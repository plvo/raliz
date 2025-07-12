'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { participationTable, raffleTable, userTable } from '@repo/db';
import type { CreateParticipation } from '@repo/db';
import { and, count, eq, sum } from 'drizzle-orm';

interface CreateParticipationInput {
  raffleId: string;
  userId: string;
  walletAddress: string;
  transactionHash: string;
  amountPaid: string;
  tokenUsed: string;
}

export async function createParticipation(input: CreateParticipationInput) {
  return withAction<{ participationId: string }>(async (db) => {
    const { raffleId, userId, walletAddress, transactionHash, amountPaid, tokenUsed } = input;

    // Vérifier que la raffle existe et est active
    const raffle = await db.select().from(raffleTable).where(eq(raffleTable.id, raffleId)).limit(1);

    if (!raffle.length) {
      throw new Error('Raffle not found');
    }

    if (raffle[0].status !== 'ACTIVE') {
      throw new Error('Raffle is not active');
    }

    // Vérifier que l'utilisateur n'a pas déjà participé
    const existingParticipation = await db
      .select()
      .from(participationTable)
      .where(and(eq(participationTable.raffleId, raffleId), eq(participationTable.userId, userId)))
      .limit(1);

    if (existingParticipation.length > 0) {
      throw new Error('User has already participated in this raffle');
    }

    // Créer la participation
    const participationData: CreateParticipation = {
      raffleId,
      userId,
      walletAddress,
      transactionHash,
      amountPaid,
      tokenUsed,
      pointsEarned: 1, // Points de base pour la participation
    };

    const result = await db
      .insert(participationTable)
      .values(participationData)
      .returning({ id: participationTable.id });

    // Calculer les nouvelles statistiques utilisateur
    const [participationStats] = await db
      .select({
        totalParticipations: count(participationTable.id),
        totalPoints: sum(participationTable.pointsEarned),
      })
      .from(participationTable)
      .where(eq(participationTable.userId, userId));

    // Mettre à jour les statistiques utilisateur
    await db
      .update(userTable)
      .set({
        totalParticipations: Number(participationStats.totalParticipations),
        totalPoints: Number(participationStats.totalPoints) || 0,
      })
      .where(eq(userTable.id, userId));

    return { participationId: result[0].id };
  });
}
