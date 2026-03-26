---
phase: 15
plan: 1
subsystem: documentation-site
tags: [prompts, ai, documentation, eleventy]
dependency_graph:
  requires: [prompts/*.md, site/_data/navigation.json]
  provides: [site/prompts/ 문서 페이지 7개, 네비게이션 통합]
  affects: [.pa11yci.js, navigation.json]
tech_stack:
  added: []
  patterns: [quadruple-backtick 코드 블록으로 프롬프트 감싸기]
key_files:
  created:
    - site/prompts/prompts.json
    - site/prompts/index.md
    - site/prompts/design.md
    - site/prompts/figma.md
    - site/prompts/publishing.md
    - site/prompts/components.md
    - site/prompts/context.md
    - site/prompts/review.md
  modified:
    - site/_data/navigation.json
    - .pa11yci.js
decisions:
  - quadruple backtick(````)으로 프롬프트 내용 감싸기 -- 내부 triple backtick 충돌 방지
  - AI 프롬프트 섹션을 거버넌스 앞에 배치
metrics:
  duration: 6min
  completed: "2026-03-26"
---

# Phase 15 Plan 1: AI 프롬프트 문서 사이트 통합 Summary

문서 사이트에 AI 프롬프트 섹션 7개 페이지 통합, quadruple backtick 코드 블록으로 복사 가능한 프롬프트 제공

## Tasks Completed

### Task 1: site/prompts/ 디렉토리 + 문서 페이지 7개 생성

- `prompts.json` 디렉토리 데이터 (layout: page, section: prompts, tags: prompts)
- `index.md` 개요 페이지 + AI 도구별 매핑 테이블 + 선택 가이드
- `design.md` (order: 2) -- 디자인 AI 프롬프트 (Google Stitch, Galileo, Lovable, v0)
- `figma.md` (order: 3) -- 피그마 AI 프롬프트 (Figma AI, Figma Make)
- `publishing.md` (order: 4) -- 퍼블리싱 AI 프롬프트 (Cursor, Copilot, Windsurf)
- `components.md` (order: 5) -- 컴포넌트 스니펫 프롬프트 (모든 코드 생성 AI)
- `context.md` (order: 6) -- 대화형 AI 컨텍스트 (ChatGPT, Gemini, Claude 웹)
- `review.md` (order: 7) -- 코드 리뷰 체크리스트 (모든 AI 리뷰 용도)
- **Commit:** 93742ec

### Task 2: 네비게이션 + pa11yci 업데이트

- `navigation.json`에 AI 프롬프트 섹션 7개 항목 추가 (거버넌스 앞 배치)
- `.pa11yci.js`에 prompts/ 7개 URL 추가
- **Commit:** 16455c1

## Decisions Made

1. **quadruple backtick 사용:** 프롬프트 원본에 triple backtick 코드 블록이 포함되어 있어 quadruple backtick(````)으로 감싸서 마크다운 렌더링 충돌을 방지했다. clipboard-init.js가 `pre[class*="language-"]` 요소에 복사 버튼을 자동 추가하므로 `language-markdown` 클래스가 부여되어 복사 기능이 작동한다.
2. **섹션 배치:** AI 프롬프트 섹션을 테스트와 거버넌스 사이에 배치하여, 실무 도구(테스트) 다음 + 관리 체계(거버넌스) 앞에 위치시켰다.

## Deviations from Plan

None -- 플랜대로 정확히 실행했다.

## Known Stubs

None -- 모든 프롬프트 내용이 원본 prompts/ 파일에서 완전히 복사되었다.
