'use server';

import { db } from '@repo/db';

type ActionFn<T> = (database: typeof db) => Promise<T>;

/**
 * Wrapper function to handle actions with error handling.
 * @param action - The action to be executed.
 * @param authNeeded - Whether the action needs authentication.
 * @returns A promise that resolves to an ApiResponse containing the result of the action or an error response.
 */
export async function withAction<T>(action: ActionFn<T>): Promise<ActionResponse<T>> {
  try {
    const data = await action(db);

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
