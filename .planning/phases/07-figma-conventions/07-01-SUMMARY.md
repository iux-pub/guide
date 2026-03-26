---
phase: 07-figma-conventions
plan: 01
subsystem: docs
tags: [figma, design-conventions, variables, auto-layout, documentation, eleventy]

requires:
  - phase: 05-documentation-site
    provides: Eleventy 문서 사이트 인프라 및 페이지 패턴
provides:
  - 피그마 컴포넌트 네이밍 규칙 문서
  - 레이어/프레임 구조 가이드 문서
  - 피그마 Variable-CSS Custom Property 매핑 테이블
  - Auto Layout 토큰 매핑 참조표
affects: [08-design-qa-handoff-quality]

tech-stack:
  added: []
  patterns: [피그마 Variable 네이밍 → CSS Custom Property 변환 규칙]

key-files:
  created:
    - site/figma/figma.json
    - site/figma/index.md
    - site/figma/component-naming.md
    - site/figma/layer-structure.md
    - site/figma/variables.md
    - site/figma/auto-layout.md
  modified:
    - site/_data/navigation.json

key-decisions:
  - "피그마 컴포넌트 네이밍은 PascalCase + 슬래시 계층 구조로 통일"
  - "Variable Collection을 Color/Typography/Spacing/Misc 4개로 구분"
  - "Auto Layout 값은 토큰 스케일(4,8,16,24,32,48,64px)만 허용, 비토큰 값 금지"

patterns-established:
  - "피그마 Variable → CSS Custom Property 변환: 슬래시를 하이픈으로, PascalCase를 kebab-case로"
  - "컴포넌트 Property 네이밍: Variant는 camelCase, Boolean은 has/show 접두사"

requirements-completed: [FIG-01, FIG-02, FIG-03, FIG-04]

duration: 4min
completed: 2026-03-26
---

# Phase 7 Plan 1: 피그마 컨벤션 Summary

**피그마 컴포넌트 네이밍/레이어 구조/Variable 매핑/Auto Layout 토큰 규칙 4개 가이드를 Eleventy 문서 사이트에 추가**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T02:42:02Z
- **Completed:** 2026-03-26T02:46:24Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- 피그마 컴포넌트 네이밍 규칙 (계층 구조, PascalCase, Property 네이밍, BEM 매핑) 문서화
- 레이어/프레임 구조 가이드 (페이지 구성, 프레임 네이밍, 정리 원칙, 크기 기준) 문서화
- 피그마 Variable과 CSS Custom Property 간 전체 매핑 테이블 (색상, 타이포, 간격, 기타) 작성
- Auto Layout 패딩/갭 토큰 매핑, 컴포넌트별 패턴, 반응형 동작 정의

## Task Commits

Each task was committed atomically:

1. **Task 1: 피그마 컨벤션 디렉토리 + 개요 + 컴포넌트 네이밍** - `abe7e6d` (feat)
2. **Task 2: 레이어/프레임 구조 + Variable 매핑** - `50f5504` (feat)
3. **Task 3: Auto Layout 규칙 + 네비게이션 업데이트** - `08763d0` (feat)

## Files Created/Modified
- `site/figma/figma.json` - Eleventy 디렉토리 데이터 파일
- `site/figma/index.md` - 피그마 컨벤션 개요 페이지
- `site/figma/component-naming.md` - 컴포넌트 네이밍 규칙 (계층, 대소문자, Property, BEM 매핑)
- `site/figma/layer-structure.md` - 레이어/프레임 구조 가이드 (페이지 구성, 네이밍, 정리 원칙)
- `site/figma/variables.md` - Variable 네이밍 + CSS Custom Property 매핑 테이블
- `site/figma/auto-layout.md` - Auto Layout 패딩/갭 토큰 매핑, 반응형 동작
- `site/_data/navigation.json` - 피그마 컨벤션 섹션 추가 (5개 항목)

## Decisions Made
- 피그마 컴포넌트 네이밍은 PascalCase + 슬래시 계층 구조로 통일 (BEM 매핑과 자연스럽게 연결)
- Variable Collection을 Color/Typography/Spacing/Misc 4개로 구분하여 관리
- Auto Layout 값은 토큰 스케일(4,8,16,24,32,48,64px)만 허용하고 비토큰 값(5px, 10px, 15px 등) 금지

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 피그마 컨벤션 4개 문서가 완성되어 Phase 8 (디자인 QA + 핸드오프 품질) 진행 가능
- Variable 매핑 테이블이 핸드오프 QA 체크리스트의 기준 자료로 활용 가능

---
*Phase: 07-figma-conventions*
*Completed: 2026-03-26*
