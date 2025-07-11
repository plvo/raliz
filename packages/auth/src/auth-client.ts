import { inferAdditionalFields } from 'better-auth/client/plugins';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(), // https://www.better-auth.com/docs/concepts/typescript#inferring-additional-fields-on-client
    adminClient(),
  ],
});
