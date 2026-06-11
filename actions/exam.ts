'use server'

import { createClient } from '@/lib/supabase/server'

export async function beginExam(candidateId: string, examId: string) {
  const supabase = await createClient()

  // Check if attempt already exists (resume case)
  const { data: existingAttempt } = await supabase
    .from('attempts')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('exam_id', examId)
    .single()

  if (existingAttempt) {
    // Attempt exists — resume, don't create a new one
    return { success: true, attemptId: existingAttempt.id }
  }

  // Create a fresh attempt
  const { data, error } = await supabase
    .from('attempts')
    .insert({
      candidate_id: candidateId,
      exam_id: examId,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: 'Failed to start exam. Please try again.' }
  }

  return { success: true, attemptId: data.id }
}