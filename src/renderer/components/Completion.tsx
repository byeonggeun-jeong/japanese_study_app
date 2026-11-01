import type { StudySet } from '../../shared/types'

export function Completion({ set, onFinish, busy }: { set: StudySet; onFinish(): void; busy: boolean }) {
  return (
    <div className="completion-card">
      <p className="eyebrow">학습 완료</p>
      <h2>{set.itemIds.length}문제를 풀었습니다</h2>
      <p>오늘도 일본어를 한 걸음 더 익혔어요.</p>
      <button type="button" className="primary-button" onClick={onFinish} disabled={busy}>학습 마치기</button>
    </div>
  )
}
