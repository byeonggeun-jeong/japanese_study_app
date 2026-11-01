import { describe, expect, it } from 'vitest'
import { buildDailySet, buildFreeSet, finishSet } from '../src/learning/scheduler'
import { recordAnswer } from '../src/learning/review'
import { createEmptyProgress } from '../src/main/progressStore'
import type { StudyContent, StudyItem } from '../src/shared/types'

function item(id: string, chapter: StudyItem['chapter'] = 'vocabulary', level: StudyItem['level'] = 'N5'): StudyItem {
  return { id, chapter, level, topicId: 'test-topic', lessonId: `${chapter}-${level}`,
    kind: 'choice', prompt: id, options: ['yes', 'no'], answer: 'yes', explanation: 'because' }
}

function content(items: StudyItem[]): StudyContent {
  return { items, lessons: [] }
}

describe('study scheduling', () => {
  const today = '2026-11-01'

  it('puts due review before unseen material', () => {
    const items = Array.from({ length: 20 }, (_, i) => item(`word-${i}`))
    const progress = { ...createEmptyProgress(), review: { 'word-19': { dueDate: today, intervalDays: 1, successes: 1 } } }
    expect(buildDailySet(content(items), progress, today, 7).itemIds[0]).toBe('word-19')
  })

  it('returns an incorrect answer for review on the next day', () => {
    const progress = recordAnswer(createEmptyProgress(), 'word-1', false, today)
    expect(progress.review['word-1'].dueDate).toBe('2026-11-02')
    expect(buildDailySet(content([item('word-1')]), progress, '2026-11-02', 1).itemIds).toContain('word-1')
  })

  it('reduces new material when due reviews fill the set', () => {
    const items = Array.from({ length: 30 }, (_, i) => item(`word-${i}`))
    const due = Object.fromEntries(items.slice(0, 12).map((entry) => [entry.id, { dueDate: today, intervalDays: 1, successes: 1 }]))
    const withoutDue = buildDailySet(content(items), createEmptyProgress(), today, 1)
    const withDue = buildDailySet(content(items), { ...createEmptyProgress(), review: due }, today, 1)
    expect(withDue.itemIds.filter((id) => !due[id]).length).toBeLessThan(withoutDue.itemIds.length)
    expect(withDue.itemIds.length).toBeLessThanOrEqual(15)
  })

  it('respects an N4 start for one chapter without changing another', () => {
    const items = [item('grammar-n5', 'grammar', 'N5'), item('grammar-n4', 'grammar', 'N4'), item('vocab-n5')]
    const progress = { ...createEmptyProgress(), placement: { starts: { grammar: 'N4' }, completedAt: today } }
    expect(buildDailySet(content(items), progress, today, 1).itemIds).toEqual(expect.arrayContaining(['grammar-n4', 'vocab-n5']))
    expect(buildDailySet(content(items), progress, today, 1).itemIds).not.toContain('grammar-n5')
  })

  it('makes free batches reproducible and keeps them within one chapter', () => {
    const items = Array.from({ length: 20 }, (_, i) => item(`kana-${i}`, 'kana', 'kana'))
    const batch = buildFreeSet(content(items), 'kana', 7)
    expect(batch).toEqual(buildFreeSet(content(items), 'kana', 7))
    expect(batch.itemIds).toHaveLength(10)
    expect(buildFreeSet(content(items), 'kana', 8).itemIds).not.toEqual([])
  })

  it('returns an empty set when no content exists', () => {
    expect(buildDailySet(content([]), createEmptyProgress(), today, 1).itemIds).toEqual([])
  })

  it('counts any completed set once for the local day', () => {
    const set = buildFreeSet(content([item('kana-1', 'kana', 'kana')]), 'kana', 1)
    const once = finishSet(createEmptyProgress(), set, today)
    const twice = finishSet(once, set, today)
    expect(twice.completedDates).toEqual([today])
  })
})
