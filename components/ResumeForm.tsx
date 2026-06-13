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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h2 className="text-white font-bold text-lg mb-1">Already Registered?</h2>
      <p className="text-slate-400 text-sm mb-5">
        Enter your email to resume on this device
      </p>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {state.error}
          </div>
        )}

        <input
          id="resume_email"
          name="email"
          type="email"
          placeholder="Enter your registered email"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isPending ? 'Looking up session...' : 'Resume Session →'}
        </button>
      </form>
    </div>
  )
}