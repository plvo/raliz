ALTER TABLE "user_accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_accounts" CASCADE;--> statement-breakpoint
DROP TABLE "user_sessions" CASCADE;--> statement-breakpoint
ALTER TABLE "organizers" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "wallet_address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "banned";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ban_reason";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ban_expires";