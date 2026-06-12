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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 select-none">

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {question.section_title}
        </span>
        <span className="text-sm text-gray-400">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      <p className="text-gray-900 font-medium text-base leading-relaxed mb-6">
        {question.body}
      </p>

      <div className="space-y-3">
        {options.map(({ key, field }) => {
          const isSelected = selectedOption === key
          return (
            <button
              key={key}
              onClick={() => onAnswer(key)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {key}
              </span>
              <span>{question[field]}</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}