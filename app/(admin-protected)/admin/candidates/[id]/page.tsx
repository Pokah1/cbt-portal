import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, email, phone, created_at, category_id')
    .eq('id', id)
    .single()

  if (!candidate) notFound()

  // Get category
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', candidate.category_id)
    .single()

  // Get exam
  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, duration_minutes')
    .eq('category_id', candidate.category_id)
    .single()

  if (!exam) notFound()

  // Get attempt
  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, score, total_marks, started_at, submitted_at, is_completed')
    .eq('candidate_id', id)
    .eq('exam_id', exam.id)
    .maybeSingle()

  // Get sections
  const { data: sections } = await supabase
    .from('sections')
    .select('id, title, order_index, questions(id, marks)')
    .eq('exam_id', exam.id)
    .order('order_index')

  // Get answers if attempt exists
  const { data: answers } = attempt
    ? await supabase
        .from('answers')
        .select('question_id, selected_option, is_correct')
        .eq('attempt_id', attempt.id)
    : { data: [] }

  const answersMap = Object.fromEntries(
    (answers ?? []).map((a) => [a.question_id, a])
  )

  const sectionBreakdown = (sections ?? []).map((section) => {
    const questions = section.questions as { id: string; marks: number }[]
    const sectionTotal = questions.reduce((sum, q) => sum + q.marks, 0)
    const sectionScore = questions.reduce((sum, q) => {
      return sum + (answersMap[q.id]?.is_correct ? q.marks : 0)
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

  const score = attempt?.score ?? 0
  const totalMarks = attempt?.total_marks ?? 0
  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
  const isPassed = percentage >= 50

  const timeTaken =
    attempt?.submitted_at && attempt?.started_at
      ? Math.round(
          (new Date(attempt.submitted_at).getTime() -
            new Date(attempt.started_at).getTime()) /
            1000 /
            60
        )
      : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
      >
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {candidate.full_name}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Candidate Detail View</p>
      </div>

      {/* Candidate info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: candidate.full_name },
            { label: 'Email', value: candidate.email },
            { label: 'Phone', value: candidate.phone },
            { label: 'Category', value: category?.name ?? '—' },
            {
              label: 'Registered',
              value: new Date(candidate.created_at!).toLocaleString('en-NG', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
            },
            {
              label: 'Exam',
              value: exam.title,
            },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
              <p className="text-sm font-medium text-gray-900">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Score card */}
      {attempt?.is_completed ? (
        <>
          <div
            className={`rounded-2xl border shadow-sm p-6 mb-4 text-center ${
              isPassed
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div
              className={`text-6xl font-black mb-1 ${
                isPassed ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {percentage}%
            </div>
            <p
              className={`font-semibold ${
                isPassed ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {isPassed ? '✓ Pass' : '✗ Fail'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {score} out of {totalMarks} marks
            </p>
            {timeTaken !== null && (
              <p className="text-gray-400 text-xs mt-1">
                Completed in {timeTaken} minute{timeTaken !== 1 ? 's' : ''}
              </p>
            )}
            {attempt.submitted_at && (
              <p className="text-gray-400 text-xs mt-1">
                Submitted{' '}
                {new Date(attempt.submitted_at).toLocaleString('en-NG', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            )}
          </div>

          {/* Section breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
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
                      <span className="font-medium text-gray-800 text-sm">
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
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          sectionPassed ? 'bg-green-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${sectionPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{sectionPct}%</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Answer Summary
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
                  {answers?.filter((a) => a.selected_option && !a.is_correct)
                    .length ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Incorrect</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-yellow-700 font-medium">
            This candidate has not completed the exam yet.
          </p>
        </div>
      )}
    </div>
  )
}