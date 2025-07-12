CREATE TYPE "public"."reward_type" AS ENUM('TEAM_TOP3', 'INDIVIDUAL_MVP', 'SPECIAL');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'SEASON_REWARD';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'LEADERBOARD_UPDATE';--> statement-breakpoint
CREATE TABLE "organizer_season_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"total_chz_engaged" numeric(18, 8) DEFAULT '0' NOT NULL,
	"total_raffles_completed" integer DEFAULT 0 NOT NULL,
	"total_participants_unique" integer DEFAULT 0 NOT NULL,
	"average_participation_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"leaderboard_position" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"reward_type" "reward_type" NOT NULL,
	"organizer_id" uuid,
	"user_id" varchar(255),
	"position" integer,
	"reward_amount_chz" numeric(18, 8),
	"reward_description" text NOT NULL,
	"distributed" boolean DEFAULT false NOT NULL,
	"transaction_hash" varchar(66),
	"distributed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"rewards_distributed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_season_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"season_id" uuid NOT NULL,
	"organizer_id" uuid,
	"total_points" integer DEFAULT 0 NOT NULL,
	"total_participations" integer DEFAULT 0 NOT NULL,
	"total_chz_spent" numeric(18, 8) DEFAULT '0' NOT NULL,
	"rank_in_team" integer,
	"last_participation_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "raffles" RENAME COLUMN "token_contract_address" TO "minimum_fan_tokens";--> statement-breakpoint
ALTER TABLE "organizers" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "organizers" ADD COLUMN "fan_token_address" varchar(42) NOT NULL;--> statement-breakpoint
ALTER TABLE "organizers" ADD COLUMN "total_chz_engaged" numeric(18, 8) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizers" ADD COLUMN "total_completed_raffles" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizers" ADD COLUMN "leaderboard_rank" integer;--> statement-breakpoint
ALTER TABLE "participations" ADD COLUMN "points_earned" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "raffles" ADD COLUMN "total_chz_collected" numeric(18, 8) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "raffles" ADD COLUMN "season_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_participations" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "favorite_organizer_id" uuid;--> statement-breakpoint
ALTER TABLE "organizer_season_stats" ADD CONSTRAINT "organizer_season_stats_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizer_season_stats" ADD CONSTRAINT "organizer_season_stats_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_rewards" ADD CONSTRAINT "season_rewards_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_rewards" ADD CONSTRAINT "season_rewards_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_rewards" ADD CONSTRAINT "season_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_season_stats" ADD CONSTRAINT "user_season_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_season_stats" ADD CONSTRAINT "user_season_stats_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_season_stats" ADD CONSTRAINT "user_season_stats_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organizer_season_stats_organizer_id_idx" ON "organizer_season_stats" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "organizer_season_stats_season_id_idx" ON "organizer_season_stats" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "organizer_season_stats_total_chz_engaged_idx" ON "organizer_season_stats" USING btree ("total_chz_engaged");--> statement-breakpoint
CREATE INDEX "organizer_season_stats_leaderboard_position_idx" ON "organizer_season_stats" USING btree ("leaderboard_position");--> statement-breakpoint
CREATE INDEX "season_rewards_season_id_idx" ON "season_rewards" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "season_rewards_reward_type_idx" ON "season_rewards" USING btree ("reward_type");--> statement-breakpoint
CREATE INDEX "season_rewards_organizer_id_idx" ON "season_rewards" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "season_rewards_user_id_idx" ON "season_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "season_rewards_distributed_idx" ON "season_rewards" USING btree ("distributed");--> statement-breakpoint
CREATE INDEX "season_rewards_position_idx" ON "season_rewards" USING btree ("position");--> statement-breakpoint
CREATE INDEX "seasons_is_active_idx" ON "seasons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "seasons_start_date_idx" ON "seasons" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "seasons_end_date_idx" ON "seasons" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "user_season_stats_user_id_idx" ON "user_season_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_season_stats_season_id_idx" ON "user_season_stats" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "user_season_stats_organizer_id_idx" ON "user_season_stats" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "user_season_stats_total_points_idx" ON "user_season_stats" USING btree ("total_points");--> statement-breakpoint
CREATE INDEX "user_season_stats_rank_in_team_idx" ON "user_season_stats" USING btree ("rank_in_team");--> statement-breakpoint
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "organizers_fan_token_address_idx" ON "organizers" USING btree ("fan_token_address");--> statement-breakpoint
CREATE INDEX "organizers_total_chz_engaged_idx" ON "organizers" USING btree ("total_chz_engaged");--> statement-breakpoint
CREATE INDEX "organizers_leaderboard_rank_idx" ON "organizers" USING btree ("leaderboard_rank");--> statement-breakpoint
CREATE INDEX "participations_points_earned_idx" ON "participations" USING btree ("points_earned");--> statement-breakpoint
CREATE INDEX "raffles_season_id_idx" ON "raffles" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "raffles_total_chz_collected_idx" ON "raffles" USING btree ("total_chz_collected");--> statement-breakpoint
CREATE INDEX "users_total_points_idx" ON "users" USING btree ("total_points");--> statement-breakpoint
CREATE INDEX "users_favorite_organizer_idx" ON "users" USING btree ("favorite_organizer_id");--> statement-breakpoint
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_fan_token_address_unique" UNIQUE("fan_token_address");