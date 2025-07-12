'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { type User, userTable } from '@repo/db';
import { inArray } from 'drizzle-orm';

export async function getUsersByAddresses(walletAddresses: string[]) {
    return withAction<User[]>(async (db) => {
        return await db.select().from(userTable).where(inArray(userTable.walletAddress, walletAddresses));
    })
}