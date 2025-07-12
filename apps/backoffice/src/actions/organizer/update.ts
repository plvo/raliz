'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { updateOrganizerProfileSchema, type UpdateOrganizerProfileInput } from '@/schemas/organizer';
import { organizerTable, type Organizer } from '@repo/db';
import { desc, eq, ne, and } from '@repo/db';

/**
 * Met à jour le profil de l'organisateur
 * Pour le moment l'auth est ouverte, donc on met à jour le premier organisateur
 */
export async function updateOrganizerProfile(data: UpdateOrganizerProfileInput) {
    return withAction<Organizer>(async (db) => {
        const validatedData = updateOrganizerProfileSchema.parse(data);

        // Pour le moment, on met à jour le premier organisateur trouvé
        const existingOrganizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .limit(1);

        if (existingOrganizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        const existingOrganizer = existingOrganizers[0];

        // Vérifier que l'email n'est pas déjà utilisé par un autre organisateur
        if (validatedData.email) {
            const emailExists = await db
                .select()
                .from(organizerTable)
                .where(and(
                    eq(organizerTable.email, validatedData.email),
                    ne(organizerTable.id, existingOrganizer.id)
                ))
                .limit(1);

            if (emailExists.length > 0) {
                throw new Error('Cet email est déjà utilisé par un autre organisateur');
            }
        }

        // Vérifier que l'adresse wallet n'est pas déjà utilisée
        const walletExists = await db
            .select()
            .from(organizerTable)
            .where(and(
                eq(organizerTable.walletAddress, validatedData.walletAddress),
                ne(organizerTable.id, existingOrganizer.id)
            ))
            .limit(1);

        if (walletExists.length > 0) {
            throw new Error('Cette adresse wallet est déjà utilisée par un autre organisateur');
        }

        // Vérifier que l'adresse du fan token n'est pas déjà utilisée
        const fanTokenExists = await db
            .select()
            .from(organizerTable)
            .where(and(
                ne(organizerTable.id, existingOrganizer.id)
            ))
            .limit(1);

        if (fanTokenExists.length > 0) {
            throw new Error('Cette adresse de fan token est déjà utilisée par un autre organisateur');
        }

        const updatedOrganizers = await db
            .update(organizerTable)
            .set({
                name: validatedData.name,
                email: validatedData.email,
                description: validatedData.description,
                logoUrl: validatedData.logoUrl,
                walletAddress: validatedData.walletAddress,
                updatedAt: new Date(),
            })
            .where(eq(organizerTable.id, existingOrganizer.id))
            .returning();

        return updatedOrganizers[0];
    }); // Auth ouverte pour le moment
}

/**
 * Met à jour un organisateur spécifique par ID
 */
export async function updateOrganizerById(id: string, data: Partial<UpdateOrganizerProfileInput>) {
    return withAction<Organizer>(async (db) => {
        // Valider les données partielles
        const validatedData = updateOrganizerProfileSchema.partial().parse(data);

        const existingOrganizers = await db
            .select()
            .from(organizerTable)
            .where(eq(organizerTable.id, id))
            .limit(1);

        if (existingOrganizers.length === 0) {
            throw new Error('Organisateur non trouvé');
        }

        // Vérifications d'unicité uniquement si les champs sont fournis
        if (validatedData.email) {
            const emailExists = await db
                .select()
                .from(organizerTable)
                .where(and(
                    eq(organizerTable.email, validatedData.email),
                    ne(organizerTable.id, id)
                ))
                .limit(1);

            if (emailExists.length > 0) {
                throw new Error('Cet email est déjà utilisé par un autre organisateur');
            }
        }

        if (validatedData.walletAddress) {
            const walletExists = await db
                .select()
                .from(organizerTable)
                .where(and(
                    eq(organizerTable.walletAddress, validatedData.walletAddress),
                    ne(organizerTable.id, id)
                ))
                .limit(1);

            if (walletExists.length > 0) {
                throw new Error('Cette adresse wallet est déjà utilisée par un autre organisateur');
            }
        }

        const updatedOrganizers = await db
            .update(organizerTable)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(eq(organizerTable.id, id))
            .returning();

        return updatedOrganizers[0];
    }); // Auth ouverte pour le moment
} 