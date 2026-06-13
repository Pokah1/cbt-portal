'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveAnswer, submitExam, recordTabSwitch } from '@/actions/exam'
import ExamTimer from '@/components/exam/ExamTimer'
import QuestionCard from '@/components/exam/QuestionCard'
import QuestionNav from '@/components/exam/QuestionNav'
import Calculator from '@/components/exam/Calculator'

type Question = {
  id: string
  body: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  order_index: number
  section_id: string
  section_title: string
}

type Props = {
  candidate: { id: string; full_name: string; category_id: string }
  attempt: { id: string; started_at: string; is_completed: boolean }
  exam: { id: string; title: string; duration_minutes: number }
  questions: Question[]
  initialAnswers: Record<string, string>
  remainingSeconds: number
  showCalculator: boolean
}

const MAX_TAB_SWITCHES = 3

export default function ExamClient({
  candidate,
  attempt,
  exam,
  questions,
  initialAnswers,
  remainingSeconds,
  showCalculator,
}: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalculatorPanel, setShowCalculatorPanel] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const hasAutoSubmitted = useRef(false)
  // These refs always hold the latest values — no stale closure issues
  const answersRef = useRef(answers)
  const attemptIdRef = useRef(attempt.id)
  const routerRef = useRef(router)

  // Keep refs in sync with state
  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { routerRef.current = router }, [router])

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length

  // Core submit — always reads from refs so never stale
  const autoSubmit = useCallback(async () => {
    if (hasAutoSubmitted.current) return
    hasAutoSubmitted.current = true
    setIsSubmitting(true)
    await submitExam(attemptIdRef.current, answersRef.current)
    routerRef.current.push('/results')
  }, [])

  // Manual submit — shows modal first
  function handleSubmitClick() {
    setShowConfirmModal(true)
  }

  // Confirmed via modal
  async function handleConfirmSubmit() {
    setShowConfirmModal(false)
    if (hasAutoSubmitted.current) return
    hasAutoSubmitted.current = true
    setIsSubmitting(true)
    await submitExam(attemptIdRef.current, answersRef.current)
    routerRef.current.push('/results')
  }

  // Timer expiry
  const handleTimeUp = useCallback(() => {
    autoSubmit()
  }, [autoSubmit])

  
  // Both are stable so this effect never re-runs unnecessarily
 useEffect(() => {
  async function handleVisibilityChange() {
    if (!document.hidden) return

    const result = await recordTabSwitch(attemptIdRef.current)

    if (result.shouldAutoSubmit) {
      // Server already submitted — just redirect
      routerRef.current.push('/results')
    } else {
      setTabSwitchCount(result.count)
      setShowTabWarning(true)
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () =>
    document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [])

  async function handleAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    await saveAnswer(attempt.id, questionId, option)
  }

  return (
    <div
      className="min-h-screen bg-slate-950"
      onContextMenu={(e) => e.preventDefault()}
    >

      {/* Tab switch warning modal */}
      {showTabWarning && tabSwitchCount < MAX_TAB_SWITCHES && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Tab Switch Detected
            </h2>
            <p className="text-slate-400 text-sm mb-3">
              Leaving the exam window has been recorded.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-400 font-semibold text-sm">
                Warning {tabSwitchCount} of {MAX_TAB_SWITCHES} — exam
                auto-submits on the {MAX_TAB_SWITCHES}rd violation
              </p>
            </div>
            <button
              onClick={() => setShowTabWarning(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Submit Your Exam?
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
              You have answered{' '}
              <span className="text-white font-bold">{answeredCount}</span> of{' '}
              <span className="text-white font-bold">{totalQuestions}</span>{' '}
              questions. This action cannot be undone.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Answered', value: answeredCount, color: 'text-emerald-400' },
                { label: 'Unanswered', value: totalQuestions - answeredCount, color: 'text-yellow-400' },
                { label: 'Total', value: totalQuestions, color: 'text-white' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-slate-900 border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-white text-sm">{exam.title}</p>
              <p className="text-slate-400 text-xs">{candidate.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tabSwitchCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold">
                ⚠ {tabSwitchCount}/{MAX_TAB_SWITCHES} warnings
              </div>
            )}
            {showCalculator && (
              <button
                onClick={() => setShowCalculatorPanel((p) => !p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  showCalculatorPanel
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                🧮 Calculator
              </button>
            )}
            <ExamTimer
              remainingSeconds={remainingSeconds}
              onTimeUp={handleTimeUp}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-white/5">
          <div
            className="h-0.5 bg-emerald-500 transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Question area */}
        <div className="lg:col-span-2 space-y-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            selectedOption={answers[currentQuestion.id] ?? null}
            onAnswer={(option) => handleAnswer(currentQuestion.id, option)}
          />

          <div className="flex justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          <button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : '✓ Submit Exam'}
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <QuestionNav
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
        </div>

      </div>

      {/* Floating calculator */}
      {showCalculator && showCalculatorPanel && (
        <Calculator onClose={() => setShowCalculatorPanel(false)} />
      )}

    </div>
  )
}