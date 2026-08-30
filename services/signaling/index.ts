import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

export interface ExtendedWebSocket extends WebSocket {
  room?: string;
  peerId?: string;
  agentRole?: string;
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
      } catch (e) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (data.type === "join") {
        ws.room = data.room || "schizophonic-studio-1";
        ws.peerId = data.peerId || `peer-${Math.random().toString(36).substr(2, 6)}`;
        ws.agentRole = data.agentRole || "Node";
        
        if (!rooms.has(ws.room)) rooms.set(ws.room, new Set());
        rooms.get(ws.room)!.add(ws);

        // Get members list
        const members = Array.from(rooms.get(ws.room)!).map(client => ({
          peerId: client.peerId,
          agentRole: client.agentRole
        }));

        ws.send(JSON.stringify({
          type: "joined",
          room: ws.room,
          peerId: ws.peerId,
          members
        }));

        // Broadcast to existing room peers
        rooms.get(ws.room)!.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "peer-joined",
              peerId: ws.peerId,
              agentRole: ws.agentRole
            }));
          }
        });
      }

      if (data.type === "signal") {
        const room = ws.room ? rooms.get(ws.room) : undefined;
        if (!room) return;
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            if (!data.target || client.peerId === data.target) {
              client.send(JSON.stringify({ ...data, sender: ws.peerId }));
            }
          }
        });
      }

      if (data.type === "telemetry") {
        const room = ws.room ? rooms.get(ws.room) : undefined;
        if (!room) return;
        room.forEach((client) => {
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
      if (ws.room && rooms.has(ws.room)) {
        rooms.get(ws.room)!.delete(ws);
        if (ws.peerId) {
          rooms.get(ws.room)!.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "peer-left", peerId: ws.peerId }));
            }
          });
        }
        if (rooms.get(ws.room)!.size === 0) {
          rooms.delete(ws.room);
        }
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket client error:", err.message);
    });
  });

  return { wss, rooms };
}
