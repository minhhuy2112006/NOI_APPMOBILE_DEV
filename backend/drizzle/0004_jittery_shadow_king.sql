CREATE TYPE "public"."organization_representative_transfer_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "organization_representative_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"status" "organization_representative_transfer_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_representative_transfers" ADD CONSTRAINT "organization_representative_transfers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_representative_transfers" ADD CONSTRAINT "organization_representative_transfers_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_representative_transfers" ADD CONSTRAINT "organization_representative_transfers_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_rep_transfers_org_id_idx" ON "organization_representative_transfers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_rep_transfers_from_user_idx" ON "organization_representative_transfers" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "organization_rep_transfers_to_user_idx" ON "organization_representative_transfers" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "organization_rep_transfers_status_idx" ON "organization_representative_transfers" USING btree ("status");