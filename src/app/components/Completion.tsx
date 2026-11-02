import type { Progress, StudyItem, StudySet } from '../../shared/types'
import { useEffect, useRef } from 'react'

export function Completion({ set, items, progress, onFinish, busy }: { set: StudySet; items: StudyItem[]; progress: Progress; onFinish(): void; busy: boolean }) {
  const finishButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { finishButton.current?.focus() }, [])
  const label = (item: StudyItem) => item.guide?.title ?? item.speechText ?? item.prompt
  const review = items.filter((item) => progress.review[item.id])
    .sort((a, b) => progress.review[a.id].dueDate.localeCompare(progress.review[b.id].dueDate)).slice(0, 3)
  return (
    <div className="completion-card">
      <h2>{set.itemIds.length}문제를 풀었습니다</h2>
      <h3>학습한 내용</h3>
      <ul>{items.slice(0, 3).map((item) => <li key={item.id}>{label(item)}</li>)}</ul>
      {items.length > 3 && <p>외 {items.length - 3}문제</p>}
      {review.length > 0 && <>
        <h3>다음 복습</h3>
        <ul>{review.map((item) => <li key={item.id}>{progress.review[item.id].dueDate} · {label(item)}</li>)}</ul>
        <p>복습 일정은 오늘의 학습에 반영됩니다.</p>
      </>}
      <button ref={finishButton} type="button" className="primary-button" onClick={onFinish} disabled={busy}>학습 마치기</button>
    </div>
  )
}
