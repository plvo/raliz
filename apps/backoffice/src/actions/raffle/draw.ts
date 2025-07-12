'use server';

import { withAction } from '@/lib/wrappers/with-action';
import {
    drawWinnersSchema,
    type DrawWinnersInput,
    confirmWinnersDrawSchema,
    type ConfirmWinnersDrawInput,
    cancelWinnersDrawSchema,
    type CancelWinnersDrawInput
} from '@/schemas/raffle';
import {
    raffleTable,
    organizerTable,
    participationTable,
    winnerTable,
    userTable,
    type Winner
} from '@repo/db';
import { desc, eq } from '@repo/db';
// Blockchain intégration sera gérée côté frontend via wallet connect

interface DrawResult {
    winners: (Winner & {
        user: {
            id: string;
            username: string | null;
            email: string | null;
            walletAddress: string | null;
        };
        participation: {
            id: string;
            walletAddress: string;
            amountPaid: string;
            transactionHash: string | null;
            participatedAt: Date;
        };
    })[];
    raffleId: string;
    totalParticipants: number;
    winnerAddresses: string[]; // Adresses pour la transaction blockchain
    blockchainRaffleId: number; // ID pour la transaction blockchain
}

/**
 * Effectue le tirage au sort des gagnants d'une raffle
 */
export async function drawWinners(data: DrawWinnersInput) {
    return withAction<DrawResult>(async (db) => {
        const validatedData = drawWinnersSchema.parse(data);

        // Vérifier que l'organisateur existe
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        const organizer = organizers[0];

        // Vérifier que la raffle existe et appartient à l'organisateur
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, validatedData.raffleId))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        const raffle = raffles[0];

        if (raffle.organizerId !== organizer.id) {
            throw new Error('Vous n\'êtes pas autorisé à effectuer le tirage de cette raffle');
        }

        // Vérifier que la raffle est active et que la date de fin est passée
        if (raffle.status !== 'ACTIVE') {
            throw new Error('Seules les raffles actives peuvent avoir un tirage au sort');
        }

        if (new Date() < new Date(raffle.endDate)) {
            throw new Error('Le tirage ne peut être effectué qu\'après la date de fin de la raffle');
        }

        // Vérifier que le tirage n'a pas déjà été effectué
        const existingWinners = await db
            .select()
            .from(winnerTable)
            .where(eq(winnerTable.raffleId, validatedData.raffleId))
            .limit(1);

        if (existingWinners.length > 0) {
            throw new Error('Le tirage a déjà été effectué pour cette raffle');
        }

        // Récupérer tous les participants
        const participants = await db
            .select({
                participation: participationTable,
                user: {
                    id: userTable.id,
                    username: userTable.username,
                    email: userTable.email,
                    walletAddress: userTable.walletAddress,
                },
            })
            .from(participationTable)
            .innerJoin(userTable, eq(participationTable.userId, userTable.id))
            .where(eq(participationTable.raffleId, validatedData.raffleId));

        if (participants.length === 0) {
            throw new Error('Aucun participant trouvé pour cette raffle');
        }

        const maxWinners = Math.min(validatedData.winnerCount, participants.length, Number.parseInt(raffle.maxWinners));

        if (maxWinners <= 0) {
            throw new Error('Nombre de gagnants invalide');
        }

        // Effectuer le tirage au sort (algorithme de Fisher-Yates)
        const shuffledParticipants = [...participants];
        for (let i = shuffledParticipants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
        }

        const selectedWinners = shuffledParticipants.slice(0, maxWinners);

        // Insérer les gagnants dans la base de données
        const winnerInserts = selectedWinners.map((winner, index) => ({
            raffleId: validatedData.raffleId,
            participationId: winner.participation.id,
            userId: winner.user.id,
            winnerRank: (index + 1).toString(),
            drawnAt: new Date(),
        }));

        const insertedWinners = await db
            .insert(winnerTable)
            .values(winnerInserts)
            .returning();

        // NOTE: Le statut reste ACTIVE jusqu'à confirmation blockchain
        // Il sera mis à ENDED dans confirmWinnersDraw()

        // Marquer les participations gagnantes
        const winnerParticipationIds = selectedWinners.map(w => w.participation.id);

        for (const participationId of winnerParticipationIds) {
            await db
                .update(participationTable)
                .set({
                    isWinner: true,
                    updatedAt: new Date(),
                })
                .where(eq(participationTable.id, participationId));
        }

        // 3. Préparer les données pour la transaction blockchain (sera effectuée côté frontend)
        const winnerAddresses = selectedWinners
            .map(w => w.user.walletAddress)
            .filter((address): address is string => address !== null);

        if (winnerAddresses.length !== selectedWinners.length) {
            throw new Error('Certains gagnants n\'ont pas d\'adresse wallet');
        }

        // Récupérer les gagnants avec toutes les informations
        const winnersWithDetails = insertedWinners.map((winner, index) => ({
            ...winner,
            user: selectedWinners[index].user,
            participation: {
                id: selectedWinners[index].participation.id,
                walletAddress: selectedWinners[index].participation.walletAddress,
                amountPaid: selectedWinners[index].participation.amountPaid,
                transactionHash: selectedWinners[index].participation.transactionHash,
                participatedAt: selectedWinners[index].participation.participatedAt,
            },
        }));

        return {
            winners: winnersWithDetails,
            raffleId: validatedData.raffleId,
            totalParticipants: participants.length,
            winnerAddresses,
            blockchainRaffleId: 0, // TODO: récupérer l'ID réel depuis le contrat
        };
    }); // Auth ouverte pour le moment
}

