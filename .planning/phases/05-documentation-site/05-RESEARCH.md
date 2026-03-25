# Phase 5: Documentation Site - Research

**Researched:** 2026-03-26
**Domain:** Eleventy 정적 사이트 생성, pagefind 검색, Prism.js 코드 하이라이팅, clipboard.js 복사
**Confidence:** HIGH

## Summary

Phase 5는 Eleventy 3.x 기반 정적 문서 사이트를 구축하여 Phase 1~4에서 만든 토큰, 컨벤션, 컴포넌트, 접근성 가이드를 한곳에서 열람/검색 가능하게 한다. 기존 playground HTML(10개), 접근성 가이드 마크다운(11개), BEM 가이드, SCSS 구조 가이드, 스니펫(9개)이 이미 존재하므로 콘텐츠 작성이 아닌 **사이트 프레임워크 구축과 콘텐츠 통합**이 핵심이다.

Eleventy 3.1.5는 ESM을 지원하며 Nunjucks 템플릿 엔진과 자연스럽게 결합된다. pagefind는 빌드 후 자동 인덱싱으로 별도 서버 없이 정적 검색을 제공하고, `@11ty/eleventy-plugin-syntaxhighlight` 플러그인이 Prism.js 기반 코드 하이라이팅을 Nunjucks/Markdown 모두에서 지원한다. clipboard.js는 2KB의 경량 라이브러리로 코드 복사 버튼을 간단히 구현할 수 있다.

**Primary recommendation:** Eleventy 3.1.5 + Nunjucks + `eleventy.after` 이벤트에서 pagefind CLI 실행 구조. 기존 마크다운 파일에 YAML front matter만 추가하면 Eleventy가 바로 렌더링한다. playground HTML은 iframe으로 컴포넌트 미리보기에 활용.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 4개 대섹션 구조 -- 토큰(Token) / 컨벤션(Convention) / 컴포넌트(Component) / 접근성(Accessibility) + pagefind 검색. 각 섹션 내 하위 페이지 배치.
- **D-02:** 네비게이션 스타일은 Claude 재량 -- 문서 사이트 표준 패턴(좌측 사이드바 등)으로 자유롭게 구성.
- **D-03:** 미리보기 구현 방식은 Claude 재량 -- iframe 임베드 또는 Nunjucks 매크로 등 최적의 방법으로 구현. Phase 3 playground HTML을 활용.
- **D-04:** 코드 복사(copy-to-clipboard) 버튼은 각 코드 블록 우측 상단에 배치. clipboard.js 사용. 클릭 시 "복사됨" 피드백 표시.
- **D-05:** 미니말 + 토큰 기반 스타일링 -- 프로젝트 토큰(--color-*, --spacing-*, --font-*)을 문서 사이트에도 적용. 콘텐츠 중심의 깔끔한 디자인.
- **D-06:** 기본 반응형 -- respond-to() 믹스인 활용. 모바일에서 사이드바 숨김 + 햄버거 메뉴, 콘텐츠 1열. 데스크탑에서 사이드바 고정.
- **D-07:** CLAUDE.md 확장 방식 -- 현재 CLAUDE.md의 컴포넌트 스니펫 경로 안내에 접근성 가이드 경로(docs/accessibility/)도 추가. AI가 레포 클론 후 CLAUDE.md만 읽으면 모든 규칙과 가이드 경로 확인 가능.

### Claude's Discretion
- Eleventy 디렉토리 구조 및 설정 (eleventy.config.js)
- Nunjucks 템플릿 상속 구조 (base layout, page layout 등)
- pagefind 설정 및 통합 방식
- Prism.js 코드 하이라이팅 테마 선택
- 컴포넌트 미리보기의 구체적 구현 방식 (iframe vs 매크로)
- 네비게이션 UI 패턴 (사이드바, 탭, 브레드크럼 등)
- 문서 사이트 전용 SCSS 파일 구조

