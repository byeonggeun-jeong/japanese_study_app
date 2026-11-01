import { describe, expect, it } from 'vitest'
import { loadContent } from '../src/learning/content'
import { applyPlacement, nextPlacementItem, scorePlacement } from '../src/learning/placement'
import { createEmptyProgress } from '../src/main/progressStore'
import type { Chapter, PlacementAnswer } from '../src/shared/types'

const chapters: Chapter[] = ['kana', 'grammar', 'vocabulary', 'sentences']

function answersFor(chapter: Chapter, firstCorrect: boolean, secondCorrect: boolean): PlacementAnswer[] {
  return [
    { itemId: `${chapter}-1`, chapter, tier: 1, correct: firstCorrect },
    { itemId: `${chapter}-2`, chapter, tier: 1, correct: firstCorrect },
    { itemId: `${chapter}-3`, chapter, tier: 2, correct: secondCorrect }
  ]
}

describe('placement', () => {
  it('starts a complete beginner at basic lessons in every chapter', () => {
    const answers = chapters.flatMap((chapter) => answersFor(chapter, false, false))
    expect(scorePlacement(answers).starts).toEqual({
      kana: 'hiragana-basic', grammar: 'N5', vocabulary: 'N5', sentences: 'N5'
    })
  })

  it('keeps kana basic while advancing a strong sentence reader', () => {
    const answers = [
      ...answersFor('kana', false, false),
      ...answersFor('sentences', true, true)
    ]
    expect(scorePlacement(answers).starts).toEqual({
      kana: 'hiragana-basic', grammar: 'N5', vocabulary: 'N5', sentences: 'N4'
    })
  })

  it('does not skip a chapter when diagnosis is incomplete', () => {
    expect(scorePlacement([{ itemId: 'only-one', chapter: 'grammar', tier: 2, correct: true }]).starts.grammar).toBe('N5')
  })

  it('skips advanced questions after two incorrect basics in a chapter', () => {
    const items = loadContent().items.filter((item) => item.placementTier)
    const first = items.find((item) => item.chapter === 'kana' && item.placementTier === 1)!
    const second = items.find((item) => item.chapter === 'kana' && item.placementTier === 1 && item.id !== first.id)!
    const answers: PlacementAnswer[] = [
      { itemId: first.id, chapter: 'kana', tier: 1, correct: false },
      { itemId: second.id, chapter: 'kana', tier: 1, correct: false }
    ]
    expect(nextPlacementItem(items, answers)?.chapter).toBe('grammar')
  })

  it('can repeat diagnosis without deleting history', () => {
    const progress = { ...createEmptyProgress(), completedDates: ['2026-10-31'] }
    const placed = applyPlacement(progress, scorePlacement(answersFor('kana', true, true)), '2026-11-01T10:00:00.000Z')
    expect(placed.completedDates).toEqual(['2026-10-31'])
    expect(placed.placement?.starts.kana).toBe('katakana-basic')
  })
})
