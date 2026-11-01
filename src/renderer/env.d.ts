import type { StudyAppAPI } from '../shared/types'

declare global {
  interface Window {
    studyApp: StudyAppAPI
  }
}
