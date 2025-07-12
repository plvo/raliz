'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { getOrganizerByIdSchema } from '@/schemas/organizer';
import { organizerTable, type Organizer } from '@repo/db';
import { desc, eq } from '@repo/db';

/**
 * Récupère le profil de l'organisateur connecté
 * Pour le moment l'auth est ouverte, donc on prend le premier organisateur
 */
export async function getOrganizerProfile() {
    return withAction<Organizer>(async (db) => {
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        return organizers[0];
    }); // Auth ouverte pour le moment
}

/**
 * Récupère un organisateur par son ID
 */
export async function getOrganizerById(id: string) {
    return withAction<Organizer>(async (db) => {
        const validatedData = getOrganizerByIdSchema.parse({ id });

        const organizers = await db
            .select()
            .from(organizerTable)
            .where(eq(organizerTable.id, validatedData.id))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Organisateur non trouvé');
        }

        return organizers[0];
    }); // Auth ouverte pour le moment
}

/**
 * Récupère tous les organisateurs (pour admin si nécessaire)
 */
export async function getAllOrganizers() {
    return withAction<Organizer[]>(async (db) => {
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt));

        return organizers;
    }); // Auth ouverte pour le moment
} 