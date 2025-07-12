'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { updateRaffleSchema, type UpdateRaffleInput } from '@/schemas/raffle';
import { raffleTable, organizerTable, type Raffle } from '@repo/db';
import { desc, eq } from '@repo/db';

/**
 * Met à jour une raffle existante
 */
export async function updateRaffle(data: UpdateRaffleInput) {
    return withAction<Raffle>(async (db) => {
        const validatedData = updateRaffleSchema.parse(data);

        // Vérifier que la raffle existe et appartient à l'organisateur actuel
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        const organizer = organizers[0];

        const existingRaffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, validatedData.id))
            .limit(1);

        if (existingRaffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        const existingRaffle = existingRaffles[0];

        if (existingRaffle.organizerId !== organizer.id) {
            throw new Error('Vous n\'êtes pas autorisé à modifier cette raffle');
        }

        // Ne permettre la modification que si la raffle est en statut DRAFT
        if (existingRaffle.status !== 'DRAFT') {
            throw new Error('Seules les raffles en brouillon peuvent être modifiées');
        }

        // Préparer les données à mettre à jour (en excluant l'id)
        const updateData: Partial<typeof raffleTable.$inferInsert> = {};

        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.prizeDescription !== undefined) updateData.prizeDescription = validatedData.prizeDescription;
        if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;
        if (validatedData.startDate !== undefined) updateData.startDate = validatedData.startDate;
        if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate;
        if (validatedData.maxWinners !== undefined) updateData.maxWinners = validatedData.maxWinners;
        if (validatedData.maxParticipants !== undefined) updateData.maxParticipants = validatedData.maxParticipants;

        updateData.updatedAt = new Date();

        const updatedRaffles = await db
            .update(raffleTable)
            .set(updateData)
            .where(eq(raffleTable.id, validatedData.id))
            .returning();

        return updatedRaffles[0];
    }); // Auth ouverte pour le moment
}

/**
 * Change le statut d'une raffle (DRAFT -> ACTIVE, ACTIVE -> ENDED)
 */
export async function updateRaffleStatus(raffleId: string, status: 'DRAFT' | 'ACTIVE' | 'ENDED') {
    return withAction<Raffle>(async (db) => {
        // Vérifier que la raffle existe et appartient à l'organisateur actuel
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        const organizer = organizers[0];

        const existingRaffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, raffleId))
            .limit(1);

        if (existingRaffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        const existingRaffle = existingRaffles[0];

        if (existingRaffle.organizerId !== organizer.id) {
            throw new Error('Vous n\'êtes pas autorisé à modifier cette raffle');
        }

        // Valider les transitions de statut
        const currentStatus = existingRaffle.status;

        if (currentStatus === 'ENDED') {
            throw new Error('Une raffle terminée ne peut plus être modifiée');
        }

        if (currentStatus === 'ACTIVE' && status === 'DRAFT') {
            throw new Error('Une raffle active ne peut pas revenir en brouillon');
        }

        if (status === 'ACTIVE') {
            // Vérifier que tous les champs obligatoires sont remplis
            if (!existingRaffle.title || !existingRaffle.description || !existingRaffle.prizeDescription) {
                throw new Error('Tous les champs obligatoires doivent être remplis avant d\'activer la raffle');
            }

            if (new Date(existingRaffle.startDate) <= new Date()) {
                throw new Error('La date de début doit être dans le futur');
            }

            if (new Date(existingRaffle.endDate) <= new Date(existingRaffle.startDate)) {
                throw new Error('La date de fin doit être après la date de début');
            }
        }

        const updatedRaffles = await db
            .update(raffleTable)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(raffleTable.id, raffleId))
            .returning();

        return updatedRaffles[0];
    }); // Auth ouverte pour le moment
} 