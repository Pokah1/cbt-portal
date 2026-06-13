
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BeginTestButton from '@/components/BeginTestButton'
import Link from 'next/link'

export default async function InstructionsPage() {
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
    .select('id, name')
    .eq('id', candidate.category_id)
    .single()

  const { data: exam } = await supabase
    .from('exams')
    .select('id, title, duration_minutes')
    .eq('category_id', candidate.category_id)
    .eq('is_active', true)
    .single()

  if (!exam) redirect('/register')

  const { data: sections } = await supabase
    .from('sections')
    .select('id, title, question_count, order_index')
    .eq('exam_id', exam.id)
    .order('order_index')

  const { data: existingAttempt } = await supabase
    .from('attempts')
    .select('id, is_completed')
    .eq('candidate_id', candidateId)
    .eq('exam_id', exam.id)
    .maybeSingle()

  if (existingAttempt?.is_completed) redirect('/results')

  const rules = [
    'The timer begins immediately when you click Begin Test.',
    'You can navigate freely between questions within the time limit.',
    'Your answers are saved automatically as you select them.',
    'You may change any answer before final submission.',
    'The exam auto-submits when the timer reaches zero.',
    'Switching tabs is monitored — 3 violations trigger auto-submission.',
    'Do not close or refresh the browser during the exam.',
    'You cannot retake the exam once submitted.',
  ]

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
            Almost There
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Before You Begin
          </h1>
          <p className="text-slate-400 text-sm">
            Read all instructions carefully before starting your assessment
          </p>
        </div>

        {/* Candidate card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 backdrop-blur-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Candidate
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">{candidate.full_name}</p>
              <p className="text-slate-400 text-sm">{candidate.email}</p>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              {category?.name}
            </span>
          </div>
        </div>

        {/* Exam breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4 backdrop-blur-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Exam Structure
          </p>
          <div className="space-y-2">
            {(sections ?? []).map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400 text-xs font-bold">
                      {section.order_index}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {section.title}
                  </span>
                </div>
                <span className="text-slate-400 text-sm">
                  {section.question_count} questions
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-slate-300 text-sm font-semibold">
              Total Duration
            </span>
            <span className="text-emerald-400 font-bold text-lg">
              {exam.duration_minutes} minutes
            </span>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Rules & Guidelines
          </p>
          <ul className="space-y-3">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-emerald-500/20 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs font-bold">{i + 1}</span>
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Begin button */}
        <BeginTestButton
          candidateId={candidate.id}
          examId={exam.id}
          hasExistingAttempt={!!existingAttempt}
        />

      </div>
    </main>
  )
}