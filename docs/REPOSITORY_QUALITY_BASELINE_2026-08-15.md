# Acoustic-Mesh — Repository Quality Baseline

**Audit date:** 2026-08-15  
**Scope:** engineering quality, evidence, reproducibility, CI, security/provenance  
**Epistemic status:** audit record; not acoustic-performance validation

## Current disposition

Acoustic-Mesh is **Active / experimental** and is correctly separated from DGAF governance and PDMAL research in its README.

## Verified observations

- `README.md` explicitly distinguishes the acoustic/WebRTC implementation track from governance and lattice research.
- `package.json` defines a workspace structure under `apps/*`, `services/*`, and `packages/*`.
- `package.json` exposes `dev`, `build`, and `start`; `build` is currently `tsc --noEmit`.
- `package-lock.json` root identity matches `acoustic-mesh` / `1.0.0` and the declared workspace layout.
- CI runs on pushes and pull requests to `main`, installs dependencies with `npm ci`, and performs a build check.
- The CI workflow's lint fallback runs `node --check` over JavaScript files when no ESLint configuration is present.
- Repository search did not identify a current Vitest/Jest/Mocha-style automated test suite or test script. This is an evidence gap, not proof that no test-like code exists.
- The implementation inventory explicitly classifies AudioContext, microphone acquisition, AnalyserNode, RTCPeerConnection, FFT, sensor processing, localization, sensor fusion, noise robustness, and latency as not established or target capabilities unless executable evidence is found.

## Gaps

### P0 — physical/acoustic evidence
The repository currently provides no inspected benchmark artifact establishing microphone/sensor accuracy, localization accuracy, signal-quality performance, or WebRTC acoustic performance. The existing physical-validation issue remains the authoritative work item.

Required evidence should include, as applicable:

1. hardware/device matrix;
2. recording/test protocol;
3. controlled acoustic environment description;
4. raw or reproducibly generated test traces;
5. declared metrics and acceptance criteria;
6. exact software/device configuration;
7. reproducible analysis output.

### P1 — runtime/test evidence
The current CI establishes dependency installation and TypeScript build integrity but not runtime protocol behavior. The signaling service should eventually have deterministic automated tests covering startup, connection establishment, malformed input handling, disconnect/reconnect behavior, and protocol-level invariants.

Because repository search did not identify a conventional test framework, Acoustic-Mesh should not currently be represented as having a unit/integration test gate.

### P1 — CI quality
The current CI contains a conditional ESLint step and a separate build step. The build command is useful for TypeScript integrity, but CI should not be described as acoustic validation. The governance-badge job reports missing markers as warnings rather than failing the workflow; that is appropriate only if the check is explicitly informational.

### P2 — provenance
`package.json` uses a workspace architecture and external networking/database dependencies. The lockfile root identity is currently coherent, but a successful `npm ci` plus build execution is still required before dependency reproducibility is marked verified. Secrets must remain environment-managed and outside version control.

## Promotion rule

A successful TypeScript build does not establish acoustic performance, spatial localization, signal-processing validity, or WebRTC quality. Those require measurements and reproducible experiments.

## Next action

Close the physical/acoustic evidence gate first. In parallel, establish deterministic signaling/runtime tests. Add a reproducible acoustic benchmark job to CI only after the measurement protocol and acceptance criteria are fixed.
