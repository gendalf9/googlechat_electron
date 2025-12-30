# Google Chat Desktop - Product Requirements Document (PRD)

## 1. 제품 개요

### 1.1 제품 설명

Google Chat Desktop은 Electron 기반의 경량화되고 최적화된 Google Chat 데스크탑 애플리케이션입니다. 웹 브라우저에서 Google Chat을 사용하는 불편함을 해소하고, 네이티브 데스크탑 경험을 제공합니다.

### 1.2 타겟 사용자

- 업무 및 개인용 Google Chat 사용자
- 데스크탑에서 더 나은 생산성을 원하는 사용자
- 브라우저 탭 관리의 번거로움을 피하고 싶은 사용자
- 시스템 트레이와 백그라운드 실행을 선호하는 사용자

### 1.3 제품 목표

- Google Chat 웹 서비스의 네이티브 데스크탑 경험 제공
- 최적화된 성능으로 시스템 리소스 최소화
- 크로스 플랫폼 지원 (macOS, Windows, Linux)
- 직관적인 사용자 인터페이스와 사용자 경험 제공

## 2. 핵심 기능 요구사항

### 2.1 창 관리 (Window Management)

- **기본 창 속성**
  - 초기 크기: 1200x800px
  - 최소 크기: 800x600px
  - 배경색: #ffffff (흰색)
  - 제목: "Google Chat"

- **창 동작**
  - 앱 시작 시 창 자동 생성 및 표시
  - 닫기 버튼 클릭 시 창 숨기기 (앱 종료 아님)
  - 시스템 트레이 아이콘 클릭 시 창 토글 (표시/숨기기)
  - 활성화(activate) 이벤트 시 창이 없으면 새로 생성

- **로딩 화면**
  - Google Chat 로딩 중 스피너 및 진행률 표시
  - 최대 3회 재시도 로직
  - 네트워크 오류 시 에러 메시지 및 재시도 버튼

### 2.2 시스템 트레이 (System Tray)

- **트레이 아이콘**
  - 상시 표시
  - 툴팁: "Google Chat Desktop"

- **트레이 컨텍스트 메뉴**
  - "Google Chat 열기" (Cmd/Ctrl+Shift+G 단축키)
  - "알림 테스트"
  - 구분선
  - "종료" (Cmd/Ctrl+Q 단축키)

- **클릭 동작**
  - 트레이 아이콘 클릭 시 창 표시/숨기기 토글
  - 창이 파괴된 경우 새 창 생성

### 2.3 알림 시스템 (Notification System)

- **새 메시지 감지**
  - 페이지 제목(title) 변경 감지 (MutationObserver 사용)
  - 제목이 "Google Chat"이 아닌 경우 새 메시지로 간주
  - 2초 디바운싱으로 알림 빈도 제어

- **알림 표시**
  - 제목: "Google Chat"
  - 내용: "새 메시지"
  - 네이티브 OS 알림 사용

- **다운로드 알림**
  - 다운로드 완료 시 알림 (macOS)
  - 다운로드 폴더 열기 옵션 제공
  - 다운로드 실패 시 오류 알림

### 2.4 외부 링크 처리 (External Links)

- **링크 열기 동작**
  - Google Chat 도메인(chat.google.com) 외 링크는 시스템 기본 브라우저에서 열기
  - 새 창 생성 방지 (setWindowOpenHandler)

- **네비게이션 제어**
  - Google Chat 도메인 외 페이지 이동 방지
  - 외부 URL은 시스템 브라우저로 리다이렉트

### 2.5 파일 다운로드 (File Download)

- **다운로드 처리**
  - 기본 다운로드 폴더에 자동 저장
  - 한글 파일명 디코딩 지원 (URL 디코딩)
  - 다운로드 완료 알림 표시
  - 다운로드 폴더 열기 옵션 제공

- **인증된 URL 처리**
  - Google Chat 첨부 파일 URL은 인증 필요 → 시스템 브라우저에서 열기 유도

### 2.6 컨텍스트 메뉴 (Context Menu)

- **기본 메뉴 항목**
  - 잘라내기 (Cut)
  - 복사 (Copy)
  - 붙여넣기 (Paste)
  - 전체 선택 (Select All)

- **추가 기능**
  - 검색: 선택한 텍스트로 Google 검색
  - 링크 열기: 링크 URL을 시스템 브라우저에서 열기 (링크 선택 시 표시)

### 2.7 키보드 단축키 (Keyboard Shortcuts)

- **페이지 제어**
  - `Cmd/Ctrl + R`: 페이지 새로고침
  - `Cmd/Ctrl + Shift + R`: 강제 새로고침 (캐시 무시)
  - `Cmd/Ctrl + W`: 창 숨기기 (종료 아님)
  - `F12`: 개발자 도구 토글 (개발 모드만)
  - `Cmd/Ctrl + Q`: 애플리케이션 종료

- **채팅 관련**
  - `Cmd/Ctrl + N`: 새 채팅 열기

### 2.8 메뉴바 (Application Menu)

