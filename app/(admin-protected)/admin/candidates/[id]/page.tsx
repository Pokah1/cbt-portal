import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteCandidateButton from '@/components/DeleteCandidateButton'


export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, email, phone, created_at, category_id')
    .eq('id', id)
    .single()

  if (!candidate) notFound()

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', candidate.category_id)
    .single()

  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, duration_minutes')
    .eq('category_id', candidate.category_id)
    .single()

  if (!exam) notFound()

  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, score, total_marks, started_at, submitted_at, is_completed, tab_switches')
    .eq('candidate_id', id)
    .eq('exam_id', exam.id)
    .maybeSingle()

  const { data: sections } = await supabase
    .from('sections')
    .select('id, title, order_index, questions(id, marks)')
    .eq('exam_id', exam.id)
    .order('order_index')

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
    const sectionScore = questions.reduce(
      (sum, q) => sum + (answersMap[q.id]?.is_correct ? q.marks : 0),
      0
    )
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
            1000 / 60
        )
      : null

  const correctCount = answers?.filter((a) => a.is_correct).length ?? 0
  const incorrectCount =
    answers?.filter((a) => a.selected_option && !a.is_correct).length ?? 0
  const attemptedCount =
    answers?.filter((a) => a.selected_option).length ?? 0

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Top bar */}
      <div className="bg-slate-900 border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Assessly</span>
            </Link>
            <span className="text-slate-600 text-sm hidden sm:block">/ Admin / Candidate</span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">

        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-extrabold text-white">
            {candidate.full_name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Candidate Detail View</p>
        </div>

        {/* Candidate info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Personal Information
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: candidate.full_name },
              { label: 'Email Address', value: candidate.email },
              { label: 'Phone Number', value: candidate.phone },
              { label: 'Category', value: category?.name ?? '—' },
              { label: 'Exam', value: exam.title },
              {
                label: 'Registered',
                value: new Date(candidate.created_at!).toLocaleString(
                  'en-NG',
                  { dateStyle: 'medium', timeStyle: 'short' }
                ),
              },
            ].map((row) => (
              <div key={row.label} className="bg-white/5 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">{row.label}</p>
                <p className="text-white font-semibold text-sm">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {attempt?.is_completed ? (
          <>
            {/* Score hero */}
            <div className={`rounded-2xl border p-8 text-center ${
              isPassed
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className={`text-7xl font-black mb-2 ${
                isPassed ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {percentage}%
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-2 ${
                isPassed
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {isPassed ? '✓ Pass' : '✗ Fail'}
              </div>
              <p className="text-slate-400 text-sm">
                {score} out of {totalMarks} marks
              </p>
              {timeTaken !== null && (
                <p className="text-slate-500 text-xs mt-1">
                  Completed in {timeTaken} minute{timeTaken !== 1 ? 's' : ''}
                </p>
              )}
              {(attempt.tab_switches ?? 0) > 0 && (
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full mt-3">
                  ⚠ {attempt.tab_switches} tab switch
                  {attempt.tab_switches !== 1 ? 'es' : ''} recorded
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Attempted', value: attemptedCount, color: 'text-white' },
                { label: 'Correct', value: correctCount, color: 'text-emerald-400' },
                { label: 'Incorrect', value: incorrectCount, color: 'text-red-400' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                >
                  <p className={`text-3xl font-black ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Section breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Section Breakdown
              </p>
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
                        <span className="text-white font-semibold text-sm">
                          {section.title}
                        </span>
                        <div className="text-right">
                          <span className="text-white font-bold text-sm">
                            {section.score}/{section.total}
                          </span>
                          <span className="text-slate-500 text-xs ml-2">
                            ({section.attempted}/{section.questionCount} attempted)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sectionPassed ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${sectionPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{sectionPct}%</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 text-center">
            <p className="text-yellow-400 font-semibold">
              This candidate has not completed the exam yet.
            </p>
          </div>
        )}

      </div>
      {/* Danger zone */}
<div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
  <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
    Danger Zone
  </p>
  <p className="text-slate-400 text-sm mb-4">
    Permanently delete this candidate and all their exam data. This
    action cannot be undone.
  </p>
  <DeleteCandidateButton candidateId={candidate.id} />
</div>
    </div>
  )
}