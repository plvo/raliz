ALTER TABLE "raffles" ADD COLUMN "contract_raffle_id" integer;--> statement-breakpoint
CREATE INDEX "raffles_contract_raffle_id_idx" ON "raffles" USING btree ("contract_raffle_id");