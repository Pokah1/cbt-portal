import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getQuestionsBySection } from '@/actions/questions'
import QuestionManager from '@/components/admin/QuestionManager'

export default async function SectionQuestionsPage({
  params,
}: {
  params: Promise<{ sectionId: string }>
}) {
  const { sectionId } = await params
  const { section, questions } = await getQuestionsBySection(sectionId)

  if (!section) notFound()

  const sectionData = section as unknown as {
    id: string
    title: string
    question_count: number
    exams: { title: string; categories: { name: string } | null } | null
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Top bar */}
      <div className="bg-slate-900 border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Assessly</span>
            </Link>
            <span className="text-slate-600 text-sm hidden sm:block">
              / Admin / Questions / {sectionData.title}
            </span>
          </div>
          <Link
            href="/admin/questions"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
          >
            ← All Sections
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-8">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">
            {sectionData.exams?.categories?.name}
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            {sectionData.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {questions.length} of {sectionData.question_count} questions
          </p>
        </div>

        <QuestionManager
          sectionId={sectionData.id}
          initialQuestions={questions}
        />

      </div>
    </div>
  )
}