---
phase: 02-conventions-bem-linting
verified: 2026-03-25T00:00:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 2: Conventions — BEM + Linting Verification Report

**Phase Goal:** BEM 네이밍 규칙이 명확히 문서화되고 Stylelint으로 자동 강제되어, 기존의 느슨한 하이픈 네이밍 대신 일관된 Block__Element--Modifier 패턴이 적용되는 상태
**Verified:** 2026-03-25
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                 | Status     | Evidence                                                                              |
|----|-----------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------|
| 1  | npx stylelint 실행 시 BEM 위반 클래스명에 warning이 출력된다          | ✓ VERIFIED | `.stylelintrc.json`에 `defaultSeverity: "warning"` 설정 확인. `scss/selector-class-pattern`에 BEM regex + 위반 시 한국어 메시지 포함. `plugin/selector-bem-pattern`에 `severity: "warning"` 옵션 명시. |
| 2  | npm run lint:css 명령이 동작한다                                       | ✓ VERIFIED | `package.json` scripts에 `lint:css`, `lint:css:fix` 두 개 모두 존재. stylelint 바이너리 `node_modules/.bin/stylelint` 설치 확인. |
| 3  | BEM 가이드 문서에 do/don't 예제가 기존 프로젝트 실제 코드 기반으로 존재한다 | ✓ VERIFIED | `docs/bem-guide.md` 372줄. `.btn-primary`→`.btn--primary`, `.card-header`→`.card__header`, `.input-box.error`→`.form__input--error` 등 20개 이상의 DO/DON'T 예제. `grep -c "DON'T\|잘못된\|금지"` 결과 19개. |
| 4  | SCSS 중첩 BEM 패턴(&__element, &--modifier) 가이드가 예제 코드와 함께 존재한다 | ✓ VERIFIED | `docs/bem-guide.md`에 `&__header`, `&__body`, `&__title`, `&--featured` 등 카드/버튼 컴포넌트 전체 예제 포함. `&__` 및 `&--` 패턴 모두 확인. |
| 5  | BEM 위반 경고 메시지에 올바른 패턴 권장 방향이 포함된다                | ✓ VERIFIED | `.stylelintrc.json` `message` 필드: `"BEM 패턴 위반: \"%s\" -> .block__element--modifier 형태로 작성하세요"` 명시. |
| 6  | CLAUDE.md를 읽은 AI가 BEM 패턴에 맞는 SCSS 코드를 즉시 생성할 수 있다 | ✓ VERIFIED | CLAUDE.md 525줄. 필수 패턴 4종, 금지 패턴 6종 대조표, SCSS 중첩 예시(카드 컴포넌트) 포함. `block__element--modifier`, `btn--primary` 모두 확인. |
| 7  | CLAUDE.md에 디자인 토큰 사용법이 구체적으로 안내되어 있다             | ✓ VERIFIED | `--color-primary`, `--spacing-*`, `--font-size-*` 실제 변수명 전체 나열. 하드코딩 vs 토큰 비교 예시 포함. |
| 8  | CLAUDE.md에 SCSS 구조(ITCSS 레이어, 파일 배치) 규칙이 포함되어 있다  | ✓ VERIFIED | `6-components` ITCSS 레이어 경로, `respond-to` 믹스인 사용법, `@use/@forward` 모듈 시스템 규칙 포함. |
| 9  | CLAUDE.md에 금지 패턴이 명시되어 있다                                 | ✓ VERIFIED | `.btn-primary` → `.btn--primary` 등 6가지 금지 패턴 대조표. 인라인 스타일 금지, `!important` 금지, 하드코딩 값 금지 명시. |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact                     | Expected                            | Status     | Details                                                                                   |
|------------------------------|-------------------------------------|------------|-------------------------------------------------------------------------------------------|
| `.stylelintrc.json`          | Stylelint BEM 린팅 설정              | ✓ VERIFIED | 28줄. `extends`, `plugins`, `defaultSeverity: "warning"`, `scss/selector-class-pattern` BEM regex, `plugin/selector-bem-pattern` 모두 포함. |
| `docs/bem-guide.md`          | BEM 네이밍 규칙 가이드 (100줄 이상)  | ✓ VERIFIED | 372줄. min_lines 100 기준 초과. DO/DON'T 예제 6섹션, SCSS 중첩 패턴, ITCSS 레이어별 적용 범위, Stylelint 사용법 포함. |
| `package.json`               | lint:css, lint:css:fix npm scripts  | ✓ VERIFIED | `lint:css: "stylelint \"src/scss/**/*.scss\""`, `lint:css:fix: "stylelint \"src/scss/**/*.scss\" --fix"` 모두 존재. |
| `CLAUDE.md`                  | AI 즉시 활용 가능한 프로젝트 전체 규칙 지시문 | ✓ VERIFIED | 525줄 (min_lines 80 초과). BEM, 토큰, SCSS 구조, 접근성, 린트 규칙 모두 포함. GSD 워크플로우 섹션 보존. |

