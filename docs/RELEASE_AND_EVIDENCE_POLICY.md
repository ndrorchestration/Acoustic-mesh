# Acoustic-Mesh Release and Evidence Policy

## Current software version

`1.0.0` is retained as the repository's existing software release/version label. It describes the software artifact and its compatibility/versioning history; it must **not** be interpreted as evidence that acoustic, spatial, sensor, WebRTC, or mathematical research claims are validated.

Because the repository remains explicitly experimental, a future versioning reassessment may be warranted if public documentation or compatibility expectations imply production maturity. That reassessment must preserve historical version provenance rather than silently rewriting it.

## Evidence ladder

`DESCRIBED → IMPLEMENTED → BUILD/CI VERIFIED → FUNCTIONALLY TESTED → BENCHMARKED → EMPIRICALLY REPLICATED`

Different components may occupy different evidence states.

## Acoustic claim gate

Claims about acoustic localization, spatial reconstruction, modal analysis, sensor fusion, frequency response, latency, noise robustness, or WebRTC performance require measurements appropriate to the claim. Source code, successful builds, and deployment status do not substitute for physical/acoustic evidence.

Historical or target-state terminology—including harmonic, phi-related, headroom, and frequency-threshold language—must remain qualified unless reproducible implementation or measurement evidence supports the specific claim.

## Architecture boundary

Acoustic-Mesh is the acoustic/WebRTC engineering track. DGAF, PDMAL/Phi-Calculus, Driftwatch, ACP, and related projects may integrate with it, but their existence or claims do not validate Acoustic-Mesh's physical performance.

## Release rule

A future major release should require stable interfaces plus evidence appropriate to every capability presented as stable. A version number alone never establishes scientific validity or production readiness.
