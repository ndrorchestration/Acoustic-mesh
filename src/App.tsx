import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { AgentGatekeepers } from './components/AgentGatekeepers';
import { SpectrumAnalyzer } from './components/SpectrumAnalyzer';
import { WebRTCController } from './components/WebRTCController';
import { TelemetryLog, LogEntry } from './components/TelemetryLog';
import { MeshNode, AcousticTelemetry, AgentSpec, SignalingMessage } from './types';
import { ShieldCheck, Info, RefreshCw, Cpu, Activity } from 'lucide-react';

export default function App() {
  const [room, setRoom] = useState('schizophonic-studio-1');
  const [localPeerId, setLocalPeerId] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [peers, setPeers] = useState<MeshNode[]>([]);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<AcousticTelemetry>({
    dominantFreqHz: 432,
    headroomPercent: 18.5,
    dissonanceHz: 1.2,
    phiHarmonyScore: 90,
    timestamp: Date.now(),
    mode: '0 Hz Ionian Mode'
  });

  // Agent specs loaded from backend
  const [agents, setAgents] = useState<AgentSpec[]>([
    {
      id: 1,
      name: "Reson",
      role: "Harmonic Logic Gatekeeper",
      gate: "15% headroom enforcement · Savage Reason halt (>10 Hz)",
      status: "ACTIVE",
      color: "emerald"
    },
    {
      id: 2,
      name: "Echolette",
      role: "Feedback Loop Architect",
      gate: "Semantic drift detection · Ceremonialization flagging",
      status: "ACTIVE",
      color: "cyan"
    },
    {
      id: 3,
      name: "Lyra",
      role: "Harmonic Synthesizer",
      gate: "Multi-agent coordination · dissonance reconciliation",
      status: "ACTIVE",
      color: "purple"
    }
  ]);

  const wsRef = useRef<WebSocket | null>(null);

  const addLog = useCallback((type: LogEntry['type'], message: string, details?: any) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: timeStr,
      details
    };
    setLogs((prev) => [newEntry, ...prev].slice(0, 100));
  }, []);

  // Fetch agent specs from API
  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        if (data?.agents) {
          setAgents(data.agents);
        }
      })
      .catch((err) => {
        console.warn('Using default agent registry specs:', err);
      });
  }, []);

  // Connect to WebSocket signaling server
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    addLog('info', `Connecting to WebSocket signaling endpoint at ${wsUrl}...`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      addLog('info', `WebSocket signaling connection OPEN.`);

      // Send Join message
      const myId = `peer-${Math.random().toString(36).substr(2, 6)}`;
      setLocalPeerId(myId);

      ws.send(JSON.stringify({
        type: 'join',
        room,
        peerId: myId,
        agentRole: 'MeshNode'
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: SignalingMessage = JSON.parse(event.data);

        if (msg.type === 'joined') {
          addLog('signal', `Successfully joined room "${msg.room}". Peers: ${msg.members?.length || 0}`);
          if (msg.members) {
            const remotePeers: MeshNode[] = msg.members
              .filter((m) => m.peerId !== msg.peerId)
              .map((m) => ({
                peerId: m.peerId,
                agentRole: m.agentRole || 'MeshNode',
                connectedAt: Date.now(),
                status: 'connected'
              }));
            setPeers(remotePeers);
          }
        } else if (msg.type === 'peer-joined') {
          addLog('signal', `Remote peer joined mesh: ${msg.peerId}`);
          setPeers((prev) => {
            if (prev.some((p) => p.peerId === msg.peerId)) return prev;
            return [...prev, {
              peerId: msg.peerId!,
              agentRole: msg.agentRole || 'MeshNode',
              connectedAt: Date.now(),
              status: 'connected'
            }];
          });
        } else if (msg.type === 'peer-left') {
          addLog('signal', `Peer disconnected from mesh: ${msg.peerId}`);
          setPeers((prev) => prev.filter((p) => p.peerId !== msg.peerId));
        } else if (msg.type === 'signal') {
          addLog('signal', `Received signal from ${msg.sender}: ${JSON.stringify(msg.data || msg)}`);
        } else if (msg.type === 'telemetry') {
          addLog('telemetry', `Telemetry broadcast from ${msg.sender}: Freq ${msg.telemetry?.dominantFreqHz}Hz, Headroom ${msg.telemetry?.headroomPercent}%`);
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      addLog('warning', 'WebSocket signaling connection CLOSED.');
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      addLog('warning', 'WebSocket connection error encountered.');
    };
  }, [room, addLog]);

  // Connect on room change or mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [room, connectWebSocket]);

  // Evaluate telemetry against API periodically or on change
  useEffect(() => {
    if (telemetry.dissonanceHz > 10) {
      addLog('halt', `SAVAGE REASON HALT: Cognitive dissonance (${telemetry.dissonanceHz.toFixed(1)} Hz) exceeds 10 Hz threshold! Signal halted by Reson.`);
    } else if (telemetry.headroomPercent < 15) {
      addLog('warning', `HEADROOM WARNING: Signal headroom (${telemetry.headroomPercent.toFixed(1)}%) below 15% Reson threshold.`);
    }

    // Broadcast telemetry over WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'telemetry',
        room,
        telemetry
      }));
    }
  }, [telemetry, room, addLog]);

  const savageReasonHalt = telemetry.dissonanceHz > 10;

  const handleSendSignal = (signalData: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(signalData));
      addLog('signal', `Broadcasted WebRTC ping signal to room ${room}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        room={room}
        setRoom={setRoom}
        isConnected={wsConnected}
        peerCount={peers.length}
        onReconnect={connectWebSocket}
        phiHarmonyScore={telemetry.phiHarmonyScore}
        savageReasonHalt={savageReasonHalt}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Top: 3 Agent Gatekeeper Cards */}
        <section>
          <AgentGatekeepers
            agents={agents}
            headroomPercent={telemetry.headroomPercent}
            dissonanceHz={telemetry.dissonanceHz}
            savageReasonHalt={savageReasonHalt}
          />
        </section>

        {/* Middle: Spectrum Analyzer & Mesh Controller */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7">
            <SpectrumAnalyzer
              telemetry={telemetry}
              setTelemetry={setTelemetry}
              isAudioActive={isAudioActive}
              setIsAudioActive={setIsAudioActive}
              savageReasonHalt={savageReasonHalt}
            />
          </div>

          <div className="lg:col-span-5">
            <WebRTCController
              peers={peers}
              localPeerId={localPeerId}
              wsConnected={wsConnected}
              room={room}
              onSendSignal={handleSendSignal}
              telemetry={telemetry}
            />
          </div>

        </section>

        {/* Bottom: Telemetry Console Log */}
        <section>
          <TelemetryLog
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </section>

        {/* Ecosystem Footer Info */}
        <footer className="border-t border-slate-800/80 pt-6 pb-8 text-xs font-mono text-slate-500 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-slate-300 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Schizophonic Studio &bull; Acoustic-Mesh Substrate
              </div>
              <p className="text-slate-500">
                Governed by DGAF / Agent Amethyst &bull; PhiLattice / PDMAL Ecosystem &bull; OpenTelemetry Observability
              </p>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
                Target: 0 Hz Ionian Mode
              </span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
                15% Headroom Enforced
              </span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
