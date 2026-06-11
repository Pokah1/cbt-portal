'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function beginExam(candidateId: string, examId: string) {
  const supabase = await createClient()

  const { data: existingAttempt } = await supabase
    .from('attempts')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('exam_id', examId)
    .single()

  if (existingAttempt) {
    return { success: true, attemptId: existingAttempt.id }
  }

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

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOption: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('answers')
    .upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: selectedOption,
      },
      { onConflict: 'attempt_id,question_id' }
    )

  if (error) {
    return { success: false }
  }

  return { success: true }
}

export async function submitExam(
  attemptId: string,
  answers: Record<string, string>
) {
  const supabase = await createAdminClient()

  const { data: attempt } = await supabase
    .from('attempts')
    .select('exam_id')
    .eq('id', attemptId)
    .single()

  if (!attempt) return { success: false }

  const { data: sections } = await supabase
    .from('sections')
    .select('questions(id, correct_option, marks)')
    .eq('exam_id', attempt.exam_id)

  if (!sections) return { success: false }

  const allQuestions = (sections ?? []).flatMap(
    (s) => s.questions as { id: string; correct_option: string; marks: number }[]
  )

  let score = 0
  let totalMarks = 0

  const answerUpdates = allQuestions.map((q) => {
    totalMarks += q.marks
    const selected = answers[q.id]
    const isCorrect = selected === q.correct_option
    if (isCorrect) score += q.marks

    return {
      attempt_id: attemptId,
      question_id: q.id,
      selected_option: selected ?? null,
      is_correct: selected ? isCorrect : null,
    }
  })

  await supabase
    .from('answers')
    .upsert(answerUpdates, { onConflict: 'attempt_id,question_id' })

  await supabase
    .from('attempts')
    .update({
      is_completed: true,
      submitted_at: new Date().toISOString(),
      score,
      total_marks: totalMarks,
    })
    .eq('id', attemptId)

  return { success: true, score, totalMarks }
}