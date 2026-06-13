import { createClient } from '@/lib/supabase/server'
import { adminLogout } from '@/actions/admin'
import AdminResultsTable from '@/components/AdminResultsTable'
import Link from 'next/link'

type Attempt = {
  id: string
  score: number | null
  total_marks: number | null
  submitted_at: string | null
  candidates: {
    id: string
    full_name: string
    email: string
    phone: string
    categories: { name: string } | null
  } | null
  exams: { title: string } | null
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: attempts } = await supabase
    .from('attempts')
    .select(`
      id,
      score,
      total_marks,
      submitted_at,
      candidates (
        id,
        full_name,
        email,
        phone,
        categories ( name )
      ),
      exams ( title )
    `)
    .eq('is_completed', true)
    .order('submitted_at', { ascending: false })

  const typedAttempts = (attempts ?? []) as unknown as Attempt[]

  const totalCandidates = typedAttempts.length
  const totalPassed = typedAttempts.filter((a) => {
    const pct = ((a.score ?? 0) / (a.total_marks ?? 1)) * 100
    return pct >= 50
  }).length
  const totalFailed = totalCandidates - totalPassed
  const avgScore =
    totalCandidates > 0
      ? Math.round(
          typedAttempts.reduce((sum, a) => {
            return sum + ((a.score ?? 0) / (a.total_marks ?? 1)) * 100
          }, 0) / totalCandidates
        )
      : 0

  const stats = [
    { label: 'Total Submissions', value: totalCandidates, color: 'text-white' },
    { label: 'Passed', value: totalPassed, color: 'text-emerald-400' },
    { label: 'Failed', value: totalFailed, color: 'text-red-400' },
    { label: 'Average Score', value: `${avgScore}%`, color: 'text-blue-400' },
  ]

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Top bar */}
      <div className="bg-slate-900 border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Assessly</span>
            </Link>
            <span className="text-slate-600 text-sm hidden sm:block">/ Admin</span>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of all assessment submissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <p className={`text-4xl font-black ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <AdminResultsTable attempts={typedAttempts} />

      </div>
    </div>
  )
}