'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  remainingSeconds: number
  onTimeUp: () => void
}

export default function ExamTimer({ remainingSeconds, onTimeUp }: Props) {
  const [seconds, setSeconds] = useState(remainingSeconds)
  const onTimeUpRef = useRef(onTimeUp)

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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-extrabold text-md transition-all ${
        isCritical
          ? 'bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse'
          : isWarning
          ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
          : 'bg-white/5 border border-white/10 text-slate-300'
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
       <span className="animate-bounce">
    {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
  </span>
    </div>
  )
}