import { createHash } from 'node:crypto';
import schema from './spatial-observation-v0.1.schema.json' with { type: 'json' };

const props = schema.properties;
const required = new Set(schema.required);
const sha = (value) => createHash('sha256').update(value).digest('hex');
const decimal = (value) => typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value);
const plain = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const finite = (x) => typeof x === 'number' && Number.isFinite(x);
const keyOf = (o) => [o.device_id, o.sensor_id, o.timebase_id].join('|');

export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (plain(value)) return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}

/** Candidate, dependency-free bounded checker; NOT a full JSON Schema 2020-12 engine. */
export function checkObservation(o, trusted, previous = new Map()) {
  const reasons = [];
  if (!plain(o)) return { ok: false, reasons: ['NOT_OBJECT'] };
  for (const k of required) if (!(k in o)) reasons.push('MISSING:' + k);
  for (const k of Object.keys(o)) if (!(k in props)) reasons.push('UNKNOWN:' + k);
  if (reasons.length) return { ok: false, reasons };
  for (const [k, p] of Object.entries(props)) {
    if (!(k in o)) continue;
    const v = o[k];
    if (p.const !== undefined && v !== p.const) reasons.push('CONST:' + k);
    if (p.enum && !p.enum.includes(v)) reasons.push('ENUM:' + k);
    if (p.type === 'string' && (typeof v !== 'string' || (p.minLength && v.length < p.minLength))) reasons.push('STRING:' + k);
    if (p.type === 'integer' && (!Number.isSafeInteger(v) || v < (p.minimum ?? 0))) reasons.push('INTEGER:' + k);
    if (p.type === 'array' && (!Array.isArray(v) || v.length < (p.minItems ?? 0))) reasons.push('ARRAY:' + k);
    if (p.type === 'object' && !plain(v)) reasons.push('OBJECT:' + k);
    if (p.pattern && (typeof v !== 'string' || !new RegExp(p.pattern).test(v))) reasons.push('PATTERN:' + k);
  }
  if (!decimal(o.monotonic_time_ns) || !decimal(o.clock_offset_uncertainty_ns)) reasons.push('INVALID_CLOCK_NUMBER');
  if (o.wall_clock_anchor_utc !== undefined && (typeof o.wall_clock_anchor_utc !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(o.wall_clock_anchor_utc) || !Number.isFinite(Date.parse(o.wall_clock_anchor_utc)))) reasons.push('INVALID_WALL_ANCHOR');
  if (!Array.isArray(o.measurement) || !o.measurement.length || !o.measurement.every(finite)) reasons.push('INVALID_MEASUREMENT');
  if (!Array.isArray(o.quality_flags) || !o.quality_flags.every(x => typeof x === 'string' && x.length > 0) || new Set(o.quality_flags).size !== o.quality_flags.length) reasons.push('INVALID_FLAGS');
  const u = o.uncertainty;
  if (!plain(u) || !['stddev', 'covariance'].includes(u.kind) || !Array.isArray(u.values) || !u.values.every(finite) || Object.keys(u).some(k => !['kind','values'].includes(k))) reasons.push('INVALID_UNCERTAINTY');
  else if (Array.isArray(o.measurement)) {
    const n = o.measurement.length;
    if (u.values.length !== (u.kind === 'stddev' ? n : n*n)) reasons.push('UNCERTAINTY_DIMENSION');
    if (u.kind === 'stddev' && u.values.some(x => x < 0)) reasons.push('NEGATIVE_STDDEV');
    // Covariance PSD and cross-sensor correlations are NOT certified by this bounded checker.
    if (u.kind === 'covariance' && u.values.length === n*n) {
      for(let i=0;i<n;i++) if (u.values[i*n+i] < 0) reasons.push('NEGATIVE_VARIANCE');
      for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) {
        if(Math.abs(u.values[i*n+j] - u.values[j*n+i]) > 1e-9) reasons.push('COVARIANCE_NOT_SYMMETRIC');
      }
    }
  }
  const pair = trusted?.sensors?.[o.sensor_id];
  if (!pair || pair.device_id !== o.device_id || pair.timebase_id !== o.timebase_id ||
      pair.frame_id !== o.frame_id || pair.transform_revision !== o.transform_revision ||
      pair.calibration_id !== o.calibration_id || pair.modality !== o.modality) reasons.push('UNTRUSTED_SENSOR_CONTEXT');
  if (!trusted?.allowed_units?.[o.modality]?.includes(o.unit)) reasons.push('INVALID_MODALITY_UNIT');
  if (decimal(o.clock_offset_uncertainty_ns) && (!decimal(trusted?.max_clock_uncertainty_ns) ||
      BigInt(o.clock_offset_uncertainty_ns) > BigInt(trusted.max_clock_uncertainty_ns))) reasons.push('CLOCK_UNCERTAINTY_EXCEEDED');
  const prev = previous.get(keyOf(o));
  if (prev && decimal(o.monotonic_time_ns) &&
      (o.sequence <= prev.sequence || BigInt(o.monotonic_time_ns) <= BigInt(prev.monotonic_time_ns))) reasons.push('NON_MONOTONIC');
  if (prev && Number.isSafeInteger(o.sequence) && o.sequence > prev.sequence + 1) reasons.push('SEQUENCE_GAP');
  if (Array.isArray(o.quality_flags) && o.quality_flags.some(f => ['packet_loss','calibration_stale','transform_stale','clock_untrusted'].includes(f))) reasons.push('QUALITY_BLOCKED');
  return { ok: reasons.length === 0, reasons: [...new Set(reasons)].sort() };
}

/** Replay preserves rejected observations and emits deterministic decision receipts. */
export function replay(observations, trusted) {
  const seen = new Map();
  const decisions = observations.map((o, index) => {
    const verdict = checkObservation(o, trusted, seen);
    if (verdict.ok) seen.set(keyOf(o), { sequence: o.sequence, monotonic_time_ns: o.monotonic_time_ns });
    return { index, observation_id: o?.observation_id ?? null, ...verdict };
  });
  return { decisions, receipt_sha256: sha(canonical(decisions)) };
}
