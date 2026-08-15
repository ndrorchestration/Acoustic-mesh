# Acoustic-Mesh Component Evidence Matrix — 2026-08-15

This matrix separates software presence from acoustic/physical validation. It is intentionally conservative where repository evidence does not establish measured performance.

| Capability | Repository evidence | Current evidence state | Required evidence for stronger claim |
|---|---|---|---|
| Web application/UI | React/Vite application files | IMPLEMENTED | functional test / deployment verification |
| WebRTC/networking | referenced in project scope and documentation | DESCRIBED / IMPLEMENTATION REQUIRES COMPONENT AUDIT | integration test + network measurements |
| Acoustic signal processing | project scope/documentation | DESCRIBED | executable signal-processing implementation + test vectors |
| Frequency analysis | project scope/documentation | DESCRIBED | reproducible DSP tests + reference signals |
| Spatial/acoustic localization | project scope/documentation | HYPOTHESIS / TARGET | ground-truth localization benchmark |
| Sensor fusion | project scope/documentation | DESCRIBED / TARGET | synchronized sensor dataset + error metrics |
| Noise robustness | target capability | NOT ESTABLISHED | controlled SNR/noise benchmark |
| Latency | target capability | NOT ESTABLISHED | end-to-end timing measurements |
| Cross-device mesh performance | target capability | NOT ESTABLISHED | multi-device network/acoustic test |
| Phi-related methods | historical/project terminology | NOT VALIDATED BY THIS REPOSITORY | separate mathematical/computational evidence |

## Interpretation rule

A source file, UI, simulation, or successful build demonstrates software existence or behavior represented by its tests. It does not demonstrate physical-world acoustic performance.

## Evidence promotion

A capability may move from `DESCRIBED` or `TARGET` to `IMPLEMENTED` only when executable implementation is identified. It may move to `TESTED` when reproducible tests exist. Physical/acoustic claims require measurements with documented hardware, environment, signals, ground truth, metrics, and repeatability.
