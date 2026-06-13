'use client'

import { useState } from 'react'

type CalcState = {
  display: string
  firstOperand: number | null
  operator: string | null
  waitingForSecond: boolean
  expression: string
}

const initialState: CalcState = {
  display: '0',
  firstOperand: null,
  operator: null,
  waitingForSecond: false,
  expression: '',
}

function calculate(first: number, second: number, operator: string): number {
  switch (operator) {
    case '+': return first + second
    case '-': return first - second
    case '*': return first * second
    case '/': return second !== 0 ? first / second : 0
    case '%': return (first * second) / 100
    default: return second
  }
}

type Props = {
  onClose: () => void
}

export default function Calculator({ onClose }: Props) {
  const [state, setState] = useState<CalcState>(initialState)

  function handleNumber(num: string) {
    if (state.waitingForSecond) {
      setState((s) => ({
        ...s,
        display: num,
        expression: s.expression + num,
        waitingForSecond: false,
      }))
      return
    }
    const newDisplay = state.display === '0' ? num : state.display + num
    setState((s) => ({
      ...s,
      display: newDisplay,
      expression: s.waitingForSecond ? s.expression + num : s.expression.slice(0, -s.display.length) + newDisplay,
    }))
  }

  function handleDecimal() {
    if (state.waitingForSecond) {
      setState((s) => ({ ...s, display: '0.', expression: s.expression + '0.', waitingForSecond: false }))
      return
    }
    if (!state.display.includes('.')) {
      setState((s) => ({ ...s, display: s.display + '.', expression: s.expression + '.' }))
    }
  }

  function handleOperator(op: string) {
    const current = parseFloat(state.display)
    const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op

    if (state.operator && !state.waitingForSecond) {
      const result = calculate(state.firstOperand!, current, state.operator)
      const resultStr = String(parseFloat(result.toFixed(10)))
      setState({
        display: resultStr,
        firstOperand: result,
        operator: op,
        waitingForSecond: true,
        expression: resultStr + ' ' + opSymbol + ' ',
      })
      return
    }

    setState((s) => ({
      ...s,
      firstOperand: current,
      operator: op,
      waitingForSecond: true,
      expression: s.display + ' ' + opSymbol + ' ',
    }))
  }

  function handlePercent() {
    const current = parseFloat(state.display)
    const result = current / 100
    const resultStr = String(parseFloat(result.toFixed(10)))
    setState((s) => ({
      ...s,
      display: resultStr,
      expression: resultStr,
    }))
  }

  function handleToggleSign() {
    const current = parseFloat(state.display)
    const toggled = current * -1
    const toggledStr = String(toggled)
    setState((s) => ({ ...s, display: toggledStr }))
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
      expression: state.expression + state.display + ' =',
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

  const buttons = [
    { label: 'AC', action: handleClear, style: 'bg-slate-600 hover:bg-slate-500 text-white' },
    { label: '+/-', action: handleToggleSign, style: 'bg-slate-600 hover:bg-slate-500 text-white' },
    { label: '%', action: handlePercent, style: 'bg-slate-600 hover:bg-slate-500 text-white' },
    { label: '÷', action: () => handleOperator('/'), style: 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold' },
    { label: '7', action: () => handleNumber('7'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '8', action: () => handleNumber('8'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '9', action: () => handleNumber('9'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '×', action: () => handleOperator('*'), style: 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold' },
    { label: '4', action: () => handleNumber('4'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '5', action: () => handleNumber('5'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '6', action: () => handleNumber('6'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '−', action: () => handleOperator('-'), style: 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold' },
    { label: '1', action: () => handleNumber('1'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '2', action: () => handleNumber('2'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '3', action: () => handleNumber('3'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '+', action: () => handleOperator('+'), style: 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold' },
    { label: '⌫', action: handleBackspace, style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '0', action: () => handleNumber('0'), style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '.', action: handleDecimal, style: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { label: '=', action: handleEquals, style: 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold' },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40 w-72 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base">🧮</span>
          <span className="text-white font-bold text-sm">Calculator</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Display */}
      <div className="bg-slate-950 px-5 py-4 text-right">
        <p className="text-slate-500 text-xs h-4 truncate font-mono">
          {state.expression || ' '}
        </p>
        <p className="text-white text-4xl font-light font-mono mt-1 truncate">
          {state.display}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-px bg-white/5 p-px">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={`${btn.style} py-4 text-lg font-semibold transition-all active:scale-95`}
          >
            {btn.label}
          </button>
        ))}
      </div>

    </div>
  )
}