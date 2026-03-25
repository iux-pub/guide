---
phase: 4
slug: accessibility-checklist-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pa11y-ci 4.x + Stylelint (SCSS 린팅) |
| **Config file** | `.pa11yci.js` (Wave 1에서 생성) |
| **Quick run command** | `npm run lint:css` |
| **Full suite command** | `npm run lint:css && npm run test:a11y` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint:css`
- **After every plan wave:** Run `npm run lint:css && npm run test:a11y`
- **Before `/gsd:verify-work`:** Full suite must be green + 브라우저 수동 확인
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | A11Y-06 | setup | `npm run test:a11y` | Wave 0 후 | ⬜ pending |
| 04-01-02 | 01 | 1 | A11Y-01, A11Y-02 | manual | 파일 존재 + 내용 확인 | - | ⬜ pending |
| 04-02-01 | 02 | 1 | A11Y-03 | manual | 파일 존재 + 내용 확인 | - | ⬜ pending |
| 04-02-02 | 02 | 1 | A11Y-04, A11Y-05 | manual | 파일 존재 + 내용 확인 | - | ⬜ pending |
| 04-03-01 | 03 | 2 | A11Y-01, A11Y-02 | lint | `npm run lint:css` (HTML 파일 생성) | - | ⬜ pending |
| 04-03-02 | 03 | 2 | A11Y-06 | a11y | `npm run test:a11y` | ✅ | ⬜ pending |
| 04-03-03 | 03 | 2 | A11Y-06 | a11y | `npm run test:a11y` (이슈 수정 후 재실행) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `pa11y-ci` 및 `@axe-core/cli` npm 패키지 설치 (04-01-01에서 수행)
- [ ] `.pa11yci.js` 설정 파일 생성 (04-01-01에서 수행)
- [ ] `npm run test:a11y` 스크립트 추가 (04-01-01에서 수행)
- [ ] `reports/` 디렉토리 생성 + `.gitkeep` (04-01-01에서 수행)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 체크리스트 마크다운 내용 정확성 | A11Y-01, A11Y-02 | KWCAG 2.2 33개 항목 매핑은 수동 확인 필요 | docs/accessibility/checklist.md 열어 33개 항목 존재 확인 |
| 컴포넌트별 가이드 품질 | A11Y-03 | 접근성 패턴 정확성은 도메인 전문성 필요 | docs/accessibility/*.md 각각 열어 ARIA 표 + do/don't 확인 |
| HTML 체크리스트 인터랙션 | A11Y-01 | 체크박스 동작은 브라우저 확인 필요 | src/playground/a11y-checklist.html 열어 체크박스 클릭 + localStorage 저장 확인 |
| 색상 대비 표 정확성 | A11Y-05 | 대비 비율 계산 검증 | docs/accessibility/color-contrast.md의 대비 비율을 WebAIM 도구로 교차 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
