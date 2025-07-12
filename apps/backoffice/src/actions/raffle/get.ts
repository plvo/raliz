'use server';

import { withAction } from '@/lib/wrappers/with-action';
import { getRaffleByIdSchema } from '@/schemas/raffle';
import {
    raffleTable,
    organizerTable,
    participationTable,
    winnerTable,
    userTable,
    type Raffle,
    type Organizer
} from '@repo/db';
import { desc, eq, count, and } from '@repo/db';

/**
 * Récupère toutes les raffles de l'organisateur connecté
 * Pour le moment l'auth est ouverte, donc on prend les raffles du premier organisateur
 */
export async function getOrganizerRaffles(organizer: Organizer) {
    return withAction<Raffle[]>(async (db) => {
        console.log('Fetching raffles for organizer:', organizer.id);
        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.organizerId, organizer.id))
            .orderBy(desc(raffleTable.createdAt));

        return raffles;
    });
}

/**
 * Récupère une raffle spécifique par son ID avec tous les détails
 */
export async function getRaffleById(id: string) {
    return withAction<{
        raffle: Raffle;
        organizer: {
            id: string;
            name: string;
            email: string | null;
            logoUrl: string | null;
            walletAddress: string;
            fanTokenAddress: string;
        };
        participationsCount: number;
        winnersCount: number;
    }>(async (db) => {
        const validatedData = getRaffleByIdSchema.parse({ id });

        const raffles = await db
            .select()
            .from(raffleTable)
            .where(eq(raffleTable.id, validatedData.id))
            .limit(1);

        if (raffles.length === 0) {
            throw new Error('Raffle non trouvée');
        }

        const raffle = raffles[0];

        // Récupérer l'organisateur
        const organizers = await db
            .select({
                id: organizerTable.id,
                name: organizerTable.name,
                email: organizerTable.email,
                logoUrl: organizerTable.logoUrl,
                walletAddress: organizerTable.walletAddress,
                fanTokenAddress: organizerTable.fanTokenAddress,
            })
            .from(organizerTable)
            .where(eq(organizerTable.id, raffle.organizerId))
            .limit(1);

        if (organizers.length === 0) {
            throw new Error('Organisateur non trouvé');
        }

        // Compter les participations
        const participationsCountResult = await db
            .select({ count: count() })
            .from(participationTable)
            .where(eq(participationTable.raffleId, validatedData.id));

        // Compter les gagnants
        const winnersCountResult = await db
            .select({ count: count() })
            .from(winnerTable)
            .where(eq(winnerTable.raffleId, validatedData.id));

        return {
            raffle,
            organizer: organizers[0],
            participationsCount: participationsCountResult[0]?.count || 0,
            winnersCount: winnersCountResult[0]?.count || 0,
        };
    });
}

/**
 * Récupère les participants d'une raffle
 */
export async function getRaffleParticipants(raffleId: string) {
    return withAction<Array<{
        participation: {
            id: string;
            walletAddress: string;
            amountPaid: string;
            tokenUsed: string;
            transactionHash: string | null;
            participatedAt: Date;
            isWinner: boolean;
        };
        user: {
            id: string;
            username: string | null;
            email: string | null;
            walletAddress: string | null;
        };
    }>>(async (db) => {
        const participants = await db
            .select({
                participation: {
                    id: participationTable.id,
                    walletAddress: participationTable.walletAddress,
                    amountPaid: participationTable.amountPaid,
                    tokenUsed: participationTable.tokenUsed,
                    transactionHash: participationTable.transactionHash,
                    participatedAt: participationTable.participatedAt,
                    isWinner: participationTable.isWinner,
                },
                user: {
                    id: userTable.id,
                    username: userTable.username,
                    email: userTable.email,
                    walletAddress: userTable.walletAddress,
                },
            })
            .from(participationTable)
            .innerJoin(userTable, eq(participationTable.userId, userTable.id))
            .where(eq(participationTable.raffleId, raffleId))
            .orderBy(desc(participationTable.participatedAt));

        return participants;
    });
}

/**
 * Récupère les statistiques des raffles de l'organisateur donné
 */
export async function getRaffleStats(organizer: Organizer) {
    return withAction<{
        totalRaffles: number;
        activeRaffles: number;
        endedRaffles: number;
        draftRaffles: number;
        totalParticipations: number;
        totalWinners: number;
    }>(async (db) => {
        const [
            totalRafflesResult,
            activeRafflesResult,
            endedRafflesResult,
            draftRafflesResult,
        ] = await Promise.all([
            db
                .select({ count: count() })
                .from(raffleTable)
                .where(eq(raffleTable.organizerId, organizer.id)),
            db
                .select({ count: count() })
                .from(raffleTable)
                .where(and(eq(raffleTable.organizerId, organizer.id), eq(raffleTable.status, 'ACTIVE'))),
            db
                .select({ count: count() })
                .from(raffleTable)
                .where(and(eq(raffleTable.organizerId, organizer.id), eq(raffleTable.status, 'ENDED'))),
            db
                .select({ count: count() })
                .from(raffleTable)
                .where(and(eq(raffleTable.organizerId, organizer.id), eq(raffleTable.status, 'DRAFT'))),
        ]);

        // Compter les participations et gagnants pour toutes les raffles de l'organisateur
        const [totalParticipationsResult, totalWinnersResult] = await Promise.all([
            db
                .select({ count: count() })
                .from(participationTable)
                .innerJoin(raffleTable, eq(participationTable.raffleId, raffleTable.id))
                .where(eq(raffleTable.organizerId, organizer.id)),
            db
                .select({ count: count() })
                .from(winnerTable)
                .innerJoin(raffleTable, eq(winnerTable.raffleId, raffleTable.id))
                .where(eq(raffleTable.organizerId, organizer.id)),
        ]);

        return {
            totalRaffles: totalRafflesResult[0]?.count || 0,
            activeRaffles: activeRafflesResult[0]?.count || 0,
            endedRaffles: endedRafflesResult[0]?.count || 0,
            draftRaffles: draftRafflesResult[0]?.count || 0,
            totalParticipations: totalParticipationsResult[0]?.count || 0,
            totalWinners: totalWinnersResult[0]?.count || 0,
        };
    });
} 