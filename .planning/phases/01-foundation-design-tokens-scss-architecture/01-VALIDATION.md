---
phase: 1
slug: foundation-design-tokens-scss-architecture
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | dart-sass CLI (scss compilation test) + browser rendering check |
| **Config file** | package.json (npm scripts) |
| **Quick run command** | `npm run build:css` |
| **Full suite command** | `npm run build:css` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build:css`
- **After every plan wave:** Run `npm run build:css`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 01-01-T1 | 01 | 1 | TOKEN-01~05, SCSS-01, SCSS-05 | file-check | `ls src/scss/1-settings/_tokens-*.scss && cat package.json \| grep -q '"sass"'` | ⬜ pending |
| 01-01-T2 | 01 | 1 | TOKEN-06, SCSS-04 | build | `npm run build:css && test -f dist/css/style.css` | ⬜ pending |
| 01-02-T1 | 02 | 2 | SCSS-02, SCSS-03, SCSS-04 | file-check | `grep -q "@mixin flex-center" src/scss/2-tools/_mixins.scss && grep -q "@mixin respond-to" src/scss/2-tools/_responsive.scss` | ⬜ pending |
| 01-02-T2 | 02 | 2 | SCSS-02, SCSS-03 | build | `npm run build:css && grep -q "\.container" dist/css/style.css && grep -q "\.grid" dist/css/style.css` | ⬜ pending |
| 01-03-T1 | 03 | 2 | TOKEN-07 | file-check | `test -f src/playground/index.html && grep -q "style.css" src/playground/index.html` | ⬜ pending |
| 01-03-T2 | 03 | 2 | SCSS-06 | file-check | `test -f docs/scss-structure-guide.md && wc -l docs/scss-structure-guide.md \| awk '{if ($1 >= 50) print "PASS"}'` | ⬜ pending |
| 01-03-T3 | 03 | 2 | TOKEN-07 | manual | checkpoint:human-verify (브라우저 시각 확인) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — npm init + dart-sass dependency + build scripts
- [ ] SCSS entry point — `src/scss/style.scss` with @use imports

*Wave 0 sets up build infrastructure before any tokens or architecture.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 토큰 플레이그라운드 시각적 확인 | TOKEN-07 | HTML 렌더링 결과 시각 검증 | src/playground/index.html을 브라우저에서 열고 색상/타이포/간격 표시 확인 |
| KRDS 시맨틱 색상 정확도 | TOKEN-01 | 색상값 비교 필요 | KRDS 공식 토큰값과 `:root` 정의값 대조 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
