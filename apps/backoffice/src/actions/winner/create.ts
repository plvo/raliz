'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { type Winner, winnerTable } from '@repo/db';

export async function createWinners(winners: Winner[]) {
    return withAction<Winner[]>(async (db) => {
        return await db.insert(winnerTable).values(winners).returning();
    })
}