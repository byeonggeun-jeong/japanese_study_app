import { getStreak } from '../../learning/streak'
import type { Chapter, Progress, StudyContent } from '../../shared/types'

function precedingDates(today: string): string[] {
  const date = new Date(`${today}T00:00:00Z`)
  return Array.from({ length: 28 }, (_, index) => {
    const value = new Date(date)
    value.setUTCDate(value.getUTCDate() - 27 + index)
    return value.toISOString().slice(0, 10)
  })
}

export function ProgressView({ progress, today, content }: { progress: Progress; today: string; content: StudyContent }) {
  const streak = getStreak(progress.completedDates, today)
  const studied = new Set(progress.completedDates)
  const mastered = Object.values(progress.answers).filter((answer) => answer.correct >= 2 && answer.correct > answer.incorrect).length
  const reviewed = Object.values(progress.review).filter((review) => review.successes >= 2).length

  return (
    <div className="progress-page">
      <div className="page-intro">
        <p className="eyebrow">쌓인 만큼 보이는 성장</p>
        <h1>학습 기록</h1>
        <p>꾸준히 쌓아 온 시간을 확인해 보세요.</p>
      </div>
      <div className="progress-summary">
        <section className="stat-card"><span className="stat-label">학습일</span><strong>총 {progress.completedDates.length}일 학습</strong></section>
        <section className="stat-card"><span className="stat-label">연속 기록</span><strong>{streak.current}일 연속</strong></section>
        <section className="stat-card"><span className="stat-label">익숙해진 문제</span><strong>{mastered}개</strong></section>
        <section className="stat-card"><span className="stat-label">반복 성공</span><strong>{reviewed}개</strong></section>
      </div>
      <section className="calendar-card">
        <h2>챕터별 진도</h2>
        <p>한 번 이상 풀어 본 문제와 반복해서 익힌 문제를 확인해요.</p>
        <div className="chapter-progress-list">
          {([['kana', '문자'], ['grammar', '문법'], ['vocabulary', '단어'], ['sentences', '문장']] as [Chapter, string][]).map(([chapter, title]) => {
            const items = content.items.filter((item) => item.chapter === chapter)
            const attempted = items.filter((item) => progress.answers[item.id]).length
            const familiar = items.filter((item) => (progress.answers[item.id]?.correct ?? 0) >= 2 && progress.answers[item.id].correct > progress.answers[item.id].incorrect).length
            return <div key={chapter}>
              <div className="chapter-progress-label"><strong>{title}</strong><span>{attempted} / {items.length}문제 · 익숙해진 문제 {familiar}개</span></div>
              <progress value={attempted} max={items.length || 1} aria-label={`${title} 학습 진도`} />
            </div>
          })}
        </div>
      </section>
      <section className="calendar-card">
        <h2>최근 4주</h2>
        <p>색이 채워진 날에 한 묶음 이상 학습했어요.</p>
        <div className="study-calendar" aria-label="최근 4주 학습 달력">
          {precedingDates(today).map((date) => (
            <div key={date} className={`calendar-day ${studied.has(date) ? 'studied' : ''}`}
              aria-label={`${date} ${studied.has(date) ? '학습 완료' : '학습 없음'}`}
              title={`${date} ${studied.has(date) ? '학습 완료' : '학습 없음'}`}>{Number(date.slice(-2))}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
