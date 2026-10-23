CREATE TYPE "public"."organization_invitation_status" AS ENUM('PENDING', 'PENDING_VERIFICATION', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invited_user_id" uuid NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"role" "organization_member_role" DEFAULT 'STAFF' NOT NULL,
	"status" "organization_invitation_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_invitations_org_id_idx" ON "organization_invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_invitations_invited_user_id_idx" ON "organization_invitations" USING btree ("invited_user_id");--> statement-breakpoint
CREATE INDEX "organization_invitations_status_idx" ON "organization_invitations" USING btree ("status");