import { createHash } from 'node:crypto';
import { canonical, replay } from './spatial-observation-validator.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 128;
const hasOwn = (obj, key) => Object.hasOwn(obj, key);

/**
 * Receiver-side *synthetic fixture* artifact binding experiment.
 *
 * REVIEW_ONLY means the supplied bytes match the producer-declared SHA-256,
 * not that the bytes came from a real sensor, that consent was obtained,
 * that the receiver policy is authenticated or that fusion is authorized.
 * This function NEVER emits ALLOW.
 */
export function assessReceiverFixture(observations, trusted, rawArtifacts, policy) {
  // The candidate observation engine itself checks replay shape/size and
  // evaluates an isolated JSON-only snapshot of receiver context and data.
  const evaluated = JSON.parse(canonical({ observations, trusted, policy }));
  if (!evaluated.observations.length) throw new TypeError('EMPTY_OBSERVATION_BATCH');
  const replayReceipt = replay(evaluated.observations, evaluated.trusted);
  const policyDigest = digest(canonical(evaluated.policy));
  const active = evaluated.policy;
  const policyValid = active !== null && typeof active === 'object' &&
    !Array.isArray(active) &&
    active.mode === 'synthetic-only' &&
    validId(active.receiver_policy_id) && validId(active.dataset_trial_id) &&
    Object.keys(active).sort().join('|') ===
      ['dataset_trial_id','mode','receiver_policy_id'].sort().join('|');

  if (!Array.isArray(rawArtifacts) || rawArtifacts.length > 128)
    throw new TypeError('INVALID_RAW_ARTIFACT_COLLECTION');
  const artifactKeys = Reflect.ownKeys(rawArtifacts);
  if (artifactKeys.length !== rawArtifacts.length + 1 ||
      artifactKeys.some(k => typeof k !== 'string' ||
        (k !== 'length' && !/^(0|[1-9][0-9]*)$/.test(k))))
    throw new TypeError('INVALID_RAW_ARTIFACT_ARRAY_SHAPE');
  // Validate array indices before for-of can read from a getter.
  for (let i = 0; i < rawArtifacts.length; i++) {
    const desc = Object.getOwnPropertyDescriptor(rawArtifacts, String(i));
    if (!desc || !hasOwn(desc, 'value')) throw new TypeError('RAW_ARTIFACT_ARRAY_ACCESSOR');
  }
  const evidence = new Map();
  let totalBytes = 0;
  const duplicateIds = new Set();
  for (const record of rawArtifacts) {
    if (record === null || typeof record !== 'object' ||
        Array.isArray(record) || Object.getPrototypeOf(record) !== Object.prototype ||
        Reflect.ownKeys(record).some(k => typeof k !== 'string' ||
          !['observation_id','bytes'].includes(k)) ||
        !hasOwn(record,'observation_id') || !hasOwn(record,'bytes'))
      throw new TypeError('INVALID_ARTIFACT_RECORD');
    const idProperty = Object.getOwnPropertyDescriptor(record, 'observation_id');
    const bytesProperty = Object.getOwnPropertyDescriptor(record, 'bytes');
    if (!hasOwn(idProperty,'value') || !hasOwn(bytesProperty,'value') ||
        !idProperty.enumerable || !bytesProperty.enumerable)
      throw new TypeError('ACCESSOR_NOT_ARTIFACT');
    const id = idProperty.value, source = bytesProperty.value;
    if (!validId(id)) throw new TypeError('INVALID_ARTIFACT_ID');
    if (!Buffer.isBuffer(source) && !(source instanceof Uint8Array))
      throw new TypeError('INVALID_ARTIFACT_BYTES');
    totalBytes += source.byteLength;
    if (totalBytes > 2_097_152) throw new TypeError('ARTIFACT_BYTES_LIMIT');
    if (evidence.has(id)) duplicateIds.add(id);
    // Hash a local copy: no custody/authenticity claim is made about its origin.
    evidence.set(id, {digest: digest(Buffer.from(source)), length: source.byteLength});
  }
  const referencedIds = new Set(evaluated.observations.map(o => o?.observation_id));
  const unused = [...evidence.keys()].filter(id => !referencedIds.has(id));
  const decisions = replayReceipt.decisions.map((decision, index) => {
    const o = evaluated.observations[index];
    const reasons = [];
    const raw = evidence.get(o?.observation_id);
    if (!decision.ok) reasons.push('OBSERVATION_REFUSED');
    if (!policyValid || o?.dataset_trial_id !== active?.dataset_trial_id ||
        o?.consent_retention_class !== 'synthetic')
      reasons.push('RECEIVER_POLICY_NOT_ESTABLISHED');
    if (duplicateIds.has(o?.observation_id)) reasons.push('DUPLICATE_ARTIFACT_ID');
    if (!raw) reasons.push('RAW_BYTES_UNAVAILABLE');
    else if (raw.digest !== o?.raw_artifact_sha256) reasons.push('RAW_DIGEST_MISMATCH');
    // Reserved label: never permission to fuse, persist, publish or act.
    const status = reasons.some(r=>['OBSERVATION_REFUSED','DUPLICATE_ARTIFACT_ID','RAW_DIGEST_MISMATCH'].includes(r))
      ? 'REFUSE' : reasons.length ? 'DEFER' : 'REVIEW_ONLY';
    return {index, observation_id: o?.observation_id ?? null, status,
      reasons, inspected_raw_sha256:raw?.digest ?? null};
  });
  if (unused.length) throw new TypeError('UNREFERENCED_ARTIFACT_RECORD');
  const status = decisions.some(d=>d.status==='REFUSE') ? 'REFUSE' :
    decisions.some(d=>d.status==='DEFER') ? 'DEFER' : 'REVIEW_ONLY';
  const receiptPayload = { replay_sha256: replayReceipt.receipt_sha256,
    receiver_policy_sha256: policyDigest, decisions, status };
  return { ...receiptPayload, receipt_sha256: digest(canonical(receiptPayload)) };
}
