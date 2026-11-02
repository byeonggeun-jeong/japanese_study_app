import { useState } from 'react'
import type { Chapter, StudyRange } from '../../shared/types'

const chapters: { id: Chapter; title: string; description: string }[] = [
  { id: 'kana', title: '문자', description: '히라가나 · 가타카나' },
  { id: 'grammar', title: '문법', description: '조사 · 동사 활용 · 문형' },
  { id: 'vocabulary', title: '단어', description: '뜻 · 읽기 · 예문' },
  { id: 'sentences', title: '문장', description: '해석 · 문장 조립 · 듣기' }
]

export function ChapterList({ onStart }: { onStart(chapter: Chapter, range: StudyRange): void }) {
  const [ranges, setRanges] = useState<Record<Chapter, StudyRange>>({ kana: 'hiragana', grammar: 'N5', vocabulary: 'N5', sentences: 'N5' })
  return (
    <div className="chapter-page">
      <div className="page-intro">
        <h1>챕터별 연습</h1>
        <p>한 번에 10문제</p>
      </div>
      <div className="chapter-grid">
        {chapters.map((chapter) => (
          <section className="chapter-card" key={chapter.id}>
            <h2>{chapter.title}</h2>
            <p>{chapter.description}</p>
            <label className="range-label" htmlFor={`range-${chapter.id}`}>{chapter.title} 범위</label>
            <select id={`range-${chapter.id}`} value={ranges[chapter.id]} onChange={(event) => setRanges({ ...ranges, [chapter.id]: event.target.value as StudyRange })}>
              {chapter.id === 'kana' ? <><option value="hiragana">히라가나</option><option value="katakana">가타카나</option></>
                : <><option value="N5">N5 기초</option><option value="N4">N4 확장</option></>}
              <option value="all">전체</option>
            </select>
            <button type="button" className="secondary-button" onClick={() => onStart(chapter.id, ranges[chapter.id])}>{chapter.title} 연습 시작</button>
          </section>
        ))}
      </div>
    </div>
  )
}
