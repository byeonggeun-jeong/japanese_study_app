# 일본어공부

**현재 버전: 0.1.2.** Smart App Control이 켜진 PC에서 서명되지 않은 실행 파일이 차단되는 문제가 확인됐습니다. 현재 설치본은 이 환경에서 실행할 수 없습니다. [차단 원인과 해결 조건](docs/windows-signing.md), [변경·검증 결과](docs/final-review.md)를 참고하세요.

Windows에서 매일 조금씩 이어가는 일본어 학습 앱입니다. Electron으로 실행하며 학습 자료와 진도는 PC에 저장합니다. 계정·구독·유료 API가 필요하지 않습니다.

## 라이선스와 코드 서명

직접 작성한 앱 코드와 학습 콘텐츠는 [MIT](LICENSE)로 공개합니다. OpenJLPT 파생 어휘 자료(CC BY-SA 4.0), Pretendard(SIL OFL 1.1), 외부 의존성에는 각각의 라이선스가 적용됩니다. 자세한 범위는 [출처 고지](THIRD_PARTY_NOTICES.md)를 참고하세요.

[Code signing policy](docs/code-signing-policy.md) · [공개 Windows 빌드](https://github.com/byeonggeun-jeong/japanese_study_app/actions/workflows/windows-build.yml) · [무료 서명 신청 준비](docs/signpath-application.md)

무료 서명 심사를 준비 중이며 아직 제출·승인되지 않았습니다. 현재 빌드 산출물은 unsigned로 표시하며, Smart App Control 차단을 해결한 배포본이 아닙니다.

## 설치와 실행

1. `dist/JapaneseStudy-Setup-0.1.2.exe`를 실행합니다.
2. 설치 위치를 선택하고 설치를 마칩니다. 시작 메뉴나 바탕 화면의 **일본어공부**로 실행합니다.
3. 첫 진단을 풀고 챕터별 추천 시작점을 확인합니다.
4. **오늘의 학습**을 시작하거나, **자유 연습**에서 챕터와 범위를 고릅니다. 오늘의 학습 화면에서 **문자표 보기**로 히라가나·가타카나 표를 확인할 수 있습니다.

현재 배포 대상은 Windows x64입니다. 개발 도구 설치 없이 설치 파일 하나로 사용할 수 있습니다. 이 프로젝트에서 만든 설치 파일은 코드 서명 인증서를 사용하지 않습니다. 두 번째 PC의 설치·음성 환경은 별도로 확인해야 합니다.

이 PC의 확인된 설치 경로는 `C:\Users\user\AppData\Local\Programs\JapaneseStudy\일본어공부.exe`입니다. 다른 PC나 설치 위치를 선택한 경우 경로는 달라질 수 있습니다.

## 학습 방식

- 문자: 히라가나·가타카나, 탁음·반탁음, 요음, 촉음·장음을 반복합니다. 한 묶음을 마치면 계속할 수 있습니다.
- 문법: 한국어 설명과 예문을 먼저 읽고 연습합니다. 복습에서는 바로 문제를 풉니다.
- 단어: 표기·읽기·한국어 뜻과 짧은 사용 문맥을 익힙니다.
- 문장: 문법 적용과 일상 상황의 문장 해석·조립을 연습하고 기기 음성이 있으면 듣기 문제를 풉니다.

오늘의 학습은 기한이 된 복습, 약한 항목, 현재 단계의 새 문항을 합쳐 최대 15문항을 고릅니다. 예상 시간은 약 10~20분이며 개인의 읽는 속도에 따라 달라집니다. N5로 시작한 챕터는 N5 항목을 한 번씩 풀고 나면 N4 새 문항으로 넘어갑니다. 자유 연습에서는 N4도 직접 고를 수 있습니다.

추천·자유 연습 모두 마지막 **학습 마치기**까지 누르면 PC의 현지 날짜를 학습일로 기록합니다. 하루에 여러 묶음을 풀어도 학습일은 한 번만 늘어납니다. 중간에 종료하면 저장한 다음 문항부터 이어 풀 수 있습니다. 진행 중인 묶음은 하나이며 다른 묶음을 시작하려면 먼저 마쳐야 합니다.

콘텐츠는 2,001문항(문자 220, 문법·표현 130, 단어 1,304, 문장 347)입니다. N5/N4는 자체 학습 분류이며 공식 시험 범위 보증을 뜻하지 않습니다. 제작 및 검수 상태는 [콘텐츠 범위](docs/content-coverage.md)에 기록했습니다. 전문 교사·원어민의 감수를 받았다는 표시는 하지 않습니다.

## 무료 일본어 음성

PC가 일본어 음성을 제공할 때 듣기 버튼이 표시됩니다. 음성이 없으면 Windows **설정 → 시간 및 언어 → 언어 및 지역 → 일본어 언어 옵션**에서 음성 기능을 설치하고 앱을 다시 실행합니다. Windows 버전에 따라 메뉴 이름은 조금 다를 수 있습니다.

음성팩 설치를 강제하지 않으며, 음성이 없어도 텍스트 학습은 가능합니다. 마이크·발음 채점·AI 자유 대화 기능은 포함하지 않습니다.

## 진도 보관과 백업

기록은 Windows 사용자 계정별 다음 위치에 저장됩니다.

```text
%APPDATA%\일본어공부\study-data\progress.json
%APPDATA%\일본어공부\study-data\progress.json.bak
```

앱을 닫은 뒤 `study-data` 폴더를 다른 위치에 복사하면 백업할 수 있습니다. 복원할 때도 앱을 닫고, 현재 폴더를 별도 보관한 뒤 백업 폴더를 원래 위치에 복사합니다. `.bak`는 직전 저장본이며 주 파일이 손상되면 자동 복구에 사용합니다. 두 PC는 이 폴더를 공유하지 않는 한 서로 독립적으로 기록됩니다.

새 설치 파일로 앱을 업데이트해도 사용자 데이터 위치는 유지합니다. 기록을 수동으로 삭제하면 학습 진도가 사라지므로 먼저 백업하세요.

## 개발 및 검증

Node.js 24와 npm을 기준으로 구성했습니다.

```powershell
npm ci
npm run dev
```

```powershell
npm run typecheck
npm test
npm run validate:content
npm run build
npm run make
```

`make`는 타입·테스트·콘텐츠 검사를 통과한 뒤 Windows 설치 파일을 생성합니다. 결과물은 `dist/`에 있으며 Git에는 포함하지 않습니다. 검증 기록은 [검증 문서](docs/verification.md), 구현 기준은 [설계서](docs/superpowers/specs/2026-11-01-japanese-study-windows-design.md)에서 확인할 수 있습니다.

## 출처

어휘 표기·읽기는 OpenJLPT와 그 기반 자료를 사용하며 수정된 어휘 데이터는 CC BY-SA 4.0으로 제공합니다. [출처 및 변경 사항](THIRD_PARTY_NOTICES.md), [원본 고지](licenses/OpenJLPT-NOTICE.md), [라이선스](licenses/CC-BY-SA-4.0.txt)를 참조하세요. 설치된 앱의 `resources/`에도 고지와 수정 어휘 파일이 포함됩니다.

## 개발자

GitHub: https://github.com/byeonggeun-jeong

저장소: https://github.com/byeonggeun-jeong/japanese_study_app
