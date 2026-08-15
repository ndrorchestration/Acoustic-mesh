import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { rooms, peers } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request, context: { params: Record<string, string> }) => {
  const { id } = context.params;

  const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  if (req.method === "GET") {
    const peerList = await db
      .select()
      .from(peers)
      .where(eq(peers.roomId, id));

    return Response.json({ ...room, peers: peerList });
  }

  if (req.method === "DELETE") {
    await db.delete(rooms).where(eq(rooms.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rooms/:id",
};
