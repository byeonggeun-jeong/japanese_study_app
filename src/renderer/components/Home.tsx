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
  const active = progress.activeSet
  const itemCount = active?.itemIds.length ?? dailySet.itemIds.length
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() - 6 + index)
    return { date: date.toISOString().slice(0, 10), label: ['일', '월', '화', '수', '목', '금', '토'][date.getUTCDay()] }
  })

  return (
    <div className="home-page">
      <div className="page-intro title-row"><h1>오늘의 학습</h1><time dateTime={today}>{today.replaceAll('-', '.')}</time></div>
      <div className="home-overview">
        <section className="daily-hero" aria-labelledby="daily-title">
          <h2 id="daily-title">{active ? '진행 중인 학습' : studied ? '오늘 학습 완료' : '오늘 풀 문제'}</h2>
          <div className="session-size"><strong>{itemCount}</strong><span>문제</span></div>
          <p className="session-detail">{active ? `${active.currentIndex} / ${itemCount}문제 완료` : `약 ${dailySet.estimatedMinutes}분`}</p>
          {active ? <button type="button" className="primary-button" onClick={onResume}>이어 풀기</button>
            : <button type="button" className="primary-button" onClick={onStart} disabled={itemCount === 0}>오늘의 학습 시작</button>}
        </section>
        <section className="streak-card" aria-labelledby="streak-title">
          <h2 id="streak-title">연속 학습</h2>
          <strong className="streak-value">{streak.current}일 연속</strong>
          <p>최장 {streak.longest}일 · 누적 {progress.completedDates.length}일</p>
          <div className="week-record" aria-label="최근 7일 학습 기록">
            {week.map(day => <div key={day.date} className={progress.completedDates.includes(day.date) ? 'done' : ''} aria-label={`${day.date} ${progress.completedDates.includes(day.date) ? '완료' : '학습 없음'}`}>
              <span>{day.label}</span><span className="week-dot" aria-hidden="true">{progress.completedDates.includes(day.date) && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
            </div>)}
          </div>
        </section>
      </div>
      <section className="home-secondary">
        <div><h2>자유 연습</h2><p>문자 · 문법 · 단어 · 문장</p></div>
        <button type="button" className="secondary-button" onClick={onFree}>챕터 선택 <span aria-hidden="true">›</span></button>
      </section>
    </div>
  )
}
