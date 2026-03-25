---
phase: 3
slug: components-html-scss-snippets
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Stylelint (SCSS 린팅) + 브라우저 수동 확인 |
| **Config file** | `.stylelintrc.json` |
| **Quick run command** | `npm run lint:css` |
| **Full suite command** | `npm run lint:css && npm run build:css` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint:css && npm run build:css`
- **After every plan wave:** Run `npm run lint:css && npm run build:css` + playground HTML 브라우저 수동 확인
- **Before `/gsd:verify-work`:** Full suite must be green + 8개 playground 페이지 렌더링 확인
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-* | 01 | 1 | COMP-09 | build | `npm run build:css` | 기존 | ⬜ pending |
| 03-02-* | 02 | 1 | COMP-01~04 | lint+build | `npx stylelint "src/scss/6-components/**/*.scss" && npm run build:css` | Wave 0 후 | ⬜ pending |
| 03-03-* | 03 | 2 | COMP-05~08 | lint+build | `npx stylelint "src/scss/6-components/**/*.scss" && npm run build:css` | Wave 0 후 | ⬜ pending |
| 03-04-* | 04 | 3 | COMP-10, AI-02 | manual | playground HTML 브라우저 확인 + snippets/*.md 존재 확인 | - | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `style.scss`의 `@use '6-components'` 주석 해제
- [ ] `src/scss/6-components/_index.scss`에 첫 `@forward` 추가 시 빌드 테스트
- [ ] `src/playground/` 디렉토리에 새 HTML 파일 생성 시 CSS 경로 확인
- [ ] `src/snippets/` 디렉토리 생성
- [ ] `src/js/` 디렉토리 생성

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 보일러플레이트 렌더링 | COMP-09 | HTML 시맨틱 구조 시각 확인 필요 | 브라우저에서 boilerplate.html 열어 skip-to-content, header, main, footer 확인 |
| 미리보기 페이지 렌더링 | COMP-10 | 각 컴포넌트 variant 시각 확인 | playground/*.html 각각 브라우저에서 열어 렌더링 확인 |
| KRDS 접근성 패턴 | COMP-11 | Phase 4에서 pa11y-ci 자동화 예정 | role, aria-* 속성 마크업 수동 확인 |
| AI 스니펫 포맷 | AI-02 | AI 활용성은 수동 검증 필요 | snippets/*.md 파일 열어 HTML 예제 + 사용법 포함 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
