'use server';

import { auth } from '@/lib/auth';
import { Prisma, type PrismaClient, prisma } from '@repo/db';
import { headers } from 'next/headers';
import { z } from 'zod';

/**
 * Wrapper function to handle Prisma actions with error handling.
 * @param action - The action to be executed with PrismaClient.
 * @param authNeeded - Whether the action needs authentication.
 * @returns A promise that resolves to an ApiResponse containing the result of the action or an error response.
 */
export async function withAction<T>(
  action: (prisma: PrismaClient, userId: string | null) => Promise<T>,
  authNeeded = true,
): Promise<ActionResponse<T>> {
  try {
    let session = null;
    if (authNeeded) {
      session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session || !session.user) {
        throw new Error('Unauthorized');
      }
    }

    const data = await action(prisma, authNeeded ? session?.user.id || '' : null);
    return { ok: true, data };
  } catch (error) {
    console.error('[withAction] Error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const message = getMessageError(error);

    return { ok: false, message };
  } finally {
    await prisma.$disconnect();
  }
}

const getMessageError = (error: unknown): string => {
  // Handle specific Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return `Unique constraint violation: ${error.meta?.target}`;
      case 'P2025':
        return 'Record not found';
      default:
        return `Database error: ${error.code}`;
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'Validation error';
  }
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return `Rust panic error: ${error.cause}`;
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return `Initialization error: ${error.message}`;
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return `Unknown request error: ${error.message}`;
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map((err) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    });
    return formattedErrors.length === 1 ? formattedErrors[0] : `Validation errors: ${formattedErrors.join(', ')}`;
  }

  // Handle other errors
  return error instanceof Error ? error.message : 'Internal Server Error';
};
