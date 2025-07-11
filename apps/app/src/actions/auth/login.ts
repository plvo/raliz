'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { verifyWeb3AuthToken } from '@/services/web3auth.service';
import type { User, UserInsert } from '@repo/db';
import { type db, userTable } from '@repo/db';
import { eq, or } from 'drizzle-orm';
import { cookies } from 'next/headers';

export interface LoginWithWeb3AuthInput {
  token: string;
  walletAddress?: string;
}

/**
 * Login or register user with Web3Auth token or user info
 */
export async function loginWithWeb3Auth(input: LoginWithWeb3AuthInput) {
  return withAction<User>(async (database: typeof db) => {
    console.log('Login attempt with:', { token: input.token, walletAddress: input.walletAddress });

    let userEmail = '';
    let userName = '';
    let isEmailVerified = false;

    // Try to verify as JWT token first
    const web3AuthUser = await verifyWeb3AuthToken(input.token);

    if (web3AuthUser) {
      // Valid JWT token
      console.log('Valid Web3Auth JWT token');
      userEmail = web3AuthUser.email || '';
      userName = web3AuthUser.name || '';
      isEmailVerified = web3AuthUser.email_verified || false;
    } else {
      // Fallback: treat token as email or name
      console.log('Using fallback method for token');
      const isEmail = input.token.includes('@');

      if (isEmail) {
        userEmail = input.token;
        userName = input.token.split('@')[0]; // Use email prefix as name
      } else {
        userName = input.token;
        // Generate a unique email if we don't have one
        userEmail = input.walletAddress ? `${input.walletAddress.toLowerCase()}@wallet.local` : '';
      }
    }

    console.log('User info extracted:', { userEmail, userName, walletAddress: input.walletAddress });

    // Validate that we have at least email or wallet address
    if (!userEmail && !input.walletAddress) {
      throw new Error('Either email or wallet address is required');
    }

    // Try to find existing user by email or wallet address
    const searchConditions = [];
    if (userEmail) searchConditions.push(eq(userTable.email, userEmail));
    if (input.walletAddress) searchConditions.push(eq(userTable.walletAddress, input.walletAddress));

    const existingUser = await database
      .select()
      .from(userTable)
      .where(or(...searchConditions))
      .limit(1);

    let user: User;

    if (existingUser.length > 0) {
      // User exists, update if needed
      console.log('User exists, updating if needed');
      user = existingUser[0];

      const needsUpdate =
        (input.walletAddress && user.walletAddress !== input.walletAddress) || (userEmail && user.email !== userEmail);

      if (needsUpdate) {
        const [updatedUser] = await database
          .update(userTable)
          .set({
            walletAddress: input.walletAddress || user.walletAddress,
            email: userEmail || user.email,
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, user.id))
          .returning();

        user = updatedUser;
        console.log('User updated');
      }
    } else {
      // Create new user
      console.log('Creating new user');
      const nameParts = userName.split(' ');
      const userData: UserInsert = {
        id: crypto.randomUUID(),
        email: userEmail,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        walletAddress: input.walletAddress,
        emailVerified: isEmailVerified,
        role: 'user',
      };

      const [createdUser] = await database.insert(userTable).values(userData).returning();
      user = createdUser;
      console.log('User created:', user.id);
    }

    // Set authentication cookie
    const cookieStore = await cookies();
    cookieStore.set('web3auth_token', input.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('Login successful for user:', user.id);
    return user;
  }, false);
}

/**
 * Logout user (clear Web3Auth token)
 */
export async function logout() {
  return withAction<boolean>(async () => {
    const cookieStore = await cookies();
    cookieStore.delete('web3auth_token');
    console.log('User logged out');
    return true;
  }, false);
}