/**
 * Confirme le tirage au sort après que la transaction blockchain ait été effectuée
 * Met à jour le statut de la raffle à ENDED
 */
export async function confirmWinnersDraw(data: ConfirmWinnersDrawInput) {
    return withAction<{ success: boolean; transactionHash: string }>(async (db) => {
        const validatedData = confirmWinnersDrawSchema.parse(data);
        // Vérifier que la raffle existe
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, validatedData.raffleId))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        const raffle = raffles[0];

        // Vérifier qu'il y a bien des gagnants tirés
        const winners = await db
            .select()
            .from(winnerTable)
            .where(eq(winnerTable.raffleId, validatedData.raffleId))
            .limit(1);

        if (winners.length === 0) {
            throw new Error('Aucun gagnant trouvé pour cette raffle');
        }

        // Mettre à jour le statut de la raffle à ENDED
        await db
            .update(raffleTable)
            .set({
                status: 'ENDED',
                updatedAt: new Date(),
            })
            .where(eq(raffleTable.id, validatedData.raffleId));

        return {
            success: true,
            transactionHash: validatedData.transactionHash,
        };
    });
}

/**
 * Annule le tirage au sort si la transaction blockchain échoue
 * Supprime les gagnants et remet la raffle en statut ACTIVE
 */
export async function cancelWinnersDraw(data: CancelWinnersDrawInput) {
    return withAction<{ success: boolean }>(async (db) => {
        const validatedData = cancelWinnersDrawSchema.parse(data);
        // Vérifier que la raffle existe
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, validatedData.raffleId))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        // Supprimer tous les gagnants de cette raffle
        await db
            .delete(winnerTable)
            .where(eq(winnerTable.raffleId, validatedData.raffleId));

        // Remettre les participations à isWinner = false
        await db
            .update(participationTable)
            .set({
                isWinner: false,
                updatedAt: new Date(),
            })
            .where(eq(participationTable.raffleId, validatedData.raffleId));

        // Remettre la raffle en statut ACTIVE
        await db
            .update(raffleTable)
            .set({
                status: 'ACTIVE',
                updatedAt: new Date(),
            })
            .where(eq(raffleTable.id, validatedData.raffleId));

        return { success: true };
    });
}

/**
 * Récupère les détails des gagnants d'une raffle
 */
