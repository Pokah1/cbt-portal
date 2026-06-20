'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
// import { sendResultEmails } from '@/lib/emails/sendResultEmails'


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

  // Fetch sections IN ORDER, with their questions
  const { data: sections } = await supabase
    .from('sections')
    .select('id, order_index, questions(id)')
    .eq('exam_id', examId)
    .order('order_index')

  // Shuffle questions WITHIN each section, but keep section order fixed
  const questionOrder = (sections ?? []).flatMap((section) => {
    const questionIds = (section.questions as { id: string }[]).map((q) => q.id)
    const shuffledQuestionIds = shuffleArray(questionIds)

    return shuffledQuestionIds.map((questionId) => ({
      questionId,
      optionOrder: shuffleArray(['A', 'B', 'C', 'D']),
    }))
  })

  const { data, error } = await supabase
    .from('attempts')
    .insert({
      candidate_id: candidateId,
      exam_id: examId,
      question_order: questionOrder,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: 'Failed to start exam. Please try again.' }
  }

  return { success: true, attemptId: data.id }
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
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

  if (error) return { success: false }
  return { success: true }
}

export async function submitExam(
  attemptId: string,
  answers: Record<string, string>
) {
  const supabase = await createAdminClient()

  // Get attempt
  const { data: attempt } = await supabase
    .from('attempts')
    .select('exam_id, candidate_id')
    .eq('id', attemptId)
    .single()

  if (!attempt) return { success: false }

  // Get sections and questions for scoring
  const { data: sections } = await supabase
    .from('sections')
    .select('questions(id, correct_option, marks)')
    .eq('exam_id', attempt.exam_id)

  if (!sections) return { success: false }

  const allQuestions = (sections ?? []).flatMap(
    (s) =>
      s.questions as {
        id: string
        correct_option: string
        marks: number
      }[]
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

  // Upsert answers
  await supabase
    .from('answers')
    .upsert(answerUpdates, { onConflict: 'attempt_id,question_id' })

  // Mark attempt complete
  const submittedAt = new Date().toISOString()
  await supabase
    .from('attempts')
    .update({
      is_completed: true,
      submitted_at: submittedAt,
      score,
      total_marks: totalMarks,
    })
    .eq('id', attemptId)

  // Fetch data needed for emails
//   const { data: candidate } = await supabase
//     .from('candidates')
//     .select('full_name, email, phone, category_id')
//     .eq('id', attempt.candidate_id)
//     .single()

//   if (candidate) {
//     const { data: category } = await supabase
//       .from('categories')
//       .select('name')
//       .eq('id', candidate.category_id)
//       .single()

//     const { data: exam } = await supabase
//       .from('exams')
//       .select('title')
//       .eq('id', attempt.exam_id)
//       .single()

//     // Build section breakdown for email
//     const { data: sectionData } = await supabase
//       .from('sections')
//       .select('title, order_index, questions(id, marks)')
//       .eq('exam_id', attempt.exam_id)
//       .order('order_index')

//     const answersMap = Object.fromEntries(
//       answerUpdates.map((a) => [a.question_id, a])
//     )

//     const sectionBreakdown = (sectionData ?? []).map((section) => {
//       const questions = section.questions as { id: string; marks: number }[]
//       const sectionTotal = questions.reduce((sum, q) => sum + q.marks, 0)
//       const sectionScore = questions.reduce((sum, q) => {
//         const answer = answersMap[q.id]
//         return sum + (answer?.is_correct ? q.marks : 0)
//       }, 0)
//       return {
//         title: section.title,
//         score: sectionScore,
//         total: sectionTotal,
//       }
//     })

//     // TODO: Re-enable before going live — disabled during testing to avoid hitting Resend free tier limits
// if (category && exam) {
//   await sendResultEmails({
//     candidate,
//     category,
//     exam,
//     attempt: {
//       score,
//       total_marks: totalMarks,
//       submitted_at: submittedAt,
//     },
//     sectionBreakdown,
//   })
// }
//   }

  return { success: true, score, totalMarks }
}

export async function recordTabSwitch(attemptId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('increment_tab_switches', {
    attempt_id: attemptId,
  })

  if (error) return { success: false, count: 0, shouldAutoSubmit: false }

  const count = data as number
  const shouldAutoSubmit = count >= 3

  return { success: true, count, shouldAutoSubmit }
}