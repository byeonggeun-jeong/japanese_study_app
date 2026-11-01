import type { Chapter } from '../../shared/types'

const chapters: { id: Chapter; title: string; description: string; marker: string }[] = [
  { id: 'kana', title: '문자', description: '히라가나와 가타카나를 원하는 만큼 반복해요.', marker: 'あ' },
  { id: 'grammar', title: '문법', description: '표현의 쓰임을 이해하고 문장을 완성해요.', marker: '文' },
  { id: 'vocabulary', title: '단어', description: '뜻과 읽기를 문맥 속에서 익혀요.', marker: '語' },
  { id: 'sentences', title: '문장', description: '짧은 대화와 문장으로 실제 쓰임을 연습해요.', marker: '話' }
]

export function ChapterList({ onStart }: { onStart(chapter: Chapter): void }) {
  return (
    <div className="chapter-page">
      <div className="page-intro">
        <p className="eyebrow">언제든지 더 연습하기</p>
        <h1>챕터별 연습</h1>
        <p>한 묶음을 끝내면 오늘의 학습일에도 반영됩니다.</p>
      </div>
      <div className="chapter-grid">
        {chapters.map((chapter, index) => (
          <section className="chapter-card" key={chapter.id}>
            <div className="chapter-top"><span className="chapter-number">0{index + 1}</span><span className="chapter-marker" aria-hidden="true">{chapter.marker}</span></div>
            <h2>{chapter.title}</h2>
            <p>{chapter.description}</p>
            <button type="button" className="secondary-button" onClick={() => onStart(chapter.id)}>{chapter.title} 연습 시작</button>
          </section>
        ))}
      </div>
    </div>
  )
}
