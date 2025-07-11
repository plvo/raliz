import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
});

export const { signIn, signOut, signUp, useSession } = authClient; 