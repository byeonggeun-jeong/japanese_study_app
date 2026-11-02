import { useEffect, useRef, useState } from 'react'
import { recordAnswer } from '../../learning/review'
import { finishSet } from '../../learning/scheduler'
import { orderOptions } from '../../learning/options'
import type { Progress, StudyContent, StudyItem, StudySet } from '../../shared/types'
import { ArrangeQuestion } from './ArrangeQuestion'
import { ChoiceQuestion } from './ChoiceQuestion'
import { Completion } from './Completion'
import { InputQuestion } from './InputQuestion'

export function Practice({ set, content, progress, today, getToday, onSave, onFinish, onSpeak }: {
  set: StudySet
  content: StudyContent
  progress: Progress
  today: string
  getToday?(): string
  onSave(progress: Progress): Promise<void>
  onFinish(progress: Progress): void
  onSpeak?(text: string): void
}) {
  const [index, setIndex] = useState(progress.activeSet?.id === set.id ? progress.activeSet.currentIndex : 0)
  const [feedback, setFeedback] = useState<{ item: StudyItem; correct: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [shownGuideFor, setShownGuideFor] = useState<string | null>(null)
  const [revealedSourceFor, setRevealedSourceFor] = useState<string | null>(null)
  const item = content.items.find((entry) => entry.id === set.itemIds[index])
  const questionHeading = useRef<HTMLHeadingElement>(null)
  const feedbackAction = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (feedback) feedbackAction.current?.focus()
    else questionHeading.current?.focus()
  }, [item?.id, feedback, shownGuideFor])

  async function answer(value: string): Promise<void> {
    if (!item || busy || feedback) return
    const correct = value.trim() === item.answer.trim()
    const updated = recordAnswer(progress, item.id, correct, getToday?.() ?? today)
    updated.activeSet = { id: set.id, source: set.source, itemIds: set.itemIds, chapter: set.chapter, range: set.range, currentIndex: index + 1 }
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
    const updated = finishSet(progress, set, getToday?.() ?? today)
    try {
      await onSave(updated)
      onFinish(updated)
    } catch {
      setError('학습 기록을 저장하지 못했습니다. 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  if (set.itemIds.length === 0) return <p>이 범위에는 아직 문제가 없습니다.</p>
  if (index >= set.itemIds.length) return <>
    <Completion set={set} items={set.itemIds.flatMap((id) => content.items.filter((item) => item.id === id))} progress={progress} onFinish={() => { void finish() }} busy={busy} />
    {error && <p className="error-message" role="alert">{error}</p>}
  </>
  if (!item) return <p>문제를 찾지 못했습니다. 학습을 다시 시작해 주세요.</p>

  if (item.guide && !progress.answers[item.id] && shownGuideFor !== item.id) return (
    <section className="practice">
      <article className="question-card guide-card">
        <p className="question-meta">학습 · {index + 1} / {set.itemIds.length}</p>
        <h2 ref={questionHeading} tabIndex={-1}>{item.guide.title}</h2>
        <p>{item.guide.text}</p>
        {item.guide.examples.map((example) => <div className="guide-example" key={example.ja}>
          <p lang="ja">{example.ja}</p>{example.ko && <p>{example.ko}</p>}
        </div>)}
        {onSpeak && item.speechText && <button className="secondary-button" type="button" onClick={() => onSpeak(item.speechText!)}>발음 듣기</button>}
        <button type="button" className="primary-button" onClick={() => setShownGuideFor(item.id)}>문제 풀기</button>
      </article>
    </section>
  )
  const options = orderOptions(item.options ?? [], `${set.id}:${item.id}`)

  return (
    <section className="practice">
      <div className="practice-progress">
        <span>{index + 1} / {set.itemIds.length}</span>
        <progress value={index} max={set.itemIds.length} aria-label="학습 진행률" />
      </div>
      <div className="question-card">
        <p className="question-meta">{item.chapter === 'kana' ? '문자' : item.chapter === 'grammar' ? '문법' : item.chapter === 'vocabulary' ? '단어' : '문장'}</p>
        <h2 ref={questionHeading} tabIndex={-1}>{item.kind === 'listen' && onSpeak ? '문장을 듣고 뜻을 고르세요' : item.prompt}</h2>
        {item.kind === 'listen' && onSpeak && !feedback && <div className="listening-source">
          {revealedSourceFor === item.id ? <p lang="ja">{item.speechText}</p> :
            <button type="button" className="text-button" onClick={() => setRevealedSourceFor(item.id)}>원문 보기</button>}
        </div>}
        {!feedback && !busy && (item.kind === 'choice' || item.kind === 'listen') &&
          <ChoiceQuestion options={options} onAnswer={(value) => { void answer(value) }} speechText={item.speechText} onSpeak={onSpeak} />}
        {!feedback && !busy && item.kind === 'arrange' && <ArrangeQuestion key={item.id} options={options} onAnswer={(value) => { void answer(value) }} />}
        {!feedback && !busy && item.kind === 'input' && <InputQuestion onAnswer={(value) => { void answer(value) }} />}
        {busy && <p role="status">저장 중...</p>}
        {feedback && <div className={`answer-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} role="status">
          <h3>{feedback.correct ? '정답' : '정답 확인'}</h3>
          {item.kind === 'listen' && onSpeak && <p lang="ja">{item.speechText}</p>}
          {!feedback.correct && <p>정답: {feedback.item.answer}</p>}
          <p>{feedback.item.explanation}</p>
          <button ref={feedbackAction} type="button" className="primary-button" onClick={() => { setFeedback(null); setIndex(index + 1) }}>
            {index + 1 === set.itemIds.length ? '결과 보기' : '다음 문제'}
          </button>
        </div>}
        {error && <p className="error-message" role="alert">{error}</p>}
      </div>
    </section>
  )
}
