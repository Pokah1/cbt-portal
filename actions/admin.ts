'use server'

import { cookies } from 'next/headers'

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
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  // Get all attempt IDs for this candidate
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id')
    .eq('candidate_id', candidateId)

  const attemptIds = (attempts ?? []).map((a) => a.id)

  // Delete answers first (child records)
  if (attemptIds.length > 0) {
    await supabase
      .from('answers')
      .delete()
      .in('attempt_id', attemptIds)
  }

  // Delete attempts
  await supabase
    .from('attempts')
    .delete()
    .eq('candidate_id', candidateId)

  // Delete candidate
  await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId)

  return { success: true }
}