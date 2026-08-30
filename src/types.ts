export interface MeshNode {
  peerId: string;
  agentRole: string;
  connectedAt: number;
  latencyMs?: number;
  status: 'connecting' | 'connected' | 'disconnected' | 'halted';
  dominantFreqHz?: number;
  headroomPct?: number;
}

export interface AcousticTelemetry {
  dominantFreqHz: number;
  headroomPercent: number;
  dissonanceHz: number;
  phiHarmonyScore: number;
  timestamp: number;
  mode: string;
}

export interface AgentSpec {
  id: number;
  name: string;
  role: string;
  gate: string;
  status: 'ACTIVE' | 'WARNING' | 'HALT_TRIGGERED';
  color: 'emerald' | 'cyan' | 'purple';
  metrics?: string;
}

export interface SignalingMessage {
  type: 'join' | 'joined' | 'peer-joined' | 'peer-left' | 'signal' | 'telemetry' | 'error';
  room?: string;
  peerId?: string;
  agentRole?: string;
  members?: Array<{ peerId: string; agentRole: string }>;
  telemetry?: AcousticTelemetry;
  sender?: string;
  target?: string;
  data?: any;
  message?: string;
}

export interface AudioPreset {
  name: string;
  freqHz: number;
  phiMultiplier: number;
  description: string;
}
