'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { type Raffle, and, eq, organizerTable, raffleTable } from '@repo/db';

interface GetRafflesParams {
  orgId?: string;
  seasonId?: string;
}

export async function getRaffles({ orgId, seasonId }: GetRafflesParams) {
  return withAction<Raffle[]>(async (db) => {
    // Build dynamic where clause based on provided params
    // const whereClauses = [];
    // if (orgId) {
    //   whereClauses.push(eq(raffleTable.organizerId, orgId));
    // }
    // if (seasonId) {
    //   whereClauses.push(eq(raffleTable.seasonId, seasonId));
    // }

    const raffles = await db.query.raffleTable.findMany({
      // where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
    });
    return raffles;
  });
}

export async function getRaffleById(id: string) {
  return withAction(async (db) => {
    const raffle = await db.query.raffleTable.findFirst({
      where: eq(raffleTable.id, id),
      with: {
        organizer: {
          columns: {
            fanTokenAddress: true,
          },
        },
      },
    });

    if (!raffle) {
      throw new Error('Raffle not found');
    }

    return raffle;
  });
}
