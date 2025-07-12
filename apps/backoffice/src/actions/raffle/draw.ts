'use server'

import { withAction } from "@/lib/wrappers/with-action"
import { getRaffleById } from "./get";

export async function drawRaffle(raffleId: string) {
    return withAction(async () => {
        const raffle = await getRaffleById(raffleId);
        if (!raffle.ok) {
            throw new Error("Raffle not found");
        }
        
    })
}