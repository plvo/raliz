'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { organizerTable, type Organizer } from '@repo/db';
import { desc, eq } from '@repo/db';

/**
 * Récupère le profil de l'organisateur connecté
 * Pour le moment l'auth est ouverte, donc on prend le premier organisateur
 */
export async function getOrganizerProfile(walletAddress: string) {
    return withAction<Organizer>(async (db) => {
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .where(eq(organizerTable.walletAddress, walletAddress))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        return organizers[0];
    }); 
}