import type { Progress } from '../shared/types'

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function recordAnswer(progress: Progress, itemId: string, correct: boolean, today: string): Progress {
  const previousAnswer = progress.answers[itemId] ?? { correct: 0, incorrect: 0, lastAnsweredAt: today }
  const previousReview = progress.review[itemId]
  const intervalDays = correct ? Math.min(365, (previousReview?.intervalDays ?? 0) * 2 || 1) : 1
  return {
    ...progress,
    answers: {
      ...progress.answers,
      [itemId]: {
        correct: previousAnswer.correct + Number(correct),
        incorrect: previousAnswer.incorrect + Number(!correct),
        lastAnsweredAt: today
      }
    },
    review: {
      ...progress.review,
      [itemId]: {
        dueDate: addDays(today, intervalDays),
        intervalDays,
        successes: correct ? (previousReview?.successes ?? 0) + 1 : 0
      }
    }
  }
}
