import { useState } from 'react'
import { nextPlacementItem, scorePlacement } from '../../learning/placement'
import type { PlacementAnswer } from '../../shared/types'
import type { StudyItem } from '../../shared/types'
import type { PlacementResult } from '../../learning/placement'

export function Placement({ items, onComplete }: { items: StudyItem[]; onComplete(result: PlacementResult): void }) {
  const [answers, setAnswers] = useState<PlacementAnswer[]>([])
  const [finished, setFinished] = useState(false)
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
      onComplete(scorePlacement(nextAnswers))
    }
  }

  return (
    <section className="placement">
      <p className="eyebrow">첫 학습 준비</p>
      <h2>시작점 찾기</h2>
      <p>간단한 문제로 챕터별 시작 위치를 정합니다. 모르면 편하게 고르세요.</p>
      {finished ? <p>진단을 마쳤습니다.</p> : item ? (
        <div className="question-card">
          <p className="progress-label">응답한 문제 {answers.length}개</p>
          <h3>{item.prompt}</h3>
          <div className="option-list" role="group" aria-label="답 선택">
            {item.options?.map((option) => (
              <button type="button" key={option} onClick={() => choose(option)}>{option}</button>
            ))}
          </div>
        </div>
      ) : <p>진단 문제가 없습니다.</p>}
    </section>
  )
}
