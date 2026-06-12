import { createClient } from '@/lib/supabase/server'
import { adminLogout } from '@/actions/admin'
import AdminResultsTable from '@/components/AdminResultsTable'

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
    categories: {
      name: string
    } | null
  } | null
  exams: {
    title: string
  } | null
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
        categories (
          name
        )
      ),
      exams (
        title
      )
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

  return (
    <div>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              CBT Portal — Results Overview
            </p>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Candidates', value: totalCandidates, color: 'text-gray-900' },
            { label: 'Passed', value: totalPassed, color: 'text-green-600' },
            { label: 'Failed', value: totalFailed, color: 'text-red-500' },
            { label: 'Average Score', value: `${avgScore}%`, color: 'text-blue-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
            >
              <p className={`text-3xl font-black ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Results table with filters */}
        <AdminResultsTable attempts={typedAttempts} />

      </div>
    </div>
  )
}