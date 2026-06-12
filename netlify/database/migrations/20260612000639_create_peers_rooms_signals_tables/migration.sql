CREATE TABLE "peers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"room_id" uuid NOT NULL,
	"peer_id" text NOT NULL,
	"user_agent" text,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"room_id" uuid NOT NULL,
	"from_peer" text NOT NULL,
	"to_peer" text,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"consumed_by" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "peers" ADD CONSTRAINT "peers_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_room_id_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE;