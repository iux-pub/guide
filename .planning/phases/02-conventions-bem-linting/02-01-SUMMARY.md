---
phase: 02-conventions-bem-linting
plan: 01
subsystem: linting
tags: [stylelint, bem, scss, linting, naming-convention]

requires:
  - phase: 01-foundation-design-tokens-scss-architecture
    provides: ITCSS SCSS 구조 + 디자인 토큰 + 5-objects/7-utilities BEM 패턴 파일
provides:
  - Stylelint BEM 린팅 환경 (.stylelintrc.json)
  - npm lint:css / lint:css:fix 스크립트
  - BEM 네이밍 규칙 가이드 문서 (docs/bem-guide.md)
affects: [03-components, 05-documentation-site, 02-02]

tech-stack:
  added: [stylelint@17.5.0, stylelint-config-standard-scss@17.0.0, stylelint-selector-bem-pattern@4.0.1]
  patterns: [BEM regex validation via scss/selector-class-pattern, warning-level severity, implicitComponents for objects/components layers]

key-files:
  created: [.stylelintrc.json, docs/bem-guide.md]
  modified: [package.json, package-lock.json]

key-decisions:
  - "stylelint-selector-bem-pattern@4.0.1은 peer dep으로 stylelint@^16을 요구하나, stylelint@17과 호환 동작 확인 (--legacy-peer-deps로 설치)"
  - "defaultSeverity: warning으로 설정 -- 빌드 성공 보장, 팀 적응 후 error로 전환 가능"
  - "selector-class-pattern: null로 코어 규칙 비활성화, scss/selector-class-pattern으로 대체 (Stylelint 17 SCSS 중첩 지원)"

patterns-established:
  - "BEM regex: ^[a-z][a-z0-9]*(-[a-z0-9]+)*((__[a-z0-9]+(-[a-z0-9]+)*)(--[a-z0-9]+(-[a-z0-9]+)*)?|(--[a-z0-9]+(-[a-z0-9]+)*))?$"
  - "SCSS BEM 중첩: &__element, &--modifier 패턴 필수"
  - "Element 2단계 중첩 금지: .card__header__title -> .card__title로 평탄화"

requirements-completed: [BEM-01, BEM-02, BEM-03, BEM-04]

duration: 5min
completed: 2026-03-25
---

# Phase 02 Plan 01: Stylelint BEM 린팅 + BEM 가이드 Summary

**Stylelint 17 BEM 린팅 환경 구축 (scss/selector-class-pattern + warning severity) 및 기존 프로젝트 실제 패턴 기반 DO/DON'T 가이드 372줄 작성**

## Performance

- **Duration:** 5min
- **Started:** 2026-03-25T02:11:37Z
- **Completed:** 2026-03-25T02:16:18Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Stylelint BEM 린팅 환경 구축 (scss/selector-class-pattern + resolveNestedSelectors로 SCSS 중첩 BEM 검증)
- npm run lint:css / lint:css:fix 스크립트 추가로 전체 SCSS 린트 가능
- BEM 네이밍 가이드 372줄 작성 -- 기존 프로젝트 잘못된 패턴 20개 이상 DO/DON'T 예제, SCSS 중첩 규칙, ITCSS 적용 범위

## Task Commits

1. **Task 1: Stylelint 패키지 설치 + .stylelintrc.json 설정 + npm scripts 추가** - `e347ef7` (chore)
2. **Task 2: BEM 가이드 문서 작성 (do/don't + SCSS 중첩 패턴)** - `058c805` (docs)

## Files Created/Modified

- `.stylelintrc.json` - Stylelint BEM 린팅 설정 (scss/selector-class-pattern BEM regex + plugin/selector-bem-pattern)
- `docs/bem-guide.md` - BEM 네이밍 규칙 가이드 (372줄, DO/DON'T + SCSS 중첩 + ITCSS 적용 범위 + Stylelint 사용법)
- `package.json` - devDependencies 추가 + lint:css, lint:css:fix 스크립트 추가
- `package-lock.json` - 의존성 잠금 파일 업데이트

## Decisions Made

- **stylelint-selector-bem-pattern peer dep 충돌:** v4.0.1이 stylelint@^16을 요구하나 stylelint@17.5.0과 실제 동작 호환됨. --legacy-peer-deps로 설치
- **defaultSeverity warning:** D-04 결정에 따라 빌드 성공 보장. 전체 SCSS lint 결과 0 errors, 19 warnings
- **코어 selector-class-pattern null 처리:** Stylelint 17에서 resolveNestedSelectors가 코어에서 제거되어 scss/selector-class-pattern으로 대체

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] stylelint-selector-bem-pattern peer dependency 충돌 해결**
- **Found during:** Task 1 (패키지 설치)
- **Issue:** stylelint-selector-bem-pattern@4.0.1이 peer dep으로 stylelint@^16을 요구하여 stylelint@17.5.0과 충돌
- **Fix:** --legacy-peer-deps 플래그로 설치. 실제 기능 테스트 통과 확인
- **Files modified:** package.json, package-lock.json
- **Verification:** npx stylelint 실행 시 plugin/selector-bem-pattern 규칙 정상 동작 확인
- **Committed in:** e347ef7 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** peer dep 충돌은 버전 범위 문제일 뿐 실제 기능에 영향 없음. 정상 동작 확인됨.

## Issues Encountered

- 전체 SCSS lint에서 19개 warning 발생 (0 errors). 모두 stylelint-config-standard-scss 기본 규칙의 스타일 경고이며 BEM 위반은 아님. 기존 Phase 1 코드의 선언 순서, 빈 줄 등 cosmetic 경고.

## User Setup Required

None - 추가 환경 설정 불필요.

## Next Phase Readiness

- BEM 린팅 환경 완비 -- Phase 3 컴포넌트 작성 시 자동 BEM 검증 가능
- docs/bem-guide.md로 컴포넌트 네이밍 참조 가이드 제공
- Plan 02-02 (CLAUDE.md AI 지시문 통합)에서 이 BEM 규칙을 AI instruction으로 반영 예정

## Self-Check: PASSED

- .stylelintrc.json: FOUND
- docs/bem-guide.md: FOUND
- 02-01-SUMMARY.md: FOUND
- Commit e347ef7: FOUND
- Commit 058c805: FOUND

---
*Phase: 02-conventions-bem-linting*
*Completed: 2026-03-25*