- **파일 메뉴**
  - 새로고침 (Cmd/Ctrl+R)
  - 강제 새로고침 (Cmd/Ctrl+Shift+R)
  - 개발자 도구 (F12) - 개발 모드만 표시
  - 종료 (Cmd/Ctrl+Q)

- **편집 메뉴**
  - 실행 취소, 다시 실행
  - 잘라내기, 복사, 붙여넣기, 전체 선택

- **보기 메뉴**
  - 새로고침, 강제 새로고침
  - 확대/축소 (초기화, 확대, 축소)
  - 전체 화면 토글

- **창 메뉴**
  - 최소화
  - 닫기

- **도움말 메뉴**
  - 정보: 앱 버전 및 기능 정보 표시

## 3. 성능 및 최적화 요구사항

### 3.1 메모리 관리 (Memory Management)

- **메모리 릭 방지 (Critical Fixes)**
  - Closure 참조 메모리 릭 수정
  - 컨텍스트 메뉴 누적 문제 해결
  - 세션 리스너 중복 등록 방지
  - JavaScript 문자열 메모리 최적화
  - webContents 이벤트 핸들러 누적 방지

- **타이머 및 인터벌 정리**
  - 모든 타이머 및 인터벌 추적 (Set/Map 사용)
  - 창 종료 시 모든 타이머 정리
  - 앱 종료 시 전역 정리

- **메모리 모니터링**
  - 5분마다 메모리 사용량 확인
  - 85% 이상 사용 시 자동 정리 트리거
  - 가비지 컬렉션 요청 (window.gc())

### 3.2 CPU 최적화 (CPU Optimization)

- **하드웨어 가속**
  - GPU 가속 부분적으로 비활성화 (로딩 문제 해결)
  - backgroundThrottling 활성화 (백그라운드 스로틀링)

- **이벤트 처리**
  - 디바운싱 적용 (알림, 메모리 체크 등)
  - 불필요한 이벤트 리스너 제거

- **애니메이션 최적화**
  - 애니메이션 지속 시간 0.1초로 제한
  - 불필요한 로딩 인디케이터 숨김
  - GPU 가속 활성화 (will-change 속성)

### 3.3 렌더링 최적화 (Rendering Optimization)

- **창 설정**
  - paintWhenInitiallyHidden: false
  - transparent: false
  - vibrancy: undefined (비활성화)

- **웹 콘텐츠 설정**
  - webgl: false
  - webaudio: false
  - spellcheck: false
  - plugins: false
  - images: true (필수)

## 4. 보안 요구사항 (Security Requirements)

### 4.1 Electron 보안 설정

- **기본 보안**
  - contextIsolation: true (활성화)
  - nodeIntegration: false (비활성화)
  - webSecurity: true
  - allowRunningInsecureContent: false

- **프로세스 분리**
  - sandbox: false (로딩 문제 해결을 위해 비활성화)
  - enableRemoteModule: false

### 4.2 IPC 통신 보안

- **Secure IPC Bridge**
  - contextBridge를 통한 안전한 API 노출
  - Main Process → Renderer Process: 단방향 통신
  - Renderer Process → Main Process: ipcRenderer.send 사용

- **노출 API**
  - showNotification(title, body)
  - hideWindow()
  - openExternal(url)
  - downloadFile(url, fileName)
  - getAppVersion()
  - getPlatform()
  - getPerformanceInfo()
  - requestMemoryCleanup()

### 4.3 사용자 에이전트 (User Agent)

- **커스텀 User Agent**
  ```
  Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
  ```

## 5. 플랫폼 요구사항

### 5.1 크로스 플랫폼 지원

- **지원 OS**
  - macOS (Intel + Apple Silicon)
  - Windows (x64)
  - Linux (x64)

### 5.2 플랫폼별 빌드 설정

- **macOS**
  - 타겟: DMG
  - 아키텍처: Universal Binary (x64 + arm64)
  - 카테고리: public.app-category.social-networking
  - 아이콘: assets/icon.png
  - 서명: 비활성화 (개발용)

- **Windows**
  - 타겟: NSIS
  - 아키텍처: x64
  - 아이콘: assets/icon.png
  - 데스크톱 바로가기: 생성
  - 시작 메뉴 바로가기: 생성

- **Linux**
  - 타겟: AppImage
  - 아키텍처: x64
  - 아이콘: assets/icon.png
  - 카테고리: Network

## 6. 개발 및 빌드 요구사항

### 6.1 개발 환경

- **필요 도구**
  - Node.js 18.x 이상
  - npm 또는 yarn

- **개발 스크립트**
  - `npm start`: 일반 모드 실행
  - `npm run dev`: 개발 모드 실행 (DevTools 자동 열림)
  - `npm test`: Jest 테스트 실행
  - `npm run test:watch`: 테스트 감시 모드
  - `npm run test:coverage`: 테스트 커버리지
  - `npm run lint`: ESLint 코드 검사
  - `npm run lint:fix`: 자동 수정
  - `npm run format`: Prettier 포맷팅
  - `npm run quality`: 전체 코드 품질 검사

### 6.2 빌드 스크립트

