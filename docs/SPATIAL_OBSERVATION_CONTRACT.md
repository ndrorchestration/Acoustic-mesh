# SPATIAL-OBS-CONTRACT-01 — candidate v0.1

**Status:** draft engineering fixture contract. **Not** an adopted Spatial Core API, a production validator, a physical ASIS/MeshSense measurement, or a fusion-accuracy claim.

## Location and ownership
This independent contract exercise lives in Acoustic-mesh to avoid inventing a standalone Spatial Core codebase. It is review-only until an explicit owner accepts the schema and receiver validation. No change to active acoustic visualizations, MeshSense's frozen FM-01 thresholds, or physical evidence gates.

Files:
- contracts/spatial-observation-v0.1.schema.json — candidate JSON Schema 2020-12 definition
- contracts/spatial-observation-validator.mjs — conservative admission/replay experiment using only Node builtins
- contracts/spatial-observation.test.mjs — synthetic positive/negative regression corpus and input-bound receipt tests
- contracts/spatial-schema-cases.json — shared schema versus contextual admission cases
- contracts/test_spatial_schema_202012.py — independent JSON Schema Draft 2020-12 fixture runner (pinned validator)
- contracts/test_spatial_psd_oracle.py — dependency-free Python exact-rational principal-minor oracle for 95 deterministic 2–4D covariance matrices, compared to Node
- .github/workflows/spatial-observation.yml — separate PR/push conformance job

## Verification
Run Node >=22: `node --test contracts/spatial-observation.test.mjs`.

Separately validate JSON Schema meta-schema and shared positive/negative fixture cases, in Python >=3.12:
```bash
python -m pip install 'jsonschema[format]==4.23.0'
python -m unittest discover -s contracts -p 'test_spatial_*.py' -v
```
The GitHub PR workflow runs both checks. Structural schema validity (`schema_valid`) is **not** the same as trusted-context admission (`node_valid`). This suite exercises defined fixtures and does not prove all-schema semantic equivalence or adversarial completeness.

The Node checker implements a **bounded subset** of the schema plus receiver-supplied registry-aware semantic checks. It is **not** a general JSON Schema 2020-12 implementation; the independent Python schema validator validates the shared fixtures but does not establish whole-program equivalence. G-SPAT-0 remains open pending owner review, extended hostile/negative corpus and receiver-specific trust enforcement. The current checker screens small covariance matrices for numerical positive-semidefiniteness (PSD) using normalized, pivoted Schur elimination and a relative tolerance of 1e-12. An independently written Python standard-library test computes all exact principal minors of 95 deterministic small covariance matrices (2–4D, away from numerical tolerance boundaries) and compares its classification with Node. It is independent *mathematical implementation*, **not** independent external authorship or peer review. The runtime PSD check remains a heuristic numerical gate, **not** a proof of physically valid uncertainty, calibrated cross-correlation, clock-synchronization physics, transform math, sensor authentication or physical capture. Nearly singular inputs require independently reviewed numerical bounds.

Acceptance proposal: all predefined synthetic positive and negative cases classify as designed, receipt stable across identical JSON fixtures and *different* when measurements/trusted context differ; exact-head hosted Node/Python CI evidence; then independent receiver review, broader schema coverage and calibrated physical evaluation before adoption.

## Observation semantics
- Nanosecond monotonic timestamps and error bounds use decimal strings to prevent JS integer precision loss; never compare clocks from different `timebase_id` without independently verified mapping.
- Coordinate frame, transform revision, sensor and calibration IDs must match a **trusted receiver-supplied registry**. Producer-supplied claims alone do not establish validity.
- `measurement` is an ordered numeric vector; `unit` and `modality` constrain interpretation; uncertainty is a matching standard-deviation vector or row-major covariance.
- `raw_artifact_sha256` is a *claimed* immutable raw-input digest, not evidence that raw bytes were retrieved and rehashed. Replay now emits `input_sha256` binding the exact canonical JSON observation list and trusted receiver map; `receipt_sha256` binds that digest plus deterministic per-observation decisions. These are unsigned hashes, not externally attested authenticity, sensor custody or proof of consent. Replay evaluates a newly parsed, data-only canonical JSON snapshot—not the caller-owned mutable observation and trusted maps—so input SHA-256 binds the exact observation/trust values used by the admission decision. Replay rejects duplicate observation IDs; a rejected sample does not silently advance the accepted-stream cursor. The synthetic fixture hash is not a captured hardware trace.
- Consent/retention values are proposed metadata labels only; downstream use controls and actual legal/consent enforcement are unimplemented.
- Rejection/abstention occurs on missing/untrusted context, wrong frame, calibration, clock, unit, malformed uncertainty, flagged packet loss, sequence gap, or non-monotonic same-stream observations. Signed off-diagonal covariance is permitted, but matrices up to 8 dimensions are checked for approximate numerical PSD alongside diagonal nonnegativity and symmetry. Independent numeric verification and receiver-specific measurement calibration remain required. Refusals are recorded, not silently fused.
- Different sensor clocks and frames are not unified here. Transform authority and synchronized ground truth remain future prerequisites.

