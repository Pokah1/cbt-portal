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
    categories: {
      name: string
    } | null
  } | null
  exams: {
    title: string
  } | null
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Filter bar */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          >
            <option value="all">All Categories</option>
            <option value="Category A">Category A</option>
            <option value="Category B">Category B</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          >
            <option value="all">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>

        </div>

        <p className="text-gray-400 text-xs mt-3">
          Showing {filtered.length} of {attempts.length} submission
          {attempts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-gray-400">No results match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
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
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((attempt) => {
                const percentage = Math.round(
                  ((attempt.score ?? 0) / (attempt.total_marks ?? 1)) * 100
                )
                const isPassed = percentage >= 50

                return (
                  <tr
                    key={attempt.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm whitespace-nowrap">
                        {attempt.candidates?.full_name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {attempt.candidates?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {attempt.candidates?.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                        {attempt.candidates?.categories?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {attempt.score}/{attempt.total_marks}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          isPassed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {isPassed ? '✓ Pass' : '✗ Fail'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
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
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap hover:underline"
                      >
                        View Details →
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