'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { validateWeb3AuthSession } from '@/services/web3auth.service';
import type { User } from '@repo/db';
import { type db, userTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

/**
 * Get current user from Web3Auth session
 */
export async function getCurrentUser() {
  return withAction<User | null>(async (database: typeof db) => {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    const web3AuthUser = await validateWeb3AuthSession(cookieHeader);
    if (!web3AuthUser) {
      return null;
    }

    // Find user by email or wallet address
    const user = await database
      .select()
      .from(userTable)
      .where(
        web3AuthUser.email
          ? eq(userTable.email, web3AuthUser.email)
          : eq(userTable.walletAddress, web3AuthUser.walletAddress || ''),
      )
      .limit(1);

    return user[0] || null;
  }, false);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return withAction<User | null>(async (database: typeof db) => {
    const user = await database.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

    return user[0] || null;
  }, false);
}

/**
 * Get user by wallet address
 */
export async function getUserByWalletAddress(walletAddress: string) {
  return withAction<User | null>(async (database: typeof db) => {
    const user = await database.select().from(userTable).where(eq(userTable.walletAddress, walletAddress)).limit(1);

    return user[0] || null;
  }, false);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return withAction<User | null>(async (database: typeof db) => {
    const user = await database.select().from(userTable).where(eq(userTable.email, email)).limit(1);

    return user[0] || null;
  }, false);
}
