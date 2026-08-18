# Acoustic Lab

Minimal, dependency-free browser laboratory for observing microphone audio in the time and frequency domains.

## Status

M0D.4 initial implementation slice. This is an experimental diagnostic/teaching tool, not a calibrated laboratory instrument.

## Run

Serve the repository over `localhost` or another secure origin, then open `acoustic-lab/index.html`. Browser microphone access requires a secure context such as HTTPS or localhost and explicit user permission.

## Current capabilities

- microphone capture through `getUserMedia`
- Web Audio `AudioContext`
- `AnalyserNode` time-domain visualization
- frequency-domain visualization
- configurable FFT size: 1024, 2048, 4096
- smoothing control
- approximate spectral peak frequency
- normalized RMS waveform amplitude
- freeze/resume display
- explicit diagnostic-status messaging

## Measurement boundary

The current peak estimator reports the strongest FFT bin; it is not yet a robust fundamental-frequency estimator and does not yet extract a validated harmonic series. RMS is normalized digital waveform amplitude, not calibrated SPL. These limitations are intentional and must remain visible until validated algorithms are added.

## Learning objectives

The first slice supports experiments around:

1. time domain vs. frequency domain
2. sampling rate and FFT resolution
3. spectral peaks
4. amplitude vs. frequency
5. smoothing and temporal responsiveness
6. measurement limitations

## Next evidence gates

- validate microphone acquisition across supported browsers/devices
- quantify FFT frequency-bin resolution and peak-estimation error using known test tones
- implement and validate fundamental-frequency estimation
- implement harmonic extraction with controlled synthetic signals
- add educational annotations only after the measurements they describe are validated
