import { projectLinks } from '../../shared/links'

export function Settings({ onRedoPlacement, japaneseVoiceAvailable }: { onRedoPlacement(): void; japaneseVoiceAvailable: boolean }) {
  return <div className="settings-page">
    <div className="page-intro"><h1>설정</h1></div>
    <section className="settings-card settings-action">
      <div><h2>시작점 다시 찾기</h2><p>학습 기록은 유지됩니다.</p></div>
      <button type="button" className="secondary-button" onClick={onRedoPlacement}>진단 다시 하기</button>
    </section>
    <section className="settings-card">
      <h2>학습 기록</h2><p>이 PC에 자동 저장됩니다.</p>
    </section>
    <section className="settings-card">
      <h2>일본어 듣기</h2>
      <p>{japaneseVoiceAvailable ? '이 PC의 일본어 음성을 사용합니다.' : '음성이 없어 텍스트로 학습합니다. Windows 설정에서 일본어 음성을 추가할 수 있습니다.'}</p>
    </section>
    <section className="settings-card">
      <h2>앱 정보</h2><p>일본어공부 0.1.2</p>
      <p className="project-links"><a href={projectLinks.github} target="_blank" rel="noreferrer">@byeonggeun-jeong</a><a href={projectLinks.repository} target="_blank" rel="noreferrer">소스 코드</a></p>
    </section>
    <section className="settings-card">
      <h2>콘텐츠 출처</h2>
      <p>어휘: OpenJLPT · CC BY-SA 4.0<br />한국어 뜻·예문·문법 설명은 별도 작성했습니다.</p>
      <p className="source-address">github.com/evanclan/OpenJLPT<br />creativecommons.org/licenses/by-sa/4.0/</p>
    </section>
  </div>
}
