CREATE TYPE "public"."user_role" AS ENUM('USER', 'ORGANIZER', 'CAMPAIGN_MANAGER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"name" varchar(120) NOT NULL,
	"avatar_url" text,
	"birthday" date,
	"gender" varchar(32),
	"phone" varchar(32),
	"city" varchar(120),
	"emergency_name" varchar(120),
	"emergency_relationship" varchar(80),
	"emergency_phone" varchar(32),
	"skills" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"interests" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"member_since" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(64) NOT NULL,
	"device_name" varchar(160),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"language" varchar(10) DEFAULT 'vi' NOT NULL,
	"notification_enabled" boolean DEFAULT true NOT NULL,
	"campaign_notification_enabled" boolean DEFAULT true NOT NULL,
	"attendance_notification_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");