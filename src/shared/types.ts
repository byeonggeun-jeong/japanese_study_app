export type Chapter = 'kana' | 'grammar' | 'vocabulary' | 'sentences'
export type StudyLevel = 'kana' | 'N5' | 'N4'
export type QuestionKind = 'choice' | 'input' | 'arrange' | 'listen'

export interface StudyItem {
  id: string
  chapter: Chapter
  level: StudyLevel
  topicId: string
  lessonId: string
  kind: QuestionKind
  prompt: string
  options?: string[]
  answer: string
  explanation: string
  speechText?: string
}

export interface Lesson {
  id: string
  chapter: Chapter
  level: StudyLevel
  topicId: string
  title: string
  estimatedMinutes: number
  itemIds: string[]
}

export interface StudyContent {
  items: StudyItem[]
  lessons: Lesson[]
}
