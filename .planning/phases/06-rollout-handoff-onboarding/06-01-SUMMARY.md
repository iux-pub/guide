---
phase: 06-rollout-handoff-onboarding
plan: 01
subsystem: docs
tags: [onboarding, handoff, figma, bem, eleventy, markdown]

requires:
  - phase: 05-documentation-site
    provides: Eleventy 문서 사이트 구조, 네비게이션, 레이아웃 템플릿
provides:
  - 온보딩 개요 페이지 (site/onboarding/index.md)
  - 6단계 시작 가이드 (site/onboarding/getting-started.md)
  - 피그마→코드 핸드오프 규칙 (site/onboarding/handoff.md)
  - 네비게이션에 온보딩 섹션 추가
affects: []

tech-stack:
  added: []
  patterns:
    - "온보딩 디렉토리 데이터 파일 패턴 (onboarding.json)"

key-files:
  created:
    - site/onboarding/onboarding.json
    - site/onboarding/index.md
    - site/onboarding/getting-started.md
    - site/onboarding/handoff.md
  modified:
    - site/_data/navigation.json

key-decisions:
  - "기존 tokens.json 패턴을 그대로 따라 onboarding.json 디렉토리 데이터 파일 생성"
  - "피그마 컴포넌트 매핑을 버튼/카드/폼/테이블/기타로 분류하여 가독성 향상"

patterns-established:
  - "온보딩 페이지 구조: 개요 → 시작 가이드 → 핸드오프 3단계"

requirements-completed: [HAND-01, HAND-02]

duration: 2min
completed: 2026-03-26
---

# Phase 6 Plan 01: 온보딩 가이드와 핸드오프 규칙 Summary

**온보딩 3페이지(개요, 6단계 시작 가이드, 피그마→BEM 핸드오프) 문서 사이트에 추가하고 네비게이션 연결**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-26T01:12:59Z
- **Completed:** 2026-03-26T01:14:48Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- 온보딩 개요 페이지에 가이드 시스템 구성과 주요 문서 링크 정리
- 6단계 시작 가이드(설치, SCSS 구조, 토큰, 컴포넌트, BEM, 접근성)에 각 단계별 심화 링크 포함
- 피그마→BEM 매핑 테이블(버튼 6종, 카드 2종, 폼 5종, 테이블 2종, 기타 4종 = 19개 매핑), 토큰 연결 테이블, 핸드오프 체크리스트 8항목 작성
- 네비게이션에 온보딩 섹션 3개 항목 추가

## Task Commits

Each task was committed atomically:

1. **Task 1: 온보딩 가이드 페이지 3개 + 디렉토리 데이터 파일 생성** - `074f400` (feat)
2. **Task 2: 네비게이션에 온보딩 섹션 추가** - `d108e98` (feat)

## Files Created/Modified
- `site/onboarding/onboarding.json` - Eleventy 디렉토리 데이터 파일 (layout, section, tags)
- `site/onboarding/index.md` - 온보딩 개요, 가이드 시스템 구성 소개
- `site/onboarding/getting-started.md` - 6단계 시작 가이드 (설치~접근성)
- `site/onboarding/handoff.md` - 피그마→BEM 매핑, 토큰 연결, 전달 체크리스트
- `site/_data/navigation.json` - 온보딩 섹션 추가 (5번째 섹션)

## Decisions Made
- 기존 tokens.json 패턴을 그대로 따라 onboarding.json 디렉토리 데이터 파일 생성
- 피그마 컴포넌트 매핑을 버튼/카드/폼/테이블/기타로 분류하여 가독성 향상

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 온보딩 문서 완성, Phase 6 후속 플랜(있다면) 진행 가능
- 문서 사이트 빌드 시 온보딩 페이지가 _site/onboarding/ 아래 정상 생성됨

## Self-Check: PASSED

All 6 files found. All 2 commit hashes verified.

---
*Phase: 06-rollout-handoff-onboarding*
*Completed: 2026-03-26*
