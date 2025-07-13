'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { createRaffleSchema, type CreateRaffleInput } from '@/schemas/raffle';
import { raffleTable, type Raffle, type Organizer } from '@repo/db';
import { eq } from '@repo/db';

/**
 * Étape 1 : Créer la raffle en base de données (status DRAFT)
 * La transaction blockchain sera faite côté client
 */
export async function createRaffleInDB(data: CreateRaffleInput, organizer: Organizer) {
    return withAction<{ raffle: Raffle }>(async (db) => {
        // Debug: Let's see what arrives in the server action
        console.log('=== DEBUG SERVER ACTION ===');
        console.log('data:', data);
        console.log('data.startDate:', data.startDate, 'type:', typeof data.startDate);
        console.log('data.endDate:', data.endDate, 'type:', typeof data.endDate);
        
        // Parse the data with the schema - schema handles date transformation
        const validatedData = createRaffleSchema.parse(data);
        
        const newRaffles = await db
            .insert(raffleTable)
            .values({
                title: validatedData.title,
                description: validatedData.description,
                prizeDescription: validatedData.prizeDescription,
                imageUrl: validatedData.imageUrl || null,
                participationPrice: validatedData.participationPrice,
                tokenSymbol: organizer.fanTokenSymbol,
                minimumFanTokens: '50', // Default value (fixed for now)
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
                maxWinners: validatedData.maxWinners,
                maxParticipants: validatedData.maxParticipants || null,
                organizerId: organizer.id,
                status: 'DRAFT', // Waiting for blockchain confirmation
                smartContractAddress: null, // Will be filled after transaction
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return { raffle: newRaffles[0] };
    });
}

/**
 * Étape 3 : Confirmer la création après transaction blockchain réussie
 */
export async function confirmRaffleCreation(
    raffleId: string, 
    transactionHash: string, 
    contractAddress?: string
) {
    return withAction<{ raffle: Raffle }>(async (db) => {
        // Vérifier que la raffle existe et est en status DRAFT
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, raffleId))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle not found');
        }

        const raffle = raffles[0];
        if (raffle.status !== 'DRAFT') {
            throw new Error('Raffle is not in draft status');
        }

        // Mettre à jour le statut et les informations blockchain
        const updatedRaffles = await db
            .update(raffleTable)
            .set({
                status: 'ACTIVE',
                smartContractAddress: contractAddress || null,
                updatedAt: new Date(),
            })
            .where(eq(raffleTable.id, raffleId))
            .returning();

        return { raffle: updatedRaffles[0] };
    });
}

/**
 * Supprimer la raffle si la transaction blockchain échoue
 */
export async function deleteRaffleOnBlockchainFailure(raffleId: string) {
    return withAction<{ success: boolean }>(async (db) => {
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, raffleId))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle not found');
        }

        const raffle = raffles[0];
        if (raffle.status !== 'DRAFT') {
            throw new Error('Only draft raffles can be deleted');
        }

        await db
            .delete(raffleTable)
            .where(eq(raffleTable.id, raffleId));

        return { success: true };
    });
} 
