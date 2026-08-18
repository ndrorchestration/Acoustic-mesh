# DSP Primer — Acoustic Lab

## Time domain

A microphone produces a sampled sequence of pressure-related electrical measurements. The waveform shows how the signal varies with time.

## Frequency domain

The Fourier transform represents a signal as frequency components. The browser analyser provides an FFT-derived spectrum for the MVP.

For an FFT size `N` and sample rate `Fs`, the frequency-bin spacing is:

`Δf = Fs / N`

Increasing `N` increases frequency resolution but also changes the time window represented by the transform.

## Harmonics

For an approximately periodic tone with fundamental frequency `f0`, harmonic components can occur near integer multiples:

`f_n = n f0`, for `n = 1, 2, 3, ...`

Real microphone signals are not guaranteed to be harmonic, and noise, room acoustics, transducers, and non-periodic signals can make this model incomplete.

## RMS amplitude

For normalized samples `x_i`, the RMS value is:

`RMS = sqrt((1/N) Σ x_i²)`

The MVP reports normalized waveform RMS. It must not be interpreted as calibrated sound-pressure level.

## Experimental discipline

Use known generated tones first. Compare measured peak frequency against the expected frequency and record error. Only after this calibration/validation work should the application make stronger claims about fundamental frequency or harmonic content.
