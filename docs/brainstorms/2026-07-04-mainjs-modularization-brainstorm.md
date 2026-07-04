---
date: 2026-07-04
topic: mainjs-modularization
status: ready-for-plan
---

# main.js 모듈화 + 기술 부채 정리

## What We're Building

단일 파일 `main.js`(832줄)와 `preload.js`(461줄)를 계층형 다중 파일 구조로 분해하고, 직전 코드베이스 분석에서 발견된 기술 부채를 동시에 정리한다. 결과적으로 `src/main/`, `src/preload/`, `src/shared/` 계층 구조를 갖춘 Electron 앱이 되며, 의존성 부조하·데드 CI 잡·stale UA·잡동사니 파일이 제거된다.

동작(사용자 관점 기능)은 무결하게 보존한다. 단, stale Chrome/120 UA 갱신은 의도적 행동 변경으로 포함한다.

## Why This Approach

3가지 접근(최소 분리 / 기능별 / 계층별)을 검토했다. **계층별 분리(C)**를 선택한 이유:
- 단일창 Google Chat 래퍼로 기능 확장 당분간 없으나, 기술적 관심사(window / tray / menu / IPC / injection / memory)가 명확히 구분됨
- Electron 관례(`src/main`, `src/preload`)에 부합해 신규 기여자 온보딩 비용 낮음
- `shared/`에 상수·헬퍼를 두어 main/preload 양쪽 재사용 가능

기능별 분리(B)는 신규 기능이 임박하지 않아 과도 분할로 판단. 최소 분리(A)는 평탄하나 구조 개편 의도 대비 명확성 부족.

**진입점 전략**: Clean cutover. `package.json`의 `main` 필드와 `build.files`, `webPreferences.preload` 경로를 모두 새 구조로 이동. 루트 `main.js`/`preload.js`는 제거. Shim 유지보다 빌드 설정 전면 수정 비용을 감수하고 구조적 일관성 확보.

## Key Decisions

**아키텍처 결정**:
- **구조**: `src/main/{index, window, tray, menu, notifications, navigation-guard, context-menu, optimization-injection, memory-monitor, process-handlers}.js` + `src/main/ipc/{index, downloads, external-links, memory, notifications, window}.js` + `src/preload/{index, title-observer, keyboard, error-handler}.js` + `src/shared/{constants, timers}.js`. 파일 레이아웃은 확정; 함수→파일 매핑은 plan에서 확정.
- **ESM 전환 안 함**: 현행 CommonJS 유지. Electron 39 ESM 지원 존재하나 전환 비용 > 이점. YAGNI.
- **인라인 인젝션 스크립트 추출**: `createWindow` 내 114줄짜리 `did-finish-load` 인젝션 함수(`initializeOptimizations.toString()` 주입)를 `src/main/optimization-injection.js`로 분리. 인젝션 메커니즘 자체는 plan에서 결정.
- **`timers`/`intervals` Sets 이동**: 글로벌 `Set`들을 `src/shared/timers.js`로 이동, 헬퍼(`trackTimer`, `clearAllTimers`) 노출.
- **Clean cutover**: `package.json` main = `src/main/index.js`, `build.files` = `["src/**/*", "index.html", "assets/**/*", "package.json"]`, `webPreferences.preload` 경로 변경. 루트 `main.js`/`preload.js` 삭제.

**부채 정리 결정**:
- **UA 갱신**: Chrome/120 → 현재 stable 버전으로 갱신(`src/shared/constants.js`에서 단일 소스). 호환성 위험은 acceptance의 UA 검증 항목으로 방어.
- **의존성 정리**: `@tauri-apps/cli` 제거(사용처 없음), `jest-environment-jsdom`을 `jest@29.7`과 정합(29.x로 다운그레이드), `js-yaml` override 제거(CHANGELOG 1.0.3 보안 다운그레이드 맥락에서 추가됐으나 현재 jest 29.7 고정으로 불필요).
- **CI 정리**: 데드 `update-dependencies` 잡 제거(schedule 트리거 없음), `codecov-action@v3` → `v5`, `softprops/action-gh-release@v1` → `v2`. Linux 빌드 타겟: 단일 AppImage 유지 + CI 워크플로우(upload-artifact 패턴)와 release 본문에서 `.deb`/`.rpm` 언급 제거(YAGNI — 현재 빌드 파이프라인이 AppImage만 생성, 문서만 과대).
- **잡동사니 제거**: `.env.example`(dotenv 미사용), `.taskmaster/`(Taskmaster AI 산물, 런타임 무관). `.gitignore` 점검.

**릴리스 결정**:
- **버전 범프**: `1.0.8` → `1.1.0`(minor). 내부 구조 개편 + 부채 정리 마일스톤. end-user breaking 변경 없으나 규모 신호용.
- **신규 단위 테스트 포함**: 범위 "전부"에 부합. plan에서 새 구조의 각 모듈(window/tray/menu/ipc/* 등)에 대한 단위 테스트 작성 포함.

## Acceptance Criteria

- `npm test` 전체 통과 — 단, 현재 테스트들은 main/preload를 직접 import하지 않고 로직을 인라인 재구현한 스니펫 테스트이므로 **리팩터된 실제 코드를 검증하지 못함**. 신규 단위 테스트로 gap 보완(범위 "전부"에 포함). `jest.config.js`의 `collectCoverageFrom` 경로 갱신 필수.
- ESLint + Prettier clean
- 수동 스모크: 앱 시작 → Google Chat 로딩 → 트레이 토글 → 다운로드 → 알림 → 외부 링크 → 종료/재시작 정상
- **UA 호환성 검증**: UA 갱신 후 Google Chat 정상 로딩(로그인 페이지 → 채팅 목록 → 메시지 송수신) 확인. 호환 깨질 시 원복.
- GitHub Actions 3플랫폼(macOS/Windows/Linux) 빌드 green
- `npm audit` 0 취약점 — 의존성 버전업 시 신규 취약점 노출 가능. 발생 시 `--legacy-peer-deps`/대체 버전 핀으로 완화하거나 예외 명시.
- before/after `git diff` 코드 리뷰
- `CHANGELOG.md` 갱신(1.1.0 섹션 추가)
- `README.md` 파일 구조 섹션 + `CLAUDE.md` 아키텍처 섹션 갱신

## Open Questions

없음 — 모든 WHAT 수준 결정 확정. 세부 파일 분할·인젝션 메커니즘·테스트 커버리지 경로 갱신 등 HOW 영역은 `/workflows:plan`으로 이관.

## Next Steps

→ `/workflows:plan docs/brainstorms/2026-07-04-mainjs-modularization-brainstorm.md` for 구현 단계, 파일별 변경 내역, 테스트/CI 수정 디테일.
