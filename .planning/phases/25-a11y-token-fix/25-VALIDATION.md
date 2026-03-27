# Phase 25: 접근성 수정 + 토큰 정합 - Validation

**Created:** 2026-03-27
**Source:** 25-RESEARCH.md Validation Architecture section

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Stylelint ^17.5.0 + pa11y-ci |
| Config file | .stylelintrc.json, .pa11yci.js |
| Quick run command | `npm run lint:css` |
| Full suite command | `npm test` |

## Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| A11YFIX-01 | 모달 닫기 버튼 44px | manual + lint | `npm run lint:css` | N/A (SCSS 값 검증은 수동) |
| A11YFIX-02 | 페이지네이션 링크 44px | manual + lint | `npm run lint:css` | N/A |
| A11YFIX-03 | 페이지네이션 간격 8px | manual + lint | `npm run lint:css` | N/A |
| A11YFIX-04 | 브레드크럼 간격 8px | manual + lint | `npm run lint:css` | N/A |
| A11YFIX-05 | reduced-motion 적용 | manual (SCSS grep) | `grep -r 'prefers-reduced-motion' src/scss/6-components/` | N/A |
| A11YFIX-06 | 포커스 링 통일 | manual (SCSS grep) | `grep -r 'focus-visible' src/scss/6-components/` | N/A |
| TOKFIX-01 | 토큰 값 정합 | manual (값 비교) | `npm run build:tokens && grep 'transition-fast' src/scss/1-settings/_tokens-misc.scss` | N/A |

## Sampling Rate

- **Per task commit:** `npm run lint:css`
- **Per wave merge:** `npm test` (lint + build + pa11y)
- **Phase gate:** Full suite green before verify

## Wave 0 Gaps

None -- 기존 lint/pa11y 인프라로 충분. SCSS 값 자체의 정확성은 수동 검증(grep + 빌드 후 확인).

## Verification Commands Summary

```bash
# TOKFIX-01: 토큰 값 확인
grep '"0.1s ease"' tokens.json
npm run build:tokens && grep 'transition-fast: 0.1s ease' src/scss/1-settings/_tokens-misc.scss

# A11YFIX-01: 모달 닫기 버튼 44px
grep '4.4rem' src/scss/6-components/_modal.scss

# A11YFIX-02/03: 페이지네이션 44px + 간격 8px
grep '4.4rem' src/scss/6-components/_pagination.scss
grep 'spacing-sm' src/scss/6-components/_pagination.scss | grep gap

# A11YFIX-04: 브레드크럼 간격 8px
grep 'spacing-sm' src/scss/6-components/_breadcrumb.scss

# A11YFIX-05: reduced-motion 전 컴포넌트 적용 (7개 파일)
grep -rl 'prefers-reduced-motion' src/scss/6-components/ | wc -l  # 7 expected

# A11YFIX-06: 포커스 링 통일
grep -c 'focus-visible' src/scss/6-components/_form.scss  # 3+ expected
grep 'outline-offset: 2px' src/scss/6-components/_tab.scss

# 전체 린트 + 테스트
npm run lint:css
npm test
```
