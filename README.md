# Acoustic-Mesh

![Status](https://img.shields.io/badge/Status-Active-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Language](https://img.shields.io/badge/Language-JavaScript-yellow?style=flat-square)

> **Project boundary:** Acoustic-Mesh is an acoustic/WebRTC engineering project. It is a separate implementation track from DGAF governance and PDMAL lattice research. Shared ecosystem terminology does not imply implementation equivalence.

## Purpose

Acoustic-Mesh provides a WebRTC-based signal substrate and experimental acoustic-analysis infrastructure for real-time spatial/audio work. The repository should be evaluated on its actual audio engineering, signal-processing, networking, and sensor capabilities rather than on governance terminology.

## Current scope

- WebRTC peer communication substrate
- JavaScript/TypeScript signal and mesh coordination code where implemented
- Acoustic and spatial-analysis experiments
- Observability and diagnostic infrastructure where present
- Schizophonic Studio integration where supported by repository code

## Epistemic boundary

Project names, agent roles, phi-harmonic terminology, and target-state descriptions are not evidence of physical acoustic performance or mathematical validation.

Claims such as:

- continuous 15% headroom enforcement;
- a `>10 Hz` halt threshold;
- `0 Hz Ionian Mode` as a stability state;
- "full harmonic stability";
- phi-based superiority or optimality;

require reproducible measurements or implementation evidence before being presented as achieved properties. They are therefore not stated here as unconditional system guarantees.

## Architecture relationship

Acoustic-Mesh may integrate with the broader ndrorchestration ecosystem, including DGAF and Schizophonic Studio. Those relationships are integration/documentation relationships, not evidence that DGAF validates the acoustic system or that PDMAL validates its signal-processing methods.

## Technical stack

- **WebRTC** — real-time peer communication
- **JavaScript/TypeScript** — application and mesh logic, where implemented
- **OpenTelemetry** — observability where configured
- Acoustic/signal-processing components — see the source tree and tests for current implementation status

## Related projects

- [DGAF-Framework](https://github.com/ndrorchestration/DGAF-Framework) — separate governance/evaluation track
- [Driftwatch](https://github.com/ndrorchestration/Driftwatch) — drift-detection research
- [3d-visualization-hub](https://github.com/ndrorchestration/3d-visualization-hub) — visualization track

## Status

**Active / experimental.** Repository-level claims should be supported by current code, tests, benchmarks, or documented experiments. Historical design claims remain historical unless independently re-established.

## Licensing

Package metadata declares the project as MIT-licensed. A repository `LICENSE` file should be added if the MIT license is intended to be formally distributed with the repository.

## Provenance

Developed by Ndr / Ender Hensel (`ndrorchestration`).
