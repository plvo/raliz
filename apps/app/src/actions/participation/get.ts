'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { participationTable } from '@repo/db';
import { and, eq, inArray, sql } from 'drizzle-orm';

export async function hasUserParticipated(raffleId: string, userId: string) {
  return withAction<boolean>(async (db) => {
    const participation = await db
      .select()
      .from(participationTable)
      .where(and(eq(participationTable.raffleId, raffleId), eq(participationTable.userId, userId)))
      .limit(1);

    return participation.length > 0;
  });
}

export async function getUserParticipationsForRaffles(userId: string, raffleIds: string[]) {
  return withAction<Record<string, boolean>>(async (db) => {
    if (raffleIds.length === 0) {
      return {};
    }

    const participations = await db
      .select({
        raffleId: participationTable.raffleId,
      })
      .from(participationTable)
      .where(and(eq(participationTable.userId, userId), inArray(participationTable.raffleId, raffleIds)));

    // Convert to a lookup object
    const participationLookup: Record<string, boolean> = {};
    raffleIds.forEach((id) => {
      participationLookup[id] = false;
    });

    participations.forEach((p) => {
      participationLookup[p.raffleId] = true;
    });

    return participationLookup;
  });
}
