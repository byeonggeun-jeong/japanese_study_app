// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../src/renderer/App'
import { createEmptyProgress } from '../src/main/progressStore'
import type { Progress, StudyAppAPI } from '../src/shared/types'

afterEach(() => { cleanup(); vi.useRealTimers() })

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
  it('updates the local study date when the app stays open past midnight', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 1, 23, 59, 40))
    render(<App api={{ loadProgress: async () => placedProgress(), saveProgress: async () => {} }} />)
    await act(async () => {})
    expect(screen.getByText('2026.11.01')).toBeTruthy()
    await act(async () => { vi.advanceTimersByTime(60_000) })
    expect(screen.getByText('2026.11.02')).toBeTruthy()
  })

  it('shows progress separately for each chapter', async () => {
    const user = userEvent.setup()
    appWithProgress({ ...placedProgress(), answers: { 'kana-a-01': { correct: 2, incorrect: 0, lastAnsweredAt: '2026-11-01' } } })
    await user.click(await screen.findByRole('button', { name: '진도' }))
    expect(screen.getByRole('progressbar', { name: '문자 학습 진도' }).getAttribute('value')).toBe('1')
    expect(screen.getByRole('progressbar', { name: '문법 학습 진도' }).getAttribute('value')).toBe('0')
  })

  it('offers level and script ranges for free study', async () => {
    const user = userEvent.setup()
    appWithProgress(placedProgress())
    await screen.findByRole('heading', { name: '오늘의 학습' })
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: '자유 연습' }))
    await user.selectOptions(screen.getByRole('combobox', { name: '문자 범위' }), 'katakana')
    await user.click(screen.getByRole('button', { name: '문자 연습 시작' }))
    expect(screen.getByRole('heading', { name: '문자 자유 연습' })).toBeTruthy()
  })
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

  it('keeps text study available when no Japanese voice is installed', async () => {
    const user = userEvent.setup()
    appWithProgress(placedProgress())
    await user.click(await screen.findByRole('button', { name: '설정' }))
    expect(screen.getByText(/음성이 없어도 텍스트 문제는 계속 풀 수 있습니다/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '홈' }))
    expect(screen.getByRole('button', { name: '오늘의 학습 시작' })).toBeTruthy()
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


it('shows the resumed batch size and progress instead of the unrelated daily set', async () => {
  const progress = placedProgress()
  progress.activeSet = { id: 'free-kana-resume', source: 'free', chapter: 'kana', itemIds: ['kana-a-01', 'kana-i-01'], currentIndex: 1 }
  render(<App api={{ loadProgress: async () => progress, saveProgress: async () => {} }} today="2026-11-02" />)
  expect(await screen.findByText('1 / 2문제 완료')).toBeTruthy()
  expect(screen.getByRole('heading', { name: '진행 중인 학습' })).toBeTruthy()
  expect(screen.getByRole('button', { name: '이어 풀기' })).toBeTruthy()
})


it('moves focus to the new page and identifies the active navigation item', async () => {
  const user = userEvent.setup()
  appWithProgress(placedProgress())
  await screen.findByRole('heading', { name: '오늘의 학습' })
  await user.click(screen.getByRole('button', { name: '설정' }))
  expect(screen.getByRole('heading', { name: '설정' })).toBe(document.activeElement)
  expect(screen.getByRole('button', { name: '설정' }).getAttribute('aria-current')).toBe('page')
})
