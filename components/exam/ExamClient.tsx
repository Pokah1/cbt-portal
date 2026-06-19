'use client'

import { useExam } from '@/lib/hooks/useExam'
import ExamTimer from '@/components/exam/ExamTimer'
import QuestionCard from '@/components/exam/QuestionCard'
import QuestionNav from '@/components/exam/QuestionNav'
import Calculator from '@/components/exam/Calculator'
import TabWarningModal from '@/components/exam/TabWarningModal'
import SubmitConfirmModal from '@/components/exam/SubmitConfirmModal'

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
  const {
    currentIndex,
    currentQuestion,
    answers,
    answeredCount,
    totalQuestions,
    isSubmitting,
    isLocked,
    showCalculatorPanel,
    tabSwitchCount,
    showTabWarning,
    showConfirmModal,
    handleAnswer,
    handleSubmitClick,
    handleConfirmSubmit,
    handleTimeUp,
    handleSelectQuestion,
    handlePrevious,
    handleNext,
    toggleCalculator,
    dismissTabWarning,
    dismissConfirmModal,
  } = useExam({
    attemptId: attempt.id,
    questions,
    initialAnswers,
  })

  return (
    <div
      className="min-h-screen bg-slate-950"
      onContextMenu={(e) => e.preventDefault()}
    >

      {/* Modals */}
      <TabWarningModal
        show={showTabWarning && tabSwitchCount < MAX_TAB_SWITCHES}
        tabSwitchCount={tabSwitchCount}
        maxSwitches={MAX_TAB_SWITCHES}
        onDismiss={dismissTabWarning}
      />

      <SubmitConfirmModal
        show={showConfirmModal}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={dismissConfirmModal}
      />

      {isLocked && (
  <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
      <h2 className="text-xl font-bold text-white mb-2">
        Submitting Your Exam
      </h2>
      <p className="text-slate-400 text-sm">
        Maximum tab switches exceeded. Please wait...
      </p>
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
  onClick={toggleCalculator}
  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
    showCalculatorPanel
      ? 'bg-emerald-500 text-white'
      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
  }`}
>
  🧮 <span className="text-red-600">Calculator</span>
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
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
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

        <div className="space-y-4">
          <QuestionNav
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelect={handleSelectQuestion}
          />
        </div>

      </div>

      {/* Floating calculator */}
      {showCalculator && showCalculatorPanel && (
        <Calculator onClose={toggleCalculator} />
      )}

    </div>
  )
}