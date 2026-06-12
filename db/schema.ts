import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const peers = pgTable("peers", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  peerId: text("peer_id").notNull(),
  userAgent: text("user_agent"),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signals = pgTable("signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  fromPeer: text("from_peer").notNull(),
  toPeer: text("to_peer"),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  consumedBy: jsonb("consumed_by").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
