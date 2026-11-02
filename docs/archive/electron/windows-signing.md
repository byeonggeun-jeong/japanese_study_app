# Windows 실행 차단 — 2026-11-02

상태: 원인 확인, 해결 미완료. Smart App Control 설정은 변경하지 않았다.

0.1.2 설치 파일과 설치된 일본어공부.exe 모두 Get-AuthenticodeSignature 결과가 NotSigned다. 실제 설치 경로 실행 파일에 대해 Windows CodeIntegrity 로그의 3033·3077 이벤트가 서명 요건 미충족으로 차단한 기록을 확인했다. 설치 종료 코드와 파일 버전 확인은 실행 성공의 증거가 아니므로 이전 설치 검증의 한계로 기록한다.

현재 사용자 인증서 저장소에서 사용 가능한 코드 서명 인증서를 찾지 못했다. 코드 수정·재빌드·자체 서명으로 Smart App Control의 신뢰를 보장할 수 없다. 보안 기능 해제나 예외 우회는 해결 방법으로 사용하지 않는다.

해결하려면 Windows가 신뢰하는 공급자의 인증서로 앱 실행 파일과 설치 파일을 서명하고 타임스탬프를 적용해야 한다. 함께 로드하는 바이너리도 검사하고, 최종적으로 Smart App Control을 켠 실제 PC에서 시작·학습·저장·재실행을 확인해야 완료로 판단한다.

비용 없는 후보는 SignPath Foundation의 오픈소스 서명 심사다. 2026-11-02 사용자의 승인으로 자체 코드에 MIT 라이선스를 적용하고, 공개 Windows 빌드와 Code signing policy, 신청서 초안을 추가했다. 외부 콘텐츠와 폰트의 기존 라이선스는 유지한다. 신청·승인은 아직 진행하지 않았고 승인 가능성이나 소요 기간은 보장하지 않는다. 소유자의 연락 이메일과 두 서비스의 2단계 인증 확인, 제공자의 승인이 남아 있다. 세부 내용은 signpath-application.md와 code-signing-policy.md를 참고한다.

- Microsoft 서명 요구사항: https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/code-signing-for-smart-app-control
- Microsoft Smart App Control FAQ: https://support.microsoft.com/en-us/windows/security/threat-malware-protection/smart-app-control-frequently-asked-questions
- SignPath 심사 조건: https://signpath.org/terms

## 준비 결과 검증

2026-11-02 로컬 타입 검사·87개 테스트·2,001문항/189단원 검사·앱 빌드 통과.
패키징은 샌드박스 네트워크 제한으로 처음 실패한 뒤 네트워크 허용 환경에서
성공했다. 생성된 resources의 MIT LICENSE, 외부 라이선스·출처, 수정 어휘 파일을
확인했다. 새 설치 파일 역시 NotSigned이며 실제 설치본을 덮어쓰지 않았다.

공개 Windows 빌드도 성공했다:
https://github.com/byeonggeun-jeong/japanese_study_app/actions/runs/41390055747

검증된 소스 커밋: f204cb68565753bf7bd3c42c353bf9095620290c.
npm ci부터 전체 검사, NSIS 생성, unsigned artifact 업로드까지 통과했다.
설치 파일·SHA256SUMS·build-info.json·라이선스·서명 정책을 산출물로 보관한다.
첫 CI 실행은 electron-builder의 암묵적 릴리스 게시가 토큰을 요구해 실패했으며,
make에 --publish never를 명시한 뒤 성공했다. 릴리스 게시 권한은 추가하지 않았다.
Actions의 Node 20 런타임 폐기 경고는 호스트의 Node 24 강제 실행 안내이며,
현재 실행 결과는 성공이다. 서명·SAC 실행 검증은 여전히 미완료다.
