export function Settings({ onRedoPlacement, japaneseVoiceAvailable }: { onRedoPlacement(): void; japaneseVoiceAvailable: boolean }) {
  return (
    <div className="settings-page">
      <div className="page-intro">
        <p className="eyebrow">내 학습 환경</p>
        <h1>설정</h1>
      </div>
      <section className="settings-card">
        <h2>시작점 다시 찾기</h2>
        <p>진단을 다시 해도 지금까지 공부한 기록은 남습니다.</p>
        <button type="button" className="secondary-button" onClick={onRedoPlacement}>진단 다시 하기</button>
      </section>
      <section className="settings-card">
        <h2>학습 기록</h2>
        <p>학습 기록은 이 Windows 사용자 계정의 PC에 저장됩니다. 계정이나 구독은 필요하지 않습니다.</p>
      </section>
      <section className="settings-card">
        <h2>일본어 듣기</h2>
        {japaneseVoiceAvailable
          ? <p>이 PC의 일본어 음성으로 듣기 버튼을 사용할 수 있습니다.</p>
          : <p>일본어 음성이 없습니다. Windows 설정 → 시간 및 언어 → 언어 및 지역에서 일본어를 추가하고 음성 기능을 설치해 주세요. 음성이 없어도 텍스트 문제는 계속 풀 수 있습니다.</p>}
      </section>
      <section className="settings-card">
        <h2>앱 정보와 콘텐츠 출처</h2>
        <p>일본어공부 0.1.0 · 기초부터 N4 대비까지</p>
        <p>어휘 표기·읽기는 OpenJLPT(CC BY-SA 4.0)를 바탕으로 한국어 뜻과 사용 문맥을 수정했습니다. 문법 설명과 예문은 새로 작성했습니다.</p>
        <p className="source-address">github.com/evanclan/OpenJLPT<br />creativecommons.org/licenses/by-sa/4.0/</p>
      </section>
    </div>
  )
}
