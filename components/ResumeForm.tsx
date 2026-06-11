'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { resumeSession, ResumeState } from '@/actions/candidate'

const initialState: ResumeState = {
  success: false,
  error: undefined,
}

export default function ResumeForm() {
  const [state, formAction, isPending] = useActionState(
    resumeSession,
    initialState
  )
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.push('/instructions')
    }
  }, [state.success, router])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Already Registered?
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter your email to resume your session on this device
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label
            htmlFor="resume_email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="resume_email"
            name="email"
            type="email"
            placeholder="Enter your registered email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Looking up your session...' : 'Resume Session'}
        </button>
      </form>
    </div>
  )
}