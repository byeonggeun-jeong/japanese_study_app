import type { Chapter, Progress, StudyContent, StudyItem, StudyRange, StudySet } from '../shared/types'
import { completeStudyDate } from './streak'

const dailySize = 15
const freeSize = 10
const chapters: Chapter[] = ['kana', 'grammar', 'vocabulary', 'sentences']

function shuffled<T>(values: T[], seed: number): T[] {
  const result = [...values]
  let state = seed >>> 0
  for (let index = result.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    const swap = state % (index + 1)
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

function eligibleNewItem(item: StudyItem, content: StudyContent, progress: Progress): boolean {
  const start = progress.placement?.starts[item.chapter]
  if (item.chapter === 'kana') {
    return start !== 'katakana-basic' || !item.topicId.startsWith('hiragana')
  }
  if (start === 'N4') return item.level === 'N4'
  if (item.level !== 'N4') return true
  return content.items.filter((entry) => entry.chapter === item.chapter && entry.level === 'N5')
    .every((entry) => progress.answers[entry.id] !== undefined)
}

export function buildDailySet(content: StudyContent, progress: Progress, today: string, seed: number): StudySet {
  const selected: string[] = []
  const seen = new Set<string>()
  function add(item: StudyItem): void {
    if (selected.length < dailySize && !seen.has(item.id)) {
      selected.push(item.id)
      seen.add(item.id)
    }
  }

  const due = content.items.filter((item) => progress.review[item.id]?.dueDate <= today)
    .sort((a, b) => progress.review[a.id].dueDate.localeCompare(progress.review[b.id].dueDate))
  due.forEach(add)

  const weak = shuffled(content.items.filter((item) => {
    const answer = progress.answers[item.id]
    return answer && answer.incorrect > answer.correct
  }), seed).sort((a, b) => Number(b.chapter === 'kana') - Number(a.chapter === 'kana'))
  weak.forEach(add)

  const newByChapter = chapters.map((chapter) => content.items.filter((item) =>
    item.chapter === chapter && !progress.answers[item.id] && eligibleNewItem(item, content, progress)
  ))
  for (let index = 0; selected.length < dailySize && newByChapter.some((items) => items.length > index); index++) {
    for (const items of newByChapter) {
      if (items[index]) add(items[index])
    }
  }

  return { id: `daily-${today}`, source: 'daily', itemIds: selected, estimatedMinutes: selected.length }
}

export function buildFreeSet(content: StudyContent, chapter: Chapter, seed: number, range: StudyRange = 'all'): StudySet {
  const itemIds = shuffled(content.items.filter((item) => item.chapter === chapter &&
    (range === 'all' || item.level === range || item.topicId.startsWith(`${range}-`))), seed)
    .slice(0, freeSize).map((item) => item.id)
  return { id: `free-${chapter}-${seed}`, source: 'free', chapter, range, itemIds, estimatedMinutes: itemIds.length }
}

export function finishSet(progress: Progress, set: StudySet, today: string): Progress {
  if (set.itemIds.length === 0) return progress
  return { ...completeStudyDate(progress, today), activeSet: undefined }
}
