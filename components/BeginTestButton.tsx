'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { beginExam } from '@/actions/exam'

type Props = {
  candidateId: string
  examId: string
  hasExistingAttempt: boolean
}

export default function BeginTestButton({
  candidateId,
  examId,
  hasExistingAttempt,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleBegin() {
    startTransition(async () => {
      const result = await beginExam(candidateId, examId)
      if (result.success) {
        router.push('/test')
      }
    })
  }

  return (
    <button
      onClick={handleBegin}
      disabled={isPending}
      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 text-lg"
    >
      {isPending
        ? 'Preparing your exam...'
        : hasExistingAttempt
        ? '▶ Resume Exam'
        : '▶ Begin Test'}
    </button>
  )
}