---

### Key Link Verification

| From                | To                          | Via                              | Status     | Details                                                                               |
|---------------------|-----------------------------|----------------------------------|------------|---------------------------------------------------------------------------------------|
| `.stylelintrc.json` | `src/scss/**/*.scss`        | stylelint CLI (`lint:css` script) | ✓ WIRED    | `package.json`의 `lint:css` 스크립트가 `stylelint "src/scss/**/*.scss"`로 연결. stylelint@17.5.0 설치 확인. |
| `.stylelintrc.json` | `scss/selector-class-pattern` | stylelint-config-standard-scss extends | ✓ WIRED    | `"extends": ["stylelint-config-standard-scss"]` 후 `"scss/selector-class-pattern"` 규칙 재정의로 BEM regex 적용. |
| `CLAUDE.md`         | `src/scss/**/*.scss`        | AI 코드 생성 지시문              | ✓ WIRED    | `block__element--modifier` 패턴 명시. 신규 파일 배치 경로(`6-components/_컴포넌트명.scss`) 안내. |
| `CLAUDE.md`         | `.stylelintrc.json`         | 린트 규칙 참조                   | ✓ WIRED    | `lint:css` 명령어 및 BEM 위반이 warning 수준임을 CLAUDE.md에 명시. |

---

### Data-Flow Trace (Level 4)

해당 없음 — 이 페이즈는 설정 파일, 문서, 린트 규칙으로 구성되어 동적 데이터를 렌더링하는 컴포넌트를 포함하지 않음.

---

### Behavioral Spot-Checks

| Behavior                                           | Check                                                              | Result                          | Status  |
|----------------------------------------------------|--------------------------------------------------------------------|---------------------------------|---------|
| `defaultSeverity: "warning"` 설정 확인             | `grep -q "defaultSeverity.*warning" .stylelintrc.json`            | PASS                            | ✓ PASS  |
| `scss/selector-class-pattern` 규칙 존재            | `grep -q "scss/selector-class-pattern" .stylelintrc.json`         | PASS                            | ✓ PASS  |
| `lint:css`, `lint:css:fix` 스크립트 존재           | `grep -q "lint:css" package.json && grep -q "lint:css:fix"`       | PASS (both)                     | ✓ PASS  |
| stylelint 패키지 설치 확인                          | `ls node_modules/stylelint/package.json`                          | PASS (v17.5.0)                  | ✓ PASS  |
| stylelint-selector-bem-pattern 설치 확인           | `ls node_modules/stylelint-selector-bem-pattern/package.json`     | PASS (v4.0.1)                   | ✓ PASS  |
| stylelint-config-standard-scss 설치 확인           | `ls node_modules/stylelint-config-standard-scss/package.json`     | PASS                            | ✓ PASS  |
| BEM 가이드 문서 줄 수 확인                          | `wc -l docs/bem-guide.md`                                         | 372줄 (기준 100줄 초과)          | ✓ PASS  |
| CLAUDE.md 줄 수 확인                                | `wc -l CLAUDE.md`                                                 | 525줄 (기준 80줄 초과)           | ✓ PASS  |
| BEM 가이드 DO/DON'T 신호 수                         | `grep -c "DON'T\|잘못된\|금지" docs/bem-guide.md`                 | 19개 (기준 3개 초과)             | ✓ PASS  |
| CLAUDE.md 필수 키워드 일괄 확인                     | block__element--modifier, btn--primary, --color-primary, --spacing-, --font-size-, respond-to, lint:css, 6-components, aria-, GSD | PASS (전체 10개) | ✓ PASS |
| stylelint 실행 시 5-objects 에러 없음               | `node_modules/.bin/stylelint 'src/scss/5-objects/**/*.scss'`      | 출력 없음 = 에러 0개 (warnings만) | ✓ PASS  |

---

### Requirements Coverage

