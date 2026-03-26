---
phase: 05-documentation-site
verified: 2026-03-26T00:51:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "브라우저에서 pagefind 검색 동작 확인"
    expected: "검색창에 '색상', 'btn', '접근성' 입력 시 관련 페이지 결과 표시"
    why_human: "pagefind-ui.js는 런타임 초기화. 정적 파일 검사로는 검색 결과 렌더링 확인 불가"
  - test: "컴포넌트 페이지 코드 복사 버튼 동작"
    expected: "코드 블록 우측 상단에 '복사' 버튼 표시, 클릭 시 '복사됨' 피드백 후 2초 후 원복"
    why_human: "clipboard-init.js가 DOM 로드 후 버튼을 동적 삽입. 브라우저에서만 확인 가능"
  - test: "모바일 반응형 및 햄버거 메뉴 동작"
    expected: "모바일(767px 이하) 에서 사이드바 숨김, 햄버거 버튼 클릭 시 메뉴 오버레이 표시"
    why_human: "CSS 반응형 + nav-mobile.js 동작은 브라우저에서만 확인 가능"
---

# Phase 5: Documentation Site Verification Report

**Phase Goal:** Eleventy 기반 정적 문서 사이트에서 토큰, 컨벤션, 컴포넌트, 접근성 가이드를 한곳에서 열람하고 검색할 수 있으며, 문서 사이트 자체도 접근성을 준수하는 상태
**Verified:** 2026-03-26T00:51:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | `npm run build:site`로 Eleventy 정적 사이트가 빌드되고 HTML이 생성된다 | VERIFIED | `npm run build:site` 실행 결과: "Copied 19 Wrote 31 files in 0.36 seconds (v3.1.5)". `_site/index.html` 존재 |
| 2 | 컴포넌트 페이지에서 iframe 미리보기와 코드 예제가 나란히 표시된다 | VERIFIED | `_site/components/btn/index.html`에 `<iframe src="/playground/btn.html" ...>` 존재, Prism.js 하이라이팅 클래스 적용 |
| 3 | 코드 복사(copy-to-clipboard) 기능이 연결되어 있다 | VERIFIED | `clipboard-init.js` (ClipboardJS 초기화 + '복사됨' 피드백) 존재, `_site/`에 `clipboard.min.js` 배포됨, 빌드된 HTML에 스크립트 링크 포함 |
| 4 | pagefind 검색 인덱스가 빌드 후 생성된다 | VERIFIED | `_site/pagefind/` 디렉토리에 `pagefind-ui.js`, `pagefind-ui.css`, `.pf_index`, `.pf_fragment` 인덱스 파일 존재. 빌드 로그: 31페이지 인덱싱 |
| 5 | 문서 사이트가 KWCAG/WCAG AA 접근성 기준을 충족하는 구조이다 | VERIFIED | `skip-to-content` 링크, `lang="ko"`, `role="navigation"`, `aria-label`, `aria-expanded`, iframe `title` 속성 모두 확인됨. `.pa11yci.js`에 19개 문서 사이트 URL 포함 (pa11y-ci 통과는 Plan 04 Summary에서 확인) |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|---------|--------|---------|
| `eleventy.config.js` | Eleventy ESM 설정 | VERIFIED | `export default` 포함, `dir.input: 'site'` 설정, pagefind `eleventy.after` 훅 포함 |
| `site/_includes/layouts/base.njk` | HTML 셸 레이아웃 | VERIFIED | `lang="ko"`, `skip-to-content`, pagefind-ui.js 로드, clipboard 스크립트 로드 |
| `site/_data/navigation.json` | 사이드바 네비게이션 데이터 | VERIFIED | 4개 섹션 (tokens, conventions, components, accessibility) |
| `src/scss/docs.scss` | 문서 사이트 전용 스타일 | VERIFIED | 386줄, `docs-layout` BEM 블록 포함 |
| `site/assets/js/clipboard-init.js` | clipboard.js 초기화 | VERIFIED | `ClipboardJS` 생성자, '복사됨' 피드백 포함 |
| `site/_includes/partials/component-preview.njk` | iframe 미리보기 매크로 | VERIFIED | `iframe` 태그, `title` 속성(접근성) 포함 |
| `site/_includes/layouts/component.njk` | 컴포넌트 레이아웃 | VERIFIED | `playground_src` front matter 기반 iframe 자동 렌더링 |
| `site/tokens/color.md` | 색상 토큰 문서 페이지 | VERIFIED | `--color-primary` 등 실제 토큰 값 포함 |
| `site/conventions/bem.md` | BEM 가이드 문서 | VERIFIED | `Block__Element--Modifier` 포함 |
| `site/accessibility/checklist.md` | KWCAG 체크리스트 | VERIFIED | `KWCAG` 포함, front matter `layout: layouts/page.njk` |
| `site/components/btn.md` | 버튼 컴포넌트 문서 | VERIFIED | `playground_src: /playground/btn.html`, `preview_height: 500` |
| `.pa11yci.js` | pa11y-ci 문서 사이트 설정 | VERIFIED | 19개 URL (playground 10 + docs site 9), `WCAG2AA` 기준 |
| `_site/pagefind/pagefind-ui.js` | pagefind 검색 UI | VERIFIED | `_site/pagefind/` 디렉토리에 존재 |
| `CLAUDE.md` | AI 지시문 업데이트 | VERIFIED | `docs/accessibility/` 경로 및 `npm run build:site` 안내 포함 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `site/_includes/layouts/base.njk` | `/dist/css/style.css` | link rel=stylesheet | WIRED | `_site/dist/css/style.css` 존재 확인 |
| `site/_includes/layouts/base.njk` | `/dist/css/docs.css` | link rel=stylesheet | WIRED | `_site/dist/css/docs.css` 존재 확인 |
| `eleventy.config.js` | `site/` | dir.input 설정 | WIRED | `input.*site` 패턴 확인 |
| `site/tokens/*.md` | `site/_includes/layouts/page.njk` | directory data JSON | WIRED | `site/tokens/tokens.json`에 `"layout": "layouts/page.njk"` |
| `site/components/*.md` | `site/_includes/layouts/component.njk` | directory data JSON | WIRED | `site/components/components.json`에 `"layout": "layouts/component.njk"` |
| `site/_includes/layouts/component.njk` | `site/_includes/partials/component-preview.njk` | 직접 iframe 렌더링 | WIRED | component.njk가 `playground_src` front matter를 직접 iframe src로 주입 |
| `site/assets/js/clipboard-init.js` | `clipboard (npm)` | ClipboardJS 생성자 | WIRED | `new ClipboardJS(...)` 호출, `_site/assets/js/clipboard.min.js` passthrough copy |
| `site/_includes/partials/search.njk` | `_site/pagefind/pagefind-ui.js` | PagefindUI 초기화 | WIRED | base.njk에서 `pagefind-ui.js` 로드, search.njk에서 `PagefindUI` 초기화 |
| `.pa11yci.js` | `_site/*.html` | file:// URL | WIRED | `docPages.map(p => 'file://' + path.join(siteDir, p))` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `site/_includes/layouts/component.njk` | `playground_src` | front matter (btn.md 등) | 예 — `/playground/btn.html` | FLOWING |
| `site/_includes/partials/nav-sidebar.njk` | `navigation.sections` | `site/_data/navigation.json` | 예 — 4개 섹션, 실제 URL | FLOWING |
| `_site/pagefind/` | 검색 인덱스 | Eleventy `eleventy.after` 이벤트 → pagefind CLI | 예 — 31개 파일 인덱싱 | FLOWING |
| `site/tokens/color.md` | 색상 토큰 테이블 | `src/scss/1-settings/_tokens-color.scss` 소스 추출 | 예 — 실제 CSS Custom Property 변수명과 값 | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `npm run build:site` 빌드 성공 | `npm run build:site` | "Copied 19 Wrote 31 files in 0.36 seconds (v3.1.5)" | PASS |
| `_site/index.html` 접근성 기본값 | `grep "skip-to-content\|lang=\"ko\"\|role=\"navigation\""` | 3개 항목 모두 발견 | PASS |
| pagefind 인덱스 파일 존재 | `ls _site/pagefind/` | `pagefind-ui.js`, `.pf_index`, `.pf_fragment` 등 존재 | PASS |
| 컴포넌트 페이지 iframe src | `grep "iframe" _site/components/btn/index.html` | `src="/playground/btn.html"` 정확히 설정됨 | PASS |
| clipboard.min.js 배포 | `test -f _site/assets/js/clipboard.min.js` | 존재 | PASS |
| pa11yci 설정 유효성 | `node -e "require('.pa11yci.js').urls.length"` | 19개 URL | PASS |
| Prism 하이라이팅 | `grep "language-html" _site/components/btn/index.html` | class 존재 | PASS |

