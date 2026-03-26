---
phase: 07-figma-conventions
verified: 2026-03-26T03:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "문서 사이트를 빌드하고 /figma/ 경로에서 모든 페이지가 렌더링되는지 확인"
    expected: "개요, 컴포넌트 네이밍, 레이어/프레임 구조, Variable 네이밍, Auto Layout 규칙 5개 페이지가 사이드바 네비게이션과 함께 표시된다"
    why_human: "Eleventy 빌드 및 브라우저 렌더링은 자동화 검증 불가"
  - test: "사이드바 네비게이션에서 '피그마 컨벤션' 섹션 클릭 후 각 하위 페이지 이동 확인"
    expected: "5개 항목(개요, 컴포넌트 네이밍, 레이어/프레임 구조, Variable 네이밍, Auto Layout 규칙)이 사이드바에 표시되고 각각 올바른 페이지로 이동한다"
    why_human: "네비게이션 렌더링 및 라우팅은 브라우저에서만 확인 가능"
---

# Phase 7: 피그마 컨벤션 Verification Report

**Phase Goal:** 디자이너가 피그마에서 작업할 때 따라야 할 네이밍/구조/토큰 규칙이 문서화되어 있다
**Verified:** 2026-03-26T03:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | 문서 사이트에서 피그마 컴포넌트 네이밍 규칙(계층 구조, 구분자, 대소문자)을 확인할 수 있다 | ✓ VERIFIED | `site/figma/component-naming.md` — 슬래시 계층 구조, PascalCase 규칙, `Button / Primary` 예시, 금지 패턴 표, BEM 매핑 테이블 존재 |
| 2  | 피그마 레이어/프레임 정리 규칙(페이지 구성, 그룹 네이밍)이 예제와 함께 문서화되어 있다 | ✓ VERIFIED | `site/figma/layer-structure.md` — Cover/Guide/Components 등 페이지 구성 표, 프레임 네이밍 규칙, 레이어 정리 5개 원칙, 핸드오프 체크리스트 존재 |
| 3  | 피그마 Variable 이름과 CSS Custom Property 이름의 매핑 테이블이 존재한다 | ✓ VERIFIED | `site/figma/variables.md` — Color/Typography/Spacing/Misc 4개 Collection별 전체 매핑 테이블, `--color-primary` 등 변환 규칙 요약 존재 |
| 4  | Auto Layout 패딩/갭 값이 디자인 토큰 스케일과 1:1로 매핑된 참조표가 있다 | ✓ VERIFIED | `site/figma/auto-layout.md` — 간격 토큰 스케일 참조표, 컴포넌트별(Button/Card/Form 등) Auto Layout 패턴, 반응형 동작 정의, `--spacing-md` 등 CSS 매핑 존재 |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `site/figma/figma.json` | Eleventy 디렉토리 데이터 파일 | ✓ VERIFIED | `layout`, `section`, `tags` 설정 완비 |
| `site/figma/index.md` | 피그마 컨벤션 개요 페이지 | ✓ VERIFIED | 4개 하위 가이드 링크 테이블, 핵심 원칙 4개, 관련 문서 링크 포함 |
| `site/figma/component-naming.md` | 컴포넌트 네이밍 규칙 | ✓ VERIFIED | 계층 구조, 대소문자 규칙, Property 네이밍, 금지 패턴, BEM 클래스 매핑 전체 포함 |
| `site/figma/layer-structure.md` | 레이어/프레임 구조 가이드 | ✓ VERIFIED | 페이지 구성 표(Cover 포함), 프레임 네이밍, 레이어 정리 원칙, 프레임 크기 기준, 체크리스트 포함 |
| `site/figma/variables.md` | Variable 네이밍 + CSS 매핑 | ✓ VERIFIED | Color/Typography/Spacing/Misc 전체 매핑 테이블, 변환 규칙 요약, Collection 구성 포함 |
| `site/figma/auto-layout.md` | Auto Layout 규칙 | ✓ VERIFIED | 패딩/갭 토큰 스케일 참조표, 컴포넌트별 패턴, 반응형 동작, 설정 규칙, 체크리스트 포함 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `site/_data/navigation.json` | `site/figma/*.md` | `"key": "figma"` 섹션 | ✓ WIRED | 5개 항목(개요, 컴포넌트 네이밍, 레이어/프레임 구조, Variable 네이밍, Auto Layout 규칙) 모두 등록 |
| `site/figma/figma.json` | `layouts/page.njk` | `"layout"` 필드 | ✓ WIRED | 레이아웃 파일 경로 설정됨 |
| `site/figma/index.md` | 4개 하위 페이지 | 마크다운 링크 | ✓ WIRED | `/figma/component-naming/`, `/figma/layer-structure/`, `/figma/variables/`, `/figma/auto-layout/` 링크 존재 |

