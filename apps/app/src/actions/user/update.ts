'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { eq, userTable } from '@repo/db';
import { z } from 'zod';

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  firstName: z.string().max(100, 'First name must be less than 100 characters').optional().or(z.literal('')),
  lastName: z.string().max(100, 'Last name must be less than 100 characters').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
  favoriteOrganizerId: z.string().uuid().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateUserProfile(userId: string, data: UpdateProfileInput) {
  return withAction(async (db) => {
    // Validate input
    const validatedData = updateProfileSchema.parse(data);

    // Prepare update data - convert empty strings to null
    const updateData = {
      username: validatedData.username,
      email: validatedData.email || null,
      firstName: validatedData.firstName || null,
      lastName: validatedData.lastName || null,
      phone: validatedData.phone || null,
      favoriteOrganizerId: validatedData.favoriteOrganizerId || null,
    };

    // Update user
    const [updatedUser] = await db.update(userTable).set(updateData).where(eq(userTable.id, userId)).returning();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  });
}
