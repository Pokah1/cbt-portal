import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveAnswer, submitExam, recordTabSwitch } from '@/actions/exam'

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

type UseExamProps = {
  attemptId: string
  questions: Question[]
  initialAnswers: Record<string, string>
}

export function useExam({ attemptId, questions, initialAnswers }: UseExamProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalculatorPanel, setShowCalculatorPanel] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isLocked, setIsLocked] = useState(false)


  const hasAutoSubmitted = useRef(false)
  const answersRef = useRef(answers)
  const attemptIdRef = useRef(attemptId)
  const routerRef = useRef(router)

  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { routerRef.current = router }, [router])

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length

  const autoSubmit = useCallback(async () => {
    if (hasAutoSubmitted.current) return
    hasAutoSubmitted.current = true
    setIsSubmitting(true)
    await submitExam(attemptIdRef.current, answersRef.current)
    routerRef.current.push('/results')
  }, [])

  function handleSubmitClick() {
    setShowConfirmModal(true)
  }

  async function handleConfirmSubmit() {
    setShowConfirmModal(false)
    if (hasAutoSubmitted.current) return
    hasAutoSubmitted.current = true
    setIsSubmitting(true)
    await submitExam(attemptIdRef.current, answersRef.current)
    routerRef.current.push('/results')
  }

  const handleTimeUp = useCallback(() => {
    autoSubmit()
  }, [autoSubmit])


 useEffect(() => {
  async function handleVisibilityChange() {
    if (!document.hidden) return

    const result = await recordTabSwitch(attemptIdRef.current)

    if (result.shouldAutoSubmit) {
      // Lock the UI immediately — before the async submit completes
      setIsLocked(true)
      if (!hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true
        setIsSubmitting(true)
        await submitExam(attemptIdRef.current, answersRef.current)
        routerRef.current.push('/results')
      }
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
    await saveAnswer(attemptId, questionId, option)
  }

  function handleSelectQuestion(index: number) {
    setCurrentIndex(index)
  }

  function handlePrevious() {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  function handleNext() {
    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
  }

  function toggleCalculator() {
    setShowCalculatorPanel((p) => !p)
  }

  function dismissTabWarning() {
    setShowTabWarning(false)
  }

  function dismissConfirmModal() {
    setShowConfirmModal(false)
  }

  return {
    // State
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
    // Handlers
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
  }
}