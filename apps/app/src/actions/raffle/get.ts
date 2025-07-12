'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { raffleTable } from '@repo/db';
import { eq, sql } from '@repo/db';

/**
 * Récupère l'ID du smart contract d'une raffle
 * TODO: Mettre à jour une fois que les types TypeScript seront corrects
 */
export async function getRaffleContractId(raffleId: string) {
  return withAction<{ contractRaffleId: number | null }>(async (db) => {
    // Utilisation directe de SQL pour éviter les problèmes de types temporaires
    const result = await db.execute(sql`SELECT contract_raffle_id FROM raffles WHERE id = ${raffleId} LIMIT 1`);

    if (result.rows.length === 0) {
      throw new Error('Raffle not found');
    }

    return {
      contractRaffleId: result.rows[0].contract_raffle_id as number | null,
    };
  });
}
