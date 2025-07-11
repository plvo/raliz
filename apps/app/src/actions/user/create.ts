'use server';

import { withAction } from '@/lib/wrappers/with-action';
import type { Web3AuthUserInfo } from '@/services/web3auth.service';
import { validateWeb3AuthSession } from '@/services/web3auth.service';
import type { User, UserInsert } from '@repo/db';
import { db, userTable } from '@repo/db';
import { eq, or } from 'drizzle-orm';
import { headers } from 'next/headers';

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  walletAddress?: string;
  username?: string;
}

/**
 * Create a new user from Web3Auth information
 */
export async function createUserFromWeb3Auth(web3AuthInfo: Web3AuthUserInfo): Promise<User> {
  const userData: UserInsert = {
    id: crypto.randomUUID(),
    email: web3AuthInfo.email || '',
    firstName: web3AuthInfo.name?.split(' ')[0] || 'Unknown',
    lastName: web3AuthInfo.name?.split(' ').slice(1).join(' ') || 'User',
    walletAddress: web3AuthInfo.walletAddress,
    emailVerified: web3AuthInfo.email_verified || false,
    role: 'user',
  };

  const [createdUser] = await db.insert(userTable).values(userData).returning();
  return createdUser;
}

/**
 * Create user manually
 */
export async function createUser(input: CreateUserInput) {
  return withAction<User>(async (database: typeof db) => {
    // Check if user already exists
    const existingUser = await database
      .select()
      .from(userTable)
      .where(
        or(
          eq(userTable.email, input.email),
          input.walletAddress ? eq(userTable.walletAddress, input.walletAddress) : undefined,
        ),
      )
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    const userData: UserInsert = {
      id: crypto.randomUUID(),
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      walletAddress: input.walletAddress,
      username: input.username,
      emailVerified: true,
      role: 'user',
    };

    const [createdUser] = await database.insert(userTable).values(userData).returning();
    return createdUser;
  }, false);
}

/**
 * Get or create user from Web3Auth session (auto-registration)
 */
export async function getOrCreateUserFromWeb3Auth() {
  return withAction<User | null>(async (database: typeof db) => {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    const web3AuthUser = await validateWeb3AuthSession(cookieHeader);
    if (!web3AuthUser) {
      return null;
    }

    // Try to find existing user
    const user = await database
      .select()
      .from(userTable)
      .where(
        or(
          web3AuthUser.email ? eq(userTable.email, web3AuthUser.email) : undefined,
          web3AuthUser.walletAddress ? eq(userTable.walletAddress, web3AuthUser.walletAddress) : undefined,
        ),
      )
      .limit(1);

    console.log('user', user);

    // If user doesn't exist, create one
    if (user.length === 0) {
      const userData: UserInsert = {
        id: crypto.randomUUID(),
        email: web3AuthUser.email || '',
        firstName: web3AuthUser.name?.split(' ')[0] || 'Unknown',
        lastName: web3AuthUser.name?.split(' ').slice(1).join(' ') || 'User',
        walletAddress: web3AuthUser.walletAddress,
        emailVerified: web3AuthUser.email_verified || false,
        role: 'user',
      };

      const [createdUser] = await database.insert(userTable).values(userData).returning();
      return createdUser;
    }

    return user[0];
  }, false);
}
