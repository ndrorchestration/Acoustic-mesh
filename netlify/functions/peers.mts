import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { peers, rooms } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export default async (req: Request, context: { params: Record<string, string> }) => {
  const { roomId } = context.params;

  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  if (req.method === "POST") {
    const { peerId, userAgent } = await req.json();
    if (!peerId || typeof peerId !== "string") {
      return Response.json({ error: "peerId required" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(peers)
      .where(and(eq(peers.roomId, roomId), eq(peers.peerId, peerId)));

    if (existing) {
      const [updated] = await db
        .update(peers)
        .set({ lastSeen: new Date(), userAgent: userAgent ?? existing.userAgent })
        .where(eq(peers.id, existing.id))
        .returning();
      return Response.json(updated);
    }

    const [peer] = await db
      .insert(peers)
      .values({ roomId, peerId, userAgent: userAgent ?? null })
      .returning();
    return Response.json(peer, { status: 201 });
  }

  if (req.method === "GET") {
    const peerList = await db
      .select()
      .from(peers)
      .where(eq(peers.roomId, roomId));
    return Response.json(peerList);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rooms/:roomId/peers",
};
