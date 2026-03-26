---
phase: "13"
plan: "01"
subsystem: "site-ux-onboarding"
tags: [homepage, navigation, cross-links, onboarding, readme]
dependency_graph:
  requires: []
  provides: [homepage-v09-links, prev-next-navigation, cross-document-links, starter-readme]
  affects: [site/index.md, page.njk, component.njk, docs.scss, figma-pages, component-pages, starter/README.md]
tech_stack:
  added: []
  patterns: [eleventy-filter, nunjucks-template, BEM-navigation]
key_files:
  created: []
  modified:
    - site/index.md
    - site/_includes/layouts/page.njk
    - site/_includes/layouts/component.njk
    - eleventy.config.js
    - src/scss/docs.scss
    - site/figma/component-naming.md
    - site/figma/variables.md
    - site/components/btn.md
    - site/components/form.md
    - site/components/card.md
    - site/components/table.md
    - site/components/modal.md
    - site/components/tab.md
    - site/components/pagination.md
    - site/components/breadcrumb.md
    - starter/README.md
decisions:
  - Eleventy 커스텀 필터(prevNextInSection)로 이전/다음 네비게이션 구현 -- Nunjucks 스코핑 제약 회피
metrics:
  duration: "4min"
  completed: "2026-03-26"
---

# Phase 13 Plan 01: 사이트 UX + 온보딩 개선 Summary

홈페이지 v0.9 섹션 링크 완성, 이전/다음 페이지 네비게이션 추가, 문서 간 상호 링크 연결, starter README 전면 개선

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | 홈페이지 완성 | dad3c53 | site/index.md |
| 2 | 이전/다음 페이지 네비게이션 | 81b9f69 | page.njk, component.njk, eleventy.config.js, docs.scss |
| 3 | 문서 간 상호 링크 | b4c9306 | figma/component-naming.md, figma/variables.md, components/*.md (8개) |
| 4 | starter README 개선 | 546adb3 | starter/README.md |

## What Was Built

### Task 1: 홈페이지 v0.9 섹션 링크

- 기존 4개 섹션(토큰, 컨벤션, 컴포넌트, 접근성)에 개요 페이지 링크 추가
- v0.9에서 추가된 6개 섹션(피그마 컨벤션, 디자인 QA, 퍼블리싱 심화, 테스트, 거버넌스, 온보딩) 섹션 추가
- 각 섹션별 한 줄 설명 + 링크 형태로 통일

### Task 2: 이전/다음 페이지 네비게이션

- `eleventy.config.js`에 `prevNextInSection` 커스텀 필터 추가
- navigation.json의 sections 배열에서 현재 페이지 URL과 매칭하여 동일 섹션 내 이전/다음 페이지 반환
- `page.njk`, `component.njk` 레이아웃 하단에 네비게이션 UI 삽입
- `docs.scss`에 `.docs-nav-prev-next` BEM 스타일 추가 (flex 양쪽 정렬, 호버/포커스 상태)

### Task 3: 문서 간 상호 링크

- `figma/component-naming.md` 하단에 전체 컴포넌트 페이지 8개 + 핸드오프 페이지 링크 추가
- `figma/variables.md` 하단에 토큰 페이지 4개(색상, 타이포, 간격, 그리드) + Auto Layout 링크 추가
- 컴포넌트 8개 페이지(btn, form, card, table, modal, tab, pagination, breadcrumb)에 피그마 가이드 + 접근성 가이드 링크 추가

### Task 4: starter README 전면 개선

- 퍼블리셔 퀵스타트 6단계(clone, install, build, 확인, 커스터마이즈, lint) 추가
- 빌드 출력 경로(dist/css/style.css) 테이블로 설명
- 커스터마이징 확장: Primary 색상, 폰트, 간격 변경 SCSS 코드 예시
- 불필요 컴포넌트 삭제 방법(_index.scss에서 @forward 제거)
- playground HTML 파일 10개 목록과 설명
- ITCSS SCSS 구조 요약 트리

## Decisions Made

1. **Eleventy 커스텀 필터로 이전/다음 구현**: Nunjucks의 `set` 변수가 `for` 루프 안에서 스코핑되어 외부로 전파되지 않는 제약이 있어, Eleventy의 `addFilter`로 JavaScript 함수를 등록하여 해결

## Deviations from Plan

None -- 플랜 그대로 실행

## Known Stubs

- `/design-qa/`, `/guides/` 섹션 페이지가 아직 존재하지 않음 (홈페이지에서 링크만 추가, 해당 섹션 페이지는 별도 Phase에서 생성 예정)

## Self-Check: PASSED

```
FOUND: site/index.md
FOUND: site/_includes/layouts/page.njk
FOUND: site/_includes/layouts/component.njk
FOUND: eleventy.config.js
FOUND: src/scss/docs.scss
FOUND: starter/README.md
FOUND: dad3c53
FOUND: 81b9f69
FOUND: b4c9306
FOUND: 546adb3
```