### Deferred Ideas (OUT OF SCOPE)
- 버전 관리 (토큰/컴포넌트 변경 이력) -- v2 확장
- 다국어 문서 -- Out of Scope (한국어 단일)
- 검색 고도화 (필터, 카테고리별 검색) -- pagefind 기본 검색으로 충분
- 문서 기여 가이드 (CONTRIBUTING.md) -- Phase 6 온보딩에서 고려
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOCS-01 | Eleventy 기반 문서 사이트 구축 (정적 HTML 출력) | Eleventy 3.1.5 ESM 설정, Nunjucks 템플릿, 디렉토리 구조 패턴 |
| DOCS-02 | 컴포넌트 미리보기 + 코드 예제 페이지 | iframe으로 playground HTML 임베드 + 스니펫 마크다운 코드 블록 |
| DOCS-03 | 코드 예제 copy-to-clipboard 기능 | clipboard.js 1.0.1 + Prism 코드 블록 연동 패턴 |
| DOCS-04 | 문서 내 검색 기능 (pagefind 등) | pagefind 1.4.0 eleventy.after 이벤트 통합, PagefindUI 위젯 |
| DOCS-05 | 가이드 문서 페이지 (토큰, BEM, SCSS 구조, 접근성 등) | 기존 마크다운에 front matter 추가, Nunjucks 레이아웃 래핑 |
| DOCS-06 | 문서 사이트 자체가 KWCAG/WCAG AA 준수 | pa11y-ci URL 추가, skip-to-content, 키보드 네비게이션, ARIA |
| AI-01 | 모든 가이드 문서가 AI 프롬프트로 바로 활용 가능한 구조화된 형태 | CLAUDE.md에 접근성 가이드 경로 추가, 문서 사이트 구조 경로 안내 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- BEM(Block__Element--Modifier) 필수 -- 문서 사이트 전용 컴포넌트도 BEM 적용
- SCSS(dart-sass) 전처리기 -- 문서 사이트 스타일도 SCSS로 작성
- npm 패키지 매니저 -- 모든 의존성 npm으로 설치
- KWCAG/WCAG 2.1 AA 접근성 -- 문서 사이트 자체도 준수 (DOCS-06)
- 2 spaces, single quote, 세미콜론 없음 (JS/HTML), 한국어 주석
- 인라인 스타일 금지, !important 금지
- CSS Custom Properties(토큰) 우선 사용, 하드코딩 금지
- @use/@forward 사용 (@import 금지)
- Git commit 메시지 한국어 명령형

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.5 | 정적 사이트 생성기 | ESM 지원, Nunjucks 내장, 제로 JS 출력. CLAUDE.md에서 선정 완료 |
| nunjucks | 3.2.4 | 템플릿 엔진 | Eleventy 내장. Jinja2 스타일, 매크로/상속 지원 |
| pagefind | 1.4.0 | 정적 검색 엔진 | 빌드 후 인덱싱, 별도 서버 불필요. 한국어 지원 |
| @11ty/eleventy-plugin-syntaxhighlight | 5.0.2 | Prism.js 코드 하이라이팅 | Eleventy 공식 플러그인. Nunjucks/Markdown 모두 지원 |
| clipboard.js (clipboard) | 2.0.11 | 코드 복사 | npm 패키지명 `clipboard`. 2KB, 의존성 없음. D-04 결정 |
| concurrently | 9.2.1 | 병렬 npm scripts | sass --watch + eleventy --serve 동시 실행 |

**참고:** `clipboard.js`의 npm 패키지명은 `clipboard`이다 (npm install clipboard).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| iframe 미리보기 | Nunjucks 매크로 인라인 | iframe은 완전 격리(CSS 충돌 없음)이나 높이 조절 필요. 매크로는 문서 CSS와 충돌 가능 |
| pagefind | lunr.js | lunr은 클라이언트 전체 인덱스 로딩, pagefind는 부분 로딩으로 대규모 사이트에 효율적 |
| @11ty/eleventy-plugin-syntaxhighlight | 직접 markdown-it + prismjs | 공식 플러그인이 설정/유지보수 간편, Nunjucks shortcode도 지원 |

**Installation:**
```bash
npm install --save-dev @11ty/eleventy @11ty/eleventy-plugin-syntaxhighlight pagefind concurrently
npm install clipboard
```

## Architecture Patterns

