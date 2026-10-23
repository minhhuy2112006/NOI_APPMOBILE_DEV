CREATE TYPE "public"."campaign_recruitment_status" AS ENUM('OPEN', 'WAITLIST_ONLY', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"summary" varchar(500),
	"description" text,
	"cover_image_url" text,
	"location_name" varchar(255),
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"capacity" integer,
	"status" "campaign_status" DEFAULT 'DRAFT' NOT NULL,
	"recruitment_status" "campaign_recruitment_status" DEFAULT 'CLOSED' NOT NULL,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_capacity_positive" CHECK (
            "campaigns"."capacity" IS NULL
            OR "campaigns"."capacity" > 0
          ),
	CONSTRAINT "campaigns_valid_time_range" CHECK (
            "campaigns"."start_at" IS NULL
            OR "campaigns"."end_at" IS NULL
            OR "campaigns"."end_at" > "campaigns"."start_at"
          )
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaigns_organization_id_idx" ON "campaigns" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_recruitment_status_idx" ON "campaigns" USING btree ("recruitment_status");--> statement-breakpoint
CREATE INDEX "campaigns_start_at_idx" ON "campaigns" USING btree ("start_at");