// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
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
