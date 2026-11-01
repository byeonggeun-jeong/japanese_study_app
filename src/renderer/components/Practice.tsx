import { useState } from 'react'
import { recordAnswer } from '../../learning/review'
import { finishSet } from '../../learning/scheduler'
import type { Progress, StudyContent, StudyItem, StudySet } from '../../shared/types'
import { ArrangeQuestion } from './ArrangeQuestion'
import { ChoiceQuestion } from './ChoiceQuestion'
import { Completion } from './Completion'
import { InputQuestion } from './InputQuestion'

export function Practice({ set, content, progress, today, onSave, onFinish, onSpeak }: {
  set: StudySet
  content: StudyContent
  progress: Progress
  today: string
  onSave(progress: Progress): Promise<void>
  onFinish(progress: Progress): void
  onSpeak?(text: string): void
}) {
  const [index, setIndex] = useState(progress.activeSet?.id === set.id ? progress.activeSet.currentIndex : 0)
  const [feedback, setFeedback] = useState<{ item: StudyItem; correct: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const item = content.items.find((entry) => entry.id === set.itemIds[index])

  async function answer(value: string): Promise<void> {
    if (!item || busy || feedback) return
    const correct = value.trim() === item.answer.trim()
    const updated = recordAnswer(progress, item.id, correct, today)
    updated.activeSet = { id: set.id, source: set.source, itemIds: set.itemIds, currentIndex: index + 1 }
    setBusy(true)
    setError('')
    try {
      await onSave(updated)
      setFeedback({ item, correct })
    } catch {
      setError('답변을 저장하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  async function finish(): Promise<void> {
    if (busy) return
    setBusy(true)
    setError('')
    const updated = finishSet(progress, set, today)
    try {
      await onSave(updated)
      onFinish(updated)
    } catch {
      setError('학습 기록을 저장하지 못했습니다. 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  if (set.itemIds.length === 0) return <p>이 범위에는 아직 문제가 없습니다.</p>
  if (index >= set.itemIds.length) return <Completion set={set} onFinish={() => { void finish() }} busy={busy} />
  if (!item) return <p>문제를 찾지 못했습니다. 학습을 다시 시작해 주세요.</p>

  return (
    <section className="practice">
      <div className="practice-progress">
        <span>{index + 1} / {set.itemIds.length}</span>
        <progress value={index} max={set.itemIds.length} aria-label="학습 진행률" />
      </div>
      <div className="question-card">
        <p className="eyebrow">{item.chapter === 'kana' ? '문자' : item.chapter === 'grammar' ? '문법' : item.chapter === 'vocabulary' ? '단어' : '문장'}</p>
        <h2>{item.prompt}</h2>
        {!feedback && !busy && (item.kind === 'choice' || item.kind === 'listen') &&
          <ChoiceQuestion options={item.options ?? []} onAnswer={(value) => { void answer(value) }} speechText={item.speechText} onSpeak={onSpeak} />}
        {!feedback && !busy && item.kind === 'arrange' && <ArrangeQuestion options={item.options ?? []} onAnswer={(value) => { void answer(value) }} />}
        {!feedback && !busy && item.kind === 'input' && <InputQuestion onAnswer={(value) => { void answer(value) }} />}
        {busy && <p role="status">저장 중...</p>}
        {feedback && <div className={`answer-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} role="status">
          <h3>{feedback.correct ? '정답이에요' : '다시 익혀 볼게요'}</h3>
          {!feedback.correct && <p>정답: {feedback.item.answer}</p>}
          <p>{feedback.item.explanation}</p>
          <button type="button" className="primary-button" onClick={() => { setFeedback(null); setIndex(index + 1) }}>
            {index + 1 === set.itemIds.length ? '결과 보기' : '다음 문제'}
          </button>
        </div>}
        {error && <p className="error-message" role="alert">{error}</p>}
      </div>
    </section>
  )
}
