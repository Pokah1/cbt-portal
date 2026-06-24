'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  remainingSeconds: number
  onTimeUp: () => void
}

export default function ExamTimer({ remainingSeconds, onTimeUp }: Props) {
  const [seconds, setSeconds] = useState(remainingSeconds)
  const [showNudge, setShowNudge] = useState(false)
  const onTimeUpRef = useRef(onTimeUp)
  const lastNudgeRef = useRef<number | null>(null)
  const nudgeHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep onTimeUp ref current
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  // Countdown interval
  useEffect(() => {
    if (seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Time up — separate safe effect
  useEffect(() => {
    if (seconds === 0) {
      onTimeUpRef.current()
    }
  }, [seconds])

  // Nudge at every 5-minute mark
  // No return cleanup here — intentional, so the hide timer
  // is NOT cancelled when seconds changes every tick
  useEffect(() => {
    if (seconds <= 120) return
    if (seconds === remainingSeconds) return
    if (seconds % 300 !== 0) return
    if (lastNudgeRef.current === seconds) return

    lastNudgeRef.current = seconds

    if (nudgeHideRef.current) clearTimeout(nudgeHideRef.current)

    setShowNudge(true)

    nudgeHideRef.current = setTimeout(() => {
      setShowNudge(false)
      nudgeHideRef.current = null
    }, 60000) // hide after 1 minute
  }, [seconds, remainingSeconds])

  // Cleanup hide timer on unmount only
  useEffect(() => {
    return () => {
      if (nudgeHideRef.current) clearTimeout(nudgeHideRef.current)
    }
  }, [])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const isWarning = seconds <= 300
  const isCritical = seconds <= 60
  const isPermanentFloat = seconds <= 120
  const showFloating = isPermanentFloat || showNudge
  const progressPct = Math.min(100, (seconds / remainingSeconds) * 100)

  return (
    <>
      {/* Top bar timer pill */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm transition-all duration-500 ${
          isCritical
            ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse shadow-lg shadow-red-500/20'
            : isWarning
            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
            : 'bg-white/5 border border-white/10 text-slate-300'
        }`}
      >
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isCritical
              ? 'text-red-400'
              : isWarning
              ? 'text-yellow-300'
              : 'text-slate-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {display}
      </div>

      {/* Floating timer */}
      {showFloating && (
        <div
          className={`fixed bottom-6 right-6 z-30 flex flex-col items-center justify-center rounded-2xl shadow-2xl transition-all duration-500 ${
            isCritical
              ? 'w-28 h-28 bg-red-500 shadow-red-500/40 animate-pulse'
              : isWarning
              ? 'w-24 h-24 bg-yellow-500/90 shadow-yellow-500/30'
              : 'w-24 h-24 bg-emerald-600/90 shadow-emerald-500/30'
          }`}
        >
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${
                2 * Math.PI * 44 * (1 - progressPct / 100)
              }`}
              className="transition-all duration-1000"
            />
          </svg>

          <span
            className={`relative font-mono font-black text-white z-10 ${
              isCritical ? 'text-2xl' : 'text-xl'
            }`}
          >
            {display}
          </span>
          <span className="relative text-white/80 text-xs font-semibold z-10 mt-0.5">
            {isCritical ? 'HURRY!' : 'remaining'}
          </span>
        </div>
      )}
    </>
  )
}