# Governance and Evidence Boundary

## Current status

Acoustic-Mesh is an **independent experimental repository**. It may reuse terminology, design patterns, or evaluation ideas from `DGAF-Framework`, PDMAL, Driftwatch, and other ndrorchestration projects, but no external repository or agent persona automatically governs, certifies, validates, or authorizes this code.

Historical references to **Agent Amethyst**, **COLLEEN**, protocol numbers, phi attractors, harmonic baselines, stasis windows, or DGAF constitutional authority are preserved as project history only. They are not current evidence of runtime enforcement or external certification.

## Project-local controls

The controls that are actually enforceable here are those present in this repository and verifiable at an exact commit, including:

- source-controlled CI workflows;
- locked dependency installation through `bun.lock`;
- TypeScript type checking;
- production build verification;
- explicit API and telemetry semantics;
- issue-tracked physical-evidence requirements.

A named protocol or persona is not an enforcement mechanism unless its behavior is implemented in code or CI and verified in the current repository.

## Evidence classes

Use the following distinctions when describing this project:

`DEFINED → IMPLEMENTED → COMPUTED → VERIFIED → ATTESTED → HISTORICAL → HYPOTHESIS → METAPHOR → UNSUPPORTED`

Examples:

- a UI threshold written in code is **IMPLEMENTED**;
- a deterministic heuristic score produced by that code is **COMPUTED**;
- a passing exact-head CI job can make the tested software property **VERIFIED** for that commit;
- a project-local label such as “Ionian Mode” or an agent persona remains **METAPHOR / project vocabulary** unless a separately defined measurable claim is established;
- physical acoustic performance remains **HYPOTHESIS / NOT ESTABLISHED** until the measurement protocol in issue #4 is executed with retained evidence.

## Cross-repository boundary

`DGAF-Framework`, PDMAL, Driftwatch, MeshSense, Sentinel, and Acoustic-Mesh maintain separate evidence surfaces. Integration or shared vocabulary does not transfer validation between repositories.

## Current physical-evidence gate

Issue #4 defines the required chain for acoustic/ASIS physical validation:

`network implementation → software tests → acoustic/sensor protocol → physical measurement → uncertainty/replication`

Software CI, healthy endpoints, UI behavior, and WebSocket connectivity must not be promoted into physical-performance claims.

## Historical governance record

Older repository records may contain versioned DGAF protocol references and Agent Amethyst/COLLEEN declarations. Those records are historical provenance and should be interpreted in the context of the date and source commit where they were written, not as current authority.