### Data-Flow Trace (Level 4)

정적 마크다운 문서 페이지이므로 동적 데이터 흐름 검증 해당 없음. 모든 콘텐츠는 빌드 시 Eleventy가 마크다운을 HTML로 변환하는 구조이다.

### Behavioral Spot-Checks

정적 문서 생성 프로젝트이므로 실행 가능한 API/CLI 엔드포인트 없음. Eleventy 빌드 결과물 렌더링 확인은 인간 검증 항목으로 이관.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 커밋 abe7e6d 존재 | `git log --oneline abe7e6d` | `abe7e6d feat(07-01): 피그마 컨벤션 디렉토리 + 개요 + 컴포넌트 네이밍 가이드 생성` | ✓ PASS |
| 커밋 50f5504 존재 | `git log --oneline 50f5504` | `50f5504 feat(07-01): 레이어/프레임 구조 가이드 + Variable 매핑 가이드 생성` | ✓ PASS |
| 커밋 08763d0 존재 | `git log --oneline 08763d0` | `08763d0 feat(07-01): Auto Layout 규칙 가이드 생성 + 네비게이션에 피그마 섹션 추가` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FIG-01 | 07-01-PLAN.md | 피그마 컴포넌트 네이밍 규칙 (계층 구조, 구분자, 대소문자 규칙) | ✓ SATISFIED | `site/figma/component-naming.md` — 슬래시 계층, PascalCase 규칙, Property 네이밍, BEM 매핑 테이블 완비 |
| FIG-02 | 07-01-PLAN.md | 피그마 레이어/프레임 구조 가이드 (페이지 정리, 그룹 네이밍) | ✓ SATISFIED | `site/figma/layer-structure.md` — 페이지 구성, 프레임 네이밍, 레이어 정리 원칙, 파일 체크리스트 완비 |
| FIG-03 | 07-01-PLAN.md | 피그마 Variable 네이밍 규칙 + CSS Custom Property 매핑 | ✓ SATISFIED | `site/figma/variables.md` — 4개 Collection 전체 매핑 테이블, 변환 규칙 요약 완비 |
| FIG-04 | 07-01-PLAN.md | 피그마 Auto Layout 규칙 (패딩/갭 토큰 매핑, 반응형 동작 정의) | ✓ SATISFIED | `site/figma/auto-layout.md` — 토큰 스케일 참조표, 컴포넌트별 패턴, 반응형 동작 완비 |

**REQUIREMENTS.md 상태:** FIG-01~04 모두 `[x]` 완료 처리, Phase 7 매핑 테이블에 `Complete` 기록 확인.
**ORPHANED 요구사항:** 없음.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | 없음 |

`site/figma/` 전체 파일에서 TODO, FIXME, PLACEHOLDER, "coming soon", "not yet implemented" 등 미완성 패턴 없음.

### Human Verification Required

#### 1. 문서 사이트 빌드 및 피그마 컨벤션 페이지 렌더링 확인

**Test:** `npm run build` 실행 후 `/figma/` 경로에서 개요 페이지 접속, 5개 하위 페이지 모두 정상 렌더링 확인
**Expected:** 각 페이지가 사이드바 레이아웃과 함께 표시되며, 마크다운 표와 코드 블록이 올바르게 렌더링된다
**Why human:** Eleventy 빌드 결과물의 HTML 렌더링은 브라우저에서만 확인 가능

#### 2. 사이드바 네비게이션 '피그마 컨벤션' 섹션 동작 확인

**Test:** 문서 사이트 실행 후 사이드바에서 '피그마 컨벤션' 섹션의 5개 항목 클릭
**Expected:** 각 항목이 올바른 URL로 이동하며 현재 페이지가 네비게이션에서 활성 상태로 표시된다
**Why human:** 네비게이션 활성 상태 표시 및 라우팅 동작은 브라우저 실행 없이 검증 불가

### Gaps Summary

없음. 모든 필수 아티팩트가 존재하고, 실질적인 내용을 포함하며, 네비게이션에 올바르게 연결되어 있다.

---

_Verified: 2026-03-26T03:00:00Z_
_Verifier: Claude (gsd-verifier)_
