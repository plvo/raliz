'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { desc, eq, participationTable, userTable } from '@repo/db';

export async function getUserParticipations(userId: string) {
  return withAction(async (db) => {
    const participations = await db.query.participationTable.findMany({
      where: eq(participationTable.userId, userId),
      with: {
        raffle: {
          with: {
            organizer: {
              columns: {
                walletAddress: false,
                email: false,
                password: false,
              },
            },
          },
        },
      },
      orderBy: [desc(participationTable.participatedAt)],
    });

    return participations;
  });
}

export async function getUserProfile(userId: string) {
  return withAction(async (db) => {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
      with: {
        favoriteOrganizer: {
          columns: {
            walletAddress: false,
            email: false,
            password: false,
          },
        },
      },
    });

    return user;
  });
}
