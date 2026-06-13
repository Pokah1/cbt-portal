type Props = {
  show: boolean
  answeredCount: number
  totalQuestions: number
  isSubmitting: boolean
  onConfirm: () => Promise<void>  // ← change void to Promise<void>
  onCancel: () => void
}

export default function SubmitConfirmModal({
  show,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onConfirm,
  onCancel,
}: Props) {
  if (!show) return null

  return (
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
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}