Step 7b: 브라우저 서버 시작 없이 정적 파일 기반 검증만 수행. 런타임 JS 동작(검색 결과 렌더링, 복사 버튼 삽입)은 Human Verification 항목으로 분류.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| DOCS-01 | 05-01 | Eleventy 기반 문서 사이트 구축 (정적 HTML 출력) | SATISFIED | `eleventy.config.js` ESM 설정, `npm run build:site`로 31개 HTML 생성 |
| DOCS-02 | 05-03 | 컴포넌트 미리보기 + 코드 예제 페이지 | SATISFIED | 8개 컴포넌트 페이지에 iframe 미리보기 + Prism.js 코드 블록 |
| DOCS-03 | 05-03 | 코드 예제 copy-to-clipboard 기능 | SATISFIED | `clipboard-init.js` ClipboardJS 초기화, 빌드된 HTML에 스크립트 로드 |
| DOCS-04 | 05-04 | 문서 내 검색 기능 (pagefind) | SATISFIED | `_site/pagefind/` 인덱스 파일 존재, `pagefind-ui.js` 로드 |
| DOCS-05 | 05-02 | 가이드 문서 페이지 (토큰, BEM, SCSS 구조, 접근성 등) | SATISFIED | tokens(5), conventions(3), accessibility(12) 총 20개 페이지 빌드 완료 |
| DOCS-06 | 05-01, 05-04 | 문서 사이트 자체가 KWCAG/WCAG AA 준수 | SATISFIED | `skip-to-content`, `lang="ko"`, `role="navigation"`, `aria-label`, `aria-expanded`, iframe `title` 속성 확인. `.pa11yci.js`에 19개 URL, pa11y-ci WCAG2AA 기준 설정 |
| AI-01 | 05-02 | 모든 가이드 문서가 AI 프롬프트로 바로 활용 가능한 구조화된 형태 | SATISFIED | `CLAUDE.md`에 `docs/accessibility/{component}.md` 경로 안내, `npm run build:site` 사용법 포함 |

