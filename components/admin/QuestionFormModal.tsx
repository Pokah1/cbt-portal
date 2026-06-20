'use client'

import { useState } from 'react'
import { createQuestion, updateQuestion } from '@/actions/questions'

type Question = {
  id: string
  body: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  marks: number
  order_index: number
}

type Props = {
  sectionId: string
  existingQuestion: Question | null
  onClose: () => void
  onSaved: (question: Question, isNew: boolean) => void
}

export default function QuestionFormModal({
  sectionId,
  existingQuestion,
  onClose,
  onSaved,
}: Props) {
  const isEditing = !!existingQuestion

  const [body, setBody] = useState(existingQuestion?.body ?? '')
  const [optionA, setOptionA] = useState(existingQuestion?.option_a ?? '')
  const [optionB, setOptionB] = useState(existingQuestion?.option_b ?? '')
  const [optionC, setOptionC] = useState(existingQuestion?.option_c ?? '')
  const [optionD, setOptionD] = useState(existingQuestion?.option_d ?? '')
  const [correctOption, setCorrectOption] = useState(
    existingQuestion?.correct_option ?? 'A'
  )
  const [marks, setMarks] = useState(existingQuestion?.marks ?? 1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!body.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError('All fields are required')
      return
    }

    setError(null)
    setIsSaving(true)

    const input = {
      section_id: sectionId,
      body: body.trim(),
      option_a: optionA.trim(),
      option_b: optionB.trim(),
      option_c: optionC.trim(),
      option_d: optionD.trim(),
      correct_option: correctOption as 'A' | 'B' | 'C' | 'D',
      marks,
    }

    if (isEditing && existingQuestion) {
      const result = await updateQuestion(existingQuestion.id, input)
      if (result.success) {
        onSaved({ ...existingQuestion, ...input }, false)
      } else {
        setError(result.error ?? 'Failed to save')
      }
    } else {
      const result = await createQuestion(input)
      if (result.success && result.question) {
        onSaved(result.question as Question, true)
      } else {
        setError(result.error ?? 'Failed to save')
      }
    }

    setIsSaving(false)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm'

  const optionFields = [
    { key: 'A', value: optionA, setValue: setOptionA },
    { key: 'B', value: optionB, setValue: setOptionB },
    { key: 'C', value: optionC, setValue: setOptionC },
    { key: 'D', value: optionD, setValue: setOptionD },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header — fixed */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-8 py-6 overflow-y-auto flex-1">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          {/* Question body — full width */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Question
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Enter the question text"
              className={inputClass}
            />
          </div>

          {/* Options — two-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {optionFields.map((opt) => (
              <div key={opt.key}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Option {opt.key}
                  {correctOption === opt.key && (
                    <span className="ml-2 text-emerald-400 text-xs font-semibold">
                      ✓ Correct
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={opt.value}
                  onChange={(e) => opt.setValue(e.target.value)}
                  placeholder={`Enter option ${opt.key}`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          {/* Correct option + marks — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Correct Option
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setCorrectOption(letter)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      correctOption === letter
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Marks
              </label>
              <input
                type="number"
                min={1}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

        </div>

        {/* Footer — fixed */}
        <div className="flex gap-3 px-8 py-5 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Question'}
          </button>
        </div>

      </div>
    </div>
  )
}