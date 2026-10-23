CREATE TYPE "public"."campaign_application_status" AS ENUM('PENDING_REVIEW', 'SELECTED_PENDING_CONFIRMATION', 'CONFIRMED', 'WAITLISTED', 'WAITLIST_INVITED', 'REJECTED', 'DECLINED', 'CONFIRMATION_EXPIRED', 'WITHDRAW_REQUESTED', 'WITHDRAWN', 'PARTICIPATION_COMPLETED');--> statement-breakpoint
CREATE TABLE "campaign_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"applicant_user_id" uuid NOT NULL,
	"motivation" text,
	"status" "campaign_application_status" DEFAULT 'PENDING_REVIEW' NOT NULL,
	"confirmation_expires_at" timestamp with time zone,
	"selected_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"waitlisted_at" timestamp with time zone,
	"waitlist_invited_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"confirmation_expired_at" timestamp with time zone,
	"withdraw_requested_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone,
	"participation_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_position_id_campaign_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."campaign_positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_applications_campaign_user_unique" ON "campaign_applications" USING btree ("campaign_id","applicant_user_id");--> statement-breakpoint
CREATE INDEX "campaign_applications_campaign_id_idx" ON "campaign_applications" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_applications_position_id_idx" ON "campaign_applications" USING btree ("position_id");--> statement-breakpoint
CREATE INDEX "campaign_applications_applicant_user_id_idx" ON "campaign_applications" USING btree ("applicant_user_id");--> statement-breakpoint
CREATE INDEX "campaign_applications_status_idx" ON "campaign_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaign_applications_campaign_status_idx" ON "campaign_applications" USING btree ("campaign_id","status");