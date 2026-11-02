import type { StudyAppAPI } from '../shared/types'

let etag = ''

export class ProgressConflictError extends Error {
  constructor() { super('다른 창에서 기록이 변경됐습니다. 새로고침 후 이어서 학습해 주세요.') }
}

export function saveErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ProgressConflictError ? error.message : fallback
}

export const studyApi: StudyAppAPI = {
  async loadProgress() {
    const response = await fetch('/api/progress', { cache: 'no-store' })
    if (!response.ok) throw new Error('학습 기록을 불러오지 못했습니다.')
    etag = response.headers.get('etag') ?? ''
    return response.json()
  },
  async saveProgress(progress) {
    const response = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'If-Match': etag },
      body: JSON.stringify(progress)
    })
    if (response.status === 409) throw new ProgressConflictError()
    if (!response.ok) throw new Error('학습 기록을 저장하지 못했습니다. 시작 창이 열려 있는지 확인해 주세요.')
    etag = response.headers.get('etag') ?? ''
  }
}