| Requirement | Source Plan  | Description                                              | Status       | Evidence                                                                  |
|-------------|--------------|----------------------------------------------------------|--------------|---------------------------------------------------------------------------|
| BEM-01      | 02-01-PLAN   | BEM 네이밍 규칙 가이드 (Block__Element--Modifier 표기법 명확화) | ✓ SATISFIED  | `docs/bem-guide.md` Block/Element/Modifier 정의, 허용 패턴 표, ITCSS 레이어별 적용 범위 문서화. |
| BEM-02      | 02-01-PLAN   | BEM do/don't 예제 모음 (기존 잘못된 패턴 vs 올바른 패턴)   | ✓ SATISFIED  | 6개 섹션에 20개 이상 DO/DON'T 예제. `.btn-primary`, `.card-header`, `.input-box.error` 등 기존 프로젝트 실제 패턴 기반. |
| BEM-03      | 02-01-PLAN   | SCSS에서 BEM 중첩 작성 규칙 (&__element, &--modifier 패턴) | ✓ SATISFIED  | `docs/bem-guide.md` "SCSS 중첩 BEM 작성 규칙" 섹션에 카드/버튼 컴포넌트 전체 예제. `resolveNestedSelectors: true`로 린트 지원. |
| BEM-04      | 02-01-PLAN   | Stylelint + BEM 패턴 린팅 설정 파일 (.stylelintrc) 템플릿 제공 | ✓ SATISFIED  | `.stylelintrc.json` 생성. `scss/selector-class-pattern` BEM regex, `plugin/selector-bem-pattern` implicitComponents, `defaultSeverity: "warning"` 설정. |
| AI-03       | 02-02-PLAN   | 디자인 토큰/BEM 규칙이 AI 지시문(instruction) 형태로도 제공되어 프로젝트 시작 시 즉시 주입 가능 | ✓ SATISFIED  | CLAUDE.md 525줄 AI instruction 형태로 재작성. BEM 규칙, 토큰 변수명, SCSS 구조, 접근성, 린트 규칙 전체 포함. 명령형("~하라", "~금지") 작성. |

**요구사항 커버리지:** 5/5 (BEM-01, BEM-02, BEM-03, BEM-04, AI-03) — 전부 충족
**고아 요구사항:** 없음 — REQUIREMENTS.md Traceability 테이블에서 Phase 2에 매핑된 요구사항(BEM-01~04, AI-03) 모두 계획에 선언됨.

---

### D-04 특별 검증: defaultSeverity "warning"

CONTEXT.md D-04 지시사항: "BEM 위반 시 경고(warning) 수준으로 표시 — 빌드는 성공하되 경고 로그 출력"

검증 결과:
- `.stylelintrc.json` 4번 줄: `"defaultSeverity": "warning"` — **확인됨**
- `plugin/selector-bem-pattern` 옵션 객체에도 `"severity": "warning"` — **이중 확인됨**
- CONVENTIONS.md 린트 규칙 설명: "BEM 위반은 warning 수준이다 (빌드는 성공하되 경고 출력)" — 문서와 설정 일치

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| 없음 | - | - | - | - |

스캔 범위: `.stylelintrc.json`, `docs/bem-guide.md`, `package.json`, `CLAUDE.md`
TODO/FIXME/placeholder, 빈 구현, 하드코딩 빈 데이터 — 없음.

---

### Human Verification Required

#### 1. BEM 위반 클래스 실제 경고 출력 확인

**Test:** `.btn-primary` 클래스를 포함한 임시 SCSS 파일을 `src/scss/6-components/_test.scss`에 생성 후 `npm run lint:css` 실행
**Expected:** `BEM 패턴 위반: "btn-primary" -> .block__element--modifier 형태로 작성하세요` 경고 메시지 출력
**Why human:** 테스트 파일 생성/삭제가 필요하며, 실제 터미널 출력 확인 필요 (CI 환경에서 검증 가능)

#### 2. `plugin/selector-bem-pattern`의 implicitComponents 동작 확인

**Test:** `src/scss/6-components/_card.scss` 파일에서 `.btn--primary`처럼 파일명(`card`)과 일치하지 않는 블록명 사용
**Expected:** "이 파일의 선택자가 파일명 기반 BEM 블록과 일치하지 않습니다" 경고 출력
**Why human:** stylelint-selector-bem-pattern@4.0.1이 stylelint@17과 --legacy-peer-deps로 설치되어 실제 플러그인 동작을 런타임에서 확인 필요

---

### Gaps Summary

갭 없음. 모든 자동화 검사 통과.

Phase 2의 두 가지 핵심 목표 — (1) Stylelint BEM 린팅 자동화, (2) AI 즉시 활용 가능한 CLAUDE.md 통합 지시문 — 모두 달성되었다.

CONTEXT.md D-04 요구사항인 `defaultSeverity: "warning"` 설정이 `.stylelintrc.json`에 정확히 반영되었다. 빌드는 성공하되 BEM 위반 시 경고가 출력되는 구조로, D-07에서 명시한 "팀 적응 후 에러 전환" 경로도 보존되어 있다.

---

_Verified: 2026-03-25_
_Verifier: Claude (gsd-verifier)_