### Recommended Project Structure
```
site/                               # Eleventy 입력 디렉토리 (src와 분리)
├── _data/                          # 글로벌 데이터 (네비게이션, 사이트 메타)
│   ├── site.json                   # 사이트 제목, 설명 등
│   └── navigation.json             # 사이드바 네비게이션 데이터
├── _includes/                      # Nunjucks 레이아웃/파셜
│   ├── layouts/
│   │   ├── base.njk                # HTML 셸 (head, skip-to-content, scripts)
│   │   ├── page.njk                # 사이드바 + 콘텐츠 레이아웃
│   │   └── component.njk           # 미리보기 + 코드 탭 레이아웃
│   ├── partials/
│   │   ├── nav-sidebar.njk         # 좌측 네비게이션
│   │   ├── nav-mobile.njk          # 모바일 햄버거 메뉴
│   │   ├── search.njk              # pagefind 검색 위젯
│   │   ├── copy-button.njk         # 코드 복사 버튼 매크로
│   │   └── component-preview.njk   # iframe 미리보기 매크로
│   └── macros/
│       └── helpers.njk             # 공용 Nunjucks 매크로
├── tokens/                         # 토큰 섹션 페이지들
│   ├── index.md                    # 토큰 개요
│   ├── color.md                    # 색상 토큰
│   ├── typography.md               # 타이포그래피 토큰
│   ├── spacing.md                  # 간격 토큰
│   └── grid.md                     # 그리드 토큰
├── conventions/                    # 컨벤션 섹션 페이지들
│   ├── index.md                    # 컨벤션 개요
│   ├── bem.md                      # BEM 가이드 (docs/bem-guide.md 기반)
│   └── scss-structure.md           # SCSS 구조 가이드
├── components/                     # 컴포넌트 섹션 페이지들
│   ├── index.md                    # 컴포넌트 개요
│   ├── btn.md                      # 버튼
│   ├── form.md                     # 폼
│   ├── card.md                     # 카드
│   ├── table.md                    # 테이블
│   ├── modal.md                    # 모달
│   ├── tab.md                      # 탭
│   ├── pagination.md               # 페이지네이션
│   ├── breadcrumb.md               # 브레드크럼
│   └── boilerplate.md              # 보일러플레이트
├── accessibility/                  # 접근성 섹션 페이지들
│   ├── index.md                    # 접근성 개요
│   ├── checklist.md                # KWCAG 체크리스트
│   ├── color-contrast.md           # 색상 대비
│   ├── sr-only.md                  # 스크린리더 전용
│   ├── btn.md                      # 버튼 접근성
│   ├── form.md                     # 폼 접근성
│   ├── card.md                     # 카드 접근성
│   ├── table.md                    # 테이블 접근성
│   ├── modal.md                    # 모달 접근성
│   ├── tab.md                      # 탭 접근성
│   ├── breadcrumb.md               # 브레드크럼 접근성
│   └── pagination.md               # 페이지네이션 접근성
├── assets/                         # 정적 자원 (passthrough copy)
│   ├── css/                        # 빌드된 CSS (dist/css에서 복사 또는 별도 빌드)
│   └── js/                         # clipboard.js, 모바일 메뉴 JS 등
├── index.md                        # 메인 랜딩 페이지
_site/                              # Eleventy 출력 (빌드 결과)
eleventy.config.js                  # Eleventy 설정
```

### Pattern 1: Eleventy ESM 설정
**What:** eleventy.config.js를 ESM으로 작성, 디렉토리/플러그인 설정
**When to use:** 프로젝트 초기 설정

```javascript
// eleventy.config.js
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'

export default function(eleventyConfig) {
  // 코드 하이라이팅 플러그인
  eleventyConfig.addPlugin(syntaxHighlight)

  // 정적 자원 passthrough copy
  eleventyConfig.addPassthroughCopy('site/assets')
  eleventyConfig.addPassthroughCopy({ 'dist/css': 'assets/css' })
  eleventyConfig.addPassthroughCopy({ 'src/playground': 'playground' })

  // pagefind 빌드 후 인덱싱
  eleventyConfig.on('eleventy.after', async () => {
    const { execSync } = await import('child_process')
    execSync('npx -y pagefind --site _site --glob "**/*.html"', {
      stdio: 'inherit'
    })
  })

  return {
    dir: {
      input: 'site',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  }
}
```

