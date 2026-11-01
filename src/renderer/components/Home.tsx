import { getStreak } from '../../learning/streak'
import type { Progress, StudySet } from '../../shared/types'

export function Home({ progress, today, dailySet, onStart, onResume, onFree }: {
  progress: Progress
  today: string
  dailySet: StudySet
  onStart(): void
  onResume(): void
  onFree(): void
}) {
  const streak = getStreak(progress.completedDates, today)
  const studied = progress.completedDates.includes(today)
  const hasActive = Boolean(progress.activeSet)

  return (
    <div className="home-page">
      <div className="page-intro">
        <p className="eyebrow">매일 조금씩, 확실하게</p>
        <h1>오늘의 학습</h1>
        <p>지금 필요한 복습부터 새로운 표현까지, 오늘의 분량을 준비했어요.</p>
      </div>

      <section className="daily-hero" aria-labelledby="daily-title">
        <div>
          <p className="eyebrow">TODAY · {today}</p>
          <h2 id="daily-title">{studied ? '오늘의 한 걸음, 완료!' : '오늘도 한 걸음 앞으로'}</h2>
          <p>{dailySet.itemIds.length > 0 ? `약 ${dailySet.estimatedMinutes}분 · ${dailySet.itemIds.length}문제` : '새 학습 문제가 준비되면 여기에 표시됩니다.'}</p>
          {hasActive ? <button type="button" className="primary-button" onClick={onResume}>이어 풀기</button>
            : <button type="button" className="primary-button" onClick={onStart} disabled={dailySet.itemIds.length === 0}>오늘의 학습 시작</button>}
        </div>
        <div className="hero-mark" aria-hidden="true">あ</div>
      </section>

      <div className="home-stats">
        <section className="stat-card">
          <span className="stat-label">현재 연속 기록</span>
          <strong>{streak.current}일 연속</strong>
          <span>최장 {streak.longest}일</span>
        </section>
        <section className="stat-card">
          <span className="stat-label">누적 학습</span>
          <strong>{progress.completedDates.length}일</strong>
          <span>매일 쌓이는 기록</span>
        </section>
        <section className="stat-card">
          <span className="stat-label">오늘의 상태</span>
          <strong>{studied ? '완료' : '기다리는 중'}</strong>
          <span>{studied ? '자유 연습도 이어갈 수 있어요' : '한 묶음을 끝내면 기록됩니다'}</span>
        </section>
      </div>

      <section className="home-secondary">
        <div>
          <h2>원하는 챕터를 더 연습하고 싶나요?</h2>
          <p>문자, 문법, 단어, 문장을 자유롭게 반복할 수 있어요.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onFree}>자유 연습</button>
      </section>
    </div>
  )
}
