import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(1, { message: "Password is required" }),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
  clinicName: z.string().trim().min(2, { message: "Clinic name must be at least 2 characters" }).max(200),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
});

export const businessBasicsSchema = z.object({
  name: z.string().trim().min(2, { message: "Business name is required" }).max(200),
  type: z.enum(['dental_clinic', 'medical_practice', 'salon', 'restaurant', 'other']),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().url().max(500).optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type BusinessBasicsFormData = z.infer<typeof businessBasicsSchema>;
