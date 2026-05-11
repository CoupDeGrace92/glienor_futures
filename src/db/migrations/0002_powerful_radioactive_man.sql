CREATE TABLE "items" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_price_logs" RENAME TO "granular_price_logs";--> statement-breakpoint
ALTER TABLE "price_history" DROP CONSTRAINT "price_history_name_users_username_fk";
--> statement-breakpoint
ALTER TABLE "granular_price_logs" ADD COLUMN "avg_high_price" integer;--> statement-breakpoint
ALTER TABLE "granular_price_logs" ADD COLUMN "high_price_volume" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "granular_price_logs" ADD COLUMN "avg_low_price" integer;--> statement-breakpoint
ALTER TABLE "granular_price_logs" ADD COLUMN "low_price_volume" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "price_history" ADD COLUMN "price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "granular_price_logs" ADD CONSTRAINT "granular_price_logs_id_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_id_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "granular_price_logs" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "granular_price_logs" DROP COLUMN "volume";