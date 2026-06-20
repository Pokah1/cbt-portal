import Link from 'next/link'
import { getSectionsOverview } from '@/actions/questions'

type SectionRow = {
  id: string
  title: string
  question_count: number
  order_index: number
  exams: { title: string; categories: { name: string } | null } | null
  questions: { id: string }[]
}

export default async function QuestionsOverviewPage() {
  const { sections } = await getSectionsOverview()
  const typedSections = sections as unknown as SectionRow[]

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
            <span className="text-slate-600 text-sm hidden sm:block">/ Admin / Questions</span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Question Bank</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage questions for each exam section
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {typedSections.map((section) => {
            const actualCount = section.questions?.length ?? 0
            const expectedCount = section.question_count
            const isShort = actualCount < expectedCount
            const isExact = actualCount === expectedCount

            return (
              <Link
                key={section.id}
                href={`/admin/questions/${section.id}`}
                className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all hover:bg-white/[0.07] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">
                      {section.exams?.categories?.name}
                    </p>
                    <h2 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">
                      {section.title}
                    </h2>
                  </div>
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-slate-500 text-sm">
                    {actualCount} of {expectedCount} questions
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isExact
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isShort
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {isExact ? '✓ Complete' : isShort ? `Needs ${expectedCount - actualCount} more` : 'Excess'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}