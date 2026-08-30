import React, { useEffect, useRef, useState } from 'react';
import { Activity, Mic, MicOff, Volume2, Sliders, Zap, AlertTriangle } from 'lucide-react';
import { AcousticTelemetry } from '../types';

interface SpectrumAnalyzerProps {
  telemetry: AcousticTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<AcousticTelemetry>>;
  isAudioActive: boolean;
  setIsAudioActive: (active: boolean) => void;
  savageReasonHalt: boolean;
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  telemetry,
  setTelemetry,
  isAudioActive,
  setIsAudioActive,
  savageReasonHalt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const synthOscRef = useRef<OscillatorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [useMic, setUseMic] = useState(false);
  const [targetFreq, setTargetFreq] = useState(432);
  const [headroomTarget, setHeadroomTarget] = useState(18.5);
  const [dissonanceInput, setDissonanceInput] = useState(1.2);
  const [synthType, setSynthType] = useState<'sine' | 'triangle' | 'phi'>('phi');

  // Toggle audio engine (Synth or Mic)
  const toggleAudio = async () => {
    if (isAudioActive) {
      // Stop audio
      if (synthOscRef.current) {
        try { synthOscRef.current.stop(); } catch (e) {}
        synthOscRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAudioActive(false);
    } else {
      // Start audio
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        if (useMic) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);
        } else {
          // Synthetic Phi Generator
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = synthType === 'phi' ? 'sine' : synthType;
          osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);
          
          // Headroom gain control
          gain.gain.setValueAtTime((headroomTarget / 100) * 0.2, ctx.currentTime);
          
          osc.connect(gain);
          gain.connect(analyser);
          gain.connect(ctx.destination);
          
          osc.start();
          synthOscRef.current = osc;
        }

        setIsAudioActive(true);
      } catch (err) {
        console.error("Audio init error:", err);
      }
    }
  };

  // Canvas FFT Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (analyserRef.current && isAudioActive) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          if (savageReasonHalt) {
            gradient.addColorStop(0, '#7f1d1d');
            gradient.addColorStop(1, '#ef4444');
          } else {
            gradient.addColorStop(0, '#0284c7');
            gradient.addColorStop(0.7, '#06b6d4');
            gradient.addColorStop(1, '#a855f7');
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      } else {
        // Draw synthesized phi wave pattern when audio inactive
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = savageReasonHalt ? '#ef4444' : '#06b6d4';

        const time = Date.now() * 0.003;
        for (let x = 0; x < width; x += 2) {
          const phiVal = Math.sin((x * 0.02) + time) * Math.cos((x * 0.01) + time * 1.618);
          const y = (height / 2) + phiVal * (savageReasonHalt ? 35 : 20);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAudioActive, savageReasonHalt]);

  // Update telemetry object whenever sliders or target parameters change
  useEffect(() => {
    const calculatedHarmony = Math.max(0, Math.min(100, Math.round(100 - (dissonanceInput * 8) - (headroomTarget < 15 ? 25 : 0))));
    setTelemetry({
      dominantFreqHz: targetFreq,
      headroomPercent: headroomTarget,
      dissonanceHz: dissonanceInput,
      phiHarmonyScore: calculatedHarmony,
      timestamp: Date.now(),
      mode: '0 Hz Ionian Mode'
    });
  }, [targetFreq, headroomTarget, dissonanceInput, setTelemetry]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
      
      {/* Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-slate-100 text-base">
              Phi-Harmonic Modal Spectrum & Real-Time FFT
            </h2>
            <p className="text-xs text-slate-400">
              Sensor pipeline &bull; 15% Headroom enforcement &bull; 0 Hz Ionian stability
            </p>
          </div>
        </div>

        {/* Audio Toggle Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseMic(!useMic)}
            disabled={isAudioActive}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border ${
              useMic
                ? 'bg-purple-950 border-purple-700 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {useMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            {useMic ? 'Input: Mic' : 'Input: Synth'}
          </button>

          <button
            onClick={toggleAudio}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              isAudioActive
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-lg shadow-red-950/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-950/50'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {isAudioActive ? 'Stop Signal' : 'Stream Audio Signal'}
          </button>
        </div>
      </div>

      {/* Canvas FFT Display */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 p-1">
        <canvas
          ref={canvasRef}
          width={700}
          height={160}
          className="w-full h-40 block rounded-lg"
        />
        
        {/* Overlay Telemetry Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            Freq: <span className="font-bold text-white">{telemetry.dominantFreqHz} Hz</span>
          </div>

          <div className={`border backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 ${
            telemetry.headroomPercent < 15
              ? 'bg-amber-950/90 border-amber-800 text-amber-300'
              : 'bg-slate-900/90 border-slate-800 text-emerald-300'
          }`}>
            Headroom: <span className="font-bold">{telemetry.headroomPercent.toFixed(1)}%</span>
            {telemetry.headroomPercent < 15 && <AlertTriangle className="w-3 h-3 text-amber-400" />}
          </div>

          <div className={`border backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 ${
            savageReasonHalt
              ? 'bg-red-950/90 border-red-800 text-red-300 font-bold'
              : 'bg-slate-900/90 border-slate-800 text-purple-300'
          }`}>
            Dissonance: <span className="font-bold">{telemetry.dissonanceHz.toFixed(1)} Hz</span>
          </div>
        </div>
      </div>

      {/* Acoustic Pipeline Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* Freq Tuning */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Modal Freq:</span>
            <span className="font-bold text-cyan-300">{targetFreq} Hz</span>
          </div>
          <input
            type="range"
            min="100"
            max="880"
            step="1"
            value={targetFreq}
            onChange={(e) => setTargetFreq(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>432Hz (Phi)</span>
            <span>528Hz (Solfeggio)</span>
          </div>
        </div>

        {/* Headroom Control */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Signal Headroom:</span>
            <span className={`font-bold ${headroomTarget < 15 ? 'text-amber-400' : 'text-emerald-300'}`}>
              {headroomTarget.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="0.5"
            value={headroomTarget}
            onChange={(e) => setHeadroomTarget(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span className="text-amber-400">&lt;15% Violates Reson</span>
            <span>15%+ Headroom</span>
          </div>
        </div>

        {/* Dissonance Drift */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Cognitive Dissonance:</span>
            <span className={`font-bold ${dissonanceInput > 10 ? 'text-red-400' : 'text-purple-300'}`}>
              {dissonanceInput.toFixed(1)} Hz
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="18"
            step="0.2"
            value={dissonanceInput}
            onChange={(e) => setDissonanceInput(Number(e.target.value))}
            className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 Hz Target</span>
            <span className="text-red-400">&gt;10 Hz Savage Halt</span>
          </div>
        </div>

      </div>
    </div>
  );
};
