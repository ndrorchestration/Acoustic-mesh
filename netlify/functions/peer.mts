import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { peers } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export default async (req: Request, context: { params: Record<string, string> }) => {
  const { roomId, peerId } = context.params;

  if (req.method === "DELETE") {
    await db
      .delete(peers)
      .where(and(eq(peers.roomId, roomId), eq(peers.peerId, peerId)));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/rooms/:roomId/peers/:peerId",
};
