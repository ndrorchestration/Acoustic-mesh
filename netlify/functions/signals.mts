import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { signals, rooms } from "../../db/schema.js";
import { eq, and, gt, ne, sql } from "drizzle-orm";

export default async (req: Request, context: { params: Record<string, string> }) => {
  const { roomId } = context.params;

  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  if (req.method === "POST") {
    const { fromPeer, toPeer, type, payload } = await req.json();
    if (!fromPeer || !type || payload === undefined) {
      return Response.json(
        { error: "fromPeer, type, and payload required" },
        { status: 400 }
      );
    }

    const [signal] = await db
      .insert(signals)
      .values({ roomId, fromPeer, toPeer: toPeer ?? null, type, payload, consumedBy: [] })
      .returning();

    return Response.json(signal, { status: 201 });
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const peerId = url.searchParams.get("peerId");
    const since = url.searchParams.get("since");

    if (!peerId) {
      return Response.json({ error: "peerId required" }, { status: 400 });
    }

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 30_000);

    const pending = await db
      .select()
      .from(signals)
      .where(
        and(
          eq(signals.roomId, roomId),
          gt(signals.createdAt, sinceDate),
          ne(signals.fromPeer, peerId),
          sql`(${signals.toPeer} IS NULL OR ${signals.toPeer} = ${peerId})`,
          sql`NOT (${signals.consumedBy} @> ${JSON.stringify([peerId])}::jsonb)`
        )
      );

    if (pending.length > 0) {
      for (const s of pending) {
        await db
          .update(signals)
          .set({
            consumedBy: sql`${signals.consumedBy} || ${JSON.stringify([peerId])}::jsonb`,
          })
          .where(eq(signals.id, s.id));
      }
    }

    return Response.json(pending);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rooms/:roomId/signals",
};
