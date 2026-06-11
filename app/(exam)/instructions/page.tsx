/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BeginTestButton from '@/components/BeginTestButton'

export default async function InstructionsPage() {
  const cookieStore = await cookies()
  const candidateId = cookieStore.get('candidate_id')?.value

  if (!candidateId) {
    redirect('/register')
  }

  const supabase = await createClient()

  // Query 1: Get candidate and their category
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, email, category_id')
    .eq('id', candidateId)
    .single()

  if (!candidate) {
    redirect('/register')
  }

  // Query 2: Get category name
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('id', candidate.category_id)
    .single()

  // Query 3: Get exam for this category
  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, duration_minutes')
    .eq('category_id', candidate.category_id)
    .eq('is_active', true)
    .single()

  if (!exam) {
    redirect('/register')
  }

  // Query 4: Get sections for this exam
  const { data: sections } = await supabase
    .from('sections')
    .select('id, title, question_count, order_index')
    .eq('exam_id', exam.id)
    .order('order_index')

  // Query 5: Check for existing attempt
  const { data: existingAttempt } = await supabase
    .from('attempts')
    .select('id, is_completed')
    .eq('candidate_id', candidateId)
    .eq('exam_id', exam.id)
    .maybeSingle()

  if (existingAttempt?.is_completed) {
    redirect('/results')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Exam Instructions
          </h1>
          <p className="text-gray-500 mt-2">
            Please read carefully before you begin
          </p>
        </div>

        {/* Candidate Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Candidate Details
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {candidate.full_name}
              </p>
              <p className="text-gray-500 text-sm">{candidate.email}</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full">
              {category?.name}
            </span>
          </div>
        </div>

        {/* Exam Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Exam Breakdown
          </h2>
          <div className="space-y-3">
            {(sections ?? []).map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                    {section.order_index}
                  </div>
                  <span className="font-medium text-gray-800">
                    {section.title}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">
                  {section.question_count} questions
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Duration</span>
            <span className="font-bold text-blue-600 text-lg">
              {exam.duration_minutes} minutes
            </span>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Rules & Guidelines
          </h2>
          <ul className="space-y-3 text-gray-600 text-sm">
            {[
              'The timer begins immediately when you click Begin Test.',
              'You can navigate between questions freely within the time limit.',
              'Your answers are saved automatically as you select them.',
              'You may change your answer at any time before submitting.',
              'The exam will auto-submit when the timer reaches zero.',
              'Do not close or refresh the browser during the exam.',
              'Ensure you have a stable internet connection before starting.',
              'You cannot retake the exam once it has been submitted.',
            ].map((rule, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-0.5">
                  {index + 1}.
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Begin Button */}
        <BeginTestButton
          candidateId={candidate.id}
          examId={exam.id}
          hasExistingAttempt={!!existingAttempt}
        />

      </div>
    </main>
  )
}