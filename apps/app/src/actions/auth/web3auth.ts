'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { type CreateUser, type User, eq, userTable } from '@repo/db';

export async function getWeb3User(walletAddress: string): Promise<ActionResponse<User | null>> {
  return withAction(async (db) => {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.walletAddress, walletAddress),
    });

    console.log('getWeb3User', { address: walletAddress, user });

    return user ?? null;
  });
}

interface loginOrCreateWeb3UserResponse {
  user: User | null;
  isNewUser: boolean;
}

export async function loginOrCreateWeb3User(
  walletAddress: string,
): Promise<ActionResponse<loginOrCreateWeb3UserResponse>> {
  return withAction(async (db) => {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.walletAddress, walletAddress),
    });

    console.log({ address: walletAddress, user });

    if (!user) {
      const newUser = await createWeb3User({ walletAddress });

      if (!newUser.ok) {
        return { user: null, isNewUser: false };
      }

      return { user: newUser.data, isNewUser: true };
    }

    return { user, isNewUser: false };
  });
}

export interface Web3AuthUserInfo {
  walletAddress: string;
}

export async function createWeb3User(web3AuthInfo: Web3AuthUserInfo): Promise<ActionResponse<User>> {
  return withAction(async (db) => {
    const userData: CreateUser = {
      id: crypto.randomUUID(),
      walletAddress: web3AuthInfo.walletAddress,
      username: `user_${crypto.randomUUID().slice(0, 8)}`,
    };

    const [createdUser] = await db.insert(userTable).values(userData).returning();
    return createdUser;
  });
}

// export async function loginWeb3User(web3AuthInfo: Web3AuthUserInfo): Promise<ActionResponse<User | null>> {
// }
