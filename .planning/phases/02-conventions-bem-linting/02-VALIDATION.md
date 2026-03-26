---
phase: 2
slug: conventions-bem-linting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Stylelint CLI + file existence checks |
| **Config file** | .stylelintrc.json |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build:css` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build:css`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-T1 | 01 | 1 | BEM-01, BEM-02, BEM-03 | file-check | `test -f docs/bem-guide.md && wc -l docs/bem-guide.md` | ⬜ pending |
| 02-01-T2 | 01 | 1 | BEM-04 | lint | `npm run lint -- src/scss/5-objects/_grid.scss` | ⬜ pending |
| 02-02-T1 | 02 | 2 | AI-03 | file-check | `grep -q "BEM" CLAUDE.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `stylelint`, `stylelint-config-standard-scss`, `stylelint-selector-bem-pattern` — npm install
- [ ] `.stylelintrc.json` — config file created
- [ ] `package.json` — `lint` and `lint:fix` scripts added

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| BEM do/don't 예제 가독성 | BEM-02 | 문서 품질 판단 | docs/bem-guide.md 열어서 예제가 이해 가능한지 확인 |
| CLAUDE.md AI 지시문 효과성 | AI-03 | AI 코드 생성 테스트 | CLAUDE.md를 AI에게 주고 BEM 규칙대로 코드 생성하는지 확인 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
