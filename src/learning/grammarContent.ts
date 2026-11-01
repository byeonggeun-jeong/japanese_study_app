import { n4Grammar, n5Grammar } from '../content/grammar/points'
import type { Lesson, StudyItem } from '../shared/types'

type Point = { pattern: string; meaning: string; examples: [string, string, string, string] }

function parse(source: string): Point[] {
  return source.split('\n').map((line) => {
    const [pattern, meaning, ja1, ko1, ja2, ko2] = line.split('|')
    if (![pattern, meaning, ja1, ko1, ja2, ko2].every(Boolean)) throw new Error(`Incomplete grammar point: ${line}`)
    return { pattern, meaning, examples: [ja1, ko1, ja2, ko2] }
  })
}

export function grammarExamples(): { level: 'N5' | 'N4'; ja: string; ko: string }[] {
  return ([['N5', n5Grammar], ['N4', n4Grammar]] as const).flatMap(([level, source]) =>
    parse(source).flatMap((point) => [
      { level, ja: point.examples[0], ko: point.examples[1] },
      { level, ja: point.examples[2], ko: point.examples[3] }
    ])
  )
}

export function buildGrammarContent(): { items: StudyItem[]; lessons: Lesson[] } {
  const items: StudyItem[] = []
  const lessons: Lesson[] = []
  for (const [level, source] of [['N5', n5Grammar], ['N4', n4Grammar]] as const) {
    const points = parse(source)
    const meanings = [...new Set(points.map((point) => point.meaning))]
    points.forEach((point, index) => {
      const lessonNumber = Math.floor(index / 5) + 1
      const lessonId = `grammar-${level.toLowerCase()}-core-${lessonNumber}`
      if (index % 5 === 0) lessons.push({
        id: lessonId, chapter: 'grammar', level, topicId: `core-${lessonNumber}`,
        title: `${level} 문법·표현 ${lessonNumber}`, estimatedMinutes: 10, itemIds: []
      })
      const id = `grammar-created-${level.toLowerCase()}-${String(index + 1).padStart(3, '0')}`
      lessons[lessons.length - 1].itemIds.push(id)
      const distractors = meanings.filter((meaning) => meaning !== point.meaning)
      items.push({
        id, chapter: 'grammar', level, topicId: `core-${lessonNumber}`, lessonId,
        kind: 'choice', prompt: `「${point.pattern}」의 쓰임은 무엇인가요?\n${point.examples[0]}`,
        options: [point.meaning, ...[0, 1, 2].map((offset) => distractors[(index * 5 + offset * 7) % distractors.length])],
        answer: point.meaning,
        explanation: `${point.pattern}: ${point.meaning}\n${point.examples[0]} ${point.examples[1]}\n${point.examples[2]} ${point.examples[3]}`,
        speechText: point.examples[0]
      })
    })
  }
  return { items, lessons }
}
