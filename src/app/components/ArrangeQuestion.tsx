import { useState } from 'react'

export function ArrangeQuestion({ options, onAnswer }: { options: string[]; onAnswer(value: string): void }) {
  const [selected, setSelected] = useState<number[]>([])
  const remaining = options.map((_, index) => index).filter((index) => !selected.includes(index))
  return (
    <div className="arrange-question">
      <p aria-live="polite" className="assembled-answer">{selected.map((index) => options[index]).join('') || '단어를 순서대로 선택하세요.'}</p>
      <div className="token-list" role="group" aria-label="문장 조립">
        {remaining.map((index) => (
          <button type="button" key={index} onClick={() => setSelected([...selected, index])}>{options[index]}</button>
        ))}
      </div>
      <div className="question-actions">
        <button type="button" className="secondary-button" onClick={() => setSelected([])} disabled={selected.length === 0}>다시 만들기</button>
        <button type="button" className="primary-button" onClick={() => onAnswer(selected.map((index) => options[index]).join(''))} disabled={selected.length === 0}>확인</button>
      </div>
    </div>
  )
}
