import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExamClient from '@/components/exam/ExamClient'

type RawQuestion = {
  id: string
  body: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  order_index: number
}

type ShuffleEntry = { questionId: string; optionOrder: string[] }

function getOptionField(
  letter: string
): 'option_a' | 'option_b' | 'option_c' | 'option_d' {
  switch (letter) {
    case 'A': return 'option_a'
    case 'B': return 'option_b'
    case 'C': return 'option_c'
    case 'D': return 'option_d'
    default: return 'option_a'
  }
}

function calculateRemainingSeconds(
  startedAt: string,
  durationMinutes: number
): number {
  const start = new Date(startedAt).getTime()
  const durationMs = durationMinutes * 60 * 1000
  const elapsed = new Date().getTime() - start
  return Math.max(0, Math.floor((durationMs - elapsed) / 1000))
}

export default async function TestPage() {
  const cookieStore = await cookies()
  const candidateId = cookieStore.get('candidate_id')?.value

  if (!candidateId) {
    redirect('/register')
  }

  const supabase = await createClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, category_id')
    .eq('id', candidateId)
    .single()

  if (!candidate) {
    redirect('/register')
  }

  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, duration_minutes')
    .eq('category_id', candidate.category_id)
    .eq('is_active', true)
    .single()

  if (!exam) {
    redirect('/register')
  }

  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, started_at, is_completed, question_order')
    .eq('candidate_id', candidateId)
    .eq('exam_id', exam.id)
    .maybeSingle()

  if (!attempt) {
    redirect('/instructions')
  }

  if (attempt.is_completed) {
    redirect('/results')
  }

  const { data: sections } = await supabase
    .from('sections')
    .select(`
      id,
      title,
      order_index,
      question_count,
      questions (
        id,
        body,
        option_a,
        option_b,
        option_c,
        option_d,
        order_index
      )
    `)
    .eq('exam_id', exam.id)
    .order('order_index')

  const { data: existingAnswers } = await supabase
    .from('answers')
    .select('question_id, selected_option')
    .eq('attempt_id', attempt.id)

  const remainingSeconds = calculateRemainingSeconds(
    attempt.started_at,
    exam.duration_minutes
  )

  if (remainingSeconds === 0) {
    redirect('/results')
  }

  const allQuestionsUnordered = (sections ?? []).flatMap((section) =>
    (section.questions as RawQuestion[]).map((q) => ({
      ...q,
      section_id: section.id,
      section_title: section.title,
    }))
  )

  const questionsById = Object.fromEntries(
    allQuestionsUnordered.map((q) => [q.id, q])
  )

  const questionOrder = (attempt.question_order ?? []) as ShuffleEntry[]

  const allQuestions = questionOrder
    .map((entry) => {
      const q = questionsById[entry.questionId]
      if (!q) return null

      const shuffledOptions = entry.optionOrder.map((originalLetter) => ({
        content: q[getOptionField(originalLetter)],
        originalLetter,
      }))

      return {
        id: q.id,
        body: q.body,
        order_index: q.order_index,
        section_id: q.section_id,
        section_title: q.section_title,
        shuffledOptions,
      }
    })
    .filter((q): q is NonNullable<typeof q> => q !== null)

  const answersMap = Object.fromEntries(
    (existingAnswers ?? []).map((a) => [a.question_id, a.selected_option])
  )

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', candidate.category_id)
    .single()

  const showCalculator = category?.name === 'Category A'

  return (
    <ExamClient
      candidate={candidate}
      attempt={attempt}
      exam={exam}
      questions={allQuestions}
      initialAnswers={answersMap}
      remainingSeconds={remainingSeconds}
      showCalculator={showCalculator}
    />
  )
}