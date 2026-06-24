import { SupabaseClient } from '@supabase/supabase-js'

export type ResultsSupabaseClient = SupabaseClient

export type CandidateRow = {
  id: string
  full_name: string
  email: string
  category_id: string
}

export type CategoryRow = {
  name: string
}

export type ExamRow = {
  id: string
  title: string
  duration_minutes: number
}

export type AttemptRow = {
  id: string
  score: number | null
  total_marks: number | null
  started_at: string
  submitted_at: string | null
  is_completed: boolean
}

export type AnswerRow = {
  question_id: string
  selected_option: string | null
  is_correct: boolean | null
}

export type SectionWithQuestions = {
  id: string
  title: string
  order_index: number
  questions: { id: string; marks: number }[]
}

export type SectionBreakdown = {
  title: string
  score: number
  total: number
  attempted: number
  questionCount: number
}

export type ExamStatistics = {
  score: number
  totalMarks: number
  percentage: number
  passed: boolean
  timeTaken: number | null
  correctCount: number
  incorrectCount: number
  attemptedCount: number
}