# Web Audio API Notes

The MVP uses browser-native APIs only.

- `navigator.mediaDevices.getUserMedia({audio:true})` requests microphone access.
- `AudioContext` provides the browser audio processing context.
- `MediaStreamAudioSourceNode` connects the microphone stream to the graph.
- `AnalyserNode` exposes time-domain and frequency-domain analysis data.
- `getByteTimeDomainData()` supplies sampled waveform data for visualization.
- `getFloatFrequencyData()` supplies FFT magnitude values in decibels.

## Security and permissions

Microphone access is permission-gated and normally requires a secure context. The lab does not upload microphone data and does not use the networking layer in this first slice.

## Interpretation

The analyser output is device-, browser-, microphone-, and environment-dependent. The MVP therefore reports diagnostic measurements and explicitly avoids claims of calibrated SPL or validated pitch/harmonic extraction.

References: consult the current browser Web Audio and Media Capture specifications/documentation when extending the implementation.
