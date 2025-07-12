'use server';

import { db, eq, userTable } from '@repo/db';

export async function addEmail(email: string, walletAddress: `0x${string}`) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.walletAddress, walletAddress),
  });

  if (!user) {
    throw new Error('User not found');
  }

  await db.update(userTable).set({ email }).where(eq(userTable.walletAddress, walletAddress));
}
