export type Category = {
  id: string
  name: string
  description: string | null
  created_at?: string
}

export type Exam = {
  id: string
  category_id: string
  title: string
  duration_minutes: number
  is_active: boolean
  created_at?: string
}

export type Section = {
  id: string
  exam_id: string
  title: string
  question_count: number
  order_index: number
  created_at?: string
}

export type Question = {
  id: string
  section_id: string
  body: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  marks: number
  order_index: number
  created_at?: string
}

export type Candidate = {
  id: string
  full_name: string
  email: string
  phone: string
  category_id: string
  created_at?: string
}

export type Attempt = {
  id: string
  candidate_id: string
  exam_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  total_marks: number | null
  is_completed: boolean
  created_at?: string
  tab_switches: number
}

export type Answer = {
  id: string
  attempt_id: string
  question_id: string
  selected_option: 'A' | 'B' | 'C' | 'D' | null
  is_correct: boolean | null
  answered_at?: string
}