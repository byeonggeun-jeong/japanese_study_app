import { useRef, useState } from 'react'

export function InputQuestion({ onAnswer }: { onAnswer(value: string): void }) {
  const [value, setValue] = useState('')
  const composing = useRef(false)
  return (
    <form className="input-question" onSubmit={(event) => { event.preventDefault(); if (!composing.current && value.trim()) onAnswer(value.trim()) }}>
      <label htmlFor="answer-input">답 입력</label>
      <input id="answer-input" value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off"
        onCompositionStart={() => { composing.current = true }} onCompositionEnd={() => { composing.current = false }}
        onKeyDown={(event) => { if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault() }} />
      <button type="submit" className="primary-button" disabled={!value.trim()}>확인</button>
    </form>
  )
}
