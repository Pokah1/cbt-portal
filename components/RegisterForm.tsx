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

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm'

const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'
const errorClass = 'text-red-400 text-xs mt-1.5'

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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h2 className="text-white font-bold text-lg mb-5">New Candidate</h2>

      <form action={formAction} className="space-y-4">
        {state.errors?.general && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {state.errors.general[0]}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className={labelClass}>Full Name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="e.g. Chukwuemeka Obi"
            value={formValues.full_name}
            onChange={handleChange}
            className={inputClass}
          />
          {state.errors?.full_name && (
            <p className={errorClass}>{state.errors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formValues.email}
            onChange={handleChange}
            className={inputClass}
          />
          {state.errors?.email && (
            <p className={errorClass}>{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 08012345678"
            value={formValues.phone}
            onChange={handleChange}
            className={inputClass}
          />
          {state.errors?.phone && (
            <p className={errorClass}>{state.errors.phone[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="category_id" className={labelClass}>
            Assessment Category
          </label>
          <select
  id="category_id"
  name="category_id"
  value={formValues.category_id}
  onChange={handleChange}
  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
>
  <option value="" className="bg-slate-900 text-slate-400">
    -- Select your qualification --
  </option>
  {categories.map((category) => (
    <option
      key={category.id}
      value={category.id}
      className="bg-slate-900 text-white"
    >
      {category.name} — {category.description}
    </option>
  ))}
</select>
          {state.errors?.category_id && (
            <p className={errorClass}>{state.errors.category_id[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 mt-2"
        >
          {isPending ? 'Creating profile...' : 'Register & Continue →'}
        </button>
      </form>
    </div>
  )
}