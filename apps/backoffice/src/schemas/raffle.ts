import { z } from 'zod';


// Helper function to parse dates that might be strings or Date objects
const dateParser = z.union([
    z.string().transform((str) => new Date(str)),
    z.date()
]).transform((date) => {
    // Ensure we always get a valid Date object
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
    }
    return parsedDate;
});

export const createRaffleSchema = z.object({
    title: z.string().min(3, 'The title must contain at least 3 characters').max(255, 'The title cannot exceed 255 characters'),
    description: z.string().min(10, 'The description must contain at least 10 characters').max(1000, 'The description cannot exceed 1000 characters'),
    prizeDescription: z.string().min(5, 'The prize description must contain at least 5 characters').max(500, 'The prize description cannot exceed 500 characters'),
    imageUrl: z.string().url('Invalid image URL').max(500, 'The URL cannot exceed 500 characters').optional(),
    participationPrice: z.string().regex(/^\d+(\.\d{1,8})?$/, 'Invalid participation price (max 8 decimals)'),
    startDate: dateParser.refine(
        (date) => date > new Date(), 
        'The start date must be in the future'
    ),
    endDate: dateParser,
    maxWinners: z.string().regex(/^\d+$/, 'Invalid number of winners').refine((val) => {
        const num = Number.parseInt(val);
        return num >= 1 && num <= 100;
    }, 'Number of winners must be between 1 and 100'),
    maxParticipants: z.string().regex(/^\d+$/, 'Invalid number of participants').refine((val) => {
        const num = Number.parseInt(val);
        return num >= 1;
    }, 'Number of participants must be at least 1').optional(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'The end date must be after the start date',
    path: ['endDate'],
  });

export type CreateRaffleInput = z.infer<typeof createRaffleSchema>;

export const updateRaffleSchema = z.object({
    id: z.string().uuid('Invalid raffle ID'),
    title: z.string().min(3, 'The title must contain at least 3 characters').max(255, 'The title cannot exceed 255 characters').optional(),
    description: z.string().min(10, 'The description must contain at least 10 characters').max(1000, 'The description cannot exceed 1000 characters').optional(),
    prizeDescription: z.string().min(5, 'The prize description must contain at least 5 characters').max(500, 'The prize description cannot exceed 500 characters').optional(),
    imageUrl: z.string().url('Invalid image URL').max(500, 'The URL cannot exceed 500 characters').optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    maxWinners: z.string().regex(/^\d+$/, 'Invalid number of winners').optional(),
    maxParticipants: z.string().regex(/^\d+$/, 'Invalid number of participants').optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: 'The end date must be after the start date',
    path: ['endDate'],
});

export type UpdateRaffleInput = z.infer<typeof updateRaffleSchema>;

export const getRaffleByIdSchema = z.object({
    id: z.string().uuid('Invalid raffle ID'),
});

export type GetRaffleByIdInput = z.infer<typeof getRaffleByIdSchema>;

export const drawWinnersSchema = z.object({
    raffleId: z.string().uuid('Invalid raffle ID'),
    winnerCount: z.number().min(1, 'At least one winner is required').max(100, 'Maximum 100 winners'),
});

export type DrawWinnersInput = z.infer<typeof drawWinnersSchema>; 
