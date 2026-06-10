import { z } from 'zod'

export const registrationSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\s-]+$/, 'Please enter a valid phone number'),
  category_id: z
    .string()
    .uuid('Please select a valid category'),
})

export type RegistrationInput = z.infer<typeof registrationSchema>