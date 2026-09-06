import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { attachSignaling } from "./services/signaling/index.ts";

const HEURISTIC_BOUNDARY = {
  evidenceClass: "PROJECT_LOCAL_HEURISTIC",
  scientificCalibration: false,
  physicalValidation: false,
  governanceAuthority: false,
  note: "Values and persona labels exposed by these routes are experimental UI/simulation constructs, not validated acoustic, cognitive, or governance measurements."
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HOST = "0.0.0.0";

  app.use(express.json());

  const server = http.createServer(app);

  // WebSocket room/signaling transport. This verifies transport behavior only;
  // it does not establish physical acoustic performance.
  const activeRooms = new Map();
  const { rooms } = attachSignaling(server, activeRooms);

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "acoustic-mesh-experimental",
      serverTime: new Date().toISOString(),
      activeRooms: rooms.size,
      uptime: process.uptime(),
      evidenceBoundary: "runtime-health-only"
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
      classification: HEURISTIC_BOUNDARY,
      studioLabel: "Schizophonic Studio (historical/project vocabulary)",
      ecosystemReferences: ["DGAF", "PDMAL"],
      agents: [
        {
          id: 1,
          name: "Reson",
          role: "Project-local threshold persona",
          gate: "Simulation rule: flag headroom below 15%; flag dissonance input above 10 Hz",
          status: "ACTIVE",
          color: "emerald"
        },
        {
          id: 2,
          name: "Echolette",
          role: "Project-local drift-display persona",
          gate: "Simulation rule: display elevated synthetic drift when dissonance input exceeds 5",
          status: "ACTIVE",
          color: "cyan"
        },
        {
          id: 3,
          name: "Lyra",
          role: "Project-local synthesis-display persona",
          gate: "Simulation rule: display heuristic reconciliation state from synthetic telemetry",
          status: "ACTIVE",
          color: "purple"
        }
      ],
      targetStateLabel: "0 Hz Ionian Mode (project vocabulary; not a physical target)",
      heuristicConstants: {
        headroomThresholdPercent: 15,
        dissonanceThresholdHz: 10,
        phiRatioReference: 1.61803398875
      }
    });
  });

  app.post("/api/telemetry/evaluate", (req, res) => {
    const { dominantFreqHz, headroomPercent, dissonanceHz } = req.body || {};

    const freq = Number(dominantFreqHz) || 432;
    const headroom = Number(headroomPercent) || 18.5;
    const dissonance = Number(dissonanceHz) || 1.2;

    const headroomViolation = headroom < 15;
    const heuristicHalt = dissonance > 10;

    // Project-local deterministic display score. This formula is not calibrated
    // as an acoustic-quality, cognitive-state, truth, or safety metric.
    const phiHarmonyScore = Math.max(
      0,
      Math.min(100, Math.round(100 - dissonance * 8 - (headroomViolation ? 25 : 0)))
    );

    res.json({
      classification: HEURISTIC_BOUNDARY,
      timestamp: Date.now(),
      evaluatedState: {
        dominantFreqHz: freq,
        headroomPercent: headroom,
        dissonanceHz: dissonance,
        phiHarmonyScore
      },
      simulationState: {
        reson: {
          status: heuristicHalt ? "SIMULATION_THRESHOLD_TRIGGERED" : headroomViolation ? "SIMULATION_HEADROOM_WARNING" : "SIMULATION_NOMINAL",
          headroomOk: !headroomViolation,
          heuristicHalt
        },
        echolette: {
          status: dissonance > 5 ? "SIMULATION_DRIFT_FLAG" : "SIMULATION_NOMINAL",
          syntheticDriftIndicator: Number(Math.min(10, dissonance * 0.9).toFixed(2))
        },
        lyra: {
          status: phiHarmonyScore > 80 ? "SIMULATION_RECONCILED" : "SIMULATION_ADJUSTING",
          suggestedDisplayCorrectionHz: Number((dissonance * -1).toFixed(2))
        }
      }
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
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