## Bounded input and refusal policy (synthetic engineering profile)
- At most 128 observations per replay, 8 measurement dimensions (up to 64 covariance entries), 16 quality flags and 128 configured trusted sensors. Identifier fields are capped at 128 characters; decimal clock strings at 40 characters.
- The canonical replay digest rejects getter/setter-backed properties (including nested arrays and top-level batch elements before executing any accessor), sparse/extra-keyed arrays, non-enumerable and symbol-keyed own properties, non-JSON numbers, undefined values, cycles/reused in-memory object references, excessive nesting (depth over 24), excessive aggregate strings (over 1 MiB), too many tree nodes and input bytes over 2 MiB. These are defensive operational caps **for this draft** and must be reviewed against actual receiving workloads; they are not sensor physics or normative standards.
- For any invalid or oversized input, **no successful admission/fusion** is recorded; some grossly invalid replay payloads raise a typed exception rather than returning a digest. Direct clock admission limits decimal parsing to 40 characters before constructing arbitrary-precision integers and refuses malformed prior stream timestamps. Consumers must handle such exceptions as refusal, not retry/approval.
- The encoder is a local deterministic JSON-only digest format, **not** an RFC 8785 (JCS) interoperability claim or signed source-attestation protocol. Its own-property descriptors are read to prevent getter side effects; the strict serialized snapshot is evaluated instead of the mutable original. This assumes the Node process executing the checker and its runtime are trusted; Proxy traps can still run during descriptor inspection, and the digest cannot authenticate the external sensor or original transport bytes. The Node in-memory checker does not replace the independently executed JSON Schema 2020-12 validator. The Python stage verifies positive/negative structural cases separately from contextual (sensor/clock/frame/unit/provenance) admission.
- A local trusted map is only a receiver-supplied *fixture*, not proof that an actual device, principal or calibration authority was authenticated. Hardware/device identity attestation, consent, transform validity and physical error distributions remain future gates.

## Standards and research sources
JSON Schema Draft 2020-12: https://json-schema.org/draft/2020-12/
ROS REP-103 and REP-105: https://reps.openrobotics.org/rep-0103/ ; https://reps.openrobotics.org/rep-0105/
W3C PROV-O: https://www.w3.org/TR/prov-o/
LOCATA: https://doi.org/10.1109/TASLP.2020.2990485
OPERAnet: https://www.nature.com/articles/s41597-022-01573-2

Project research intake: https://app.notion.com/p/404f5bad238b812cb22fcc3efa7d3519
Architecture decision remains PENDING: https://app.notion.com/p/3b8f5bad238b818dbf1dc133188dbc45
Physical acoustic owner: https://github.com/ndrorchestration/Acoustic-mesh/issues/4
MeshSense FM-01 owner: https://github.com/ndrorchestration/Meshsense/issues/3

## Charter-based panel review
See the [Ecosystem Expert Panel — SPATIAL-OBS-CONTRACT-01 adversarial review](https://app.notion.com/p/404f5bad238b810abbfbcca7e55e6720). The eight lenses were applied by one assistant, **not** separately executed Notion Custom Agents or independent peer reviewers. Review status: HOLD DRAFT pending verifiable acceptance.

## Non-claims
No device capture, on-device synchronization, physical localization, CSI collection, multimodal fusion, independent replication, product readiness, research efficacy, or scientific N increment follows from this proposed contract. Never transfer a synthetic result to physical evidence.
