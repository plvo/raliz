CREATE TYPE "public"."notification_type" AS ENUM('RAFFLE_CREATED', 'PARTICIPATION_CONFIRMED', 'WINNER_SELECTED', 'RAFFLE_ENDED');--> statement-breakpoint
CREATE TYPE "public"."raffle_status" AS ENUM('DRAFT', 'ACTIVE', 'ENDED');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"raffle_id" uuid
);
--> statement-breakpoint
CREATE TABLE "organizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"description" text,
	"logo_url" varchar(500),
	"wallet_address" varchar(42) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizers_email_unique" UNIQUE("email"),
	CONSTRAINT "organizers_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "participations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"transaction_hash" varchar(66),
	"amount_paid" numeric(18, 8) NOT NULL,
	"token_used" varchar(10) NOT NULL,
	"participated_at" timestamp DEFAULT now() NOT NULL,
	"is_winner" boolean DEFAULT false NOT NULL,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"raffle_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raffles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"prize_description" text NOT NULL,
	"image_url" varchar(500),
	"participation_price" numeric(18, 8) DEFAULT '0' NOT NULL,
	"token_contract_address" varchar(42),
	"token_symbol" varchar(10) DEFAULT 'CHZ' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"max_winners" varchar(10) DEFAULT '1' NOT NULL,
	"max_participants" varchar(10),
	"status" "raffle_status" DEFAULT 'DRAFT' NOT NULL,
	"smart_contract_address" varchar(42),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organizer_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" varchar(255),
	"password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"ip_address" varchar(255),
	"user_agent" varchar(255),
	"expires_at" timestamp NOT NULL,
	"impersonated_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"username" varchar(255),
	"wallet_address" varchar(42),
	"phone" varchar(255),
	"email_verified" boolean DEFAULT true NOT NULL,
	"role" varchar(255) DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" varchar(255),
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "winners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"winner_rank" varchar(10) NOT NULL,
	"has_been_contacted" boolean DEFAULT false NOT NULL,
	"drawn_at" timestamp DEFAULT now() NOT NULL,
	"contacted_at" timestamp,
	"contact_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"participation_id" uuid NOT NULL,
	"raffle_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_participation_id_participations_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."participations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_raffle_id_idx" ON "notifications" USING btree ("raffle_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "organizers_email_idx" ON "organizers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "organizers_wallet_address_idx" ON "organizers" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "participations_raffle_id_idx" ON "participations" USING btree ("raffle_id");--> statement-breakpoint
CREATE INDEX "participations_user_id_idx" ON "participations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "participations_wallet_address_idx" ON "participations" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "participations_transaction_hash_idx" ON "participations" USING btree ("transaction_hash");--> statement-breakpoint
CREATE INDEX "raffles_organizer_id_idx" ON "raffles" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "raffles_status_idx" ON "raffles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "raffles_end_date_idx" ON "raffles" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_wallet_address_idx" ON "users" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "winners_raffle_id_idx" ON "winners" USING btree ("raffle_id");--> statement-breakpoint
CREATE INDEX "winners_user_id_idx" ON "winners" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "winners_participation_id_idx" ON "winners" USING btree ("participation_id");