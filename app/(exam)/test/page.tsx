import {cookies} from 'next/headers'
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

function calculateRemainingSeconds(startedAt: string, durationMinutes: number): number {
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

    //Get candidate and their category
    const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, category_id')
    .eq('id', candidateId)
    .single()

  if (!candidate) {
    redirect('/register')
  }

  // Get their exam
  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, duration_minutes')
    .eq('category_id', candidate.category_id)
    .eq('is_active', true)
    .single()

  if (!exam) {
    redirect('/register')
  }

  // Get or verify attempt exists
  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, started_at, is_completed')
    .eq('candidate_id', candidateId)
    .eq('exam_id', exam.id)
    .maybeSingle()

  // No attempt means they skipped instructions — send them back
  if (!attempt) {
    redirect('/instructions')
  }

  // Already completed — send to results
  if (attempt.is_completed) {
    redirect('/results')
  }

  // Get all sections with questions
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


    // Get any existing answers for this attempt
  const { data: existingAnswers } = await supabase
    .from('answers')
    .select('question_id, selected_option')
    .eq('attempt_id', attempt.id)

    // Calculate remaining time in seconds
 const remainingSeconds = calculateRemainingSeconds(
  attempt.started_at,
  exam.duration_minutes
)

  // If time already expired redirect to results
  if (remainingSeconds === 0) {
    redirect('/results')
  }

  // Build a flat list of all questions with section info
  const allQuestions = (sections ?? []).flatMap((section) =>
    (section.questions as RawQuestion[])
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        ...q,
        section_id: section.id,
        section_title: section.title,
      }))
  )

  // Build answers map: { question_id: selected_option }
  const answersMap = Object.fromEntries(
    (existingAnswers ?? []).map((a) => [a.question_id, a.selected_option])
  )

  // Determine if calculator should show (Category A only)
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