### Pattern 2: Nunjucks 레이아웃 상속
**What:** base -> page -> component 3단계 레이아웃 상속
**When to use:** 모든 페이지

```html
{# base.njk -- HTML 셸 #}
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | INFOMIND UX 가이드</title>
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/docs.css">
  <link href="/pagefind/pagefind-ui.css" rel="stylesheet">
</head>
<body>
  <a href="#main-content" class="skip-to-content sr-only">본문 바로가기</a>
  {% include "partials/nav-mobile.njk" %}
  <div class="docs-layout">
    {% include "partials/nav-sidebar.njk" %}
    <main id="main-content" class="docs-layout__content" data-pagefind-body>
      {% block content %}{% endblock %}
    </main>
  </div>
  <script src="/pagefind/pagefind-ui.js"></script>
  <script src="/assets/js/clipboard-init.js"></script>
  {% block scripts %}{% endblock %}
</body>
</html>
```

```markdown
---
layout: layouts/page.njk
title: 버튼
section: components
order: 1
---
# 버튼 (Button)
...마크다운 콘텐츠...
```

### Pattern 3: 마크다운 Front Matter 추가
**What:** 기존 마크다운 파일에 YAML front matter 추가하여 Eleventy 연동
**When to use:** 기존 docs/, src/snippets/ 마크다운 통합 시

기존 마크다운 파일에는 front matter가 없다. 두 가지 접근 가능:
1. **복사 후 front matter 추가** -- 기존 파일을 site/ 디렉토리로 복사하여 front matter 추가 (원본 보존)
2. **원본에 front matter 추가** -- docs/, src/snippets/ 파일 자체에 front matter 추가

**권장: 접근 1 (복사 후 추가)** -- 기존 docs/, src/snippets/는 AI 직접 참조용으로 유지, site/ 디렉토리에 문서 사이트용 버전 관리.

### Pattern 4: 컴포넌트 미리보기 (iframe)
**What:** playground HTML을 iframe으로 임베드하여 라이브 미리보기 제공
**When to use:** 컴포넌트 페이지 (DOCS-02)

```html
{# component-preview.njk 매크로 #}
{% macro preview(component_name, height) %}
<div class="preview">
  <div class="preview__frame">
    <iframe
      src="/playground/{{ component_name }}.html"
      title="{{ component_name }} 컴포넌트 미리보기"
      height="{{ height | default(400) }}"
      loading="lazy"
      class="preview__iframe"
    ></iframe>
  </div>
</div>
{% endmacro %}
```

**iframe 장점:**
- 문서 사이트 CSS와 컴포넌트 CSS 완전 격리
- playground HTML을 그대로 재사용 (코드 중복 없음)
- Phase 3 playground에 이미 JS(모달, 탭)가 포함되어 있어 인터랙션도 동작

**iframe 주의사항:**
- 높이를 콘텐츠에 맞게 수동 설정하거나 ResizeObserver로 자동 조절 필요
- iframe에 `title` 속성 필수 (접근성)

### Pattern 5: clipboard.js 코드 복사
**What:** Prism 코드 블록에 복사 버튼 자동 추가
**When to use:** 모든 코드 블록 (DOCS-03)

```javascript
// clipboard-init.js
;(function() {
  'use strict'

  document.querySelectorAll('pre[class*="language-"]').forEach(function(pre) {
    var btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.setAttribute('aria-label', '코드 복사')
    btn.textContent = '복사'
    pre.style.position = 'relative'
    pre.appendChild(btn)
  })

  var clipboard = new ClipboardJS('.copy-btn', {
    target: function(trigger) {
      return trigger.closest('pre').querySelector('code')
    }
  })

  clipboard.on('success', function(e) {
    e.trigger.textContent = '복사됨'
    e.trigger.setAttribute('aria-label', '코드 복사됨')
    setTimeout(function() {
      e.trigger.textContent = '복사'
      e.trigger.setAttribute('aria-label', '코드 복사')
    }, 2000)
    e.clearSelection()
  })
})()
```

### Pattern 6: pagefind 검색 통합
**What:** pagefind UI 위젯을 사이드바 또는 헤더에 배치
**When to use:** DOCS-04

