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
  const hasAutoSubmitted = useRef(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length

  // Submit handler
  const handleSubmit = useCallback(
    async (isAuto = false) => {
      if (hasAutoSubmitted.current) return
      hasAutoSubmitted.current = true
      setIsSubmitting(true)

      if (!isAuto) {
        const confirmed = window.confirm(
          `You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`
        )
        if (!confirmed) {
          hasAutoSubmitted.current = false
          setIsSubmitting(false)
          return
        }
      }

      await submitExam(attempt.id, answers)
      router.push('/results')
    },
    [answeredCount, totalQuestions, attempt.id, answers, router]
  )

  const handleTimeUp = useCallback(() => {
    handleSubmit(true)
  }, [handleSubmit])

  // Tab switch detection
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.hidden) {
        const result = await recordTabSwitch(attempt.id)
        const newCount = result.count

        setTabSwitchCount(newCount)
        setShowTabWarning(true)

        if (newCount >= MAX_TAB_SWITCHES) {
          // Auto-submit after max violations
          handleSubmit(true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [attempt.id, handleSubmit])

  // Save answer
  async function handleAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    await saveAnswer(attempt.id, questionId, option)
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      onContextMenu={(e) => e.preventDefault()}
    >

      {/* Tab switch warning modal */}
      {showTabWarning && tabSwitchCount < MAX_TAB_SWITCHES && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Warning — Tab Switch Detected
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              You have switched tabs or left this window. This has been recorded.
            </p>
            <p className="text-red-600 font-semibold text-sm mb-6">
              Warning {tabSwitchCount} of {MAX_TAB_SWITCHES} — Your exam will be
              auto-submitted on the {MAX_TAB_SWITCHES}rd violation.
            </p>
            <button
              onClick={() => setShowTabWarning(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{exam.title}</p>
            <p className="text-sm text-gray-500">{candidate.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Tab switch indicator */}
            {tabSwitchCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {tabSwitchCount}/{MAX_TAB_SWITCHES} warnings
              </div>
            )}
            {showCalculator && (
              <button
                onClick={() => setShowCalculatorPanel((p) => !p)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
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

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
              }
              disabled={currentIndex === totalQuestions - 1}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
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
          {showCalculator && showCalculatorPanel && <Calculator />}
        </div>

      </div>
    </div>
  )
}