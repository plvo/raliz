import { isUsernameValid } from '@/lib/auth';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstname: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  zip: z.string().min(5, 'Le code postal doit contenir 5 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères'),
  zone: z.enum(['A', 'B', 'C']),
  phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères'),
  birth_date: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'NOT_SPECIFIED']),
  username: z.string().min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères").refine(isUsernameValid, {
    message: "Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres, des tirets et des underscores",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