```html
{# search.njk #}
<div class="docs-search" role="search" aria-label="문서 검색">
  <div id="search"></div>
</div>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    new PagefindUI({
      element: '#search',
      showSubResults: true,
      translations: {
        placeholder: '검색어를 입력하세요',
        zero_results: '검색 결과가 없습니다'
      }
    })
  })
</script>
```

핵심: `data-pagefind-body` 속성을 메인 콘텐츠 영역에만 적용하여 네비게이션/푸터가 검색에 포함되지 않도록 한다.

### Anti-Patterns to Avoid
- **docs/ 원본 직접 수정으로 Eleventy 의존성 생성:** AI가 직접 참조하는 docs/와 src/snippets/는 원본 보존. site/ 디렉토리에서 관리.
- **playground HTML을 Nunjucks 매크로로 재작성:** playground에 이미 완성된 HTML+JS가 있으므로 iframe으로 재사용. 중복 작성은 유지보수 부담.
- **문서 사이트 전용 CSS를 style.css에 합침:** 문서 사이트 스타일은 별도 SCSS 파일(docs.scss)로 분리. 프로젝트 토큰은 공유하되 문서 레이아웃 스타일은 독립.
- **pagefind 인덱스를 git에 커밋:** `_site/pagefind/`는 빌드 산출물이므로 .gitignore에 추가.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 코드 하이라이팅 | 직접 Prism.js 설정 | @11ty/eleventy-plugin-syntaxhighlight | Eleventy 공식, Nunjucks shortcode 지원, 자동 언어 감지 |
| 문서 검색 | lunr.js 인덱스 직접 구축 | pagefind | 빌드 후 자동 인덱싱, 부분 로딩, UI 위젯 포함 |
| 코드 복사 | document.execCommand('copy') | clipboard.js | 브라우저 호환성, 피드백 처리, Clipboard API 폴백 |
| 마크다운 -> HTML | 직접 markdown-it 설정 | Eleventy 내장 markdown 처리 | front matter 파싱, 레이아웃 연결 자동 |
| iframe 높이 자동 조절 | 수동 postMessage | 고정 높이 + 수동 조정 | 복잡도 대비 이점 적음, 컴포넌트별 적절한 높이 지정으로 충분 |

## Common Pitfalls

### Pitfall 1: 기존 마크다운 front matter 부재
**What goes wrong:** Eleventy가 마크다운을 렌더링하지만 레이아웃이 적용되지 않아 날 HTML만 출력
**Why it happens:** 기존 docs/, src/snippets/ 마크다운에 YAML front matter가 없음
**How to avoid:** site/ 디렉토리에 복사본을 만들어 front matter 추가. 또는 디렉토리별 데이터 파일(directory data file)로 기본 layout 지정
**Warning signs:** 빌드 후 페이지에 네비게이션/레이아웃이 없음

### Pitfall 2: CSS 경로 불일치
**What goes wrong:** 문서 사이트에서 스타일이 적용되지 않음
**Why it happens:** Eleventy 출력(_site/)에서 dist/css/style.css 경로가 달라짐
**How to avoid:** passthrough copy로 dist/css를 _site/assets/css로 복사. 또는 빌드 스크립트에서 SCSS 컴파일 출력을 _site/로 직접 지정
**Warning signs:** 브라우저 네트워크 탭에서 CSS 404

### Pitfall 3: playground HTML의 상대 경로
**What goes wrong:** iframe으로 임베드한 playground에서 style.css 경로가 깨짐
**Why it happens:** playground HTML이 `../../dist/css/style.css` 상대 경로 사용
**How to avoid:** passthrough copy로 playground HTML을 _site/playground/에 복사하고, 빌드 시 CSS 경로를 절대 경로(`/assets/css/style.css`)로 변경. 또는 별도 빌드 단계에서 경로 치환
**Warning signs:** iframe 내 컴포넌트에 스타일 미적용

### Pitfall 4: pagefind 인덱싱 타이밍
**What goes wrong:** 검색이 동작하지 않거나 빈 결과
**Why it happens:** pagefind가 Eleventy 빌드 완료 전에 실행되거나, --serve 모드에서 매 변경마다 인덱싱 실행
**How to avoid:** `eleventy.after` 이벤트에서 실행하면 빌드 완료 보장. 개발 시에는 검색 기능 비활성화하거나 별도 빌드 명령 사용
**Warning signs:** 개발 서버 재시작 시 pagefind 인덱싱으로 느려짐

