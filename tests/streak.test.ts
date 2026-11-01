import { describe, expect, it } from 'vitest'
import { completeStudyDate, getStreak } from '../src/learning/streak'
import { createEmptyProgress } from '../src/main/progressStore'

describe('study dates and streaks', () => {
  it('counts a date once even after both guided and free sets', () => {
    const once = completeStudyDate(createEmptyProgress(), '2026-11-01')
    const twice = completeStudyDate(once, '2026-11-01')
    expect(twice.completedDates).toEqual(['2026-11-01'])
  })

  it('keeps yesterday’s streak visible before today’s study', () => {
    expect(getStreak(['2026-10-30', '2026-10-31'], '2026-11-01')).toEqual({ current: 2, longest: 2 })
  })

  it('continues at midnight when a new local date is completed', () => {
    expect(getStreak(['2026-10-31', '2026-11-01'], '2026-11-01')).toEqual({ current: 2, longest: 2 })
  })

  it('resets current streak after a missed whole day and keeps the record', () => {
    expect(getStreak(['2026-10-28', '2026-10-29'], '2026-11-01')).toEqual({ current: 0, longest: 2 })
  })
})
