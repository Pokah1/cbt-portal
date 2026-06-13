'use client'

import { useState } from 'react'
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

type Props = {
  attempts: Attempt[]
}

export default function AdminResultsTable({ attempts }: Props) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = attempts.filter((attempt) => {
    const percentage =
      ((attempt.score ?? 0) / (attempt.total_marks ?? 1)) * 100
    const isPassed = percentage >= 50
    const categoryName = attempt.candidates?.categories?.name ?? ''
    const fullName = attempt.candidates?.full_name ?? ''
    const email = attempt.candidates?.email ?? ''

    const matchesCategory =
      categoryFilter === 'all' || categoryName === categoryFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pass' && isPassed) ||
      (statusFilter === 'fail' && !isPassed)
    const matchesSearch =
      search === '' ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesStatus && matchesSearch
  })

  const inputClass =
    'px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

      {/* Filter bar */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} flex-1`}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${inputClass} bg-slate-900`}
          >
            <option value="all">All Categories</option>
            <option value="Category A">Category A</option>
            <option value="Category B">Category B</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputClass} bg-slate-900`}
          >
            <option value="all">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Showing {filtered.length} of {attempts.length} submission
          {attempts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-slate-500">No results match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  'Candidate',
                  'Phone',
                  'Category',
                  'Score',
                  'Percentage',
                  'Status',
                  'Submitted',
                  '',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((attempt) => {
                const percentage = Math.round(
                  ((attempt.score ?? 0) / (attempt.total_marks ?? 1)) * 100
                )
                const isPassed = percentage >= 50

                return (
                  <tr
                    key={attempt.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white text-sm whitespace-nowrap">
                        {attempt.candidates?.full_name}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {attempt.candidates?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">
                        {attempt.candidates?.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        {attempt.candidates?.categories?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-sm">
                        {attempt.score}/{attempt.total_marks}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-sm">
                        {percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isPassed ? '✓ Pass' : '✗ Fail'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        {attempt.submitted_at
                          ? new Date(attempt.submitted_at).toLocaleString(
                              'en-NG',
                              { dateStyle: 'medium', timeStyle: 'short' }
                            )
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/candidates/${attempt.candidates?.id}`}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}