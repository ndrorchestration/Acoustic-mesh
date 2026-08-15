import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { peers } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { roomId, peerId } = await req.json();
  if (!roomId || !peerId) {
    return Response.json({ error: "roomId and peerId required" }, { status: 400 });
  }

  const [updated] = await db
    .update(peers)
    .set({ lastSeen: new Date() })
    .where(and(eq(peers.roomId, roomId), eq(peers.peerId, peerId)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Peer not found" }, { status: 404 });
  }

  return Response.json({ ok: true, lastSeen: updated.lastSeen });
};

export const config: Config = {
  path: "/api/heartbeat",
};
