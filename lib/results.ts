import { SupabaseClient } from '@supabase/supabase-js'
import {
  AttemptRow,
  AnswerRow,
  SectionBreakdown,
  SectionWithQuestions,
  ExamStatistics,
} from '@/types/results'

// ─── Pure helpers ──────────────────────────────────────────────────────────

export function checkTimeExpired(
  startedAt: string,
  durationMinutes: number
): boolean {
  const elapsed = Date.now() - new Date(startedAt).getTime()
  return elapsed > durationMinutes * 60 * 1000
}

// ─── Data fetchers ─────────────────────────────────────────────────────────

export async function getCandidate(
  supabase: SupabaseClient,
  candidateId: string
) {
  const { data } = await supabase
    .from('candidates')
    .select('id, full_name, email, category_id')
    .eq('id', candidateId)
    .single()
  return data
}

export async function getCategoryAndExam(
  supabase: SupabaseClient,
  categoryId: string
) {
  const [categoryResult, examResult] = await Promise.all([
    supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single(),
    supabase
      .from('exams')
      .select('id, title, duration_minutes')
      .eq('category_id', categoryId)
      .single(),
  ])
  return {
    category: categoryResult.data,
    exam: examResult.data,
  }
}

export async function getAttempt(
  supabase: SupabaseClient,
  candidateId: string,
  examId: string
): Promise<AttemptRow | null> {
  const { data } = await supabase
    .from('attempts')
    .select('id, score, total_marks, started_at, submitted_at, is_completed')
    .eq('candidate_id', candidateId)
    .eq('exam_id', examId)
    .maybeSingle()
  return data
}

export async function getSectionsAndAnswers(
  supabase: SupabaseClient,
  examId: string,
  attemptId: string
) {
  const [sectionsResult, answersResult] = await Promise.all([
    supabase
      .from('sections')
      .select('id, title, order_index, questions(id, marks)')
      .eq('exam_id', examId)
      .order('order_index'),
    supabase
      .from('answers')
      .select('question_id, selected_option, is_correct')
      .eq('attempt_id', attemptId),
  ])
  return {
    sections: (sectionsResult.data ?? []) as SectionWithQuestions[],
    answers: (answersResult.data ?? []) as AnswerRow[],
  }
}

// ─── Auto-submit expired attempt ──────────────────────────────────────────

export async function autoSubmitExpiredAttempt(
  adminSupabase: SupabaseClient,
  attempt: AttemptRow,
  examId: string
): Promise<AttemptRow> {
  // Guard: only submit if still incomplete — prevents race conditions
  // between two tabs or two server renders hitting this simultaneously
  const { data: current } = await adminSupabase
    .from('attempts')
    .select('is_completed')
    .eq('id', attempt.id)
    .single()

  if (current?.is_completed) {
    // Already submitted by another process — refetch the completed row
    const { data: completed } = await adminSupabase
      .from('attempts')
      .select('id, score, total_marks, started_at, submitted_at, is_completed')
      .eq('id', attempt.id)
      .single()
    return completed as AttemptRow
  }

  // Fetch saved answers and questions in parallel
  const [answersResult, sectionsResult] = await Promise.all([
    adminSupabase
      .from('answers')
      .select('question_id, selected_option')
      .eq('attempt_id', attempt.id),
    adminSupabase
      .from('sections')
      .select('questions(id, correct_option, marks)')
      .eq('exam_id', examId),
  ])

  const savedAnswers = answersResult.data ?? []
  const allQuestions = (sectionsResult.data ?? []).flatMap(
    (s) =>
      s.questions as {
        id: string
        correct_option: string
        marks: number
      }[]
  )

  const savedAnswersMap = new Map(
    savedAnswers
      .filter((a) => a.selected_option)
      .map((a) => [a.question_id, a.selected_option as string])
  )

  let score = 0
  let totalMarks = 0

  const answerUpdates = allQuestions.map((q) => {
    totalMarks += q.marks
    const selected = savedAnswersMap.get(q.id)
    const isCorrect = !!selected && selected === q.correct_option
    if (isCorrect) score += q.marks
    return {
      attempt_id: attempt.id,
      question_id: q.id,
      selected_option: selected ?? null,
      is_correct: selected ? isCorrect : null,
    }
  })

  const submittedAt = new Date().toISOString()

  // Run upsert and update in parallel
  await Promise.all([
    adminSupabase
      .from('answers')
      .upsert(answerUpdates, { onConflict: 'attempt_id,question_id' }),
    adminSupabase
      .from('attempts')
      .update({
        is_completed: true,
        submitted_at: submittedAt,
        score,
        total_marks: totalMarks,
      })
      .eq('id', attempt.id)
      .eq('is_completed', false), // race condition guard at DB level
  ])

  // Return the completed attempt without mutating the original
  return {
    ...attempt,
    is_completed: true,
    score,
    total_marks: totalMarks,
    submitted_at: submittedAt,
  }
}

// ─── Calculations ──────────────────────────────────────────────────────────

export function buildSectionBreakdown(
  sections: SectionWithQuestions[],
  answersMap: Map<string, AnswerRow>
): SectionBreakdown[] {
  return sections.map((section) => {
    let sectionTotal = 0
    let sectionScore = 0
    let attempted = 0

    for (const q of section.questions) {
      sectionTotal += q.marks
      const answer = answersMap.get(q.id)
      if (answer?.selected_option) attempted++
      if (answer?.is_correct) sectionScore += q.marks
    }

    return {
      title: section.title,
      score: sectionScore,
      total: sectionTotal,
      attempted,
      questionCount: section.questions.length,
    }
  })
}

export function calculateStatistics(
  attempt: AttemptRow,
  answers: AnswerRow[]
): ExamStatistics {
  const score = attempt.score ?? 0
  const totalMarks = attempt.total_marks ?? 0
  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
  const passed = percentage >= 50

  const timeTaken =
    attempt.submitted_at && attempt.started_at
      ? Math.round(
          (new Date(attempt.submitted_at).getTime() -
            new Date(attempt.started_at).getTime()) /
            1000 /
            60
        )
      : null

  // Single loop over answers for all three counts
  let correctCount = 0
  let incorrectCount = 0
  let attemptedCount = 0

  for (const a of answers) {
    if (a.selected_option) {
      attemptedCount++
      if (a.is_correct) correctCount++
      else incorrectCount++
    }
  }

  return {
    score,
    totalMarks,
    percentage,
    passed,
    timeTaken,
    correctCount,
    incorrectCount,
    attemptedCount,
  }
}