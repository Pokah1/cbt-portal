'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { registrationSchema } from '@/lib/validations/candidate'

export type RegisterState = {
  success: boolean
  errors?: {
    full_name?: string[]
    email?: string[]
    phone?: string[]
    category_id?: string[]
    general?: string[]
  }
  candidate?: {
    id: string
    full_name: string
    email: string
  } | null
}

export async function registerCandidate(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const rawData = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    category_id: formData.get('category_id') as string,
  }

  const validation = registrationSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .insert(validation.data)
    .select('id, full_name, email')
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        errors: {
          email: ['This email address is already registered'],
        },
      }
    }

    return {
      success: false,
      errors: {
        general: ['Something went wrong. Please try again.'],
      },
    }
  }

  // Set candidate_id cookie after successful registration
  const cookieStore = await cookies()
  cookieStore.set('candidate_id', data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 *2, //2 hours
   path: '/',
  })

  return {
    success: true,
    candidate: data,
  }
}

export type ResumeState = {
  success: boolean
  error?: string
}

export async function resumeSession(
  _prevState: ResumeState,
  formData: FormData
): Promise<ResumeState> {
  const email = (formData.get('email') as string)?.toLowerCase().trim()

  if (!email) {
    return { success: false, error: 'Please enter your email address' }
  }

  const supabase = await createClient()

  // Find candidate by email
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!candidate) {
    return {
      success: false,
      error: 'No registration found for this email address',
    }
  }

  // Re-set the cookie on this device
  const cookieStore = await cookies()
  cookieStore.set('candidate_id', candidate.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  })

  return { success: true }
}