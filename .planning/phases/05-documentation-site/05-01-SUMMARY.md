---
phase: 05-documentation-site
plan: 01
subsystem: docs
tags: [eleventy, nunjucks, pagefind, scss, navigation, accessibility]

requires:
  - phase: 01-foundation-design-tokens-scss-architecture
    provides: ITCSS SCSS 레이어, 디자인 토큰, 반응형 믹스인
  - phase: 03-components
    provides: playground HTML, 컴포넌트 SCSS
provides:
  - Eleventy 3.1.5 ESM 기반 문서 사이트 프레임워크
  - Nunjucks 레이아웃 3종 (base/page/component)
  - 사이드바 + 모바일 네비게이션 (4개 대섹션)
  - 문서 전용 SCSS (docs.scss)
  - pagefind 검색 인덱싱 통합
affects: [05-02, 05-03, 05-04]

tech-stack:
  added: ["@11ty/eleventy@3.1.5", "@11ty/eleventy-plugin-syntaxhighlight@5.0.2", "pagefind", "concurrently", "clipboard"]
  patterns: ["Eleventy ESM config", "Nunjucks layout inheritance (base -> page/component)", "passthrough copy for CSS/playground", "eleventy.after pagefind 후처리"]

key-files:
  created:
    - eleventy.config.js
    - src/scss/docs.scss
    - site/_data/site.json
    - site/_data/navigation.json
    - site/_includes/layouts/base.njk
    - site/_includes/layouts/page.njk
    - site/_includes/layouts/component.njk
    - site/_includes/partials/nav-sidebar.njk
    - site/_includes/partials/nav-mobile.njk
    - site/_includes/partials/search.njk
    - site/assets/js/nav-mobile.js
    - site/index.md
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Eleventy ESM 설정으로 import/export 사용 (CommonJS 대신)"
  - "문서 사이트 SCSS를 style.css와 별도 docs.css로 분리 (프로젝트 토큰은 공유)"
  - "모바일 사이드바를 position:fixed 오버레이 + 배경 딤 처리로 구현"
  - "pagefind는 eleventy.after 이벤트에서 자동 실행되도록 통합"

patterns-established:
  - "Eleventy dir.input=site, dir.output=_site 구조"
  - "Nunjucks 3단계 레이아웃 상속: base.njk -> page.njk/component.njk"
  - "navigation.json 데이터 기반 사이드바 자동 렌더링 (page.url 비교로 활성 표시)"
  - "바닐라 JS IIFE 패턴으로 모바일 메뉴 토글 (aria-expanded 동기화)"

requirements-completed: [DOCS-01, DOCS-06]

duration: 6min
completed: 2026-03-26
---

# Phase 5 Plan 01: Documentation Site Infrastructure Summary

**Eleventy 3.1.5 ESM 기반 문서 사이트 프레임워크 구축 -- Nunjucks 레이아웃 3종, 4개 섹션 사이드바, 모바일 햄버거 메뉴, pagefind 검색, WCAG AA 접근성 기반**

## Performance

- **Duration:** 6min
- **Started:** 2026-03-25T23:06:03Z
- **Completed:** 2026-03-25T23:12:31Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Eleventy 3.1.5 ESM 설정 완료 -- syntax highlighting, passthrough copy, pagefind 후처리 통합
- Nunjucks 레이아웃 3종(base/page/component) + 사이드바/모바일 네비게이션 구현
- 문서 전용 SCSS(docs.scss) -- BEM 레이아웃, 반응형 사이드바, 코드블록 스타일, skip-to-content
- npm run build:site로 전체 빌드 성공, _site/index.html에 4개 섹션 네비게이션 렌더링 확인

## Task Commits

1. **Task 1: Eleventy 패키지 설치 + 설정 + 빌드 스크립트 + 문서 SCSS** - `429efc9` (feat)
2. **Task 2: Nunjucks 레이아웃 3종 + 네비게이션(사이드바+모바일) 구현** - `1d3769c` (feat)

