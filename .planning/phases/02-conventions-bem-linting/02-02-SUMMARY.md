---
phase: 02-conventions-bem-linting
plan: 02
subsystem: conventions
tags: [claude-md, bem, scss, design-tokens, ai-instructions, itcss, accessibility]

requires:
  - phase: 01-foundation-design-tokens-scss-architecture
    provides: ITCSS SCSS 구조 + 디자인 토큰 파일 + 반응형 믹스인
  - phase: 02-conventions-bem-linting
    plan: 01
    provides: Stylelint BEM 린팅 환경 + BEM 가이드 문서
provides:
  - CLAUDE.md 통합 AI 지시문 (BEM, 토큰, SCSS 구조, 접근성, 린트 규칙)
affects: [03-components, 04-accessibility, 05-documentation-site, 06-rollout]

tech-stack:
  added: []
  patterns: [CLAUDE.md AI instruction 형태 규칙 통합, GSD 블록 기반 섹션 관리]

key-files:
  created: []
  modified: [CLAUDE.md]

key-decisions:
  - "CLAUDE.md conventions/architecture 블록에 Phase 1~2 전체 규칙을 통합 -- 별도 스킬 파일 없이 단일 파일로 AI 지시문 완성"
  - "토큰 변수명은 실제 SCSS 파일에서 읽어온 정확한 값 사용 -- 추측 없이 src/scss/1-settings/ 파일 기반"
  - "모든 규칙을 명령형으로 작성 -- AI가 지시문으로 즉시 해석 가능한 형태"

patterns-established:
  - "CLAUDE.md GSD 블록 패턴: conventions-start/end, architecture-start/end로 섹션 분리"
  - "AI instruction 형태: 금지 패턴과 올바른 패턴 대조표, 하드코딩 vs 토큰 비교 예시"

requirements-completed: [AI-03]

duration: 6min
completed: 2026-03-25
---

# Phase 02 Plan 02: CLAUDE.md AI 지시문 통합 Summary

**CLAUDE.md를 Phase 1~2 전체 규칙(BEM 네이밍, 디자인 토큰 전체 변수명, ITCSS 7레이어 구조, 반응형 믹스인, 린트 규칙, 접근성 기본) 통합 AI 지시문 525줄로 재작성**

## Performance

- **Duration:** 6min
- **Started:** 2026-03-25T02:34:08Z
- **Completed:** 2026-03-25T02:40:27Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- CLAUDE.md conventions 블록에 BEM 네이밍 규칙 (필수 패턴 4종, 금지 패턴 6종 대조표, SCSS 중첩 예시) 작성
- 디자인 토큰 전체 변수명을 실제 SCSS 파일 기반으로 정확히 나열 (색상 24개, 타이포 14개, 간격 7개, 기타 18개)
- CLAUDE.md architecture 블록에 ITCSS 7레이어 구조, 파일 배치 규칙, 반응형 믹스인 사용법, 공용 믹스인 시그니처 작성
- 하드코딩 vs 토큰 비교 예시, 린트 명령어, 접근성 기본 규칙 포함

## Task Commits

1. **Task 1: CLAUDE.md를 Phase 1~2 통합 AI 지시문으로 업데이트** - `0c18731` (feat)

## Files Created/Modified

- `CLAUDE.md` - Phase 1~2 전체 규칙 통합 AI 지시문 (525줄). conventions 블록: BEM, 토큰, 린트, 코딩 스타일, 접근성. architecture 블록: ITCSS 구조, 반응형, 믹스인.

## Decisions Made

- **단일 파일 통합:** D-08 결정에 따라 별도 스킬 파일 없이 CLAUDE.md 하나에 모든 규칙 통합
- **실제 토큰 값 사용:** 추측 없이 `src/scss/1-settings/` 파일에서 읽어온 정확한 변수명과 값 나열
- **명령형 작성:** 모든 규칙을 "~하라", "~금지한다" 형태로 작성하여 AI가 즉시 지시문으로 해석 가능

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - 추가 환경 설정 불필요.

## Next Phase Readiness

- CLAUDE.md가 Phase 1~2 전체 규칙을 포함하므로 Phase 3 컴포넌트 작성 시 AI가 즉시 BEM + 토큰 규칙을 따를 수 있음
- Phase 5 문서 사이트에서 CLAUDE.md 규칙 반영 가능
- Phase 6 롤아웃 시 CLAUDE.md만 복사하면 AI가 팀 표준 즉시 적용

## Self-Check: PASSED

- CLAUDE.md: FOUND (525 lines)
- 02-02-SUMMARY.md: FOUND
- Commit 0c18731: FOUND

---
*Phase: 02-conventions-bem-linting*
*Completed: 2026-03-25*