### Pitfall 5: 문서 사이트 SCSS와 프로젝트 SCSS 충돌
**What goes wrong:** 문서 사이트 레이아웃 클래스가 프로젝트 컴포넌트 스타일과 충돌
**Why it happens:** 동일 style.css에 문서 사이트 스타일 추가
**How to avoid:** 문서 사이트 전용 SCSS 파일(docs.scss)을 별도 생성. 프로젝트 style.css는 공유하되 docs 레이아웃은 `docs-` 접두사 BEM 블록으로 격리
**Warning signs:** 문서 사이트 스타일이 playground iframe에 영향

### Pitfall 6: 접근성 누락 (DOCS-06)
**What goes wrong:** 문서 사이트 자체가 WCAG AA 미준수
**Why it happens:** 네비게이션, 검색, 모바일 메뉴 등 새 UI에 ARIA 속성 누락
**How to avoid:** skip-to-content 링크, nav role="navigation" aria-label, 검색 role="search", 모바일 메뉴 aria-expanded, 키보드 네비게이션 지원
**Warning signs:** pa11y-ci 문서 사이트 URL 검사 실패

## Code Examples

### Eleventy 디렉토리 데이터 파일 (레이아웃 자동 적용)
```json
// site/components/components.json
{
  "layout": "layouts/component.njk",
  "section": "components",
  "tags": "component"
}
```
이렇게 하면 components/ 폴더 내 모든 마크다운에 자동으로 component 레이아웃이 적용된다.

### npm scripts 패턴
```json
{
  "scripts": {
    "build:css": "sass src/scss/style.scss dist/css/style.css --load-path=node_modules",
    "build:docs-css": "sass src/scss/docs.scss dist/css/docs.css --load-path=node_modules",
    "build:site": "npm run build:css && npm run build:docs-css && npx @11ty/eleventy",
    "serve": "concurrently \"sass src/scss/style.scss dist/css/style.css --load-path=node_modules --watch\" \"sass src/scss/docs.scss dist/css/docs.css --load-path=node_modules --watch\" \"npx @11ty/eleventy --serve\"",
    "lint:css": "stylelint \"src/scss/**/*.scss\"",
    "lint:css:fix": "stylelint \"src/scss/**/*.scss\" --fix",
    "test:a11y": "npm run build:css && pa11y-ci --config .pa11yci.js"
  }
}
```

### Prism.js 테마 선택
Prism One Dark 또는 Prism Tomorrow Night 테마 권장. 어두운 배경이 코드 가독성에 유리하며, 프로젝트 컬러와 충돌 없음. `@11ty/eleventy-plugin-syntaxhighlight`는 CSS만 별도 포함하면 되고, PrismJS 공식 테마 CDN 또는 npm prismjs 패키지에서 CSS 복사.

