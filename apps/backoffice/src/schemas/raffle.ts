import { z } from 'zod';

export const createRaffleSchema = z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255, 'Le titre ne peut pas dépasser 255 caractères'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(1000, 'La description ne peut pas dépasser 1000 caractères'),
    prizeDescription: z.string().min(5, 'La description du prix doit contenir au moins 5 caractères').max(500, 'La description du prix ne peut pas dépasser 500 caractères'),
    imageUrl: z.string().url('URL de l\'image invalide').max(500, 'L\'URL ne peut pas dépasser 500 caractères').optional(),
    participationPrice: z.string().regex(/^\d+(\.\d{1,8})?$/, 'Prix de participation invalide (max 8 décimales)'),
    tokenSymbol: z.string().min(2, 'Symbole du token requis').max(10, 'Symbole du token trop long').default('CHZ'),
    minimumFanTokens: z.string().regex(/^\d+(\.\d{1,8})?$/, 'Minimum de fan tokens invalide (max 8 décimales)').default('50'),
    startDate: z.date().min(new Date(), 'La date de début doit être dans le futur'),
    endDate: z.date(),
    maxWinners: z.string().regex(/^\d+$/, 'Nombre de gagnants invalide').min(1).max(100),
    maxParticipants: z.string().regex(/^\d+$/, 'Nombre de participants invalide').optional(),
    smartContractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse du contrat smart invalide (format 0x...)').optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
});

export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;

export const updateRaffleSchema = z.object({
    id: z.string().uuid('ID raffle invalide'),
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255, 'Le titre ne peut pas dépasser 255 caractères').optional(),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
    prizeDescription: z.string().min(5, 'La description du prix doit contenir au moins 5 caractères').max(500, 'La description du prix ne peut pas dépasser 500 caractères').optional(),
    imageUrl: z.string().url('URL de l\'image invalide').max(500, 'L\'URL ne peut pas dépasser 500 caractères').optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    maxWinners: z.string().regex(/^\d+$/, 'Nombre de gagnants invalide').optional(),
    maxParticipants: z.string().regex(/^\d+$/, 'Nombre de participants invalide').optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
});

export type UpdateRaffleInput = z.infer<typeof updateRaffleSchema>;

export const getRaffleByIdSchema = z.object({
    id: z.string().uuid('ID raffle invalide'),
});

export type GetRaffleByIdInput = z.infer<typeof getRaffleByIdSchema>;

export const drawWinnersSchema = z.object({
    raffleId: z.string().uuid('ID raffle invalide'),
    winnerCount: z.number().min(1, 'Au moins un gagnant requis').max(100, 'Maximum 100 gagnants'),
});

export type DrawWinnersInput = z.infer<typeof drawWinnersSchema>;

export const confirmRaffleCreationSchema = z.object({
    raffleId: z.string().uuid('ID raffle invalide'),
    transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Hash de transaction invalide (format 0x...)'),
});

export type ConfirmRaffleCreationInput = z.infer<typeof confirmRaffleCreationSchema>;

export const cancelRaffleCreationSchema = z.object({
    raffleId: z.string().uuid('ID raffle invalide'),
});

export type CancelRaffleCreationInput = z.infer<typeof cancelRaffleCreationSchema>;

export const confirmWinnersDrawSchema = z.object({
    raffleId: z.string().uuid('ID raffle invalide'),
    transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Hash de transaction invalide (format 0x...)'),
});

export type ConfirmWinnersDrawInput = z.infer<typeof confirmWinnersDrawSchema>;

export const cancelWinnersDrawSchema = z.object({
    raffleId: z.string().uuid('ID raffle invalide'),
});

export type CancelWinnersDrawInput = z.infer<typeof cancelWinnersDrawSchema>; 