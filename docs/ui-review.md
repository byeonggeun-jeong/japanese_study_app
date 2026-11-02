# UI 점검 및 설치본 업데이트 — 2026-11-02

## 범위와 적용 스킬

Electron / React / TypeScript / 일반 CSS. 홈, 첫 진단, 문제, 챕터 선택, 기록, 설정의 여섯 화면과 기존 컴포넌트 테스트를 점검했다. 프로젝트 기준은 사용자 AGENTS 지침, 설계서, docs/ui-polish.md의 Toss 방향·흰색/저채도 빨간색·Pretendard·번호가 붙은 한 열 선택지다. 구조나 색상을 다른 디자인 시스템으로 바꾸지 않았다.

- Emil Kowalski 저장소의 최신 `emil-design-eng`를 별도 설치해 사용했다: `C:/Users/user/.skills-manager/skills/emil-design-eng-2/SKILL.md`.
- Jakub Krehel 저장소의 최신 `better-interface`를 별도 설치해 사용했다: `C:/Users/user/.skills-manager/skills/better-interface-2/SKILL.md`.
- better-accessibility / better-layout / better-writing / better-typography / better-colors / better-ui의 로컬 지침을 각각 읽고 점검했다.
- 두 저장소의 개별 스킬 30개 모두 라이브러리에 있고 Codex에 배포됨을 CLI로 대조했다. 기존 설치는 보존하고, 누락된 prototype / remove-animations / teardown과 이번 점검용 최신 두 스킬을 추가했다. 새 점검 스킬은 기존 설치를 덮어쓰지 않아 `-2` 경로로 등록됐다.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | App/Practice/Completion의 포커스, 실제 설치본 Tab 포커스 링, 레이블·native button·IME·저장 오류 테스트 | 포커스·달력 상태 표시 수정 |
| Layout | 여섯 화면의 실제 콘텐츠, 1440/768/390 및 별도 320×844 캡처 | 320px 요일 간격과 긴 조립 조각 보완 |
| Writing | renderer 전체 문구와 설정·오류·완료·학습 버튼 | 이전 Toss 수정의 짧은 행동·상태 표현 유지. 추가 슬로건 없음 |
| Typography | 번들 Pretendard 가변 글꼴, 일본어 대체 글꼴, 실제 로딩과 줄바꿈 | 실제 Pretendard 로딩 확인. 생략된 학습 문구 없음 |
| Colors | 실제 CSS의 글자/배경·버튼·포커스·입력 경계 조합 | 입력 경계 대비 수정 |
| UI polish | 선택지/탐색/조립의 반복 빈도, hover·disabled·키보드·reduced-motion 규칙 | 반복 동작의 모션 제거, 포인터에만 눌림 효과 |

## 발견 사항과 수정

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| HIGH | Accessibility | src/renderer/components/Progress.tsx:54 | 완료 날짜를 빨간색으로만 표시 | 체크 표시와 날짜별 접근성 이름 병행 | WCAG 1.4.1, 색을 구별하지 못해도 완료 여부를 확인 |
| HIGH | Colors | src/renderer/styles.css:16 | 입력/선택 경계 #d1d6db / 흰색 = 1.46:1 | #7a8491 / 흰색 = 3.79:1 | WCAG 1.4.11의 3:1 경계 기준 |
| MEDIUM | Accessibility | src/renderer/App.tsx:30; components/Practice.tsx:29; components/Completion.tsx:5 | 화면·답안이 바뀌면 포커스가 메뉴나 body에 남음 | 새 화면 제목, 답변 후 다음 버튼, 다음 문제 제목으로 이동 | 키보드로 반복 학습할 때 처음부터 다시 Tab 할 필요를 줄임 |
| MEDIUM | Layout | src/renderer/styles.css:148,196 | 320px에서 7개 날짜·긴 조립 조각이 최소 폭을 초과할 수 있음 | 요일 간격 4px, 조각 최대폭·줄바꿈 지정 | 좁은 화면에서 선택 영역 보존 |
| LOW | UI polish | src/renderer/styles.css:198 | 모든 버튼에 hover·눌림 애니메이션, disabled/키보드도 대상 | hover 가능한 포인터에서만 효과, 선택지·탐색·조립은 즉시 반응 | 반복 학습과 키보드 조작을 지연시키지 않음 |

위 항목은 모두 반영했다. 새 의존성이나 UI 프레임워크는 추가하지 않았다.

## 검증

- `npm run make`: 타입 검사, 전체 **84/84 테스트**, 2,001문항/189단원·ID 기준 목록 검사, 빌드, NSIS 생성 성공.
- 키보드 포커스 회귀 테스트 두 건은 수정 전 실패, 수정 후 통과했다. 기존 IME·선택지·저장 복구·진단·일일 기록 테스트도 통과했다.
- 글자 대비: 본문 #191f28/흰색 16.56:1, 보조 글자 #5c6674/흰색 5.82:1, 흰색/주 버튼 5.77:1, 포커스/바탕 5.23:1.
- `inspect.mjs --app`: 최종 여섯 화면에서 실패 0. 날짜 padStart lint 경고는 날짜 형식이므로 유지한다. 홈·진단의 아래 여백은 한 작업씩 진행하는 화면의 남은 공간이며, 기록의 무채색 그래프는 값이 0인 검증 계정이어서 유지한다.
- 320px를 검사 도구에 직접 주면 기본 높이가 200px가 되어 홈 여백 오류를 보고했다. 도구 소스를 바꾸지 않고 별도 320×844 뷰포트로 여섯 화면을 캡처했다. 모든 화면의 scrollWidth=320, 잘린 버튼/입력/선택 컨트롤 0개였다.
- 설치본: `JapaneseStudy-Setup-0.1.1.exe`로 업데이트, 설치 종료 코드 0, 실행 파일 버전 0.1.1, 설정 화면의 0.1.1 확인. 업데이트 전후 학습 기록 파일 SHA-256 동일. 실제 홈에서 기존 ‘3 / 10문제 완료’와 1일 기록을 확인했다.
- 사용자 기록을 답변·재진단으로 변경하지 않았다. 학습 입력·N5/N4 조립·음성 없는 듣기 대체의 네 문항 검증은 앞선 별도 프로필에서 수행했다.

Not verified: NVDA 등 실제 화면 읽기 프로그램, 설치본의 200% 확대(키 입력의 적용을 확인하지 못함), RTL/다국어 번역, 친구 PC, 일본어 음성이 없는 이 PC에서의 실제 일본어 음성. 저장 오류·로딩·빈 상태는 소스/컴포넌트 테스트 범위이며 모든 상태의 시각 캡처를 했다는 뜻은 아니다.

## Verdict

Approve — 위 범위에서 남은 HIGH 발견 사항 없음. WCAG 전체 인증이나 위 Not verified 항목의 승인을 뜻하지 않는다.
