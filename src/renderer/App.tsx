import { useEffect, useState } from 'react'
import { loadContent } from '../learning/content'
import { applyPlacement } from '../learning/placement'
import { buildDailySet, buildFreeSet } from '../learning/scheduler'
import type { Chapter, Progress, StudyAppAPI, StudyRange, StudySet } from '../shared/types'
import { ChapterList } from './components/ChapterList'
import { Home } from './components/Home'
import { Placement } from './components/Placement'
import { Practice } from './components/Practice'
import { ProgressView } from './components/Progress'
import { Settings } from './components/Settings'
import { speakJapanese, watchJapaneseVoice } from './speech'

const content = loadContent()
type Route = 'loading' | 'placement' | 'home' | 'chapters' | 'progress' | 'settings' | 'practice' | 'kana-complete'

function localDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function App({ api = window.studyApp, today: fixedDate }: { api?: StudyAppAPI; today?: string }) {
  const [calendarDate, setCalendarDate] = useState(localDate)
  const today = fixedDate ?? calendarDate
  const [progress, setProgress] = useState<Progress | null>(null)
  const [route, setRoute] = useState<Route>('loading')
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [error, setError] = useState('')
  const [japaneseVoiceAvailable, setJapaneseVoiceAvailable] = useState(false)

  useEffect(() => watchJapaneseVoice(setJapaneseVoiceAvailable), [])
  useEffect(() => {
    if (fixedDate) return
    const update = () => setCalendarDate(localDate())
    const timer = window.setInterval(update, 30_000)
    window.addEventListener('focus', update)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update) }
  }, [fixedDate])

  useEffect(() => {
    let active = true
    api.loadProgress().then((loaded) => {
      if (!active) return
      setProgress(loaded)
      setRoute(loaded.placement ? 'home' : 'placement')
    }).catch(() => { if (active) setError('학습 기록을 불러오지 못했습니다. 앱을 다시 시작해 주세요.') })
    return () => { active = false }
  }, [api])

  async function save(next: Progress): Promise<void> {
    await api.saveProgress(next)
    setProgress(next)
    if (!fixedDate) setCalendarDate(localDate())
  }

  async function start(set: StudySet): Promise<void> {
    if (!progress || set.itemIds.length === 0) return
    const next: Progress = { ...progress, activeSet: { id: set.id, source: set.source, itemIds: set.itemIds, chapter: set.chapter, range: set.range, currentIndex: 0 } }
    try {
      await save(next)
      setStudySet(set)
      setRoute('practice')
      setError('')
    } catch {
      setError('학습을 시작할 수 없습니다. 기록 저장을 확인해 주세요.')
    }
  }

  function resume(): void {
    if (!progress?.activeSet) return
    const active = progress.activeSet
    setStudySet({ id: active.id, source: active.source, chapter: active.chapter, range: active.range, itemIds: active.itemIds, estimatedMinutes: active.itemIds.length })
    setRoute('practice')
  }

  function startFree(chapter: Chapter, range: StudyRange = 'all'): void {
    if (progress?.activeSet) {
      setError('진행 중인 학습을 먼저 마쳐 주세요. 이어 풀기로 돌아갈 수 있습니다.')
      setRoute('home')
      return
    }
    void start(buildFreeSet(content, chapter, Date.now(), range))
  }

  if (error && !progress) return <main className="load-error" role="alert">{error}</main>
  if (!progress || route === 'loading') return <main className="loading-screen" role="status">학습 기록을 불러오는 중...</main>

  const dailySet = buildDailySet(content, progress, today, Number(today.replaceAll('-', '')))
  const freeChapter = studySet?.chapter ?? studySet?.id.split('-')[1] as Chapter | undefined
  const practiceTitle = studySet?.source === 'daily' ? '오늘의 학습 진행 중' : `${freeChapter === 'kana' ? '문자' : freeChapter === 'grammar' ? '문법' : freeChapter === 'vocabulary' ? '단어' : '문장'} 자유 연습`

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">あ</span><span>일본어공부</span></div>
        <p className="sidebar-caption">하루의 작은 공부가 쌓이는 곳</p>
        {progress.placement && <nav aria-label="주요 메뉴">
          <button type="button" className={route === 'home' ? 'active' : ''} onClick={() => setRoute('home')}>홈</button>
          <button type="button" className={route === 'chapters' ? 'active' : ''} onClick={() => setRoute('chapters')}>자유 연습</button>
          <button type="button" className={route === 'progress' ? 'active' : ''} onClick={() => setRoute('progress')}>진도</button>
          <button type="button" className={route === 'settings' ? 'active' : ''} onClick={() => setRoute('settings')}>설정</button>
        </nav>}
        <div className="sidebar-footer">기초부터 N4까지<br />오늘도 내 속도로</div>
      </aside>
      <main className="main-content">
        {error && <div className="app-error" role="alert">{error}</div>}
        {route === 'placement' && <Placement items={content.items} onComplete={(result) => {
          void save(applyPlacement(progress, result, new Date().toISOString())).then(() => setRoute('home'))
            .catch(() => setError('진단 결과를 저장하지 못했습니다. 다시 시도해 주세요.'))
        }} />}
        {route === 'home' && <Home progress={progress} today={today} dailySet={dailySet}
          onStart={() => { void start(dailySet) }} onResume={resume} onFree={() => setRoute('chapters')} />}
        {route === 'chapters' && <ChapterList onStart={startFree} />}
        {route === 'progress' && <ProgressView progress={progress} today={today} content={content} />}
        {route === 'settings' && <Settings onRedoPlacement={() => setRoute('placement')} japaneseVoiceAvailable={japaneseVoiceAvailable} />}
        {route === 'practice' && studySet && <div className="practice-page">
          <div className="practice-toolbar"><button type="button" className="text-button" onClick={() => setRoute('home')}>학습 나가기</button><span>언제든 다시 이어 풀 수 있어요</span></div>
          <h1 className="practice-title">{practiceTitle}</h1>
          <Practice key={studySet.id} set={studySet} content={content} progress={progress} today={today} getToday={() => fixedDate ?? localDate()}
            onSave={save} onFinish={() => setRoute(studySet.source === 'free' && freeChapter === 'kana' ? 'kana-complete' : 'home')}
            onSpeak={japaneseVoiceAvailable ? (text) => { speakJapanese(text) } : undefined} />
        </div>}
        {route === 'kana-complete' && <div className="continue-page">
          <div className="completion-card"><p className="eyebrow">문자 반복 학습</p><h1>한 묶음을 끝냈어요</h1><p>원하면 다음 묶음도 바로 이어갈 수 있습니다.</p>
            <button type="button" className="primary-button" onClick={() => startFree('kana', studySet?.range ?? 'all')}>계속 문자 연습</button>
            <button type="button" className="secondary-button" onClick={() => setRoute('home')}>홈으로</button>
          </div>
        </div>}
      </main>
    </div>
  )
}
