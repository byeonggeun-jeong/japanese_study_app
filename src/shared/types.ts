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
  placementTier?: 1 | 2
}

export interface PlacementAnswer {
  itemId: string
  chapter: Chapter
  tier: 1 | 2
  correct: boolean
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

export interface ReviewState {
  dueDate: string
  intervalDays: number
  successes: number
}

export interface Progress {
  schemaVersion: 1
  placement?: {
    starts: Partial<Record<Chapter, string>>
    completedAt: string
  }
  answers: Record<string, { correct: number; incorrect: number; lastAnsweredAt: string }>
  review: Record<string, ReviewState>
  completedDates: string[]
  activeSet?: {
    id: string
    source: 'daily' | 'free'
    itemIds: string[]
    currentIndex: number
  }
}

export interface StudyAppAPI {
  loadProgress(): Promise<Progress>
  saveProgress(progress: Progress): Promise<void>
}
