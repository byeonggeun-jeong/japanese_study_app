// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '../src/renderer/App'
import { createEmptyProgress } from '../src/main/progressStore'
import type { Progress, StudyAppAPI } from '../src/shared/types'

afterEach(cleanup)

function placedProgress(): Progress {
  return { ...createEmptyProgress(), placement: {
    starts: { kana: 'hiragana-basic', grammar: 'N5', vocabulary: 'N5', sentences: 'N5' },
    completedAt: '2026-10-31T10:00:00.000Z'
  } }
}

function appWithProgress(initial: Progress) {
  let saved = initial
  const api: StudyAppAPI = {
    loadProgress: async () => saved,
    saveProgress: async (next) => { saved = next }
  }
  render(<App api={api} today="2026-11-01" />)
  return { saved: () => saved }
}

describe('app navigation', () => {
  it('opens placement on first launch', async () => {
    appWithProgress(createEmptyProgress())
    expect(await screen.findByRole('heading', { name: '시작점 찾기' })).toBeTruthy()
  })

  it('starts the guided set from home and returns without losing it', async () => {
    const user = userEvent.setup()
    const app = appWithProgress(placedProgress())
    expect(await screen.findByRole('heading', { name: '오늘의 학습' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '오늘의 학습 시작' }))
    expect(screen.getByRole('heading', { name: '오늘의 학습 진행 중' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '학습 나가기' }))
    expect(screen.getByRole('button', { name: '이어 풀기' })).toBeTruthy()
    expect(app.saved().activeSet?.source).toBe('daily')
  })

  it('routes from free practice to a chosen chapter and back home', async () => {
    const user = userEvent.setup()
    appWithProgress(placedProgress())
    await screen.findByRole('heading', { name: '오늘의 학습' })
    await user.click(within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('button', { name: '자유 연습' }))
    expect(screen.getByRole('heading', { name: '챕터별 연습' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '문자 연습 시작' }))
    expect(screen.getByRole('heading', { name: '문자 자유 연습' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '학습 나가기' }))
    await user.click(screen.getByRole('button', { name: '홈' }))
    expect(screen.getByRole('heading', { name: '오늘의 학습' })).toBeTruthy()
  })

  it('shows the current streak and progress screen', async () => {
    const user = userEvent.setup()
    appWithProgress({ ...placedProgress(), completedDates: ['2026-10-31', '2026-11-01'] })
    expect(await screen.findByText('2일 연속')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '진도' }))
    expect(screen.getByRole('heading', { name: '학습 기록' })).toBeTruthy()
    expect(screen.getByText('총 2일 학습')).toBeTruthy()
  })

  it('resumes a saved set at its saved question index', async () => {
    const user = userEvent.setup()
    const progress: Progress = { ...placedProgress(), activeSet: {
      id: 'daily-2026-11-01', source: 'daily', itemIds: ['kana-a-01', 'kana-i-01'], currentIndex: 1
    } }
    appWithProgress(progress)
    await user.click(await screen.findByRole('button', { name: '이어 풀기' }))
    expect(screen.getByText('い의 읽기는 무엇인가요?')).toBeTruthy()
  })

  it('offers another kana batch after finishing free practice', async () => {
    const user = userEvent.setup()
    const progress: Progress = { ...placedProgress(), activeSet: {
      id: 'free-kana-1', source: 'free', itemIds: ['kana-a-01', 'kana-i-01', 'kana-kya-01'], currentIndex: 3
    } }
    appWithProgress(progress)
    await user.click(await screen.findByRole('button', { name: '이어 풀기' }))
    await user.click(screen.getByRole('button', { name: '학습 마치기' }))
    await user.click(await screen.findByRole('button', { name: '계속 문자 연습' }))
    expect(screen.getByRole('heading', { name: '문자 자유 연습' })).toBeTruthy()
  })
})
