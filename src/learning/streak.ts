import type { Progress } from '../shared/types'

const dayMs = 86_400_000

function dayNumber(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / dayMs
}

export function completeStudyDate(progress: Progress, date: string): Progress {
  if (progress.completedDates.includes(date)) return progress
  return { ...progress, completedDates: [...progress.completedDates, date].sort() }
}

export function getStreak(dates: string[], today: string): { current: number; longest: number } {
  const days = [...new Set(dates)].map(dayNumber).filter(Number.isFinite).sort((a, b) => a - b)
  let longest = 0
  let run = 0
  let previous = Number.NEGATIVE_INFINITY
  for (const day of days) {
    run = day === previous + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = day
  }

  const todayNumber = dayNumber(today)
  const last = days.at(-1)
  if (last !== todayNumber && last !== todayNumber - 1) return { current: 0, longest }
  return { current: run, longest }
}
