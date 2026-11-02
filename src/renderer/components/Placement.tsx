import { ChoiceQuestion } from './ChoiceQuestion'
import { useState } from 'react'
import { nextPlacementItem, scorePlacement } from '../../learning/placement'
import { orderOptions } from '../../learning/options'
import type { PlacementAnswer } from '../../shared/types'
import type { StudyItem } from '../../shared/types'
import type { PlacementResult } from '../../learning/placement'

export function Placement({ items, onComplete }: { items: StudyItem[]; onComplete(result: PlacementResult): void | Promise<void> }) {
  const [answers, setAnswers] = useState<PlacementAnswer[]>([])
  const [finished, setFinished] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const item = nextPlacementItem(items.filter((entry) => entry.placementTier), answers)

  function choose(value: string): void {
    if (!item) return
    const nextAnswers = [...answers, {
      itemId: item.id,
      chapter: item.chapter,
      tier: item.placementTier!,
      correct: value === item.answer
    }]
    setAnswers(nextAnswers)
    if (!nextPlacementItem(items.filter((entry) => entry.placementTier), nextAnswers)) {
      setFinished(true)
    }
  }

  async function confirm(): Promise<void> {
    if (busy) return
    setBusy(true)
    setError('')
    try { await onComplete(scorePlacement(answers)) }
    catch { setError('진단 결과를 저장하지 못했습니다. 다시 시도해 주세요.'); setBusy(false) }
  }

  return (
    <section className="placement">
      <h1>시작점 찾기</h1>
      <p>진단 결과에 맞춰 학습을 시작합니다.</p>
      {finished ? <div className="question-card placement-result">
        <h3>챕터별 시작점</h3>
        <dl>{Object.entries(scorePlacement(answers).starts).map(([chapter, start]) => <div key={chapter}>
          <dt>{chapter === 'kana' ? '문자' : chapter === 'grammar' ? '문법' : chapter === 'vocabulary' ? '단어' : '문장'}</dt>
          <dd>{chapter === 'kana' ? start === 'katakana-basic' ? '가타카나부터' : '히라가나부터' : `${start}부터`}</dd>
        </div>)}</dl>
        <button type="button" className="primary-button" onClick={() => { void confirm() }} disabled={busy}>{busy ? '저장 중...' : '추천 학습으로'}</button>
        {error && <p role="alert" className="error-message">{error}</p>}
      </div> : item ? (
        <div className="question-card">
          <p className="progress-label">완료 {answers.length}개</p>
          <h3>{item.prompt}</h3>
          <ChoiceQuestion options={orderOptions(item.options ?? [], item.id)} onAnswer={choose} />
        </div>
      ) : <p>진단 문제가 없습니다.</p>}
    </section>
  )
}
