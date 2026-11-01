import { n4Scenes, n5Scenes } from '../content/sentences/scenes'
import type { Lesson, StudyItem } from '../shared/types'
import { grammarExamples } from './grammarContent'

type Reading = { level: 'N5' | 'N4'; ja: string; ko: string; topic: string }

function scenes(source: string, level: 'N5' | 'N4'): Reading[] {
  return source.split('\n').map((line) => {
    const [ja, ko] = line.split('|')
    if (!ja || !ko) throw new Error(`Incomplete sentence: ${line}`)
    return { level, ja, ko, topic: 'daily-scenes' }
  })
}

export function buildSentenceContent(): { items: StudyItem[]; lessons: Lesson[] } {
  const all: Reading[] = [
    ...grammarExamples().map((example) => ({ ...example, topic: 'grammar-in-context' })),
    ...scenes(n5Scenes, 'N5'), ...scenes(n4Scenes, 'N4')
  ]
  const seen = new Set<string>()
  const readings = all.filter(({ ja }) => {
    if (seen.has(ja)) return false
    seen.add(ja)
    return true
  })
  const items: StudyItem[] = []
  const lessons: Lesson[] = []
  for (const level of ['N5', 'N4'] as const) {
    for (const topic of ['grammar-in-context', 'daily-scenes']) {
      const group = readings.filter((reading) => reading.level === level && reading.topic === topic)
      const meanings = [...new Set(group.map((reading) => reading.ko))]
      group.forEach((reading, index) => {
        const lessonNumber = Math.floor(index / 10) + 1
        const lessonId = `sentence-${level.toLowerCase()}-${topic}-${lessonNumber}`
        if (index % 10 === 0) lessons.push({
          id: lessonId, chapter: 'sentences', level, topicId: topic,
          title: `${level} ${topic === 'daily-scenes' ? '생활 문장' : '문법 적용'} ${lessonNumber}`, estimatedMinutes: 12, itemIds: []
        })
        const id = `sentence-created-${level.toLowerCase()}-${topic}-${String(index + 1).padStart(3, '0')}`
        lessons[lessons.length - 1].itemIds.push(id)
        const distractors = meanings.filter((meaning) => meaning !== reading.ko)
        items.push({
          id, chapter: 'sentences', level, topicId: topic, lessonId,
          kind: index % 5 === 0 ? 'listen' : 'choice',
          prompt: `「${reading.ja}」의 뜻은 무엇인가요?`,
          options: [reading.ko, ...[0, 1, 2].map((offset) => distractors[(index * 11 + offset * 17) % distractors.length])],
          answer: reading.ko,
          explanation: `「${reading.ja}」는 ‘${reading.ko}’라는 뜻입니다.`,
          speechText: reading.ja
        })
      })
    }
  }
  return { items, lessons }
}