export async function getRaffleWinners(raffleId: string) {
    return withAction<DrawResult['winners']>(async (db) => {
        // Vérifier que l'organisateur existe
        const organizers = await db
            .select()
            .from(organizerTable)
            .orderBy(desc(organizerTable.createdAt))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Aucun organisateur trouvé');
        }

        const organizer = organizers[0];

        // Vérifier que la raffle existe et appartient à l'organisateur
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, raffleId))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        const raffle = raffles[0];

        if (raffle.organizerId !== organizer.id) {
            throw new Error('Vous n\'êtes pas autorisé à consulter les gagnants de cette raffle');
        }

        // Récupérer les gagnants avec leurs détails
        const winners = await db
            .select({
                winner: winnerTable,
                user: {
                    id: userTable.id,
                    username: userTable.username,
                    email: userTable.email,
                    walletAddress: userTable.walletAddress,
                },
                participation: {
                    id: participationTable.id,
                    walletAddress: participationTable.walletAddress,
                    amountPaid: participationTable.amountPaid,
                    transactionHash: participationTable.transactionHash,
                    participatedAt: participationTable.participatedAt,
                },
            })
            .from(winnerTable)
            .innerJoin(userTable, eq(winnerTable.userId, userTable.id))
            .innerJoin(participationTable, eq(winnerTable.participationId, participationTable.id))
            .where(eq(winnerTable.raffleId, raffleId))
            .orderBy(winnerTable.winnerRank);

        return winners.map(w => ({
            ...w.winner,
            user: w.user,
            participation: w.participation,
        }));
    }); // Auth ouverte pour le moment
}

/**
 * Effectue le tirage au sort automatiquement on-chain 
 * L'algorithme de sélection est entièrement exécuté dans le smart contract
 */
export async function drawWinnersAutomatically(raffleId: string) {
  return withAction<{ 
    success: boolean; 
    message: string; 
    raffleId: string; 
    blockchainRaffleId: number;
  }>(async (db) => {
    // Récupérer l'organisateur actuel
    const organizers = await db
      .select()
      .from(organizerTable)
      .orderBy(desc(organizerTable.createdAt))
      .limit(1);

    if (organizers.length === 0) {
      throw new Error('Aucun organisateur trouvé');
    }

    const organizer = organizers[0];

    // Vérifier que la raffle existe et appartient à l'organisateur
    const raffles = await db
      .select()
      .from(raffleTable)
      .where(eq(raffleTable.id, raffleId))
      .limit(1);

    if (raffles.length === 0) {
      throw new Error('Raffle non trouvée');
    }

    const raffle = raffles[0];

    if (raffle.organizerId !== organizer.id) {
      throw new Error('Vous n\'êtes pas autorisé à effectuer le tirage de cette raffle');
    }

    // Vérifier que la raffle est active et que la date de fin est passée
    if (raffle.status !== 'ACTIVE') {
      throw new Error('Seules les raffles actives peuvent avoir un tirage au sort');
    }

    if (new Date() < new Date(raffle.endDate)) {
      throw new Error('Le tirage ne peut être effectué qu\'après la date de fin de la raffle');
    }

    // Vérifier que le tirage n'a pas déjà été effectué
    const existingWinners = await db
      .select()
      .from(winnerTable)
      .where(eq(winnerTable.raffleId, raffleId))
      .limit(1);

    if (existingWinners.length > 0) {
      throw new Error('Le tirage a déjà été effectué pour cette raffle');
    }

    // Récupérer les participants pour validation
    const participants = await db
      .select()
      .from(participationTable)
      .where(eq(participationTable.raffleId, raffleId));

    if (participants.length === 0) {
      throw new Error('Aucun participant trouvé pour cette raffle');
    }

    // Le tirage sera effectué côté frontend avec le wallet de l'organisateur
    // Cette action prépare les données nécessaires
    const blockchainRaffleId = 0; // TODO: récupérer l'ID réel depuis le contrat

    return {
      success: true,
      message: `Tirage automatique prêt pour ${participants.length} participants. Confirmez la transaction avec votre wallet.`,
      raffleId,
      blockchainRaffleId,
    };
  });
} 