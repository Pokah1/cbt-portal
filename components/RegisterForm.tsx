'use client'

import { useActionState } from 'react'
import { registerCandidate, RegisterState } from '@/actions/candidate'
import { Category } from '@/types'

type Props = {
  categories: Category[]
}

const initialState: RegisterState = {
  success: false,
  errors: {},
  candidate: null,
}

export default function RegisterForm({ categories }: Props) {
  const [state, formAction, isPending] = useActionState(
    registerCandidate,
    initialState
  )

  if (state.success && state.candidate) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registration Successful!
        </h2>
        <p className="text-gray-500 mb-6">
          Welcome, {state.candidate.full_name}. Your registration is complete.
        </p>
        <a
          href="/instructions"
          className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Proceed to Instructions
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <form action={formAction} className="space-y-5">

        {state.errors?.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {state.errors.general[0]}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {state.errors?.full_name && (
            <p className="text-red-500 text-xs mt-1.5">{state.errors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {state.errors?.email && (
            <p className="text-red-500 text-xs mt-1.5">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 08012345678"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {state.errors?.phone && (
            <p className="text-red-500 text-xs mt-1.5">{state.errors.phone[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Category
          </label>
          <select
            id="category_id"
            name="category_id"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
          >
            <option value="">-- Select your qualification category --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} — {category.description}
              </option>
            ))}
          </select>
          {state.errors?.category_id && (
            <p className="text-red-500 text-xs mt-1.5">{state.errors.category_id[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isPending ? 'Registering...' : 'Register'}
        </button>

      </form>
    </div>
  )
}