import { Question } from '@/types/exam'

type Props = {
  questions: Question[]
  answers: Record<string, string>
  currentIndex: number
  onSelect: (index: number) => void
}

export default function QuestionNav({
  questions,
  answers,
  currentIndex,
  onSelect,
}: Props) {
  const answeredCount = Object.keys(answers).length

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm">Questions</h3>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          {answeredCount}/{questions.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, index) => {
          const isAnswered = !!answers[q.id]
          const isCurrent = index === currentIndex

          return (
            <button
              key={q.id}
              onClick={() => onSelect(index)}
              className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-400/50'
                  : isAnswered
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 inline-block" />
          Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-white/5 inline-block" />
          Unanswered
        </span>
      </div>
    </div>
  )
}