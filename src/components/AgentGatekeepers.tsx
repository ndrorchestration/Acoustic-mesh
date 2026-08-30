import React from 'react';
import { Shield, ShieldAlert, Cpu, GitPullRequest, Activity, AlertOctagon } from 'lucide-react';
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
      {/* Savage Reason Halt Alert Banner */}
      {savageReasonHalt && (
        <div className="bg-red-950/90 border-2 border-red-600 rounded-xl p-4 flex items-center justify-between text-red-200 animate-pulse shadow-xl shadow-red-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/80 rounded-lg text-red-300">
              <AlertOctagon className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm tracking-wide text-red-100 uppercase">
                CRITICAL PROTOCOL: SAVAGE REASON HALT TRIGGERED
              </h3>
              <p className="text-xs text-red-300 font-mono mt-0.5">
                Cognitive dissonance exceeded threshold (&gt;10 Hz: {dissonanceHz.toFixed(1)} Hz). Reson gatekeeper halted signal chain.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-900 border border-red-700 text-red-100 font-mono text-xs font-bold rounded-lg uppercase">
            HALT ACTIVE
          </span>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isReson = agent.id === 1;
          const isEcholette = agent.id === 2;
          const isLyra = agent.id === 3;

          let statusBg = "bg-slate-900/60 border-slate-800";
          let statusText = "text-emerald-400";
          let badgeText = "OPTIMAL";

          if (isReson) {
            if (savageReasonHalt) {
              statusBg = "bg-red-950/40 border-red-800/80";
              statusText = "text-red-400";
              badgeText = "HALT EXECUTION";
            } else if (headroomPercent < 15) {
              statusBg = "bg-amber-950/40 border-amber-800/80";
              statusText = "text-amber-400";
              badgeText = "HEADROOM WARNING";
            }
          } else if (isEcholette) {
            if (dissonanceHz > 5) {
              statusBg = "bg-amber-950/40 border-amber-800/80";
              statusText = "text-amber-400";
              badgeText = "DRIFT DETECTED";
            }
          } else if (isLyra) {
            if (dissonanceHz > 2) {
              statusBg = "bg-purple-950/40 border-purple-800/80";
              statusText = "text-purple-300";
              badgeText = "RECONCILING";
            }
          }

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-xl border transition-all ${statusBg} flex flex-col justify-between space-y-3 relative overflow-hidden`}
            >
              {/* Top Row: Icon + Name + Role */}
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
                        <h4 className="font-mono font-bold text-slate-100 text-sm">
                          {agent.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{agent.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {agent.role}
                      </p>
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

                {/* Gate Rule */}
                <div className="mt-3 bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 text-xs font-mono text-slate-300">
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">
                    Gate Rule & Enforcement
                  </div>
                  {agent.gate}
                </div>
              </div>

              {/* Dynamic Metric bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                {isReson && (
                  <>
                    <span className="text-slate-400">Headroom (Min 15%):</span>
                    <span className={`font-bold ${headroomPercent < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {headroomPercent.toFixed(1)}%
                    </span>
                  </>
                )}
                {isEcholette && (
                  <>
                    <span className="text-slate-400">Semantic Drift:</span>
                    <span className="font-bold text-cyan-400">
                      {(dissonanceHz * 0.85).toFixed(2)} Hz
                    </span>
                  </>
                )}
                {isLyra && (
                  <>
                    <span className="text-slate-400">Modal Shift Target:</span>
                    <span className="font-bold text-purple-400">
                      0 Hz Ionian
                    </span>
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
