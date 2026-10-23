CREATE TYPE "public"."identity_verification_status" AS ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('ACTIVE', 'SUSPENDED', 'ARCHIVED');--> statement-breakpoint

ALTER TYPE "public"."organization_member_role"
RENAME VALUE 'OWNER' TO 'PRIMARY_REPRESENTATIVE';--> statement-breakpoint

ALTER TYPE "public"."organization_member_role"
RENAME VALUE 'MEMBER' TO 'STAFF';--> statement-breakpoint

ALTER TABLE "organization_members"
ALTER COLUMN "role"
SET DEFAULT 'STAFF'::"public"."organization_member_role";--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN "identity_verification_status" "identity_verification_status" DEFAULT 'UNVERIFIED' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "status" "organization_status" DEFAULT 'ACTIVE' NOT NULL;