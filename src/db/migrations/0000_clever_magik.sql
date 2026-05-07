CREATE TABLE "daily_price_logs" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"last_update" timestamp NOT NULL,
	"id" integer NOT NULL,
	"volume" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metadata" (
	"version" serial PRIMARY KEY NOT NULL,
	"last_log_update" timestamp,
	"last_hist_update" timestamp,
	"last_sync_status" varchar,
	"last_sync_error" text,
	"items_processed" integer,
	"last_sync_duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"last_update" timestamp NOT NULL,
	"id" integer NOT NULL,
	"volume" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh" (
	"token" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"username" text NOT NULL,
	"email" varchar(256),
	"password" text DEFAULT 'NOSET' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_name_users_username_fk" FOREIGN KEY ("name") REFERENCES "public"."users"("username") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh" ADD CONSTRAINT "refresh_username_users_username_fk" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE cascade ON UPDATE no action;