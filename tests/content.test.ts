import { describe, expect, it } from 'vitest'
import { validateContent } from '../src/learning/validateContent'
import { loadContent } from '../src/learning/content'
import lexicon from '../src/content/vocabulary/lexicon.json'

const chapters = ['kana', 'grammar', 'vocabulary', 'sentences'] as const

function sampleContent() {
  const items = chapters.map((chapter, index) => ({
    id: `${chapter}-sample`,
    chapter,
    level: chapter === 'kana' ? 'kana' : 'N5',
    topicId: chapter,
    lessonId: `${chapter}-lesson`,
    kind: 'choice',
    prompt: `문제 ${index + 1}`,
    options: ['정답', '오답'],
    answer: '정답',
    explanation: '정답인 이유'
  }))
  const lessons = chapters.map((chapter) => ({
    id: `${chapter}-lesson`,
    chapter,
    level: chapter === 'kana' ? 'kana' : 'N5',
    topicId: chapter,
    title: `${chapter} 시작`,
    estimatedMinutes: 10,
    itemIds: [`${chapter}-sample`]
  }))
  return { items, lessons }
}

describe('learning content', () => {
  it('accepts a valid item in every chapter', () => {
    const { items, lessons } = sampleContent()
    expect(validateContent(items, lessons)).toEqual([])
  })

  it('rejects duplicate item IDs', () => {
    const { items, lessons } = sampleContent()
    expect(validateContent([...items, items[0]], lessons)).toContainEqual(
      expect.objectContaining({ code: 'duplicate-item-id', id: 'kana-sample' })
    )
  })

  it('rejects missing answers and explanations', () => {
    const { items, lessons } = sampleContent()
    items[0].answer = ''
    items[1].explanation = ' '
    expect(validateContent(items, lessons).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['missing-answer', 'missing-explanation'])
    )
  })

  it('rejects choices that cannot be selected as an answer', () => {
    const { items, lessons } = sampleContent()
    items[0].options = ['오답', '다른 오답']
    expect(validateContent(items, lessons)).toContainEqual(
      expect.objectContaining({ code: 'answer-not-in-options', id: 'kana-sample' })
    )
  })

  it('rejects duplicate answer choices', () => {
    const { items, lessons } = sampleContent()
    items[0].options = ['정답', '오답', '오답']
    expect(validateContent(items, lessons)).toContainEqual(
      expect.objectContaining({ code: 'duplicate-options', id: 'kana-sample' })
    )
  })

  it('rejects an unknown question kind', () => {
    const { items, lessons } = sampleContent()
    items[0].kind = 'drawing'
    expect(validateContent(items, lessons)).toContainEqual(
      expect.objectContaining({ code: 'invalid-kind', id: 'kana-sample' })
    )
  })

  it('rejects a lesson that points at a missing item', () => {
    const { items, lessons } = sampleContent()
    lessons[0].itemIds = ['missing-item']
    expect(validateContent(items, lessons)).toContainEqual(
      expect.objectContaining({ code: 'missing-lesson-item', id: 'kana-lesson' })
    )
  })

  it('rejects a lesson containing an item from another level', () => {
    const { items, lessons } = sampleContent()
    items[1].level = 'N4'
    expect(validateContent(items, lessons)).toContainEqual(
      expect.objectContaining({ code: 'lesson-item-mismatch', id: 'grammar-lesson' })
    )
  })

  it('rejects an item without a matching lesson and topic', () => {
    const { items, lessons } = sampleContent()
    items[0].lessonId = 'missing'
    items[1].topicId = 'kana'
    expect(validateContent(items, lessons).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['orphan-item', 'lesson-item-mismatch'])
    )
  })

  it('loads nonempty seed content for all four chapters', () => {
    const { items, lessons } = loadContent()
    expect(new Set(items.map((item) => item.chapter))).toEqual(new Set(chapters))
    expect(lessons.length).toBeGreaterThan(0)
    expect(validateContent(items, lessons)).toEqual([])
  })

  it('covers the agreed N4 preparation inventory', () => {
    const { items, lessons } = loadContent()
    for (const [chapter, minimum] of Object.entries({ vocabulary: 1200, grammar: 100, sentences: 300 })) {
      expect(items.filter((item) => item.chapter === chapter).length, chapter).toBeGreaterThanOrEqual(minimum)
    }
    expect(lessons.length).toBeGreaterThanOrEqual(120)
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length)
    expect(items.every((item) => item.explanation.trim().length > 0)).toBe(true)
    for (const chapter of ['grammar', 'vocabulary', 'sentences'] as const) {
      expect(items.some((item) => item.chapter === chapter && item.level === 'N5')).toBe(true)
      expect(items.some((item) => item.chapter === chapter && item.level === 'N4')).toBe(true)
    }
  })

  it('keeps vocabulary entries distinct and Korean definitions present', () => {
    const pairs = lexicon.map((entry) => `${entry.word}:${entry.reading}`)
    expect(new Set(pairs).size).toBe(pairs.length)
    expect(lexicon.every((entry) => entry.meaning.trim() && !/[A-Za-z]/.test(entry.meaning))).toBe(true)
  })

  it('gives every word a Japanese usage context', () => {
    expect(lexicon.every((entry) => 'context' in entry && typeof entry.context === 'string' && entry.context.trim().length > 0)).toBe(true)
  })

  it('teaches grammar with two examples and words with context', () => {
    const { items } = loadContent()
    expect(items.filter((item) => item.chapter === 'grammar').every((item) => item.guide && item.guide.examples.length >= 2)).toBe(true)
    expect(items.filter((item) => item.chapter === 'vocabulary').every((item) => item.guide && item.guide.examples.length >= 1)).toBe(true)
  })

  it('includes both scripts and special sound practice', () => {
    const kanaTopics = new Set(loadContent().items.filter((item) => item.chapter === 'kana').map((item) => item.topicId))
    for (const script of ['hiragana', 'katakana']) {
      for (const sound of ['basic', 'voiced', 'combined', 'special']) {
        expect(kanaTopics.has(`${script}-${sound}`)).toBe(true)
      }
    }
  })
})
