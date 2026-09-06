# Acoustic-Mesh

**Experimental engineering workspace for browser audio visualization, WebSocket signaling, and acoustic-mesh interface research.**

> **Epistemic status:** Active experimental engineering. The repository contains executable TypeScript/React/Express code and project-local heuristic visualizations. It does **not** establish physical acoustic performance, cognitive measurement, mathematically validated phi-harmonic behavior, DGAF efficacy, or autonomous agent governance.

## What is implemented

The current codebase includes:

- a React/Vite browser interface;
- an Express/Node runtime;
- WebSocket room/signaling infrastructure;
- browser-facing audio/spectrum visualization components;
- telemetry transport and project-local heuristic scoring;
- a small status/API surface;
- locked Bun dependencies plus CI type-check/build verification.

The repository should be evaluated from the exact implementation and current CI results rather than from historical ecosystem terminology.

## Heuristic / simulation boundary

Historical versions of this project used terms such as **Reson**, **Echolette**, **Lyra**, **Schizophonic Studio**, **PhiLattice**, **Ionian Mode**, **Savage Reason**, and **phi harmony**. Those labels are retained where useful as interface/research vocabulary, but they are **project-local simulation concepts**.

In particular:

- a numeric `phiHarmonyScore` is a deterministic UI heuristic, not a validated acoustic-quality metric;
- a `dissonanceHz` input is a project-defined simulation variable, not a measurement of cognitive dissonance;
- 15% and 10 Hz thresholds are experimental interface constants, not externally established safety or acoustic standards;
- agent/persona names describe UI roles or research metaphors and do not independently govern the runtime;
- references to DGAF or PDMAL describe ecosystem relationships and do not transfer validation to this repository.

## Software verification vs. physical validation

Software correctness and physical acoustic performance are separate evidence tracks.

Current software work can establish things such as:

`source → locked dependencies → type check → build → signaling/runtime behavior`

Physical/acoustic claims require a separate chain:

`measurement protocol → hardware/environment record → raw measurements → error/uncertainty analysis → replication`

Issue #4 tracks that physical-evidence gate. Until it closes with reproducible measurements, acoustic localization, sensing accuracy, spatial reconstruction, or similar capability claims remain **NOT ESTABLISHED**.

## Local verification

```bash
bun install --frozen-lockfile
bun run typecheck
bun run build
bun run dev
```

The runtime exposes a WebSocket signaling surface and API routes including `/api/health`, `/api/rooms`, `/api/agents`, and `/api/telemetry/evaluate`. The agent/telemetry routes explicitly describe their outputs as project-local simulation/heuristic data.

## Repository status

| Claim | Status |
|---|---|
| React/Vite/Express application exists | IMPLEMENTED |
| WebSocket signaling/room code exists | IMPLEMENTED |
| Locked dependency install path exists | IMPLEMENTED |
| Type-check/build CI | IMPLEMENTED; verify current PR/main run |
| Heuristic telemetry UI | IMPLEMENTED |
| Heuristic values are scientifically calibrated | **NOT ESTABLISHED** |
| Physical acoustic performance | **NOT ESTABLISHED** |
| Autonomous agent governance | **NOT ESTABLISHED** |
| DGAF/PDMAL effectiveness transfers here | **NO — separate evidence boundary** |

## Licensing note

The repository currently has **no root `LICENSE` file**. Historical metadata has contained conflicting license labels. This README therefore does not assert a license until that repository-level legal/administrative decision is resolved explicitly.

## Related projects

- `DGAF-Framework` — separate governance/evaluation research track.
- `Driftwatch` — separate drift-detection/evaluation track.
- `Meshsense` — separate sensing/failure-mode companion experiment.
- `sentinel-governance` — separate CI/CD automation track.

Cross-repository references do not constitute mutual validation.

## Provenance

Maintained by Ndr / Ender Hensel (`ndrorchestration`).
