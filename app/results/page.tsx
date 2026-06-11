import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ResultsPage() {
  const cookieStore = await cookies()
  const candidateId = cookieStore.get('candidate_id')?.value

  if (!candidateId) {
    redirect('/register')
  }

  const supabase = await createClient()

  // Get candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, email, category_id')
    .eq('id', candidateId)
    .single()

  if (!candidate) {
    redirect('/register')
  }

  // Get category name
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', candidate.category_id)
    .single()

  // Get exam
  const { data: exam } = await supabase
    .from('exams')
    .select('id, title')
    .eq('category_id', candidate.category_id)
    .single()

  if (!exam) {
    redirect('/register')
  }

  // Get completed attempt
  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, score, total_marks, started_at, submitted_at, is_completed')
    .eq('candidate_id', candidateId)
    .eq('exam_id', exam.id)
    .eq('is_completed', true)
    .maybeSingle()

  if (!attempt) {
    redirect('/instructions')
  }

  // Get sections
  const { data: sections } = await supabase
    .from('sections')
    .select('id, title, order_index, questions(id, marks)')
    .eq('exam_id', exam.id)
    .order('order_index')

  // Get answers for this attempt
  const { data: answers } = await supabase
    .from('answers')
    .select('question_id, selected_option, is_correct')
    .eq('attempt_id', attempt.id)

  const answersMap = Object.fromEntries(
    (answers ?? []).map((a) => [a.question_id, a])
  )

  // Calculate per-section breakdown
  const sectionBreakdown = (sections ?? []).map((section) => {
    const questions = section.questions as { id: string; marks: number }[]
    const sectionTotal = questions.reduce((sum, q) => sum + q.marks, 0)
    const sectionScore = questions.reduce((sum, q) => {
      const answer = answersMap[q.id]
      return sum + (answer?.is_correct ? q.marks : 0)
    }, 0)
    const attempted = questions.filter(
      (q) => answersMap[q.id]?.selected_option
    ).length

    return {
      title: section.title,
      score: sectionScore,
      total: sectionTotal,
      attempted,
      questionCount: questions.length,
    }
  })

  const score = attempt.score ?? 0
  const totalMarks = attempt.total_marks ?? 0
  const percentage = totalMarks > 0
    ? Math.round((score / totalMarks) * 100)
    : 0
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

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-500 mt-1">{exam.title}</p>
        </div>

        {/* Score card */}
        <div
          className={`rounded-2xl border shadow-sm p-8 text-center ${
            passed
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div
            className={`text-7xl font-black mb-2 ${
              passed ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {percentage}%
          </div>
          <p
            className={`text-xl font-semibold mb-1 ${
              passed ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {passed ? '🎉 Congratulations!' : 'Better luck next time'}
          </p>
          <p className="text-gray-600">
            {score} out of {totalMarks} marks
          </p>
          {timeTaken !== null && (
            <p className="text-gray-400 text-sm mt-1">
              Completed in {timeTaken} minute{timeTaken !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Candidate info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Candidate Details
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">
                {candidate.full_name}
              </p>
              <p className="text-gray-500 text-sm">{candidate.email}</p>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full block mb-1">
                {category?.name}
              </span>
              <span
                className={`text-sm font-semibold ${
                  passed ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {passed ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Section Breakdown
          </h2>
          <div className="space-y-5">
            {sectionBreakdown.map((section) => {
              const sectionPct =
                section.total > 0
                  ? Math.round((section.score / section.total) * 100)
                  : 0
              const sectionPassed = sectionPct >= 50

              return (
                <div key={section.title}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {section.title}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        {section.score}/{section.total} marks
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({section.attempted}/{section.questionCount} attempted)
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        sectionPassed ? 'bg-green-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${sectionPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {sectionPct}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
            Summary
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {answers?.filter((a) => a.selected_option).length ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Attempted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {answers?.filter((a) => a.is_correct).length ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {answers?.filter(
                  (a) => a.selected_option && !a.is_correct
                ).length ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Incorrect</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pb-6">
          <p className="text-gray-400 text-sm">
            Your results have been recorded. You will be contacted if you
            progress to the next stage.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </main>
  )
}