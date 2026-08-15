import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { rooms, peers } from "../../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method === "GET") {
    const allRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        createdAt: rooms.createdAt,
        peerCount: sql<number>`count(${peers.id})::int`,
      })
      .from(rooms)
      .leftJoin(peers, eq(rooms.id, peers.roomId))
      .groupBy(rooms.id)
      .orderBy(desc(rooms.createdAt));

    return Response.json(allRooms);
  }

  if (req.method === "POST") {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return Response.json({ error: "Room name required" }, { status: 400 });
    }
    const [room] = await db
      .insert(rooms)
      .values({ name: name.trim() })
      .returning();
    return Response.json(room, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rooms",
};
