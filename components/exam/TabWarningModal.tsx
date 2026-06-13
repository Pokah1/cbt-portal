type Props = {
  show: boolean
  tabSwitchCount: number
  maxSwitches: number
  onDismiss: () => void
}

export default function TabWarningModal({
  show,
  tabSwitchCount,
  maxSwitches,
  onDismiss,
}: Props) {
  if (!show) return null

  return (
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
            Warning {tabSwitchCount} of {maxSwitches} — exam
            auto-submits on the {maxSwitches}rd violation
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Return to Exam
        </button>
      </div>
    </div>
  )
}