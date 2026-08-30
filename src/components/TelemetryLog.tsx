import React, { useState } from 'react';
import { Terminal, Trash2, Filter, Download } from 'lucide-react';

export interface LogEntry {
  id: string;
  type: 'info' | 'signal' | 'telemetry' | 'halt' | 'warning';
  message: string;
  timestamp: string;
  details?: any;
}

interface TelemetryLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const TelemetryLog: React.FC<TelemetryLogProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'signal' | 'telemetry' | 'halt'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'signal') return log.type === 'signal';
    if (filter === 'telemetry') return log.type === 'telemetry';
    if (filter === 'halt') return log.type === 'halt' || log.type === 'warning';
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
      
      {/* Log Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-slate-100 text-sm">
              Live Mesh Telemetry & Signal Stream Log
            </h3>
            <p className="text-[11px] text-slate-400">
              WebSocket events, peer signaling & Reson gatekeeper audit stream
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('signal')}
              className={`px-2 py-1 rounded ${filter === 'signal' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              Signals
            </button>
            <button
              onClick={() => setFilter('telemetry')}
              className={`px-2 py-1 rounded ${filter === 'telemetry' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setFilter('halt')}
              className={`px-2 py-1 rounded ${filter === 'halt' ? 'bg-slate-800 text-red-300 font-bold' : 'text-slate-400'}`}
            >
              Halts
            </button>
          </div>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Console Window */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-3 font-mono text-xs max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6">
            Log stream empty. Signal events will appear in real-time.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let badgeStyle = "text-cyan-400 bg-cyan-950/60 border-cyan-800/80";
            if (log.type === 'halt') badgeStyle = "text-red-400 bg-red-950/80 border-red-800/90 font-bold";
            if (log.type === 'warning') badgeStyle = "text-amber-400 bg-amber-950/80 border-amber-800/90";
            if (log.type === 'telemetry') badgeStyle = "text-purple-300 bg-purple-950/60 border-purple-800/80";

            return (
              <div key={log.id} className="flex items-start gap-2 text-slate-300 hover:bg-slate-900/60 p-1 rounded transition-colors">
                <span className="text-[10px] text-slate-500 whitespace-nowrap pt-0.5">
                  [{log.timestamp}]
                </span>
                <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded border ${badgeStyle}`}>
                  {log.type}
                </span>
                <span className="flex-1 break-all">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
