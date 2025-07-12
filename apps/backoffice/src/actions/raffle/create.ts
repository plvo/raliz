'use server';

import { withAction } from '@/lib/wrappers/with-action';
import {
  type CancelRaffleCreationInput,
  type ConfirmRaffleCreationInput,
  type CreateRaffleInput,
  cancelRaffleCreationSchema,
  confirmRaffleCreationSchema,
  createRaffleSchema,
} from '@/schemas/raffle';
import { CONTRACT_ADDRESSES, type CreateRaffleParams } from '@repo/contracts';
import { type Raffle, organizerTable, raffleTable } from '@repo/db';
import { desc, eq } from '@repo/db';

/**
 * Prépare une nouvelle raffle en base de données et retourne les paramètres pour la transaction blockchain
 * Le frontend devra ensuite signer et envoyer la transaction via le wallet connecté
 */
export async function prepareRaffleCreation(data: CreateRaffleInput) {
  return withAction<{ raffle: Raffle; blockchainParams: CreateRaffleParams }>(async (db) => {
    const validatedData = createRaffleSchema.parse(data);

    // Récupérer l'organisateur actuel (premier trouvé pour le moment)
    const organizers = await db.select().from(organizerTable).orderBy(desc(organizerTable.createdAt)).limit(1);

    if (organizers.length === 0) {
      throw new Error('Aucun organisateur trouvé');
    }

    const organizer = organizers[0];

    // 1. Préparer les paramètres pour la transaction blockchain
    const blockchainParams: CreateRaffleParams = {
      title: validatedData.title,
      description: validatedData.description,
      participationFee: validatedData.participationPrice.toString(),
      requiredFanToken: validatedData.smartContractAddress || '', // Adresse du fan token requis
      minimumFanTokens: validatedData.minimumFanTokens?.toString() || '0',
      maxWinners: Number.parseInt(validatedData.maxWinners),
      endDate: validatedData.endDate,
    };

    // 2. Créer la raffle en base en status DRAFT (sera activée après confirmation blockchain)
    const newRaffles = await db
      .insert(raffleTable)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        prizeDescription: validatedData.prizeDescription,
        imageUrl: validatedData.imageUrl,
        participationPrice: validatedData.participationPrice,
        tokenSymbol: validatedData.tokenSymbol,
        minimumFanTokens: validatedData.minimumFanTokens ? Number.parseInt(validatedData.minimumFanTokens) : 50,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        maxWinners: validatedData.maxWinners,
        maxParticipants: validatedData.maxParticipants,
        organizerId: organizer.id,
        status: 'DRAFT', // En attente de confirmation blockchain
        smartContractAddress: CONTRACT_ADDRESSES.RALIZ,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const raffle = newRaffles[0];

    return {
      raffle,
      blockchainParams,
    };
  }); // Auth ouverte pour le moment
}

/**
 * Confirme la création d'une raffle après que la transaction blockchain ait été effectuée
 * Met à jour le statut de DRAFT à ACTIVE et sauvegarde l'ID du smart contract
 */
export async function confirmRaffleCreation(data: ConfirmRaffleCreationInput) {
  return withAction<Raffle>(async (db) => {
    const validatedData = confirmRaffleCreationSchema.parse(data);
    // Vérifier que la raffle existe et est en statut DRAFT
    const raffles = await db.select().from(raffleTable).where(eq(raffleTable.id, validatedData.raffleId)).limit(1);

    if (raffles.length === 0) {
      throw new Error('Raffle non trouvée');
    }

    const raffle = raffles[0];

    if (raffle.status !== 'DRAFT') {
      throw new Error("Cette raffle n'est pas en attente de confirmation");
    }

    // Mettre à jour le statut, ajouter le hash de transaction et l'ID du smart contract
    const updatedRaffles = await db
      .update(raffleTable)
      .set({
        status: 'ACTIVE',
        contractRaffleId: validatedData.contractRaffleId,
        updatedAt: new Date(),
      })
      .where(eq(raffleTable.id, validatedData.raffleId))
      .returning();

    return updatedRaffles[0];
  });
}

/**
 * Annule la création d'une raffle si la transaction blockchain échoue
 * Supprime la raffle de la base de données
 */
export async function cancelRaffleCreation(data: CancelRaffleCreationInput) {
  return withAction<{ success: boolean }>(async (db) => {
    const validatedData = cancelRaffleCreationSchema.parse(data);

    // Vérifier que la raffle existe et est en statut DRAFT
    const raffles = await db.select().from(raffleTable).where(eq(raffleTable.id, validatedData.raffleId)).limit(1);

    if (raffles.length === 0) {
      throw new Error('Raffle non trouvée');
    }

    const raffle = raffles[0];

    if (raffle.status !== 'DRAFT') {
      throw new Error('Seules les raffles en brouillon peuvent être annulées');
    }

    // Supprimer la raffle
    await db.delete(raffleTable).where(eq(raffleTable.id, validatedData.raffleId));

    return { success: true };
  });
}
