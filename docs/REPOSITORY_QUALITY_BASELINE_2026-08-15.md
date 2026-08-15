# Acoustic-Mesh — Repository Quality Baseline

**Audit date:** 2026-08-15  
**Scope:** engineering quality, evidence, reproducibility, CI, security/provenance  
**Epistemic status:** audit record; not acoustic-performance validation

## Current disposition

Acoustic-Mesh is **Active / experimental** and is correctly separated from DGAF governance and PDMAL research in its README.

## Verified observations

- `README.md` explicitly distinguishes the acoustic/WebRTC implementation track from governance and lattice research.
- `package.json` defines a workspace structure under `apps/*`, `services/*`, and `packages/*`.
- The declared build command is `tsc --noEmit`; the repository does not currently expose a dedicated automated acoustic-performance benchmark through the inspected package scripts.
- CI runs on pushes and pull requests to `main` and performs dependency installation plus a build check.

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

### P1 — CI quality
The current CI contains a conditional ESLint step and a separate build step. The build command is useful for TypeScript integrity, but CI should not be described as acoustic validation. The governance-badge job also reports missing markers as warnings rather than failing the workflow; that is appropriate only if the check is informational.

### P1 — runtime/network verification
The signaling service should eventually have deterministic automated tests covering startup, connection establishment, malformed input handling, disconnect/reconnect behavior, and protocol-level invariants.

### P2 — provenance
`package.json` uses a workspace architecture and external networking/database dependencies. Dependency-lock integrity and configuration provenance should be checked during the security pass. Secrets must remain environment-managed and outside version control.

## Promotion rule

A successful TypeScript build does not establish acoustic performance, spatial localization, signal-processing validity, or WebRTC quality. Those require measurements and reproducible experiments.

## Next action

Close the physical/acoustic evidence gate first. Then add deterministic protocol/runtime tests and, where stable enough, a reproducible acoustic benchmark job to CI.
