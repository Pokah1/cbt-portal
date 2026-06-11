'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveAnswer, submitExam } from '@/actions/exam'
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
  const hasAutoSubmitted = useRef(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length

  // Submit handler — used by both button and auto-submit
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

      const result = await submitExam(attempt.id, answers)
      if (result.success) {
        router.push('/results')
      }
    },
    [answeredCount, totalQuestions, attempt.id, answers, router]
  )

  // Auto-submit when timer expires
  const handleTimeUp = useCallback(() => {
    handleSubmit(true)
  }, [handleSubmit])

  // Save answer to DB and update local state
  async function handleAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    await saveAnswer(attempt.id, questionId, option)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{exam.title}</p>
            <p className="text-sm text-gray-500">{candidate.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
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

          {/* Prev / Next navigation */}
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

          {/* Submit button */}
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

          {showCalculator && showCalculatorPanel && (
            <Calculator />
          )}
        </div>

      </div>
    </div>
  )
}