**ORPHANED 요구사항:** 없음. REQUIREMENTS.md에서 Phase 5에 매핑된 모든 요구사항(DOCS-01 ~ DOCS-06, AI-01)이 4개 플랜 중 하나 이상에서 처리됨.

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `site/_includes/partials/search.njk` | `placeholder: '검색어를 입력하세요'` | INFO | pagefind 번역 문자열로 의도된 값. 스텁 아님 |
| `site/components/form.md` | `placeholder="이름을 입력하세요"` | INFO | HTML 코드 예제 내 예시 값. 스텁 아님 |

**스텁 분류:** 위 항목들은 코드 예제 내 예시 값 또는 UI 번역 문자열로, 실제 데이터 흐름과 무관한 정상 패턴. 블로커 안티패턴 없음.

---

### Human Verification Required

#### 1. pagefind 검색 동작

**Test:** `npm run serve` 실행 후 브라우저에서 http://localhost:8080 열기. 사이드바 상단 검색창에 '색상', 'btn', '체크리스트' 순으로 입력
**Expected:** 각 키워드에 대한 관련 페이지 목록이 드롭다운으로 표시됨
**Why human:** pagefind-ui.js는 클라이언트 JS로 초기화되어 검색 인덱스를 fetch. 정적 파일 검사로는 런타임 렌더링 확인 불가

#### 2. 코드 복사 버튼 동작

**Test:** 컴포넌트 > 버튼 페이지(http://localhost:8080/components/btn/)에서 코드 블록 우측 상단 '복사' 버튼 클릭
**Expected:** '복사됨' 텍스트로 변경, 2초 후 '복사'로 원복. 클립보드에 코드 내용 복사됨
**Why human:** clipboard-init.js가 DOMContentLoaded 후 버튼을 동적 삽입. 정적 HTML에서는 버튼이 없고 브라우저에서만 동작 확인 가능

#### 3. 모바일 반응형 및 햄버거 메뉴

**Test:** 브라우저 개발자도구에서 모바일 뷰(767px 이하) 전환 후 햄버거 버튼 클릭
**Expected:** 사이드바가 오버레이로 표시되고, ESC 키로 닫히며, aria-expanded 속성이 토글됨
**Why human:** nav-mobile.js + CSS 반응형 동작은 브라우저에서만 확인 가능

---

### Gaps Summary

갭 없음. 5개의 관찰 가능한 진실이 모두 검증됨.

- DOCS-01: Eleventy 빌드 파이프라인 완전히 동작 (31 HTML 출력)
- DOCS-02: 8개 컴포넌트 페이지 iframe 미리보기 정확히 연결됨
- DOCS-03: clipboard.js 연결 확인, 런타임 동작은 Human Verification
- DOCS-04: pagefind 인덱스 파일 생성 확인, 검색 UI 로드 확인
- DOCS-05: 20개 가이드 문서 페이지 빌드 완료
- DOCS-06: 접근성 구조적 요소 모두 확인, pa11y-ci 설정 완료
- AI-01: CLAUDE.md 업데이트 확인

자동화 검사로 확인 불가한 런타임 JS 동작(검색 렌더링, 복사 버튼, 모바일 메뉴) 3개 항목은 Human Verification으로 분류.

---

_Verified: 2026-03-26T00:51:00Z_
_Verifier: Claude (gsd-verifier)_
