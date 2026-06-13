type Question = {
  id: string
  body: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  section_title: string
}

type Props = {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedOption: string | null
  onAnswer: (option: string) => void
}

const options = [
  { key: 'A', field: 'option_a' },
  { key: 'B', field: 'option_b' },
  { key: 'C', field: 'option_c' },
  { key: 'D', field: 'option_d' },
] as const

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onAnswer,
}: Props) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 select-none">

      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          {question.section_title}
        </span>
        <span className="text-slate-400 text-xs font-medium">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      <p className="text-white font-medium text-base leading-relaxed mb-6">
        {question.body}
      </p>

      <div className="space-y-2.5">
        {options.map(({ key, field }) => {
          const isSelected = selectedOption === key
          return (
            <button
              key={key}
              onClick={() => onAnswer(key)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-center gap-3 group ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                }`}
              >
                {key}
              </span>
              <span className="text-sm">{question[field]}</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}