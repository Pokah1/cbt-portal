import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ResultsPage() {
  const cookieStore = await cookies()
  const candidateId = cookieStore.get('candidate_id')?.value

  if (!candidateId) redirect('/register')

  const supabase = await createClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, full_name, email, category_id')
    .eq('id', candidateId)
    .single()

  if (!candidate) redirect('/register')

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', candidate.category_id)
    .single()

  const { data: exam } = await supabase
    .from('exams')
    .select('id, title')
    .eq('category_id', candidate.category_id)
    .single()

  if (!exam) redirect('/register')

  const { data: attempt } = await supabase
    .from('attempts')
    .select('id, score, total_marks, started_at, submitted_at, is_completed')
    .eq('candidate_id', candidateId)
    .eq('exam_id', exam.id)
    .eq('is_completed', true)
    .maybeSingle()

  if (!attempt) redirect('/instructions')

  const { data: sections } = await supabase
    .from('sections')
    .select('id, title, order_index, questions(id, marks)')
    .eq('exam_id', exam.id)
    .order('order_index')

  const { data: answers } = await supabase
    .from('answers')
    .select('question_id, selected_option, is_correct')
    .eq('attempt_id', attempt.id)

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
            1000 / 60
        )
      : null

  const correctCount = answers?.filter((a) => a.is_correct).length ?? 0
  const incorrectCount =
    answers?.filter((a) => a.selected_option && !a.is_correct).length ?? 0
  const attemptedCount =
    answers?.filter((a) => a.selected_option).length ?? 0

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Assessly</span>
        </Link>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-1">
            Assessment Complete
          </h1>
          <p className="text-slate-400 text-sm">{exam.title}</p>
        </div>

        {/* Score hero */}
        <div className={`rounded-3xl border p-10 text-center ${
          passed
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className={`text-8xl font-black mb-3 ${
            passed ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {percentage}%
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 ${
            passed
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {passed ? '🎉 Congratulations — You Passed!' : '✗ Did Not Pass'}
          </div>
          <p className="text-slate-400 text-sm">
            {score} out of {totalMarks} marks
          </p>
          {timeTaken !== null && (
            <p className="text-slate-500 text-xs mt-1">
              Completed in {timeTaken} minute{timeTaken !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Candidate info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Candidate
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{candidate.full_name}</p>
              <p className="text-slate-400 text-sm">{candidate.email}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                {category?.name}
              </span>
              <span className={`block text-xs font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {passed ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
          </div>
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
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
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
                      <span className="text-sm font-bold text-white">
                        {section.score}/{section.total}
                      </span>
                      <span className="text-slate-500 text-xs ml-2">
                        ({section.attempted}/{section.questionCount} attempted)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
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

        {/* Footer note */}
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm leading-relaxed">
            Your results have been recorded and sent to your email.
            <br />
            You will be contacted if you progress to the next stage.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors"
          >
            ← Return to Home
          </Link>
        </div>

      </div>
    </main>
  )
}