```html
<!-- prism-okaidia 테마 (어두운 배경) -->
<link rel="stylesheet" href="/assets/css/prism-okaidia.css">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @11ty/eleventy v2 (CJS) | v3.1.5 (ESM 지원) | 2024 | eleventy.config.js ESM export default 사용 가능 |
| lunr.js 클라이언트 검색 | pagefind 정적 검색 | 2023~ | 빌드 시 인덱싱, 부분 로딩으로 성능 대폭 개선 |
| document.execCommand('copy') | Clipboard API + clipboard.js | 2020~ | execCommand deprecated, clipboard.js가 API 폴백 처리 |
| Eleventy v2 syntaxhighlight 4.x | v5.0.2 | 2024 | ESM 지원, Eleventy 3 호환 |

## Open Questions

1. **playground HTML CSS 경로 처리 방식**
   - What we know: playground HTML이 `../../dist/css/style.css` 상대 경로 사용
   - What's unclear: passthrough copy 후 경로가 깨지므로 수정 필요
   - Recommendation: Eleventy transform 또는 빌드 스크립트에서 경로 치환. 또는 playground HTML을 site/에 복사하면서 경로 수정

2. **문서 사이트 전용 SCSS 구조**
   - What we know: 프로젝트 토큰(1-settings)과 믹스인(2-tools)은 공유해야 함
   - What's unclear: docs.scss가 style.scss를 import할지, 토큰만 import할지
   - Recommendation: docs.scss가 1-settings와 2-tools를 @use하고, 문서 전용 레이아웃 스타일만 추가. style.css는 별도 로딩하여 컴포넌트 스타일 유지

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Eleventy, 모든 빌드 | ✓ | v22.21.1 | -- |
| npm | 패키지 설치 | ✓ | 10.9.4 | -- |
| sass (dart-sass) | SCSS 컴파일 | ✓ | ^1.98.0 (installed) | -- |
| npx | pagefind CLI | ✓ | 10.9.4 | -- |

**Missing dependencies with no fallback:**
- 없음 -- 모든 환경 의존성 충족

**Missing dependencies with fallback:**
- 없음

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pa11y-ci ^4.1.0 + Stylelint ^17.5.0 |
| Config file | `.pa11yci.js` (기존), `.stylelintrc.json` (기존) |
| Quick run command | `npx stylelint "src/scss/**/*.scss"` |
| Full suite command | `npm run build:site && npm run test:a11y && npm run lint:css` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCS-01 | Eleventy 빌드 성공 | smoke | `npx @11ty/eleventy --dryrun` | -- Wave 0 |
| DOCS-02 | 컴포넌트 미리보기 iframe 렌더링 | manual | 브라우저에서 확인 | manual-only |
| DOCS-03 | clipboard.js 복사 동작 | manual | 브라우저에서 확인 | manual-only |
| DOCS-04 | pagefind 검색 동작 | smoke | `npm run build:site && ls _site/pagefind/pagefind-index*.pf` | -- Wave 0 |
| DOCS-05 | 가이드 페이지 HTML 출력 | smoke | `npm run build:site && ls _site/tokens/ _site/conventions/ _site/components/ _site/accessibility/` | -- Wave 0 |
| DOCS-06 | 문서 사이트 WCAG AA | integration | `npm run build:site && pa11y-ci --config .pa11yci.js` | ✅ (URL 추가 필요) |
| AI-01 | CLAUDE.md 접근성 경로 포함 | unit | `grep -q "docs/accessibility" CLAUDE.md` | -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx stylelint "src/scss/**/*.scss"` + Eleventy dry run
- **Per wave merge:** `npm run build:site` + pa11y-ci
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Eleventy 설치 및 기본 설정 (eleventy.config.js)
- [ ] npm scripts 추가 (build:site, serve)
- [ ] .pa11yci.js에 문서 사이트 URL 추가
- [ ] .gitignore에 _site/ 추가

## Sources

### Primary (HIGH confidence)
- [Eleventy 공식 설정 문서](https://www.11ty.dev/docs/config/) - v3.x ESM 지원, 디렉토리 설정, 이벤트
- [Eleventy Nunjucks 문서](https://www.11ty.dev/docs/languages/nunjucks/) - 템플릿 설정, shortcode
- [Eleventy Syntax Highlighting 문서](https://www.11ty.dev/docs/plugins/syntaxhighlight/) - 플러그인 v5.0.2 설정
- [pagefind 공식 문서](https://pagefind.app/docs/) - CLI, UI 위젯, data-pagefind-body
- npm registry - @11ty/eleventy 3.1.5, pagefind 1.4.0, clipboard 2.0.11, prismjs 1.30.0, concurrently 9.2.1

### Secondary (MEDIUM confidence)
- [Robb Knight - pagefind + Eleventy](https://rknight.me/blog/using-pagefind-with-eleventy-for-search/) - eleventy.after 이벤트 통합 패턴
- [Per Mortensen - pagefind + Eleventy](https://permortensen.com/adding-pagefind-to-an-eleventy-site/) - Node API vs CLI 비교

### Tertiary (LOW confidence)
- 없음

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - CLAUDE.md에서 이미 선정, npm registry에서 버전 확인
- Architecture: HIGH - Eleventy 공식 문서 기반 디렉토리 구조, 검증된 패턴
- Pitfalls: HIGH - 기존 코드 분석(playground 경로, front matter 부재)에서 도출

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (안정적 스택, 30일)
