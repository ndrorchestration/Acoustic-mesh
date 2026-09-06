import React from 'react';
import { Shield, Cpu, GitPullRequest, AlertOctagon } from 'lucide-react';
import { AgentSpec } from '../types';

interface AgentGatekeepersProps {
  agents: AgentSpec[];
  headroomPercent: number;
  dissonanceHz: number;
  savageReasonHalt: boolean;
}

export const AgentGatekeepers: React.FC<AgentGatekeepersProps> = ({
  agents,
  headroomPercent,
  dissonanceHz,
  savageReasonHalt,
}) => {
  return (
    <div className="space-y-4">
      {savageReasonHalt && (
        <div className="bg-red-950/70 border border-red-700 rounded-xl p-4 flex items-center justify-between text-red-200 shadow-xl shadow-red-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/80 rounded-lg text-red-300">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm tracking-wide text-red-100 uppercase">
                Simulation threshold triggered
              </h3>
              <p className="text-xs text-red-300 font-mono mt-0.5">
                Project-defined dissonance input ({dissonanceHz.toFixed(1)} Hz) exceeded the demo threshold. This is not a cognitive, safety, or physical-acoustic measurement.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-900 border border-red-700 text-red-100 font-mono text-xs font-bold rounded-lg uppercase">
            SIM FLAG
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isReson = agent.id === 1;
          const isEcholette = agent.id === 2;
          const isLyra = agent.id === 3;

          let statusBg = "bg-slate-900/60 border-slate-800";
          let statusText = "text-emerald-400";
          let badgeText = "SIM NOMINAL";

          if (isReson) {
            if (savageReasonHalt) {
              statusBg = "bg-red-950/40 border-red-800/80";
              statusText = "text-red-400";
              badgeText = "SIM THRESHOLD";
            } else if (headroomPercent < 15) {
              statusBg = "bg-amber-950/40 border-amber-800/80";
              statusText = "text-amber-400";
              badgeText = "SIM WARNING";
            }
          } else if (isEcholette && dissonanceHz > 5) {
            statusBg = "bg-amber-950/40 border-amber-800/80";
            statusText = "text-amber-400";
            badgeText = "SIM DRIFT FLAG";
          } else if (isLyra && dissonanceHz > 2) {
            statusBg = "bg-purple-950/40 border-purple-800/80";
            statusText = "text-purple-300";
            badgeText = "SIM ADJUSTING";
          }

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-xl border transition-all ${statusBg} flex flex-col justify-between space-y-3 relative overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700">
                      {isReson && <Shield className="w-4 h-4 text-emerald-400" />}
                      {isEcholette && <GitPullRequest className="w-4 h-4 text-cyan-400" />}
                      {isLyra && <Cpu className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono font-bold text-slate-100 text-sm">{agent.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">#{agent.id}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{agent.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    statusText === 'text-red-400' ? 'bg-red-950 border-red-800 text-red-300' :
                    statusText === 'text-amber-400' ? 'bg-amber-950 border-amber-800 text-amber-300' :
                    'bg-slate-950 border-emerald-800 text-emerald-300'
                  }`}>
                    {badgeText}
                  </span>
                </div>

                <div className="mt-3 bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 text-xs font-mono text-slate-300">
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">
                    Project-local simulation rule
                  </div>
                  {agent.gate}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                {isReson && (
                  <>
                    <span className="text-slate-400">Headroom input:</span>
                    <span className={`font-bold ${headroomPercent < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {headroomPercent.toFixed(1)}%
                    </span>
                  </>
                )}
                {isEcholette && (
                  <>
                    <span className="text-slate-400">Synthetic drift indicator:</span>
                    <span className="font-bold text-cyan-400">{(dissonanceHz * 0.85).toFixed(2)}</span>
                  </>
                )}
                {isLyra && (
                  <>
                    <span className="text-slate-400">Historical target label:</span>
                    <span className="font-bold text-purple-400">Ionian / 0 Hz</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
