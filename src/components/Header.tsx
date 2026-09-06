import React from 'react';
import { Activity, Radio, Layers, Wifi, Cpu } from 'lucide-react';

interface HeaderProps {
  room: string;
  setRoom: (room: string) => void;
  isConnected: boolean;
  peerCount: number;
  onReconnect: () => void;
  phiHarmonyScore: number;
  savageReasonHalt: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  room,
  setRoom,
  isConnected,
  peerCount,
  onReconnect,
  phiHarmonyScore,
  savageReasonHalt,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse text-cyan-400' : 'text-slate-500'}`} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${savageReasonHalt ? 'bg-red-400' : isConnected ? 'bg-cyan-400' : 'bg-slate-600'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${savageReasonHalt ? 'bg-red-500' : isConnected ? 'bg-cyan-500' : 'bg-slate-600'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2 font-mono">
                Acoustic-Mesh
              </h1>
              <span className="px-2 py-0.5 text-xs rounded-md bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-medium font-mono">
                experimental
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              WebSocket signaling + browser audio / heuristic visualization
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Room:</span>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="bg-transparent text-cyan-300 focus:outline-none w-36 font-semibold"
              placeholder="Room ID"
            />
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
            savageReasonHalt
              ? 'bg-red-950/80 border-red-800/80 text-red-300'
              : phiHarmonyScore >= 80
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-amber-950/80 border-amber-800/80 text-amber-300'
          }`} title="Deterministic project-local display heuristic; not a calibrated acoustic-quality metric">
            <Activity className="w-3.5 h-3.5" />
            <span>Heuristic score: {phiHarmonyScore}%</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span className="text-slate-300">{peerCount} Peer{peerCount === 1 ? '' : 's'}</span>
          </div>

          <button
            onClick={onReconnect}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
              isConnected
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-900/30'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            {isConnected ? 'Reset WS' : 'Connect Mesh'}
          </button>
        </div>
      </div>
    </header>
  );
};
