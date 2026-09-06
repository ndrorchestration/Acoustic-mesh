import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

export interface ExtendedWebSocket extends WebSocket {
  room?: string;
  peerId?: string;
  agentRole?: string;
}

function normalizedString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function attachSignaling(server: Server | number, roomsMap = new Map<string, Set<ExtendedWebSocket>>()) {
  const wss = typeof server === "number"
    ? new WebSocketServer({ port: server })
    : new WebSocketServer({ server });

  const rooms = roomsMap;

  wss.on("connection", (ws: ExtendedWebSocket) => {
    ws.on("message", (msg) => {
      let data: any;
      try {
        data = JSON.parse(msg.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (data.type === "join") {
        const room = normalizedString(data.room, "acoustic-mesh-demo-1");
        const peerId = normalizedString(data.peerId, `peer-${Math.random().toString(36).substr(2, 6)}`);
        const agentRole = normalizedString(data.agentRole, "MeshNode");

        ws.room = room;
        ws.peerId = peerId;
        ws.agentRole = agentRole;

        if (!rooms.has(room)) rooms.set(room, new Set());
        const roomPeers = rooms.get(room)!;
        roomPeers.add(ws);

        const members = Array.from(roomPeers).map((client) => ({
          peerId: client.peerId ?? "unknown-peer",
          agentRole: client.agentRole ?? "MeshNode"
        }));

        ws.send(JSON.stringify({
          type: "joined",
          room,
          peerId,
          members
        }));

        roomPeers.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "peer-joined",
              peerId,
              agentRole
            }));
          }
        });
        return;
      }

      if (!ws.room || !ws.peerId) {
        ws.send(JSON.stringify({ type: "error", message: "Join a room before sending signaling or telemetry messages." }));
        return;
      }

      const roomPeers = rooms.get(ws.room);
      if (!roomPeers) return;

      if (data.type === "signal") {
        roomPeers.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            if (!data.target || client.peerId === data.target) {
              client.send(JSON.stringify({ ...data, sender: ws.peerId }));
            }
          }
        });
      }

      if (data.type === "telemetry") {
        roomPeers.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "telemetry",
              sender: ws.peerId,
              telemetry: data.telemetry,
              timestamp: Date.now()
            }));
          }
        });
      }
    });

    ws.on("close", () => {
      const room = ws.room;
      if (!room) return;
      const roomPeers = rooms.get(room);
      if (!roomPeers) return;

      roomPeers.delete(ws);
      if (ws.peerId) {
        roomPeers.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "peer-left", peerId: ws.peerId }));
          }
        });
      }
      if (roomPeers.size === 0) rooms.delete(room);
    });

    ws.on("error", (err) => {
      console.error("WebSocket client error:", err.message);
    });
  });

  return { wss, rooms };
}
