CREATE TABLE "campaign_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"capacity" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_positions_capacity_positive" CHECK (
            "campaign_positions"."capacity" > 0
          )
);
--> statement-breakpoint
ALTER TABLE "campaign_positions" ADD CONSTRAINT "campaign_positions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_positions_campaign_id_idx" ON "campaign_positions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_positions_active_idx" ON "campaign_positions" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_positions_campaign_name_unique" ON "campaign_positions" USING btree ("campaign_id","name");