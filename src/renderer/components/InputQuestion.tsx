import { useState } from 'react'

export function InputQuestion({ onAnswer }: { onAnswer(value: string): void }) {
  const [value, setValue] = useState('')
  return (
    <form className="input-question" onSubmit={(event) => { event.preventDefault(); if (value.trim()) onAnswer(value.trim()) }}>
      <label htmlFor="answer-input">답 입력</label>
      <input id="answer-input" value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off" lang="ja" />
      <button type="submit" className="primary-button" disabled={!value.trim()}>확인</button>
    </form>
  )
}
