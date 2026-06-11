'use client'

import { useState } from 'react'

type CalcState = {
  display: string
  firstOperand: number | null
  operator: string | null
  waitingForSecond: boolean
}

const initialState: CalcState = {
  display: '0',
  firstOperand: null,
  operator: null,
  waitingForSecond: false,
}

function calculate(first: number, second: number, operator: string): number {
  switch (operator) {
    case '+': return first + second
    case '-': return first - second
    case '*': return first * second
    case '/': return second !== 0 ? first / second : 0
    default: return second
  }
}

export default function Calculator() {
  const [state, setState] = useState<CalcState>(initialState)

  function handleNumber(num: string) {
    if (state.waitingForSecond) {
      setState((s) => ({
        ...s,
        display: num,
        waitingForSecond: false,
      }))
      return
    }
    setState((s) => ({
      ...s,
      display: s.display === '0' ? num : s.display + num,
    }))
  }

  function handleDecimal() {
    if (state.waitingForSecond) {
      setState((s) => ({ ...s, display: '0.', waitingForSecond: false }))
      return
    }
    if (!state.display.includes('.')) {
      setState((s) => ({ ...s, display: s.display + '.' }))
    }
  }

  function handleOperator(op: string) {
    const current = parseFloat(state.display)

    if (state.operator && !state.waitingForSecond) {
      const result = calculate(state.firstOperand!, current, state.operator)
      const resultStr = String(parseFloat(result.toFixed(10)))
      setState({
        display: resultStr,
        firstOperand: result,
        operator: op,
        waitingForSecond: true,
      })
      return
    }

    setState((s) => ({
      ...s,
      firstOperand: current,
      operator: op,
      waitingForSecond: true,
    }))
  }

  function handleEquals() {
    if (!state.operator || state.firstOperand === null) return

    const current = parseFloat(state.display)
    const result = calculate(state.firstOperand, current, state.operator)
    const resultStr = String(parseFloat(result.toFixed(10)))

    setState({
      display: resultStr,
      firstOperand: null,
      operator: null,
      waitingForSecond: false,
    })
  }

  function handleClear() {
    setState(initialState)
  }

  function handleBackspace() {
    setState((s) => ({
      ...s,
      display: s.display.length <= 1 ? '0' : s.display.slice(0, -1),
    }))
  }

  const btnBase =
    'w-full py-3 rounded-xl font-semibold text-sm transition-colors'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">Calculator</h3>

      {/* Display */}
      <div className="bg-gray-900 rounded-xl p-3 mb-3 text-right">
        <p className="text-gray-400 text-xs h-4">
          {state.firstOperand !== null
            ? `${state.firstOperand} ${state.operator ?? ''}`
            : ' '}
        </p>
        <p className="text-white text-2xl font-mono font-bold truncate">
          {state.display}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={handleClear}
          className={`${btnBase} col-span-2 bg-red-100 text-red-700 hover:bg-red-200`}
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          className={`${btnBase} bg-gray-100 text-gray-700 hover:bg-gray-200`}
        >
          ⌫
        </button>
        <button
          onClick={() => handleOperator('/')}
          className={`${btnBase} bg-blue-100 text-blue-700 hover:bg-blue-200`}
        >
          ÷
        </button>

        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className={`${btnBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('*')}
          className={`${btnBase} bg-blue-100 text-blue-700 hover:bg-blue-200`}
        >
          ×
        </button>

        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className={`${btnBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('-')}
          className={`${btnBase} bg-blue-100 text-blue-700 hover:bg-blue-200`}
        >
          −
        </button>

        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className={`${btnBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className={`${btnBase} bg-blue-100 text-blue-700 hover:bg-blue-200`}
        >
          +
        </button>

        <button
          onClick={() => handleNumber('0')}
          className={`${btnBase} col-span-2 bg-gray-100 text-gray-800 hover:bg-gray-200`}
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className={`${btnBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700`}
        >
          =
        </button>
      </div>
    </div>
  )
}