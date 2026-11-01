// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Practice } from '../src/renderer/components/Practice'
import { ArrangeQuestion } from '../src/renderer/components/ArrangeQuestion'
import { InputQuestion } from '../src/renderer/components/InputQuestion'
import { createEmptyProgress } from '../src/main/progressStore'
import type { Progress, StudyContent, StudySet } from '../src/shared/types'

const content: StudyContent = {
  items: [
    { id: 'q1', chapter: 'kana', level: 'kana', topicId: 'a', lessonId: 'l1', kind: 'choice', prompt: 'あ의 읽기는?', options: ['아', '이'], answer: '아', explanation: 'あ는 아입니다.' },
    { id: 'q2', chapter: 'kana', level: 'kana', topicId: 'i', lessonId: 'l1', kind: 'choice', prompt: 'い의 읽기는?', options: ['이', '아'], answer: '이', explanation: 'い는 이입니다.' }
  ],
  lessons: []
}
const set: StudySet = { id: 'daily-2026-11-01', source: 'daily', itemIds: ['q1', 'q2'], estimatedMinutes: 2 }

afterEach(cleanup)

describe('practice flow', () => {
  it('varies the answer position instead of exposing the first source option', () => {
    const positions = new Set<number>()
    for (let index = 0; index < 24; index++) {
      const item = { ...content.items[0], id: `question-${index}`, options: ['아', '이', '우', '에'] }
      const view = render(<Practice set={{ ...set, itemIds: [item.id] }} content={{ items: [item], lessons: [] }}
        progress={createEmptyProgress()} today="2026-11-01" onSave={async () => {}} onFinish={() => {}} />)
      const buttons = within(screen.getByRole('group', { name: '답 선택' })).getAllByRole('button')
      positions.add(buttons.findIndex((button) => button.textContent === '아'))
      view.unmount()
    }
    expect(positions.size).toBe(4)
  })

  it('teaches a new item before asking and skips the guide on review', async () => {
    const user = userEvent.setup()
    const item = { ...content.items[0], guide: { title: 'あ 익히기', text: 'あ는 아에 가까운 소리입니다.', examples: [{ ja: 'あめ', ko: '비·사탕' }] } }
    const one = { ...set, itemIds: [item.id] }
    const props = { set: one, content: { items: [item], lessons: [] }, today: '2026-11-01', onSave: async () => {}, onFinish: () => {} }
    const view = render(<Practice {...props} progress={createEmptyProgress()} />)
    expect(screen.getByRole('heading', { name: 'あ 익히기' })).toBeTruthy()
    expect(screen.queryByRole('group', { name: '답 선택' })).toBeNull()
    await user.click(screen.getByRole('button', { name: '연습해 보기' }))
    expect(screen.getByRole('group', { name: '답 선택' })).toBeTruthy()
    view.unmount()
    render(<Practice {...props} progress={{ ...createEmptyProgress(), answers: { q1: { correct: 1, incorrect: 0, lastAnsweredAt: '2026-10-31' } } }} />)
    expect(screen.getByRole('group', { name: '답 선택' })).toBeTruthy()
  })

  it('shows a save failure on completion and lets the learner retry', async () => {
    const user = userEvent.setup()
    const progress = { ...createEmptyProgress(), activeSet: { id: set.id, source: 'daily' as const, itemIds: set.itemIds, currentIndex: 2 } }
    let attempts = 0
    render(<Practice set={set} content={content} progress={progress} today="2026-11-01"
      onSave={async () => { if (++attempts === 1) throw new Error('disk unavailable') }} onFinish={() => {}} />)
    await user.click(screen.getByRole('button', { name: '학습 마치기' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '학습 마치기' }))
    expect(attempts).toBe(2)
  })

  it('records the actual finish date even if the displayed date is older', async () => {
    const user = userEvent.setup()
    let saved = createEmptyProgress()
    const progress = { ...saved, activeSet: { id: set.id, source: 'daily' as const, itemIds: set.itemIds, currentIndex: 2 } }
    render(<Practice set={set} content={content} progress={progress} today="2026-11-01" getToday={() => '2026-11-02'}
      onSave={async (next) => { saved = next }} onFinish={() => {}} />)
    await user.click(screen.getByRole('button', { name: '학습 마치기' }))
    expect(saved.completedDates).toEqual(['2026-11-02'])
  })
  it('records an answer, explains it, and moves to the next question', async () => {
    const user = userEvent.setup()
    let saved = createEmptyProgress()
    function Harness() {
      const [progress, setProgress] = useState<Progress>(createEmptyProgress())
      return <Practice set={set} content={content} progress={progress} today="2026-11-01"
        onSave={async (next) => { saved = next; setProgress(next) }} onFinish={() => {}} />
    }
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '아' }))
    expect(await screen.findByText('정답이에요')).toBeTruthy()
    expect(screen.getByText('あ는 아입니다.')).toBeTruthy()
    expect(saved.answers.q1.correct).toBe(1)
    expect(saved.activeSet?.currentIndex).toBe(1)
    await user.click(screen.getByRole('button', { name: '다음 문제' }))
    expect(screen.getByText('い의 읽기는?')).toBeTruthy()
  })

  it('resumes from the saved index after a reload', () => {
    const progress: Progress = { ...createEmptyProgress(), activeSet: { id: set.id, source: 'daily', itemIds: set.itemIds, currentIndex: 1 } }
    render(<Practice set={set} content={content} progress={progress} today="2026-11-01" onSave={async () => {}} onFinish={() => {}} />)
    expect(screen.getByText('い의 읽기는?')).toBeTruthy()
    expect(screen.queryByText('あ의 읽기는?')).toBeNull()
  })

  it('finishes by keyboard and counts the local date once', async () => {
    const user = userEvent.setup()
    let saved = createEmptyProgress()
    let finished: Progress | undefined
    const oneQuestionSet = { ...set, itemIds: ['q1'] }
    function Harness() {
      const [progress, setProgress] = useState<Progress>(createEmptyProgress())
      return <Practice set={oneQuestionSet} content={content} progress={progress} today="2026-11-01"
        onSave={async (next) => { saved = next; setProgress(next) }} onFinish={(next) => { finished = next }} />
    }
    render(<Harness />)
    screen.getByRole('button', { name: '아' }).focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByText('정답이에요')).toBeTruthy()
    screen.getByRole('button', { name: '결과 보기' }).focus()
    await user.keyboard('{Enter}')
    screen.getByRole('button', { name: '학습 마치기' }).focus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(finished?.completedDates).toEqual(['2026-11-01']))
    expect(saved.activeSet).toBeUndefined()
  })

  it('submits a sentence assembled from tokens', async () => {
    const user = userEvent.setup()
    let answer = ''
    render(<ArrangeQuestion options={['水', 'を', 'ください']} onAnswer={(value) => { answer = value }} />)
    for (const token of ['水', 'を', 'ください']) await user.click(screen.getByRole('button', { name: token }))
    await user.click(screen.getByRole('button', { name: '확인' }))
    expect(answer).toBe('水をください')
  })

  it('submits typed Japanese with Enter', async () => {
    const user = userEvent.setup()
    let answer = ''
    render(<InputQuestion onAnswer={(value) => { answer = value }} />)
    await user.type(screen.getByRole('textbox', { name: '답 입력' }), 'ありがとう{Enter}')
    expect(answer).toBe('ありがとう')
  })
})
