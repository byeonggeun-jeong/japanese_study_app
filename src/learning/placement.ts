import type { Chapter, PlacementAnswer, Progress, StudyItem } from '../shared/types'

const chapters: Chapter[] = ['kana', 'grammar', 'vocabulary', 'sentences']

export interface PlacementResult {
  starts: Record<Chapter, string>
}

export function scorePlacement(answers: PlacementAnswer[]): PlacementResult {
  const starts: PlacementResult['starts'] = {
    kana: 'hiragana-basic', grammar: 'N5', vocabulary: 'N5', sentences: 'N5'
  }
  for (const chapter of chapters) {
    const basic = answers.filter((answer) => answer.chapter === chapter && answer.tier === 1)
    const advanced = answers.filter((answer) => answer.chapter === chapter && answer.tier === 2)
    if (basic.length >= 2 && basic.every((answer) => answer.correct) && advanced.some((answer) => answer.correct)) {
      starts[chapter] = chapter === 'kana' ? 'katakana-basic' : 'N4'
    }
  }
  return { starts }
}

export function nextPlacementItem(items: StudyItem[], answers: PlacementAnswer[]): StudyItem | undefined {
  const answered = new Set(answers.map((answer) => answer.itemId))
  for (const chapter of chapters) {
    const candidates = items.filter((item) => item.chapter === chapter && item.placementTier)
    const basic = candidates.filter((item) => item.placementTier === 1)
    const nextBasic = basic.find((item) => !answered.has(item.id))
    if (nextBasic) return nextBasic
    const basicAnswers = answers.filter((answer) => answer.chapter === chapter && answer.tier === 1)
    if (basicAnswers.length < 2 || !basicAnswers.every((answer) => answer.correct)) continue
    const nextAdvanced = candidates.find((item) => item.placementTier === 2 && !answered.has(item.id))
    if (nextAdvanced) return nextAdvanced
  }
  return undefined
}

export function applyPlacement(progress: Progress, result: PlacementResult, now: string): Progress {
  return { ...progress, placement: { starts: result.starts, completedAt: now } }
}
