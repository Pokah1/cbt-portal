'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {beginExam} from "@/actions/exam"

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
      className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending
        ? 'Preparing your exam...'
        : hasExistingAttempt
        ? 'Resume Exam'
        : 'Begin Test'}
    </button>
  )
}