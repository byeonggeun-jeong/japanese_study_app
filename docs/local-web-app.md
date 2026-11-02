# 로컬 웹앱 0.2.0

사용자 요청: EXE 대신 로컬 웹앱, 프로젝트 구조 정리, README 갱신, 공개 GitHub 푸시.

## 구조 결정

React UI를 src/renderer에서 src/app으로 이동했다. 브라우저 API 어댑터는 같은
loadProgress/saveProgress 계약을 HTTP로 구현하므로 학습 로직과 콘텐츠를 재작성하지 않는다.
Electron main/preload, BrowserWindow 설정·테스트, 빌더 설정·패키지는 제거했다.
기존 progressStore는 src/server로 이동하고 형식 검사·백업·원자적 교체·잠금 재시도를 유지한다.

Node.js 24 LTS의 기본 HTTP 서버만 사용한다. 실행에는 공식 Node와 브라우저가 필요하다.
런타임에 npm 패키지를 설치하거나 추가 EXE를 실행하지 않는다. 배포물은 ZIP이다.
Vite는 화면과 서버를 각각 dist/app, dist/server로 빌드하며 패키징 스크립트는 실행기,
README, 라이선스와 수정된 원본 어휘 자료를 포함한다.

## 저장과 접근 범위

127.0.0.1:3217에만 바인딩한다. 학습 기록은 이전 Electron과 같은 Windows 사용자
APPDATA 경로를 사용한다. 브라우저나 배포 폴더 이동 때문에 초기화하지 않는다.
읽기는 기존 파일을 변경하지 않으며 백업 복구가 필요할 때만 복구 파일을 쓴다.
명시적인 JAPANESE_STUDY_DATA_PATH는 테스트·개발용 별도 저장 파일을 지정한다.

GET /api/progress는 기록과 ETag를 반환한다. PUT은 같은 ETag를 If-Match로 요구한다.
최신 파일과 비교하고 읽기·복구·저장을 직렬화하므로 여러 탭의 오래된 답변이 나중
기록을 덮어쓰지 않는다. 충돌 시 409와 새로고침 안내를 사용한다.
입력은 기존 스키마 검사와 2MiB 제한을 적용한다.

요청 Host와 Origin, Sec-Fetch-Site를 검사하고 CORS 허용 헤더를 제공하지 않는다.
정적 파일은 생성된 화면 폴더만 제공하며 진도 JSON, 서버 코드, 상위 경로를 제공하지 않는다.
같은 PC의 다른 프로그램을 차단하는 인증 시스템은 아니다. 외부 기기에서 접속하거나
인터넷에 공개하는 서버 용도로 사용하지 않는다.

## 정리 범위

학습 모듈·콘텐츠 ID·UI 구성과 색상은 유지했다. 기존 Electron 전용 테스트는
실제 HTTP 보안·저장 테스트로 대체했다. 테스트 import만 새 구조로 바꿨다.
앱 아이콘은 public으로 옮기고 Windows 전용 ico를 제거했다. 서명 심사 자료는
docs/archive/electron으로 보관한다. 과거 설계·검증 문서는 역사 기록으로 남긴다.

## 검증

2026-11-02 타입 검사, 95개 테스트/13파일, 콘텐츠 2,001문항/189단원 검사,
화면·서버 빌드와 Windows ZIP 생성 통과. 패키징은 PowerShell Archive 모듈의
로컬 로드 실패를 확인해 .NET ZipFile을 사용하도록 변경했다. 실행 정책은 변경하지 않았다.

현재 설치된 Node.exe는 Get-AuthenticodeSignature 결과 Valid(OpenJS Foundation)다.
실제 기본 APPDATA 경로로 서버를 띄워 기존 기록을 읽고 브라우저에서 기존 진행 중인
학습과 설정의 0.2.0을 확인했다. 사용자 기록 파일의 전후 SHA-256은 동일하다.

ZIP을 별도 폴더에 풀고 node_modules 없이 시작.cmd로 실행했다. 별도의 테스트용
진도로 문자 10문항(선택·직접 입력)을 풀고 저장, 새로고침 후 다음 문제 이어 풀기,
학습 마치기, 누적/연속 1일 반영, 서버 종료·재실행 후 10개 답변과 완료 날짜 보존을
실제 브라우저와 API로 확인했다. 문자표도 확인했고 중복 실행은 기존 서버를 재사용했다.

다운로드한 CMD는 인터넷 출처 표시와 Windows 정책 때문에 별도로 차단될 수 있다.
시작.cmd는 편의 실행기이며, 같은 폴더에서 공식 Node로 node dist/server/index.js를
실행하는 방법도 README에 제공한다. 원격 PC에서의 실제 실행까지 검증한 것은 아니다.

Ruling: 배포 자체에 Node를 묶거나 새 EXE를 만들지 않는다. 서명된 공식 런타임을
한 번 설치하는 비용을 수용해 자체 Windows 바이너리의 서명 문제를 없앤다.
Ruling: 브라우저 저장소 대신 기존 파일을 유지한다. 원본 진도 자동 이관과 파일 백업을
보존하며 쿠키 삭제·브라우저 변경으로 기록이 사라지는 것을 피한다.

## 최종 코드 검토

독립적인 읽기 전용 검토 1회에서 Critical/Important 지적은 없었다. 사소한 지적으로
Vite root 변경 후 public 아이콘이 빌드에 포함되지 않는 것을 확인해 publicDir를
명시했다. 실제 빌드와 ZIP의 icon.png 포함을 확인했다. 재검토는 반복하지 않는다.

Final Ruling: 다른 PC의 SAC 정책, 악의적인 로컬 프로세스·수동 삽입 심볼릭 링크,
Windows 외 배포는 보장 범위에서 제외한다. 각 환경의 정책 또는 명시적인 로컬 전용
설계에 따른 제한이며, README에 런타임 요구사항과 실행 방법을 기록한다.
Final Ruling: 검토자가 재실행하지 않은 브라우저 흐름·테스트는 구현자가 실제 실행한
결과를 위에 기록한다. GitHub 반영과 원격 빌드는 다음 완료 단계로 별도 검증한다.

공개 main 푸시 및 Windows CI도 성공했다:
https://github.com/byeonggeun-jeong/japanese_study_app/actions/runs/41392368971

빌드 소스: 2ceac8ea736b5ce4b83eb336c9ff1fe20c2c4bec. 깨끗한 Windows 환경에서
npm ci, 타입·테스트·콘텐츠 검사, 화면·서버 빌드, ZIP 생성·SHA-256 기록과 산출물
업로드를 통과했다. 현재 ZIP은 약 2.2MiB이며 node_modules, EXE, 개인 progress.json을
포함하지 않는다. 기존 Electron 생성물은 Git 제외 작업 폴더에 별도 보관했다.
