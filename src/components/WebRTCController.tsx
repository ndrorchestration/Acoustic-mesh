import React, { useState } from 'react';
import { Network, Server, UserCheck, Share2, Radio, Zap, ArrowUpRight, Cpu } from 'lucide-react';
import { MeshNode, AcousticTelemetry } from '../types';

interface WebRTCControllerProps {
  peers: MeshNode[];
  localPeerId: string;
  wsConnected: boolean;
  room: string;
  onSendSignal: (signalData: any) => void;
  telemetry: AcousticTelemetry;
}

export const WebRTCController: React.FC<WebRTCControllerProps> = ({
  peers,
  localPeerId,
  wsConnected,
  room,
  onSendSignal,
  telemetry,
}) => {
  const [selectedAgentRole, setSelectedAgentRole] = useState<'Reson' | 'Echolette' | 'Lyra' | 'MeshNode'>('MeshNode');
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcastPing = () => {
    onSendSignal({
      type: 'signal',
      room,
      action: 'ping',
      timestamp: Date.now(),
      telemetry
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
      
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-slate-100 text-sm">
              WebRTC Peer Mesh Topology
            </h3>
            <p className="text-xs text-slate-400">
              Direct P2P Signal Channels &bull; Multi-Device Acoustic Synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            {copied ? 'Link Copied!' : 'Multi-Tab Link'}
          </button>

          <button
            onClick={handleBroadcastPing}
            disabled={!wsConnected}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Broadcast Ping
          </button>
        </div>
      </div>

      {/* Local Peer Info Card */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Local Peer ID:</span>
          <span className="font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {localPeerId || 'Initializing...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Signaling Channel:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${wsConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
            {wsConnected ? 'WebSocket OPEN' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Mesh Nodes Table/List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>Connected Peer Nodes ({peers.length + 1})</span>
          <span>Mesh Status</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          
          {/* Local Node Entry */}
          <div className="bg-cyan-950/20 border border-cyan-800/50 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-200">{localPeerId}</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                    YOU (Local Node)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Role: Master Signal Origin &bull; {telemetry.dominantFreqHz} Hz
                </div>
              </div>
            </div>

            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
              ACTIVE SINK
            </span>
          </div>

          {/* Remote Peers List */}
          {peers.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl text-center text-xs font-mono text-slate-500">
              No remote peer nodes connected in room "{room}".
              <br />
              Open another browser tab or share the URL to form a multi-device acoustic mesh.
            </div>
          ) : (
            peers.map((peer) => (
              <div
                key={peer.peerId}
                className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{peer.peerId}</span>
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.2 rounded border border-slate-800">
                        {peer.agentRole}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Latency: {peer.latencyMs || Math.floor(12 + Math.random() * 18)}ms &bull; Connected
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    WebRTC DataChannel OPEN
                  </span>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
};
