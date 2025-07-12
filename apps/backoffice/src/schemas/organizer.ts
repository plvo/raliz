import { z } from 'zod';

export const updateOrganizerProfileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
    email: z.string().email('Format d\'email invalide').optional(),
    description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
    logoUrl: z.string().url('URL du logo invalide').max(500, 'L\'URL ne peut pas dépasser 500 caractères').optional(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse wallet invalide (format 0x...)'),
    fanTokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse du fan token invalide (format 0x...)'),
});

export type UpdateOrganizerProfileInput = z.infer<typeof updateOrganizerProfileSchema>;

export const getOrganizerByIdSchema = z.object({
    id: z.string().uuid('ID organisateur invalide'),
});

export type GetOrganizerByIdInput = z.infer<typeof getOrganizerByIdSchema>; 