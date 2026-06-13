'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function adminLogin(
  _prevState: { error?: string; success: boolean },
  formData: FormData
) {
  const password = formData.get('password') as string

  if (!password) {
    return { success: false, error: 'Please enter the admin password' }
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: 'Incorrect password' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return { success: true }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

export async function deleteCandidate(candidateId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId)

  if (error) {
    console.error('Failed to delete candidate:', error)
    return { success: false, error: 'Failed to delete candidate' }
  }

  return { success: true }
}