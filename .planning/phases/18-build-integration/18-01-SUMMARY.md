---
phase: 18-build-integration
plan: 01
subsystem: build
tags: [node, npm-scripts, prompts, automation]

requires:
  - phase: 15-ai-prompts-integration
    provides: site/prompts/ 프롬프트 마크다운 파일 7개
  - phase: 01-foundation-design-tokens-scss-architecture
    provides: src/scss/1-settings/ 토큰 SCSS 파일, src/snippets/ 스니펫 파일
provides:
  - scripts/build-prompts.js 프롬프트 자동 생성 스크립트
  - npm run build 통합 빌드 파이프라인
  - npm run build:prompts 개별 실행 가능
affects: [16-token-pipeline, prompts]

tech-stack:
  added: []
  patterns: [SCSS 파싱으로 토큰 추출, 스니펫 마크다운 파싱으로 컴포넌트 정보 추출]

key-files:
  created: [scripts/build-prompts.js]
  modified: [package.json, site/prompts/design.md, site/prompts/components.md, site/prompts/context.md]

key-decisions:
  - "tokens.json 미존재 상태에서 SCSS 파일 직접 파싱으로 토큰 추출"
  - "build:tokens는 Phase 16 구현까지 echo 플레이스홀더로 유지"
  - "build:site를 eleventy 단독 실행으로 변경 (CSS 빌드는 상위 파이프라인에서 처리)"

patterns-established:
  - "프롬프트 파일 자동 생성: SCSS 토큰 + 스니펫에서 데이터 추출하여 마크다운 재생성"
  - "통합 빌드 순서: tokens -> CSS -> docs CSS -> prompts -> site"

requirements-completed: []

duration: 4min
completed: 2026-03-26
---

# Phase 18: 빌드 통합 Summary

**SCSS 토큰 파싱 + 스니펫 추출로 3개 AI 프롬프트 자동 재생성하는 Node.js 스크립트 구축, npm run build 통합 파이프라인 구성**

## Task 1: scripts/build-prompts.js 생성 (BUILD-02)

### 구현 내용

Node.js 스크립트가 3개 프롬프트 파일을 자동 재생성한다:

1. **site/prompts/design.md** -- SCSS 토큰 파일 5개(`_tokens-color.scss`, `_tokens-typography.scss`, `_tokens-spacing.scss`, `_tokens-misc.scss`, `_tokens-grid.scss`)에서 CSS Custom Properties를 파싱하여 색상/타이포/간격/기타 토큰 테이블 + 8개 컴포넌트 BEM 구조 재생성
2. **site/prompts/components.md** -- `src/snippets/*.md` 8개 파일에서 기본 HTML 마크업, Variant 테이블, 접근성 주의사항을 추출하여 전체 파일 재작성
3. **site/prompts/context.md** -- 토큰 요약(색상/폰트/간격/반지름 등을 한 줄로 압축) + 8개 컴포넌트 요약 테이블 + CSS 방법론/접근성/반응형/코딩 스타일 규칙 요약

### 주요 함수

- `parseTokens(filePath)` -- SCSS 파일에서 `--token-name: value;` 패턴 추출
- `parseSnippet(filePath)` -- 스니펫 마크다운에서 제목/마크업/Variant/접근성 추출
- `tokensToTable()` -- 토큰 배열을 마크다운 테이블로 변환
- `buildDesignPrompt()`, `buildComponentsPrompt()`, `buildContextPrompt()` -- 각 프롬프트 조립

### Commit

- `64e7b06`: feat(18): 프롬프트 자동 생성 스크립트 추가

## Task 2: npm run build 통합 파이프라인 (BUILD-01)

### 구현 내용

package.json의 `build` 스크립트를 통합 파이프라인으로 구성:

```
npm run build:tokens && npm run build:css && npm run build:docs-css && npm run build:prompts && npm run build:site
```

실행 순서: tokens(플레이스홀더) -> CSS 컴파일 -> docs CSS 컴파일 -> 프롬프트 재생성 -> Eleventy 사이트 빌드

`build:site`를 `npx @11ty/eleventy`로 단순화 (CSS 빌드 중복 제거).

### 검증

`npm run build` 전체 파이프라인 정상 실행 확인 -- 63페이지 빌드 + Pagefind 인덱싱 성공.

### Commit

- `6e97a99`: feat(18): npm run build 통합 파이프라인 구성

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] build:tokens 미존재 처리**
- **Found during:** Task 2
- **Issue:** Phase 16 (토큰 파이프라인)이 아직 구현되지 않아 build:tokens 스크립트가 없었다
- **Fix:** echo 플레이스홀더로 build:tokens 등록 -- Phase 16 구현 시 실제 스크립트로 교체
- **Files modified:** package.json

**2. [Rule 1 - Bug] build:site 중복 CSS 빌드 제거**
- **Found during:** Task 2
- **Issue:** build:site가 내부적으로 build:css + build:docs-css를 다시 실행하여 통합 파이프라인에서 중복
- **Fix:** build:site를 `npx @11ty/eleventy`로 단순화
- **Files modified:** package.json

## Known Stubs

| 파일 | 위치 | 내용 | 이유 |
|------|------|------|------|
| package.json | build:tokens | echo 플레이스홀더 | Phase 16에서 실제 토큰 빌드 스크립트 구현 예정 |

## Self-Check: PASSED

- scripts/build-prompts.js: FOUND
- Commit 64e7b06: FOUND
- Commit 6e97a99: FOUND
- npm run build: SUCCESS (63 pages built)
