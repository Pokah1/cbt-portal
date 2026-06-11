type Question = {
  id: string
  section_title: string
}

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">Questions</h3>
        <span className="text-xs text-gray-500">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isAnswered = !!answers[q.id]
          const isCurrent = index === currentIndex

          return (
            <button
              key={q.id}
              onClick={() => onSelect(index)}
              className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : isAnswered
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100 inline-block" />
          Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
          Unanswered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          Current
        </span>
      </div>
    </div>
  )
}