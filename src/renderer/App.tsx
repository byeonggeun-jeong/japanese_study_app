import { useEffect, useRef, useState } from 'react'
import { loadContent } from '../learning/content'
import { applyPlacement } from '../learning/placement'
import { buildDailySet, buildFreeSet } from '../learning/scheduler'
import type { Chapter, Progress, StudyAppAPI, StudyRange, StudySet } from '../shared/types'
import { ChapterList } from './components/ChapterList'
import { KanaChart } from './components/KanaChart'
import { Home } from './components/Home'
import { Placement } from './components/Placement'
import { Practice } from './components/Practice'
import { ProgressView } from './components/Progress'
import { Settings } from './components/Settings'
import { speakJapanese, watchJapaneseVoice } from './speech'

const content = loadContent()
type Route = 'loading' | 'placement' | 'home' | 'chapters' | 'progress' | 'settings' | 'practice' | 'kana-complete' | 'kana-chart'

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
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const heading = mainRef.current?.querySelector('h1')
    if (!heading) return
    document.title = `${heading.textContent} · 일본어공부`
    heading.tabIndex = -1
    heading.focus()
  }, [route])

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
      <a className="skip-link" href="#study-main">본문으로 이동</a>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">あ</span><span>일본어공부</span></div>
        {progress.placement && <nav aria-label="주요 메뉴">
          <button type="button" aria-current={(route === 'home' || route === 'kana-chart') ? 'page' : undefined} className={(route === 'home' || route === 'kana-chart') ? 'active' : ''} onClick={() => setRoute('home')}>오늘의 학습</button>
          <button type="button" aria-current={route === 'chapters' ? 'page' : undefined} className={route === 'chapters' ? 'active' : ''} onClick={() => setRoute('chapters')}>자유 연습</button>
          <button type="button" aria-current={route === 'progress' ? 'page' : undefined} className={route === 'progress' ? 'active' : ''} onClick={() => setRoute('progress')}>진도</button>
          <button type="button" aria-current={route === 'settings' ? 'page' : undefined} className={route === 'settings' ? 'active' : ''} onClick={() => setRoute('settings')}>설정</button>
        </nav>}

      </aside>
      <main ref={mainRef} className="main-content" id="study-main" tabIndex={-1}>
        {error && <div className="app-error" role="alert">{error}</div>}
        {route === 'placement' && <Placement items={content.items} onComplete={async (result) => {
          await save(applyPlacement(progress, result, new Date().toISOString()))
          setRoute('home')
        }} />}
        {route === 'home' && <Home progress={progress} today={today} dailySet={dailySet}
          onStart={() => { void start(dailySet) }} onResume={resume} onKanaChart={() => setRoute('kana-chart')} />}
        {route === 'kana-chart' && <KanaChart />}
        {route === 'chapters' && <ChapterList onStart={startFree} />}
        {route === 'progress' && <ProgressView progress={progress} today={today} content={content} />}
        {route === 'settings' && <Settings onRedoPlacement={() => setRoute('placement')} japaneseVoiceAvailable={japaneseVoiceAvailable} />}
        {route === 'practice' && studySet && <div className="practice-page">
          <div className="practice-toolbar"><button type="button" className="text-button" onClick={() => setRoute('home')}>학습 나가기</button><span>자동 저장</span></div>
          <h1 className="practice-title">{practiceTitle}</h1>
          <Practice key={studySet.id} set={studySet} content={content} progress={progress} today={today} getToday={() => fixedDate ?? localDate()}
            onSave={save} onFinish={() => setRoute(studySet.source === 'free' && freeChapter === 'kana' ? 'kana-complete' : 'home')}
            onSpeak={japaneseVoiceAvailable ? (text) => { speakJapanese(text) } : undefined} />
        </div>}
        {route === 'kana-complete' && <div className="continue-page">
          <div className="completion-card"><h1>문자 연습 완료</h1><p>다음 10문제를 시작할 수 있습니다.</p>
            <button type="button" className="primary-button" onClick={() => startFree('kana', studySet?.range ?? 'all')}>계속 문자 연습</button>
            <button type="button" className="secondary-button" onClick={() => setRoute('home')}>오늘의 학습으로</button>
          </div>
        </div>}
      </main>
    </div>
  )
}
