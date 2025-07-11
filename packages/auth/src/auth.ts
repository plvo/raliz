import { db, userAccountTable, userSessionTable, userTable } from '@repo/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins/admin';

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: false,
    schema: {
      user: userTable,
      account: userAccountTable,
      session: userSessionTable,
    },
  }),
  plugins: [admin(), nextCookies()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    modelName: 'user',
    fields: {
      email: 'email',
      name: 'firstName',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      emailVerified: 'emailVerified',
      role: 'role',
      banned: 'banned',
      banReason: 'banReason',
      banExpires: 'banExpires',
    },
    additionalFields: {
      lastName: {
        type: 'string',
        required: true,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
  account: {
    modelName: 'account',
    fields: {
      userId: 'userId',
      providerId: 'providerId',
      accountId: 'accountId',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      idToken: 'idToken',
      accessTokenExpiresAt: 'accessTokenExpiresAt',
      refreshTokenExpiresAt: 'refreshTokenExpiresAt',
      scope: 'scope',
      password: 'password',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
  session: {
    modelName: 'session',
    fields: {
      userId: 'userId',
      token: 'token',
      ipAddress: 'ipAddress',
      userAgent: 'userAgent',
      expiresAt: 'expiresAt',
      impersonatedBy: 'impersonatedBy',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    expiresIn: 15 * DAY,
  },
});
