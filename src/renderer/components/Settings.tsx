export function Settings({ onRedoPlacement }: { onRedoPlacement(): void }) {
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
    </div>
  )
}
