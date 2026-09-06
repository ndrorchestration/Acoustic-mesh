import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { AgentGatekeepers } from './components/AgentGatekeepers';
import { SpectrumAnalyzer } from './components/SpectrumAnalyzer';
import { WebRTCController } from './components/WebRTCController';
import { TelemetryLog, LogEntry } from './components/TelemetryLog';
import { MeshNode, AcousticTelemetry, AgentSpec, SignalingMessage } from './types';
import { Info } from 'lucide-react';

export default function App() {
  const [room, setRoom] = useState('acoustic-mesh-demo-1');
  const [localPeerId, setLocalPeerId] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [peers, setPeers] = useState<MeshNode[]>([]);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [telemetry, setTelemetry] = useState<AcousticTelemetry>({
    dominantFreqHz: 432,
    headroomPercent: 18.5,
    dissonanceHz: 1.2,
    phiHarmonyScore: 90,
    timestamp: Date.now(),
    mode: 'historical Ionian-mode label'
  });

  const [agents, setAgents] = useState<AgentSpec[]>([
    {
      id: 1,
      name: 'Reson',
      role: 'Project-local threshold persona',
      gate: 'Simulation rule: flag headroom below 15%; flag dissonance input above 10 Hz',
      status: 'ACTIVE',
      color: 'emerald'
    },
    {
      id: 2,
      name: 'Echolette',
      role: 'Project-local drift-display persona',
      gate: 'Simulation rule: display elevated synthetic drift when dissonance input exceeds 5',
      status: 'ACTIVE',
      color: 'cyan'
    },
    {
      id: 3,
      name: 'Lyra',
      role: 'Project-local synthesis-display persona',
      gate: 'Simulation rule: display heuristic reconciliation state from synthetic telemetry',
      status: 'ACTIVE',
      color: 'purple'
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

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        if (data?.agents) setAgents(data.agents);
      })
      .catch((err) => {
        console.warn('Using bundled project-local persona specs:', err);
      });
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    addLog('info', `Connecting to WebSocket signaling endpoint at ${wsUrl}...`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      addLog('info', 'WebSocket signaling connection OPEN.');

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
          addLog('signal', `Joined room "${msg.room}". Peers: ${msg.members?.length || 0}`);
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
          addLog('telemetry', `Telemetry broadcast from ${msg.sender}: frequency ${msg.telemetry?.dominantFreqHz} Hz, headroom ${msg.telemetry?.headroomPercent}%`);
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

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [room, connectWebSocket]);

  useEffect(() => {
    if (telemetry.dissonanceHz > 10) {
      addLog('halt', `SIMULATION THRESHOLD: project-defined dissonance input (${telemetry.dissonanceHz.toFixed(1)} Hz) exceeded the demo threshold. No cognitive or safety interpretation is implied.`);
    } else if (telemetry.headroomPercent < 15) {
      addLog('warning', `SIMULATION WARNING: headroom input (${telemetry.headroomPercent.toFixed(1)}%) is below the demo threshold.`);
    }

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
      addLog('signal', `Broadcast signaling payload to room ${room}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        room={room}
        setRoom={setRoom}
        isConnected={wsConnected}
        peerCount={peers.length}
        onReconnect={connectWebSocket}
        phiHarmonyScore={telemetry.phiHarmonyScore}
        savageReasonHalt={savageReasonHalt}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <aside className="rounded-xl border border-cyan-900/70 bg-cyan-950/20 p-4 text-sm text-cyan-100 flex gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
          <p>
            <strong>Experimental simulation boundary:</strong> signaling and browser-audio code are executable software; persona labels, “dissonance” values, thresholds, and heuristic scores are project-local display constructs. They are not validated cognitive, physical-acoustic, truth, safety, or governance measurements.
          </p>
        </aside>

        <section>
          <AgentGatekeepers
            agents={agents}
            headroomPercent={telemetry.headroomPercent}
            dissonanceHz={telemetry.dissonanceHz}
            savageReasonHalt={savageReasonHalt}
          />
        </section>

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

        <section>
          <TelemetryLog logs={logs} onClearLogs={() => setLogs([])} />
        </section>

        <footer className="border-t border-slate-800/80 pt-6 pb-8 text-xs font-mono text-slate-500">
          <p className="text-slate-300 font-bold">Acoustic-Mesh experimental engineering workspace</p>
          <p className="mt-1">Runtime/signaling evidence is separate from acoustic-performance evidence. DGAF/PDMAL and historical persona terminology do not transfer validation or authority to this repository.</p>
        </footer>
      </main>
    </div>
  );
}
