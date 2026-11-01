import lexicon from '../content/vocabulary/lexicon.json'
import type { Lesson, StudyItem, StudyLevel } from '../shared/types'

type Word = { id: string; word: string; reading: string; meaning: string; context: string; level: StudyLevel; pos: string }
const words = lexicon as Word[]
const categoryNames = { noun: '명사', verb: '동작', adjective: '상태와 성질', other: '표현' }

function category(pos: string): keyof typeof categoryNames {
  if (pos.startsWith('v')) return 'verb'
  if (pos.startsWith('adj')) return 'adjective'
  if (pos.startsWith('n')) return 'noun'
  return 'other'
}

function choices(correct: string, pool: string[], offset: number): string[] {
  const distinct = [...new Set(pool)].filter((candidate) => candidate !== correct)
  const selected = Array.from({ length: 3 }, (_, index) => distinct[(offset * 7 + index * 13) % distinct.length])
  return [correct, ...selected]
}

export function buildWordContent(): { items: StudyItem[]; lessons: Lesson[] } {
  const items: StudyItem[] = []
  const lessons: Lesson[] = []
  for (const level of ['N5', 'N4'] as const) {
    for (const group of ['noun', 'verb', 'adjective', 'other'] as const) {
      const members = words.filter((word) => word.level === level && category(word.pos) === group)
      const meanings = words.filter((word) => word.level === level).map((word) => word.meaning)
      const readings = words.filter((word) => word.level === level).map((word) => word.reading)
      for (let start = 0; start < members.length; start += 15) {
        const lessonNumber = Math.floor(start / 15) + 1
        const lessonId = `vocab-${level.toLowerCase()}-${group}-${lessonNumber}`
        const batch = members.slice(start, start + 15)
        lessons.push({
          id: lessonId, chapter: 'vocabulary', level, topicId: group,
          title: `${level} ${categoryNames[group]} ${lessonNumber}`, estimatedMinutes: 15,
          itemIds: batch.map((word) => `vocab-${word.id}`)
        })
        batch.forEach((word, index) => {
          const askReading = /[\u3400-\u9fff]/u.test(word.word) && index % 3 === 0
          const answer = askReading ? word.reading : word.meaning
          items.push({
            id: `vocab-${word.id}`, chapter: 'vocabulary', level, topicId: group, lessonId,
            kind: 'choice',
            prompt: askReading ? `「${word.word}」의 읽기는 무엇인가요?` : `「${word.word}」의 뜻은 무엇인가요?`,
            options: choices(answer, askReading ? readings : meanings, start + index), answer,
            explanation: `「${word.word}」는 ${word.reading}라고 읽고 ‘${word.meaning}’이라는 뜻입니다.`,
            speechText: word.word,
            guide: { title: word.word, text: `${word.reading} · ${word.meaning}`, examples: [{ ja: word.context }] }
          })
        })
      }
    }
  }
  return { items, lessons }
}
