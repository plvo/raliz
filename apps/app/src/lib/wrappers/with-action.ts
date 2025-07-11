'use server';

import { auth } from '@repo/auth/auth';
import type { Session } from '@repo/auth/types';
import { db } from '@repo/db';
import { headers } from 'next/headers';

type ActionFn<T> = ((database: typeof db, session: Session) => Promise<T>) | ((database: typeof db) => Promise<T>);

/**
 * Wrapper function to handle actions with error handling.
 * @param action - The action to be executed.
 * @param authNeeded - Whether the action needs authentication.
 * @returns A promise that resolves to an ApiResponse containing the result of the action or an error response.
 */
export async function withAction<T>(action: ActionFn<T>, authNeeded = true): Promise<ActionResponse<T>> {
  try {
    let session: Session | null = null;

    if (authNeeded) {
      session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session || !session.user) {
        throw new Error('Unauthorized');
      }
    }

    const data = authNeeded
      ? await (action as (database: typeof db, session: Session) => Promise<T>)(db, session as Session)
      : await (action as (database: typeof db) => Promise<T>)(db);

    return { ok: true, data };
  } catch (error) {
    console.error('[withAction] Error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return { ok: false, message: `Error with action : ${error}` };
  }
}
