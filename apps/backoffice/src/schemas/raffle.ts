import { z } from 'zod';

export const createRaffleSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title cannot exceed 255 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters'),
    prizeDescription: z
      .string()
      .min(5, 'Prize description must be at least 5 characters')
      .max(500, 'Prize description cannot exceed 500 characters'),
    imageUrl: z.string().url('Invalid image URL').max(500, 'URL cannot exceed 500 characters').optional(),
    participationPrice: z.string().regex(/^\d+(\.\d{1,8})?$/, 'Invalid participation price (max 8 decimals)'),
    tokenSymbol: z.string().min(2, 'Token symbol required').max(10, 'Token symbol too long').default('CHZ'),
    minimumFanTokens: z
      .string()
      .regex(/^\d+(\.\d{1,8})?$/, 'Invalid minimum fan tokens (max 8 decimals)')
      .default('50'),
    startDate: z.date().min(new Date(), 'Start date must be in the future'),
    endDate: z.date(),
    maxWinners: z.string().regex(/^\d+$/, 'Invalid number of winners').min(1).max(100),
    maxParticipants: z.string().regex(/^\d+$/, 'Invalid number of participants').optional(),
    smartContractAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid smart contract address (format 0x...)')
      .optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;

export const updateRaffleSchema = z
  .object({
    id: z.string().uuid('Invalid raffle ID'),
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title cannot exceed 255 characters')
      .optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    prizeDescription: z
      .string()
      .min(5, 'Prize description must be at least 5 characters')
      .max(500, 'Prize description cannot exceed 500 characters')
      .optional(),
    imageUrl: z.string().url('Invalid image URL').max(500, 'URL cannot exceed 500 characters').optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    maxWinners: z.string().regex(/^\d+$/, 'Invalid number of winners').optional(),
    maxParticipants: z.string().regex(/^\d+$/, 'Invalid number of participants').optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

export type UpdateRaffleInput = z.infer<typeof updateRaffleSchema>;

export const getRaffleByIdSchema = z.object({
  id: z.string().uuid('Invalid raffle ID'),
});

export type GetRaffleByIdInput = z.infer<typeof getRaffleByIdSchema>;

export const drawWinnersSchema = z.object({
  raffleId: z.string().uuid('Invalid raffle ID'),
  winnerCount: z.number().min(1, 'At least one winner required').max(100, 'Maximum 100 winners'),
});

export type DrawWinnersInput = z.infer<typeof drawWinnersSchema>;

export const confirmRaffleCreationSchema = z.object({
  raffleId: z.string().uuid('Invalid raffle ID'),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash (format 0x...)'),
  contractRaffleId: z.number().int().min(0, 'Invalid contract raffle ID'), // Raffle ID in the smart contract
});

export type ConfirmRaffleCreationInput = z.infer<typeof confirmRaffleCreationSchema>;

export const cancelRaffleCreationSchema = z.object({
  raffleId: z.string().uuid('Invalid raffle ID'),
});

export type CancelRaffleCreationInput = z.infer<typeof cancelRaffleCreationSchema>;

export const confirmWinnersDrawSchema = z.object({
  raffleId: z.string().uuid('Invalid raffle ID'),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash (format 0x...)'),
});

export type ConfirmWinnersDrawInput = z.infer<typeof confirmWinnersDrawSchema>;

export const cancelWinnersDrawSchema = z.object({
  raffleId: z.string().uuid('Invalid raffle ID'),
});

export type CancelWinnersDrawInput = z.infer<typeof cancelWinnersDrawSchema>;
