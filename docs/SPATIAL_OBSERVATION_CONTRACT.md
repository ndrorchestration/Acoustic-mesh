# SPATIAL-OBS-CONTRACT-01 — candidate v0.1

**Status:** draft engineering fixture contract. **Not** an adopted Spatial Core API, a production validator, a physical ASIS/MeshSense measurement, or a fusion-accuracy claim.

## Location and ownership
This independent contract exercise lives in Acoustic-mesh to avoid inventing a standalone Spatial Core codebase. It is review-only until an explicit owner accepts the schema and receiver validation. No change to active acoustic visualizations, MeshSense's frozen FM-01 thresholds, or physical evidence gates.

Files:
- contracts/spatial-observation-v0.1.schema.json — candidate JSON Schema 2020-12 definition
- contracts/spatial-observation-validator.mjs — conservative admission/replay experiment using only Node builtins
- contracts/spatial-observation.test.mjs — synthetic positive/negative regression corpus
- .github/workflows/spatial-observation.yml — separate PR/push conformance job

## Verification
Run Node >=22: node --test contracts/spatial-observation.test.mjs

The checker deliberately implements a **bounded subset** of the schema plus registry-aware semantic checks. It is **not** a general JSON Schema 2020-12 implementation. Full schema conformance requires an independent validator and fixture-cross-check before G-SPAT-0 can close. The current checker also does **not** certify covariance PSD, clock-synchronization physics, uncertainty calibration, transform math, sensor identity authentication or physical capture.

Acceptance proposal: all predefined synthetic positive and negative cases classify as designed, replay receipt stable across identical fixtures, hosted exact-commit CI observed; then independent schema-engine parity and calibrated receiver evaluation before adoption.

## Observation semantics
- Nanosecond monotonic timestamps and error bounds use decimal strings to prevent JS integer precision loss; never compare clocks from different `timebase_id` without independently verified mapping.
- Coordinate frame, transform revision, sensor and calibration IDs must match a **trusted receiver-supplied registry**. Producer-supplied claims alone do not establish validity.
- `measurement` is an ordered numeric vector; `unit` and `modality` constrain interpretation; uncertainty is a matching standard-deviation vector or row-major covariance.
- `raw_artifact_sha256` identifies immutable raw input; derived decision receipts are separately hashed. The synthetic fixture hash is not a captured hardware trace.
- Consent/retention classifications control subsequent use and require independent legal/consent enforcement.
- Rejection/abstention occurs on missing/untrusted context, wrong frame, calibration, clock, unit, malformed uncertainty, or non-monotonic same-stream observations. Refusals are recorded, not silently fused.
- Different sensor clocks and frames are not unified here. Transform authority and synchronized ground truth remain future prerequisites.

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

## Non-claims
No device capture, on-device synchronization, physical localization, CSI collection, multimodal fusion, independent replication, product readiness, research efficacy, or scientific N increment follows from this proposed contract. Never transfer a synthetic result to physical evidence.
