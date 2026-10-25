import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { checkObservation, replay } from './spatial-observation-validator.mjs';

const digest = (s) => createHash('sha256').update(s).digest('hex');
const trust = {
  max_clock_uncertainty_ns: '5000000',
  allowed_units: { acoustic: ['radian','dbfs'], wifi_csi: ['unitless'], imu: ['meter_per_second_squared','radian_per_second'] },
  sensors: { 'sim-mic-1': { device_id: 'sim-device', timebase_id: 'sim-clock', frame_id: 'sim-body', transform_revision: 't1', calibration_id: 'sim-calibration-1', modality: 'acoustic' } }
};
const good = (extra = {}) => ({
  schema_version: '0.1.0', observation_id: 'trial-01/obs-1',
  modality: 'acoustic', device_id: 'sim-device', sensor_id: 'sim-mic-1', sequence: 1,
  monotonic_time_ns: '9007199254740993000', timebase_id: 'sim-clock',
  clock_offset_uncertainty_ns: '500', frame_id: 'sim-body', transform_revision: 't1',
  unit: 'radian', measurement: [0.3, 0.4],
  uncertainty: { kind: 'covariance', values: [0.04, 0, 0, 0.09] },
  quality_flags: [], calibration_id: 'sim-calibration-1',
  software_git_sha: 'a'.repeat(40), firmware_version: 'synthetic-v1',
  raw_artifact_sha256: digest('synthetic-capture-only'), dataset_trial_id: 'synthetic-trial-01',
  consent_retention_class: 'synthetic', ...extra
});
const schemaCases = JSON.parse(readFileSync(new URL('./spatial-schema-cases.json', import.meta.url), 'utf8'));
const invalid = [
  ['missing-units', { unit: undefined }, 'MISSING:unit'],
  ['bad-frame', { frame_id: 'unknown' }, 'UNTRUSTED_SENSOR_CONTEXT'],
  ['bad-calibration', { calibration_id: 'unknown' }, 'UNTRUSTED_SENSOR_CONTEXT'],
  ['invalid-clock', { timebase_id: 'unknown' }, 'UNTRUSTED_SENSOR_CONTEXT'],
  ['high-clock-error', { clock_offset_uncertainty_ns: '5000001' }, 'CLOCK_UNCERTAINTY_EXCEEDED'],
  ['bad-covariance-shape', { uncertainty: { kind:'covariance', values: [0.1] } }, 'UNCERTAINTY_DIMENSION'],
  ['asymmetric-covariance', { uncertainty: { kind:'covariance', values: [0.1,0.2,0.3,0.4] } }, 'COVARIANCE_NOT_SYMMETRIC'],
  ['unit-modality-mismatch', { unit: 'meter' }, 'INVALID_MODALITY_UNIT'],
  ['hash-not-sha256', { raw_artifact_sha256: 'x' }, 'PATTERN:raw_artifact_sha256'],
  ['unknown-field', { fantasy_metric: 10 }, 'UNKNOWN:fantasy_metric'],
  ['duplicate-quality-flag', { quality_flags: ['drop','drop'] }, 'INVALID_FLAGS'],
  ['invalid-measurement', { measurement: [Number.NaN] }, 'INVALID_MEASUREMENT'],
  ['negative-variance', { uncertainty: { kind: 'covariance', values: [-0.1,0,0,0.1] } }, 'NEGATIVE_VARIANCE'],
  ['negative-stddev', { uncertainty: { kind: 'stddev', values: [-0.1,0.2] } }, 'NEGATIVE_STDDEV'],
  ['flagged-packet-loss', { quality_flags: ['packet_loss'] }, 'QUALITY_BLOCKED']
];
describe('SPATIAL-OBS-CONTRACT-01 synthetic candidate', () => {
  it('admits bounded valid synthetic envelope', () => assert.equal(checkObservation(good(), trust).ok, true));
  for (const [name, override, expected] of invalid) {
    it('refuses ' + name, () => {
      const fixture = good(override);
      // Undefined is not a JSON value: simulate absent member, not explicit null.
      for(const [key,value] of Object.entries(override)) if(value === undefined) delete fixture[key];
      assert.ok(checkObservation(fixture, trust).reasons.includes(expected));
    });
  }
  it('refuses non-monotonic sequence and timestamp', () => {
    const batch = replay([good(),good({observation_id:'trial-01/obs-2',sequence:1,monotonic_time_ns:'9007199254740993000'})],trust);
    assert.equal(batch.decisions[0].ok,true);
    assert.ok(batch.decisions[1].reasons.includes('NON_MONOTONIC'));
  });
  it('admits valid negative off-diagonal covariance correlations (without PSD guarantee)', () => {
    assert.equal(checkObservation(good({uncertainty:{kind:'covariance',values:[0.04,-0.01,-0.01,0.09]}}),trust).ok,true);
  });
  it('refuses dropped sequence gaps', () => {
    const batch = replay([good(),good({observation_id:'trial-01/obs-3',sequence:3,monotonic_time_ns:'9007199254740993002'})],trust);
    assert.ok(batch.decisions[1].reasons.includes('SEQUENCE_GAP'));
  });
  it('accepts ordered timestamps beyond JS safe integer', () => {
    const batch = replay([good(),good({observation_id:'trial-01/obs-2',sequence:2,monotonic_time_ns:'9007199254740993001'})],trust);
    assert.deepEqual(batch.decisions.map(d => d.ok),[true,true]);
  });
  for (const fixture of schemaCases.cases) {
    it('matches schema-case observation admissibility: ' + fixture.name, () => {
      const v = checkObservation(fixture.observation, trust);
      assert.equal(v.ok, fixture.node_valid, JSON.stringify({fixture:fixture.name,reasons:v.reasons}));
    });
  }
  it('refuses inherited Object prototype names as unknown producer fields', () => {
    const v = checkObservation(good({constructor: 'bogus', toString: 'shadow'}), trust);
    assert.ok(v.reasons.includes('UNKNOWN:constructor'));
    assert.ok(v.reasons.includes('UNKNOWN:toString'));
  });
  it('keeps two delimited stream identities distinct', () => {
    const original = trust.sensors['sim-mic-1'];
    const trusted = {...trust, sensors: {
      'c': {...original, device_id:'a|b',timebase_id:'d'},
      'b|c': {...original, device_id:'a',timebase_id:'d'}
    }};
    const one=good({observation_id:'stream-a',device_id:'a|b',sensor_id:'c',timebase_id:'d'});
    const two=good({observation_id:'stream-b',device_id:'a',sensor_id:'b|c',timebase_id:'d'});
    assert.deepEqual(replay([one,two],trusted).decisions.map(x=>x.ok),[true,true]);
  });
  it('binds receipts to changed measurements despite unchanged verdicts', () => {
    const a = replay([good()], trust);
    const b = replay([good({measurement:[0.3, 0.5]})], trust);
    assert.deepEqual(a.decisions, b.decisions);
    assert.notEqual(a.input_sha256, b.input_sha256);
    assert.notEqual(a.receipt_sha256, b.receipt_sha256);
  });
  it('binds receipts to changed trusted context', () => {
    const a = replay([good()], trust);
    const b = replay([good()], {...trust, max_clock_uncertainty_ns:'5000001'});
    assert.deepEqual(a.decisions, b.decisions);
    assert.notEqual(a.receipt_sha256, b.receipt_sha256);
  });
  it('rejects non-JSON non-finite data before issuing a receipt', () => {
    assert.throws(() => replay([good({measurement:[NaN]})],trust),/NON_JSON_NUMBER/);
  });
  it('keeps equivalent JSON object key order stable', () => {
    const o = good(); const reordered=Object.fromEntries(Object.entries(o).reverse());
    assert.equal(replay([o],trust).receipt_sha256,replay([reordered],trust).receipt_sha256);
  });
  it('deterministically replays byte-identical fixture sequence', () => {
    const observations = [good(),good({observation_id:'trial-01/obs-2',sequence:2,monotonic_time_ns:'9007199254740993001'})];
    const a = replay(observations,trust),b = replay(JSON.parse(JSON.stringify(observations)),trust);
    assert.deepEqual(a,b);
    assert.match(a.receipt_sha256,/^[a-f0-9]{64}$/);
  });
});
