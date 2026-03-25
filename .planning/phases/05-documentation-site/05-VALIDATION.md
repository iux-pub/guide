---
phase: 5
slug: documentation-site
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Eleventy build + pa11y-ci + Stylelint |
| **Config file** | `eleventy.config.js`, `.pa11yci.js`, `.stylelintrc.json` |
| **Quick run command** | `npm run build && npm run lint:css` |
| **Full suite command** | `npm run build && npm run lint:css && npm run test:a11y` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (Eleventy 빌드 성공 확인)
- **After every plan wave:** Run `npm run build && npm run lint:css`
- **Before `/gsd:verify-work`:** Full suite must be green + 브라우저 수동 확인
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DOCS-01, DOCS-06 | build | `npm run build` | Wave 0 후 | ⬜ pending |
| 05-01-02 | 01 | 1 | DOCS-01 | build+lint | `npm run build && npx stylelint "src/scss/docs.scss"` | Wave 0 후 | ⬜ pending |
| 05-02-01 | 02 | 2 | DOCS-05 | build | `npm run build` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | AI-01 | manual | CLAUDE.md 경로 확인 | - | ⬜ pending |
| 05-03-01 | 03 | 2 | DOCS-02, DOCS-03 | build | `npm run build` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 2 | DOCS-02 | manual | 브라우저에서 iframe 미리보기 + 코드 복사 확인 | - | ⬜ pending |
| 05-04-01 | 04 | 3 | DOCS-04 | manual | pagefind 검색 브라우저 확인 | - | ⬜ pending |
| 05-04-02 | 04 | 3 | DOCS-06 | a11y | `npm run test:a11y` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Eleventy, Nunjucks, Prism.js, clipboard.js, pagefind npm 패키지 설치 (05-01-01에서 수행)
- [ ] `eleventy.config.js` 생성 (05-01-01에서 수행)
- [ ] `site/` 디렉토리 구조 생성 (05-01-01에서 수행)
- [ ] `src/scss/docs.scss` 생성 (05-01-02에서 수행)
- [ ] npm scripts (build, serve) 추가 (05-01-01에서 수행)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 컴포넌트 iframe 미리보기 | DOCS-02 | iframe 렌더링은 브라우저 확인 필요 | 컴포넌트 페이지에서 각 variant 미리보기 표시 확인 |
| 코드 복사 버튼 | DOCS-03 | clipboard.js 동작은 브라우저 확인 필요 | 코드 블록 우측 상단 복사 버튼 클릭 → "복사됨" 피드백 확인 |
| pagefind 검색 | DOCS-04 | 검색 UI 인터랙션은 브라우저 확인 필요 | 검색창에 토큰/컴포넌트명 입력 → 결과 표시 확인 |
| 사이트 전체 네비게이션 | DOCS-01 | 페이지 이동, 사이드바 동작 확인 | 4개 섹션 간 이동, 모바일 햄버거 메뉴 동작 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
