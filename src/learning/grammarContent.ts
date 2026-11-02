import { n4Grammar, n5Grammar } from '../content/grammar/points'
import { grammarNotes } from '../content/grammar/notes'
import type { Lesson, StudyItem } from '../shared/types'

type Point = { pattern: string; meaning: string; examples: [string, string, string, string] }

function parse(source: string): Point[] {
  return source.split('\n').map((line) => {
    const [pattern, meaning, ja1, ko1, ja2, ko2] = line.split('|')
    if (![pattern, meaning, ja1, ko1, ja2, ko2].every(Boolean)) throw new Error(`Incomplete grammar point: ${line}`)
    if (!grammarNotes[pattern]) throw new Error(`Missing grammar explanation: ${pattern}`)
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
      const cloze = ['を', 'に', 'から', 'まで'].includes(point.pattern)
      items.push({
        id, chapter: 'grammar', level, topicId: `core-${lessonNumber}`, lessonId,
        kind: 'choice', prompt: cloze ? `빈칸에 들어갈 조사를 고르세요.\n${point.examples[0].replace(point.pattern, '（　）')}\n${point.examples[1]}` : `「${point.pattern}」의 쓰임은 무엇인가요?\n${point.examples[0]}`,
        options: cloze ? [point.pattern, ...['を', 'に', 'から', 'まで'].filter((option) => option !== point.pattern)] : [point.meaning, ...[0, 1, 2].map((offset) => distractors[(index * 5 + offset * 7) % distractors.length])],
        answer: cloze ? point.pattern : point.meaning,
        explanation: `${grammarNotes[point.pattern]}\n${point.examples[0]} ${point.examples[1]}\n${point.examples[2]} ${point.examples[3]}`,
        speechText: point.examples[0],
        guide: { title: point.pattern, text: `${point.meaning}. ${grammarNotes[point.pattern]}`, examples: [
          { ja: point.examples[0], ko: point.examples[1] }, { ja: point.examples[2], ko: point.examples[3] }
        ] }
      })
    })
  }
  const foundation = ['です', 'ではありません', 'でした', 'ます', 'ません', 'ました', 'ませんでした', 'い形容詞', 'な形容詞', '普通形', 'ない形', 'た形', 'て形']
  items.sort((a, b) => {
    const rank = (item: StudyItem) => {
      const index = foundation.indexOf(item.guide!.title)
      return index < 0 ? foundation.length : index
    }
    return rank(a) - rank(b)
  })
  return { items, lessons }
}
