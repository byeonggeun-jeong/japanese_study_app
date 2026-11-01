import type { Progress, StudyItem, StudySet } from '../../shared/types'

export function Completion({ set, items, progress, onFinish, busy }: { set: StudySet; items: StudyItem[]; progress: Progress; onFinish(): void; busy: boolean }) {
  const label = (item: StudyItem) => item.guide?.title ?? item.prompt
  const review = items.filter((item) => progress.review[item.id])
    .sort((a, b) => progress.review[a.id].dueDate.localeCompare(progress.review[b.id].dueDate)).slice(0, 3)
  return (
    <div className="completion-card">
      <p className="eyebrow">학습 완료</p>
      <h2>{set.itemIds.length}문제를 풀었습니다</h2>
      <p>오늘도 일본어를 한 걸음 더 익혔어요.</p>
      <h3>이번에 익힌 내용</h3>
      <ul>{items.slice(0, 3).map((item) => <li key={item.id}>{label(item)}</li>)}</ul>
      {items.length > 3 && <p>외 {items.length - 3}문제도 함께 연습했어요.</p>}
      {review.length > 0 && <>
        <h3>다음 복습</h3>
        <ul>{review.map((item) => <li key={item.id}>{progress.review[item.id].dueDate} · {label(item)}</li>)}</ul>
        <p>복습할 날이 되면 오늘의 학습에 다시 담아 드려요.</p>
      </>}
      <button type="button" className="primary-button" onClick={onFinish} disabled={busy}>학습 마치기</button>
    </div>
  )
}