**추가 커밋:** `c24a3c8` (chore) - ITCSS SCSS 레이어 파일 추가 (Phase 1-4 산출물, 빌드 의존성)

## Files Created/Modified

- `eleventy.config.js` - Eleventy ESM 설정 (플러그인, passthrough copy, pagefind)
- `package.json` - build:site, serve, build:docs-css 스크립트 + 의존성 추가
- `.gitignore` - _site/ 추가
- `src/scss/docs.scss` - 문서 레이아웃 BEM 스타일 (사이드바, 모바일, 코드블록, 타이포)
- `site/_data/site.json` - 사이트 메타 데이터
- `site/_data/navigation.json` - 4개 대섹션 네비게이션 구조
- `site/_includes/layouts/base.njk` - HTML 셸 (skip-to-content, ARIA, pagefind)
- `site/_includes/layouts/page.njk` - 기본 페이지 레이아웃
- `site/_includes/layouts/component.njk` - 컴포넌트 미리보기 레이아웃 (iframe)
- `site/_includes/partials/nav-sidebar.njk` - 좌측 사이드바 (aria-current 지원)
- `site/_includes/partials/nav-mobile.njk` - 모바일 햄버거 메뉴 (aria-expanded)
- `site/_includes/partials/search.njk` - pagefind 검색 위젯 (한국어)
- `site/assets/js/nav-mobile.js` - 모바일 메뉴 토글 + ESC 닫기
- `site/index.md` - 랜딩 페이지 (4개 섹션 안내)

## Decisions Made

- Eleventy ESM 설정으로 import/export 사용 (CommonJS 대신) -- 프로젝트가 최신 Eleventy 3.x 사용
- 문서 사이트 SCSS를 style.css와 별도 docs.css로 분리 -- 프로젝트 토큰은 공유하되 문서 레이아웃은 독립
- 모바일 사이드바를 position:fixed 오버레이 + docs-overlay 배경 딤 처리로 구현
- pagefind는 eleventy.after 이벤트에서 자동 실행되도록 통합 (별도 빌드 단계 불필요)
- nav-sidebar에 aria-current="page" 속성 추가하여 현재 페이지 스크린리더 지원

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ITCSS SCSS 레이어 파일 추가**
- **Found during:** Task 1 (docs.scss 빌드)
- **Issue:** worktree에 Phase 1-4 산출물인 SCSS 파일이 없어 빌드 불가
- **Fix:** 메인 레포에서 SCSS 파일 복사 후 커밋
- **Files modified:** src/scss/1-settings/, 2-tools/, 3-generic/, 4-elements/, 5-objects/, 7-utilities/
- **Verification:** npm run build:css 및 build:docs-css 성공
- **Committed in:** c24a3c8

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** SCSS 빌드 의존성 해결. 기존 산출물을 worktree에 포함시킨 것으로 scope 확장 없음.

## Issues Encountered

- npm install 시 stylelint-selector-bem-pattern peer dependency 충돌 -- --legacy-peer-deps 플래그로 해결 (Phase 2 결정 사항 재적용)

## Known Stubs

None -- 모든 네비게이션 링크는 아직 존재하지 않는 페이지를 가리키지만, 이는 후속 플랜(05-02, 05-03)에서 콘텐츠 페이지를 생성할 예정이므로 의도된 구조.

## User Setup Required

None - 외부 서비스 설정 불필요.

## Next Phase Readiness

- Eleventy 인프라 완성 -- 후속 플랜에서 site/ 디렉토리에 콘텐츠 페이지만 추가하면 됨
- component.njk 레이아웃에서 iframe 미리보기 지원 준비 완료
- pagefind 검색은 빌드 시 자동 인덱싱되므로 콘텐츠 추가만으로 검색 기능 활성화

## Self-Check: PASSED

All 12 created files verified. All 3 commit hashes verified (429efc9, 1d3769c, c24a3c8).

---
*Phase: 05-documentation-site*
*Completed: 2026-03-26*
