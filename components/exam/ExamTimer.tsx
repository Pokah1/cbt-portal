'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  remainingSeconds: number
  onTimeUp: () => void
}

export default function ExamTimer({ remainingSeconds, onTimeUp }: Props) {
  const [seconds, setSeconds] = useState(remainingSeconds)
  const onTimeUpRef = useRef(onTimeUp)

  // Keep the ref current without triggering effect re-runs
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUpRef.current()
      return
    }

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval)
          onTimeUpRef.current()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isWarning = seconds <= 300
  const isCritical = seconds <= 60

  return (
    <div
      className={`px-4 py-2 rounded-xl font-mono font-bold text-lg ${
        isCritical
          ? 'bg-red-100 text-red-600 animate-pulse'
          : isWarning
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-blue-50 text-blue-700'
      }`}
    >
      ⏱ {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}