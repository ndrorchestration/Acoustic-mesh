import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { attachSignaling } from "./services/signaling/index.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HOST = "0.0.0.0";

  app.use(express.json());

  const server = http.createServer(app);

  // Attach WebSocket signaling to HTTP server
  const activeRooms = new Map();
  const { rooms } = attachSignaling(server, activeRooms);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      activeRooms: rooms.size,
      uptime: process.uptime()
    });
  });

  app.get("/api/rooms", (req, res) => {
    const roomList = Array.from(rooms.entries()).map(([name, peers]) => ({
      name,
      peerCount: (peers as Set<any>).size
    }));
    res.json({ rooms: roomList });
  });

  app.get("/api/agents", (req, res) => {
    res.json({
      studio: "Schizophonic Studio Substrate",
      ecosystem: "PhiLattice / PDMAL",
      governance: "DGAF / Agent Amethyst",
      agents: [
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
      ],
      targetState: "0 Hz Ionian Mode (Full Harmonic Stability)",
      constraints: {
        headroomLimitPercent: 15,
        savageReasonThresholdHz: 10,
        phiRatio: 1.61803398875
      }
    });
  });

  app.post("/api/telemetry/evaluate", (req, res) => {
    const { dominantFreqHz, headroomPercent, dissonanceHz } = req.body || {};
    
    const freq = Number(dominantFreqHz) || 432;
    const headroom = Number(headroomPercent) || 18.5;
    const dissonance = Number(dissonanceHz) || 1.2;

    const headroomViolation = headroom < 15;
    const savageReasonHalt = dissonance > 10;
    
    // Calculate phi harmony index (0 to 100)
    // Target harmonic ratios relative to 432Hz / 1.618
    const phiHarmonyScore = Math.max(0, Math.min(100, Math.round(100 - (dissonance * 8) - (headroomViolation ? 25 : 0))));

    res.json({
      timestamp: Date.now(),
      evaluatedState: {
        dominantFreqHz: freq,
        headroomPercent: headroom,
        dissonanceHz: dissonance,
        phiHarmonyScore
      },
      agentStatus: {
        reson: {
          status: savageReasonHalt ? "HALT_TRIGGERED" : headroomViolation ? "HEADROOM_WARNING" : "OPTIMAL",
          headroomOk: !headroomViolation,
          savageReasonHalt
        },
        echolette: {
          status: dissonance > 5 ? "DRIFT_DETECTED" : "STABLE",
          semanticDriftScore: Math.min(10, (dissonance * 0.9).toFixed(2))
        },
        lyra: {
          status: phiHarmonyScore > 80 ? "RECONCILED" : "SYNTHESIZING_HARMONICS",
          suggestedCorrectionHz: (dissonance * -1.0).toFixed(2)
        }
      }
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`[Acoustic Mesh] Server listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