- `npm run build`: 모든 플랫폼 빌드
- `npm run build:mac`: macOS만 빌드
- `npm run build:win`: Windows만 빌드
- `npm run build:linux`: Linux만 빌드
- `npm run pack`: 설치 프로그램 없이 빌드 (테스트용)

### 6.3 코드 품질 도구

- **ESLint**: JavaScript 코드 린팅
- **Prettier**: 코드 포맷팅
- **Jest**: 유닛 및 통합 테스트
- **GitHub Actions**: CI/CD 파이프라인

## 7. 테스트 요구사항

### 7.1 테스트 유형

- **유닛 테스트**
  - 주요 기능 별 테스트
  - main.js 기능 테스트
  - preload.js 기능 테스트

- **통합 테스트**
  - IPC 통신 테스트
  - 창 관리 테스트
  - 알림 시스템 테스트

- **성능 테스트**
  - 메모리 사용량 테스트
  - CPU 사용량 테스트

### 7.2 테스트 커버리지

- 최소 80% 코드 커버리지 목표

## 8. 릴리스 및 배포

### 8.1 버전 관리

- **현재 버전**: 1.0.7
- **버전 규칙**: SemVer (Semantic Versioning)

### 8.2 CI/CD 파이프라인 (GitHub Actions)

- **트리거**
  - main/develop 브랜치 푸시: 전체 빌드 및 테스트
  - Pull Request: 빌드 검증 및 코드 품질 검사
  - 태그 (v\*): 공식 릴리즈 생성
  - 수동 디스패치: 요청 시 빌드

- **파이프라인 단계**
  1. 테스트 스위트 실행 (Jest)
  2. 멀티 플랫폼 빌드 (Windows, macOS, Linux)
  3. 코드 품질 검사 (ESLint, Prettier)
  4. 보안 스캔 (npm audit)
  5. 릴리즈 (GitHub Release)

### 8.3 빌드 아티팩트

- **macOS**: `dist/*.dmg` (Universal Binary)
- **Windows**: `dist/*.exe` (NSIS 설치 프로그램)
- **Linux**: `dist/*.AppImage`, `dist/*.deb`

## 9. 사용자 경험 (UX) 요구사항

### 9.1 로딩 경험

- **로딩 화면**
  - 스피너 애니메이션
  - "Google Chat을 로드하는 중..." 메시지
  - "최적화된 성능으로 더 빠르게" 서브 메시지
  - 최대 2초 후 자동 숨김

- **에러 처리**
  - 네트워크 오류 시 에러 메시지 표시
  - 최대 3회 재시도 기능 제공
  - 명확한 에러 메시지 및 해결 가이드

### 9.2 사용자 피드백

- **알림**
  - 새 메시지 도착 시 알림
  - 다운로드 완료 알림
  - 다운로드 실패 알림

- **상태 표시**
  - 로딩 상태 (스피너)
  - 에러 상태 (에러 메시지)

## 10. 향후 개선 사항 (Future Enhancements)

### 10.1 우선순위 높은 기능

- 다크 모드 지원
- Google Meet 통합
- 알림 설정 (사용자 정의 알림)
- 다중 계정 지원

### 10.2 우선순위 낮은 기능

- 맞춤법 검사 활성화
- 플러그인 지원
- 테마 설정
- 단축키 사용자 정의

## 11. 기술 스택

### 11.1 핵심 기술

- **Framework**: Electron 39.2.0
- **Build Tool**: electron-builder 26.0.12
- **Test Framework**: Jest 29.7.0
- **Code Quality**: ESLint 8.57.0, Prettier 3.2.5

### 11.2 주요 라이브러리

- Node.js 내장 모듈 (path, process 등)
- Electron API (BrowserWindow, Tray, Menu, ipcMain, Notification 등)

## 12. 라이선스 및 법적 사항

### 12.1 라이선스

- **라이선스 종류**: MIT License
- **저작권**: Google Chat Desktop

### 12.2 면책 조항

- 비공식 Google Chat 데스크탑 클라이언트입니다.
- 앱 기능은 Google Chat 웹 서비스 안정성에 의존합니다.
- Google 계정 로그인이 필요합니다.

## 13. 성공 지표 (Success Metrics)

### 13.1 기술적 지표

- 메모리 사용량 60% 감소 (치명적 메모리 릭 수정 후)
- CPU 사용량 최적화 (백그라운드에서 최소화)
- 앱 크기 < 100MB (포장된 앱)

### 13.2 사용자 경험 지표

- 앱 시작 시간 < 5초
- 페이지 로드 시간 < 3초
- 알림 응답 시간 < 1초

## 14. 문서화

### 14.1 기술 문서

- CLAUDE.md: 개발 가이드 및 아키텍처 설명
- README.md: 사용자 가이드 및 설치 방법
- TESTING.md: 테스트 가이드 (필요 시 생성)
- CHANGELOG.md: 버전 변경 내역

### 14.2 사용자 문서

- README.md: 사용자를 위한 설명서
- 앱 내 도움말 메뉴: 정보 대화상자
