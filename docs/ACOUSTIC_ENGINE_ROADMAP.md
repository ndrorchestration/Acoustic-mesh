# Acoustic Engine Roadmap

## Purpose

This roadmap converts Acoustic-Mesh from an architectural/application foundation into a measurable acoustic-engineering implementation track. It does not assume that proposed capabilities already exist.

## Stage 0 — Baseline and instrumentation

- identify actual audio/sensor/network entry points;
- record device/browser/OS test matrix;
- establish reproducible signal fixtures;
- define ground-truth measurement procedure;
- establish timestamp and latency instrumentation.

**Exit evidence:** repository-level implementation inventory and reproducible test fixture.

## Stage 1 — Audio acquisition

Implement and verify microphone/audio capture where supported.

Minimum evidence:

- executable capture path;
- sample-rate/channel reporting;
- permission/error handling;
- captured fixture export or deterministic test stream;
- device-specific limitations documented.

## Stage 2 — Signal analysis

Implement the smallest defensible DSP pipeline before advanced spatial claims:

1. windowing;
2. FFT/STFT;
3. filtering;
4. spectral feature extraction;
5. signal-quality metrics.

**Exit evidence:** reference signals with expected numerical outputs and automated tests.

## Stage 3 — Acoustic localization

Only after Stage 2 is stable:

- define microphone geometry;
- establish time-difference/phase measurement method;
- establish ground-truth source positions;
- measure localization error;
- stratify results by SNR, distance, reverberation, and device geometry.

**Exit evidence:** reproducible localization benchmark.

## Stage 4 — Sensor fusion

Integrate available device sensors only with explicit synchronization and coordinate-frame definitions.

**Exit evidence:** synchronized sensor dataset and quantified fusion error.

## Stage 5 — Mesh transport

Implement device-to-device transport and WebRTC/data-channel behavior only after the local acoustic pipeline has measurable outputs.

**Exit evidence:** multi-device integration test plus network/latency measurements.

## Stage 6 — Persistent spatial inference

Connect validated acoustic observations to the ASIS/MeshSense spatial layer.

This stage may produce hypotheses or reconstructions; it must not be described as accurate spatial perception without ground-truth evaluation.

## Promotion rule

No stage is considered complete because its UI exists. Completion requires the stage-specific evidence described above.
