export type ValidationIssue = { code: string; id: string }

const chapters = ['kana', 'grammar', 'vocabulary', 'sentences']
const levels = ['kana', 'N5', 'N4']
const kinds = ['choice', 'input', 'arrange', 'listen']

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function nonempty(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateContent(items: unknown[], lessons: unknown[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const itemIds = new Set<string>()
  const itemsById = new Map<string, Record<string, unknown>>()
  const lessonIds = new Set<string>()

  for (const raw of items) {
    const item = record(raw)
    const id = typeof item.id === 'string' ? item.id : ''
    if (!nonempty(id)) issues.push({ code: 'missing-item-id', id })
    else if (itemIds.has(id)) issues.push({ code: 'duplicate-item-id', id })
    itemIds.add(id)
    itemsById.set(id, item)

    if (!chapters.includes(String(item.chapter))) issues.push({ code: 'invalid-chapter', id })
    if (!levels.includes(String(item.level))) issues.push({ code: 'invalid-level', id })
    if (!nonempty(item.topicId) || !nonempty(item.lessonId)) issues.push({ code: 'missing-item-link', id })
    if (!nonempty(item.prompt)) issues.push({ code: 'missing-prompt', id })
    if (!kinds.includes(String(item.kind))) issues.push({ code: 'invalid-kind', id })
    if (!nonempty(item.answer)) issues.push({ code: 'missing-answer', id })
    if (!nonempty(item.explanation)) issues.push({ code: 'missing-explanation', id })

    if (item.kind === 'choice' || item.kind === 'listen') {
      if (!Array.isArray(item.options) || !item.options.includes(item.answer)) {
        issues.push({ code: 'answer-not-in-options', id })
      }
    }
    if (item.kind === 'listen' && !nonempty(item.speechText)) {
      issues.push({ code: 'missing-speech-text', id })
    }
  }

  for (const raw of lessons) {
    const lesson = record(raw)
    const id = typeof lesson.id === 'string' ? lesson.id : ''
    if (!nonempty(id)) issues.push({ code: 'missing-lesson-id', id })
    else if (lessonIds.has(id)) issues.push({ code: 'duplicate-lesson-id', id })
    lessonIds.add(id)
    if (!chapters.includes(String(lesson.chapter))) issues.push({ code: 'invalid-lesson-chapter', id })
    if (!levels.includes(String(lesson.level))) issues.push({ code: 'invalid-lesson-level', id })
    if (!nonempty(lesson.topicId) || !nonempty(lesson.title)) issues.push({ code: 'missing-lesson-label', id })
    if (typeof lesson.estimatedMinutes !== 'number' || lesson.estimatedMinutes <= 0) issues.push({ code: 'invalid-duration', id })
    if (!Array.isArray(lesson.itemIds) || lesson.itemIds.length === 0) {
      issues.push({ code: 'empty-lesson', id })
    } else {
      for (const itemId of lesson.itemIds) {
        if (!itemIds.has(itemId)) issues.push({ code: 'missing-lesson-item', id })
        else {
          const item = itemsById.get(itemId)!
          if (item.lessonId !== id || item.chapter !== lesson.chapter || item.level !== lesson.level) {
            issues.push({ code: 'lesson-item-mismatch', id })
          }
        }
      }
    }
  }

  return issues
}
