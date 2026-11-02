# SignPath 신청 준비

상태: 초안. 제출·승인·서명 발급 전.

신청 페이지: https://signpath.org/apply

## 제출용 프로젝트 설명

Project: Japanese Study (일본어공부)

Repository: https://github.com/byeonggeun-jeong/japanese_study_app

Maintainer: byeonggeun-jeong

License: MIT for original code and content; OpenJLPT-derived vocabulary is
CC BY-SA 4.0, Pretendard is SIL OFL 1.1. See THIRD_PARTY_NOTICES.md.

Description: A free local Windows Electron application for Korean-speaking
Japanese learners, with daily practice, local progress and streak tracking,
hiragana/katakana charts, and beginner to N4 grammar, vocabulary and sentences.
No subscriptions, paid APIs, analytics or cloud study-data storage.

Signing purpose: Sign the application's executable and NSIS installer so users
can keep Windows Smart App Control enabled. We will not sign upstream third-party
binaries under our own identity. The project is newly published with two intended
users; it does not yet have an established public community or reputation.

Code signing policy:
https://github.com/byeonggeun-jeong/japanese_study_app/blob/main/docs/code-signing-policy.md

Build workflow:
https://github.com/byeonggeun-jeong/japanese_study_app/actions/workflows/windows-build.yml

## 신청 전 확인할 항목

- GitHub 공개 빌드 성공과 해당 실행 URL·커밋, 다운로드 가능한 unsigned artifact.
- 소유자 본인의 연락 이메일, GitHub 및 SignPath 계정 2단계 인증 확인.
- 심사 조건 수락과 공개 초기 프로젝트의 심사 가능 여부 확인.
- 원본 코드/자료 라이선스 구분 및 Electron 바이너리 서명 범위 검토.
- 승인 뒤 SignPath가 지정한 빌드 출처 검증, artifact 규칙 및 수동 승인 연결.

신청서 제출이나 외부 연락은 수행하지 않았다. 신청에 필요한 계정·연락처와
심사 동의는 소유자가 확인해야 한다. 승인 여부와 처리 기간은 보장하지 않는다.
