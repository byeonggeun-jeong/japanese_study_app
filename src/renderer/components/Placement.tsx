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
      <p className="eyebrow">첫 학습 준비</p>
      <h2>시작점 찾기</h2>
      <p>간단한 문제로 챕터별 시작 위치를 정합니다. 모르면 편하게 고르세요.</p>
      {finished ? <div className="question-card placement-result">
        <h3>챕터별 시작점</h3>
        <p>잘하는 영역은 이어 가고, 필요한 기초는 따로 익혀요.</p>
        <dl>{Object.entries(scorePlacement(answers).starts).map(([chapter, start]) => <div key={chapter}>
          <dt>{chapter === 'kana' ? '문자' : chapter === 'grammar' ? '문법' : chapter === 'vocabulary' ? '단어' : '문장'}</dt>
          <dd>{chapter === 'kana' ? start === 'katakana-basic' ? '가타카나부터' : '히라가나부터' : `${start}부터`}</dd>
        </div>)}</dl>
        <button type="button" className="primary-button" onClick={() => { void confirm() }} disabled={busy}>{busy ? '저장 중...' : '추천 학습으로'}</button>
        {error && <p role="alert" className="error-message">{error}</p>}
      </div> : item ? (
        <div className="question-card">
          <p className="progress-label">응답한 문제 {answers.length}개</p>
          <h3>{item.prompt}</h3>
          <div className="option-list" role="group" aria-label="답 선택">
            {orderOptions(item.options ?? [], item.id).map((option) => (
              <button type="button" key={option} onClick={() => choose(option)}>{option}</button>
            ))}
          </div>
        </div>
      ) : <p>진단 문제가 없습니다.</p>}
    </section>
  )
}
