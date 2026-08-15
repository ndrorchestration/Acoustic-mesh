import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { peers, signals } from "../../db/schema.js";
import { lt, sql } from "drizzle-orm";

export default async (req: Request) => {
  const staleThreshold = new Date(Date.now() - 60_000);
  const signalTtl = new Date(Date.now() - 120_000);

  const [deletedPeers] = await db
    .delete(peers)
    .where(lt(peers.lastSeen, staleThreshold))
    .returning({ count: sql<number>`count(*)::int` });

  const [deletedSignals] = await db
    .delete(signals)
    .where(lt(signals.createdAt, signalTtl))
    .returning({ count: sql<number>`count(*)::int` });

  console.log(
    `Cleanup: removed ${deletedPeers?.count ?? 0} stale peers, ${deletedSignals?.count ?? 0} old signals`
  );
};

export const config: Config = {
  schedule: "*/2 * * * *",
};
