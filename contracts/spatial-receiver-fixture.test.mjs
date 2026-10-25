import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { assessReceiverFixture } from './spatial-receiver-fixture.mjs';

const raw = Buffer.from('bounded synthetic, not sensor capture');
const sha = value => createHash('sha256').update(value).digest('hex');
const policy = {receiver_policy_id:'local-synthetic-review-01',dataset_trial_id:'synthetic-trial-01',mode:'synthetic-only'};
const trust = {
  max_clock_uncertainty_ns:'5000000',
  allowed_units:{acoustic:['radian']},
  sensors: {'sim-mic-1': {device_id:'sim-device',timebase_id:'sim-clock',frame_id:'sim-body',
    transform_revision:'t1',calibration_id:'sim-calibration-1',modality:'acoustic'}}
};
const good = (extra={}) => ({
  schema_version:'0.1.0',observation_id:'synthetic/1',modality:'acoustic',device_id:'sim-device',
  sensor_id:'sim-mic-1',sequence:1,monotonic_time_ns:'9007199254740993000',
  timebase_id:'sim-clock',clock_offset_uncertainty_ns:'500',
  frame_id:'sim-body',transform_revision:'t1',unit:'radian',
  measurement:[0.3,0.4],uncertainty:{kind:'covariance',values:[0.04,0,0,0.09]},
  quality_flags:[],calibration_id:'sim-calibration-1',software_git_sha:'a'.repeat(40),
  firmware_version:'simulated-v1',raw_artifact_sha256:sha(raw),
  dataset_trial_id:'synthetic-trial-01',consent_retention_class:'synthetic',...extra
});
const evidence = (id='synthetic/1',bytes=raw) => [{observation_id:id,bytes}];
const test = (o=good(), artifacts=evidence(), p=policy) =>
  assessReceiverFixture([o],trust,artifacts,p);

describe('SPATIAL-OBS synthetic receiver integrity gate (never authorizes fusion)', () => {
  it('returns only REVIEW_ONLY after matching declared digest and fixture policy', () => {
    const x=test();
    assert.equal(x.status,'REVIEW_ONLY');
    assert.equal(x.decisions[0].status,'REVIEW_ONLY');
    assert.equal(x.decisions[0].inspected_raw_sha256,sha(raw));
    assert.match(x.receipt_sha256,/^[a-f0-9]{64}$/);
    assert.equal(JSON.stringify(x).includes('bounded synthetic, not sensor capture'),false);
  });
  it('returns DEFER when raw bytes are unavailable', () => {
    const x=test(good(),[]);
    assert.equal(x.status,'DEFER');
    assert.deepEqual(x.decisions[0].reasons,['RAW_BYTES_UNAVAILABLE']);
  });
  it('returns REFUSE on mismatch between declared digest and observed supplied bytes', () => {
    const x=test(good(),evidence('synthetic/1',Buffer.from('tampered')));
    assert.equal(x.status,'REFUSE');
    assert.ok(x.decisions[0].reasons.includes('RAW_DIGEST_MISMATCH'));
  });
  it('returns REFUSE on duplicate artifact identities', () => {
    const rows=[...evidence(),...evidence()];
    assert.ok(test(good(),rows).decisions[0].reasons.includes('DUPLICATE_ARTIFACT_ID'));
  });
  it('returns DEFER on absent authority policy without inventing consent', () => {
    const x=test(good(),evidence(),null);
    assert.equal(x.status,'DEFER');
    assert.ok(x.decisions[0].reasons.includes('RECEIVER_POLICY_NOT_ESTABLISHED'));
  });
  it('does not transfer a synthetic policy to consented device data', () => {
    const x=test(good({consent_retention_class:'consented-local'}));
    assert.equal(x.status,'DEFER');
    assert.ok(x.decisions[0].reasons.includes('RECEIVER_POLICY_NOT_ESTABLISHED'));
  });
  it('does not transfer a receiver policy to a different dataset', () => {
    const x=test(good({dataset_trial_id:'different-dataset'}));
    assert.equal(x.status,'DEFER');
  });
  it('refuses a failing observation even if bytes match its raw digest', () => {
    const x=test(good({calibration_id:'forged-calibration'}));
    assert.equal(x.status,'REFUSE');
    assert.ok(x.decisions[0].reasons.includes('OBSERVATION_REFUSED'));
  });
  it('does not permit policy elevation using extra fields', () => {
    const x=test(good(),evidence(),{...policy,mode:'production'});
    assert.equal(x.status,'DEFER');
    const y=test(good(),evidence(),{...policy,owner_approval:true});
    assert.equal(y.status,'DEFER');
  });
  it('receipt binds policy and actual raw digest, without storing raw bytes', () => {
    const a=test();
    const b=test(good(),evidence(),{...policy,receiver_policy_id:'other-fixture'});
    assert.equal(a.decisions[0].status,b.decisions[0].status);
    assert.notEqual(a.receipt_sha256,b.receipt_sha256);
    const altered=Buffer.from('other bytes');
    const c=test(good({raw_artifact_sha256:sha(altered)}),evidence('synthetic/1',altered));
    assert.equal(c.status,'REVIEW_ONLY');
    assert.notEqual(a.receipt_sha256,c.receipt_sha256);
  });
  it('rejects unused artifact records and unbounded artifact bytes', () => {
    assert.throws(() => test(good(),evidence('other-id')),/UNREFERENCED_ARTIFACT_RECORD/);
    assert.throws(() => test(good(),evidence('synthetic/1',Buffer.alloc(2_097_153))),/ARTIFACT_BYTES_LIMIT/);
  });
  it('rejects accessor-backed raw artifact records without invoking getters', () => {
    const item={observation_id:'synthetic/1',bytes:raw};
    let accesses=0;
    Object.defineProperty(item,'bytes',{enumerable:true,get(){accesses++;return raw;}});
    assert.throws(() => test(good(),[item]),/ACCESSOR_NOT_ARTIFACT/);
    assert.equal(accesses,0);
  });
  it('refuses an empty observation batch instead of returning REVIEW_ONLY', () => {
    assert.throws(() => assessReceiverFixture([],trust,[],policy),/EMPTY_OBSERVATION_BATCH/);
  });
  it('refuses sparse and accessor-backed artifact arrays without running getters', () => {
    const accessor=evidence();
    let calls=0;
    Object.defineProperty(accessor,'0',{enumerable:true,get(){calls++;return evidence()[0];}});
    assert.throws(() => test(good(),accessor),/RAW_ARTIFACT_ARRAY_ACCESSOR/);
    assert.equal(calls,0);
    const sparse=evidence(); sparse.length=2;
    assert.throws(() => test(good(),sparse),/INVALID_RAW_ARTIFACT_ARRAY_SHAPE/);
  });
  it('does not claim an authenticated receipt or deployment outcome', () => {
    const result=test();
    assert.equal(result.status,'REVIEW_ONLY');
    assert.ok(!Object.hasOwn(result,'allowed'));
    assert.ok(!Object.hasOwn(result,'authenticated'));
  });
});
