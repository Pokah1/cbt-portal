'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const [formValues, setFormValues] = useState({
    full_name: '',
    email: '',
    phone: '',
    category_id: '',
  })

  useEffect(() => {
    if (state.success && state.candidate) {
      router.push('/instructions')
    }
  }, [state.success, state.candidate, router])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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
            value={formValues.full_name}
            onChange={handleChange}
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
            value={formValues.email}
            onChange={handleChange}
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
            value={formValues.phone}
            onChange={handleChange}
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
            value={formValues.category_id}
            onChange={handleChange}
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