'use client'

import { useState } from 'react'
import { deleteQuestion } from '@/actions/questions'
import QuestionFormModal from '@/components/admin/QuestionFormModal'


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
  initialQuestions: Question[]
}

export default function QuestionManager({ sectionId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreateForm() {
    setEditingQuestion(null)
    setShowForm(true)
  }

  function openEditForm(question: Question) {
    setEditingQuestion(question)
    setShowForm(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteQuestion(deleteTarget.id, sectionId)
    if (result.success) {
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id))
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  function handleSaved(question: Question, isNew: boolean) {
    if (isNew) {
      setQuestions((prev) => [...prev, question])
    } else {
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? question : q))
      )
    }
    setShowForm(false)
    setEditingQuestion(null)
  }

  return (
    <div className="space-y-4">

      {/* Add button */}
      <button
        onClick={openCreateForm}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Question
      </button>

      {/* Question list */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-slate-400">No questions yet. Add the first one above.</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-white text-sm font-medium leading-relaxed">
                    {q.body}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditForm(q)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(q)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 ml-10">
                {[
                  { key: 'A', value: q.option_a },
                  { key: 'B', value: q.option_b },
                  { key: 'C', value: q.option_c },
                  { key: 'D', value: q.option_d },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`text-xs px-3 py-2 rounded-lg border ${
                      opt.key === q.correct_option
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="font-bold">{opt.key}.</span> {opt.value}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <QuestionFormModal
          sectionId={sectionId}
          existingQuestion={editingQuestion}
          onClose={() => {
            setShowForm(false)
            setEditingQuestion(null)
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Delete This Question?
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
              This cannot be undone. Any saved answers tied to this question
              will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}