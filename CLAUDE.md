## UI/스타일 작업 시 자동 적용

절차의 단일 원본은 `contracts/agent-workflow.json`이다. Claude는 Codex 및 다른 에이전트와 동일한 순서와 실패 조건을 적용한다.

이 저장소에서 CSS·HTML·UI 작업을 시작하면 별도 트리거 없이 infoUX 컨트랙트가 발효된다.

1. `contracts/task-contract.md` 형식으로 사이트 유형, 핵심 과업, 페이지 패턴, 재사용 컴포넌트, 위젯, 예외를 먼저 선언한다.
2. infoUX MCP(`npx -y @infomind-ux/infoux-mcp`)의 `get_workflow`로 작업 절차를 확인한다.
3. 수정 파일과 가장 가까운 `AGENTS.md`를 읽는다.
4. 기존 카탈로그와 승인 패턴을 조합한 뒤 구현한다.
5. 검사는 설계 판단을 대신하지 않는 마지막 안전망으로 실행한다.

Task Contract의 필수 판단이 비어 있으면 UI 구현을 시작하지 않는다. 규칙 위반을 발견하면 즉시 작업을 중단하고 사용자에게 보고한다.

> 기준 본체는 이 저장소의 `references/`. `npm run build:mcp`로 MCP 번들(`mcp/data/`)에 반영되고, 팀원은 MCP 등록만으로 받는다. 스킬 계층은 2026-07-29 폐기했다.

---

## Project

**INFOMIND UX 디자인/퍼블리싱 가이드 시스템**

KRDS(범정부 UI/UX 디자인 시스템) 베이스 + INFOMIND UX팀 표준을 합쳐 신규 프로젝트가 즉시 적용 가능한 토큰·컴포넌트·스니펫·기준을 한 저장소에서 발행한다.

**Core Value:** 검증된 팀 표준을 일관되게 유지하며, 토큰부터 컴포넌트·스니펫·LLM 컨트랙트까지 단일 소스에서 발행한다.

발행 채널 — `starter/`(KRDS+Tailwind v4 스타터 키트), `mcp/`(infoUX MCP 서버 — AI 도구 공통 경로), `prompts/`(LLM 컨텍스트 묶음).

---

## 코딩 규칙

> 소스: `rules.json` | 상세 문서: `/conventions/` | 갱신: `npm run build:rules`
> 위반은 훅(check-violations.js + stylelint)이 자동 검출한다.

<!-- RULES_START -->
### CSS 규칙
- R-01 `error` — 색은 어디에 쓰든 var(--color-*)만 — 선언 값·Tailwind 팔레트·흑백·임의값·style 속성 안까지. 간격·크기는 rem 임의값(R-37)
- R-02 `warn` — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수
- R-03 `error` — SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용
- R-19 `error` — 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지
- R-20 `error` — 호환성 위험 CSS 선택자 금지 — 핵심 CSS에서 :has() 사용 금지
- R-24 `error` — 한글 조판 하한 — keep-all 존재 필수·음수 자간·keep-all 무력화 금지, 1.5 미만 행간 경고(마크업은 오류)
- R-26 `error` — 폰트 스택 — 1순위는 카탈로그 한글 폰트, 서체는 토큰으로만(font-family 직접값·font-serif·외부 폰트 호스트 금지)
- R-31 warn — 루트 글자 크기는 62.5%로 고정한다 — 다른 값·vw 금지(경고)
- R-34 `error` — 장식 효과 금지 — 장식 그라데이션·그라데이션 글자·글래스(backdrop)·큰 블러·컬러 글로우 그림자
- R-35 `error` — 반경은 KRDS 상한 1.2rem, 완전 원형은 지정 블록·정사각 원형만, 그림자 blur는 2.4rem 이하
- R-37 `error` — Tailwind 기본 타입·행간·간격·컨테이너 스케일 금지 — 62.5% 루트에서 37.5% 작아진다, rem 임의값을 쓴다
- R-38 `error` — KRDS 최소 글자 — 1.3rem 미만 금지, body 1.6rem·본문 성격 요소 1.5rem 이상, 단계 밖 크기 경고
- R-48 `error` — 모바일 우선 — 360px 넘는 모바일 고정 폭 금지, 모바일 기본 열 없는 3열 이상 그리드 경고
- R-49 warn — 공공·관리자 화면의 섹션 세로 여백은 밀도 프리셋의 1.5배를 넘지 않는다(경고)

### BEM 네이밍
- R-04 `info` — BEM 사용 (5-objects, 6-components 레이어에만 적용)
- R-05 `error` — element 2단계 중첩 금지 — 평탄화
- R-06 `error` — 시각적 modifier 금지 — 의미적 이름 사용
- R-17 `error` — 상태는 ARIA·hidden 속성을 먼저 — ARIA로 표현할 수 없을 때만 BEM modifier, .is-* / .has-* 금지
- R-18 `error` — modifier 이름은 허용 어휘(contracts/class-naming.json)에서 — 시각적 단어 금지

### HTML/마크업 규칙
- R-07 `warn` — inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용
- R-08 `warn` — HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동)
- R-09 `error` — img alt 속성 필수 — 일반 어휘·파일명·연번 alt는 경고
- R-10 `error` — 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지
- R-15 `error` — HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다
- R-23 `error` — 가짜·자리 콘텐츠 금지 — 채움 문구·placeholder 핫링크·'질문 1' 연번 레이블·자리값 제목·지어낸 연락처
- R-25 `error` — 섹션 리듬 — 동일 archetype 3연속·카드형 중첩 금지, archetype 선언 필수, 카드 그리드 남발 경고(납품 페이지는 3연속·3개부터 오류)
- R-27 `error` — 아이콘은 카탈로그에서 가져온다 — 임의 SVG 삽입 금지
- R-29 `error` — 마크업의 BEM 클래스는 CSS에 실재해야 한다 — 없는 modifier 금지, 없는 element 경고
- R-30 `error` — 링크는 실제 목적지와 그 목적지를 말하는 이름을 가진다 — 빈 값·#·javascript: 금지, 더보기만인 이름 경고
- R-32 `error` — 푸터에 KRDS 명칭 '개인정보 처리방침' 링크를 실제 주소로 둔다 — 옛 명칭 금지, 강조는 그 링크에만
- R-36 `error` — 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다 — 아이콘은 카탈로그(R-27)
- R-39 `error` — main 안 h1은 하나, 제목 단계를 건너뛰지 않는다
- R-40 `error` — 공공 화면은 모든 페이지 헤더에 통합검색을 두고, 공공 메인은 첫 화면에 과업 진입을 두며 마케팅 템플릿 섹션을 쓰지 않는다
- R-41 `error` — 브레드크럼·사이드 메뉴는 본문 바로가기 목적지 밖, main 첫 제목은 h1, 3단계 이상 서브는 브레드크럼, 서브 첫 섹션은 비주얼 히어로가 아니다
- R-42 `error` — 메인 히어로는 하나·첫 섹션, utility 등급은 히어로를 쓰지 않고, 화면 높이·스크롤 유도 큐를 두지 않는다
- R-43 `error` — 카피 톤 — 번역투·2인칭 마케팅 문구 금지, 버튼은 '~하세요'가 아닌 동사형, 공공 화면 느낌표 금지
- R-44 warn — 근거 없는 최상급·공공 화면의 성과 홍보 어조와 해요체·경어 혼용을 경고한다
- R-45 `error` — 한국어 화면의 영문 전용 UI 레이블, lang 없는 언어 링크, 고르기만 해도 이동하는 select를 쓰지 않는다
- R-46 `error` — publicIdentity가 required로 확정되지 않으면 공식 배너·운영기관 식별자·정부 상징을 만들지 않는다
- R-47 `error` — 개인정보 수집 폼은 동의 옆에 목적·항목·보유 기간·거부권을 알리고, 동의를 미리 체크하지 않으며, 주민등록번호를 받지 않는다
- R-50 warn — placeholder에는 예시만 둔다 — '내용을 입력하세요' 같은 빈 안내와 레이블 반복은 경고

### 접근성 규칙
- R-11 `error` — 포커스 스타일 필수 — :focus { outline: none } 금지
- R-12 `error` — 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상
- R-13 `error` — 터치 영역 최소 44×44px — 터치 입력 기기 기준
- R-14 `error` — 건너뛰기 링크 필수 — .skip-to-content
- R-16 `error` — 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다
- R-21 `error` — html lang 속성 필수 — 문서 기본 언어 명시
- R-22 `warn` — 모션 최소화 선호 존중과 표현 등급별 모션 예산 — 로더 밖 무한 반복·기능형 화면의 스크롤 진입 모션 금지
- R-28 `error` — 확대 차단 금지 — viewport에 user-scalable=no·0 또는 maximum-scale 2 미만 금지
- R-33 `error` — 자동 전환·자동 재생에는 정지 버튼(첫 포커스)이 있어야 하고, 무한 롤링 마키는 쓰지 않는다
<!-- RULES_END -->

> 위 표는 `rules.json`에서 자동 생성된다. 규칙별 적용 대상과 검사기는 `rules.json`의 `lang`·`enforcement` 필드가 정한다(MCP `get_rules`).

---

## 작업 전 체크리스트

### CSS 파일 작성 시

1. ✅ 사이트 유형을 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약 중 하나로 판정
2. ✅ 공식 배너, 정부 상징, 운영기관 식별자는 적용 대상이 확인된 경우에만 생성
3. ✅ 사용할 토큰 확인: `tokens/foundation.json`(불변) + `tokens/brand.json`(프로젝트 교체)
4. ✅ 모든 색상 = `var(--color-*)` 시맨틱 토큰
5. ✅ 기본 폰트 = `var(--font-sans)` / 코드 폰트 = `var(--font-mono)`
6. ✅ 간격/크기/타이포 스케일은 CSS 직접값 또는 Tailwind rem 임의값(`p-[2.4rem]`, `text-[1.7rem]`) 사용 — 루트가 62.5%라 Tailwind 기본 스케일(`p-4`, `text-sm`)은 37.5% 작게 렌더된다(R-37)
7. ✅ 표준 CSS nesting과 Tailwind v4 `@apply`를 사용해 구조를 간결하게 유지
8. ✅ 새 컴포넌트는 `src/styles/6-components/{name}.css` 추가 + `6-components/index.css`에 `@import` 등록
9. ✅ 작성 후: `npm run lint:css` 통과 + `npm run check` 위반 0건

### 컴포넌트 마크업 작성 시

1. 사이트 유형을 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약 중 하나로 판정한다
2. 공식 배너, 정부 상징, 운영기관 식별자는 적용 대상이 확인된 경우에만 생성한다
3. 페이지 전체 골격은 기존 인포마인드 방식 유지: `header`, `main`, `footer`
4. 각 큰 영역 안에는 `.container`를 두고 폭과 정렬을 담당시킨다
5. `main` 내부는 `section > .container` 단위로 구성한다
6. 각 section은 heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름을 제공한다
7. HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부 section 단위로 분리한다
8. 스니펫 확인: `src/snippets/{component}.md` — 기존 패턴 우선 적용
9. BEM Block명은 `src/styles/6-components/{component}.css` 파일명과 일치
10. 인터랙티브 요소: `role`, `aria-*`, `tabindex` 확인
11. 폼 요소: `<label for>` + `id` 연결 필수
12. 모바일 터치 영역 ≥ 44×44px (R-13)
13. 이유 없는 wrapper 금지 — 자식 하나만 감싸는 `<div>`나 역할이 겹치는 연속 래핑을 두지 않는다. 대상 요소에 직접 클래스를 주거나 시맨틱 요소를 쓴다. `.container`·flex/grid 부모·스크롤 래퍼·`role` 그룹은 예외 (`references/html-semantics.md` § 6.6)

기본 골격:

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>

<header id="header" class="site-header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section section--content" aria-labelledby="section-title">
    <div class="container">
      <h1 id="section-title">공지사항</h1>
      ...
    </div>
  </section>
</main>

<footer id="footer" class="site-footer">
  <div class="container">
    <nav aria-label="약관 및 정책"><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></nav>
  </div>
</footer>
```

### 신규 컴포넌트 생성 시

MCP `get_workflow("create-component")` 절차를 따른다 — 아래 파일이 일괄 생성된다:

| 파일 | 위치 |
|------|------|
| CSS | `src/styles/6-components/{name}.css` |
| 스니펫 | `src/snippets/{name}.md` |
| 플레이그라운드 | `src/playground/{name}.html` |
| 문서 페이지 | `site/components/{name}.md` |

> 컴포넌트 카탈로그(`references/krds-components.md`)를 먼저 확인한다. 카탈로그 밖 패턴은 프로젝트 필요성과 재사용 가능성을 판단해 UX팀 결정으로 확장한다.

---

## 하네스 부재 시 자체 검증

개발팀 기존 프로젝트처럼 infoUX 전용 `npm run check`, `scripts/check-violations.js`, `scripts/check-html-structure.js`가 없더라도 검증을 생략하지 않는다.

1. 프로젝트의 `package.json`, CI 설정, README에서 사용 가능한 `lint`/`build`/`test`/`a11y` 명령을 먼저 찾아 실행한다.
2. infoUX 하네스가 없으면 변경 파일을 직접 스캔한다.
3. 최소 점검 항목: raw 색상, Tailwind raw 컬러, SCSS 문법, `!important`, 핵심 CSS `:has()`, focus outline 제거, BEM 위반, 비-BEM 상태 클래스, 시각적 modifier, `div/span` 클릭, 이유 없는 wrapper(단일 자식 div 래핑), `alt`/`label`/ARIA 누락, skip link/page shell, 모바일 360px 터치 영역과 overflow.
4. 최종 보고에는 “실행한 자동 검증”, “대체한 수동 검증”, “남은 수동 QA 항목”을 구분해서 적는다.

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Site Generator | Eleventy (11ty) | ^3.1.5 |
| CSS Framework | Tailwind v4 | ^4.0.0 |
| CSS 작성 | 표준 CSS nesting + Tailwind v4 `@apply` | SCSS 빌드 없이 중첩 구조와 유틸 조합 사용 |
| Tokens | INFOUX foundation + brand | `tokens/foundation.json`(불변) + `tokens/brand.json`(교체) |
| ITCSS Pattern | 5-layer (3-generic ~ 7-utilities) | — |
| BEM | Block__Element--Modifier | 5-objects · 6-components 한정 |
| Linting | Stylelint + check-violations.js | ^17.5.0 |
| A11y Testing | pa11y-ci + axe-core | latest |

---

## 디자인 토큰 위치

색상, 기본 폰트, 브레이크포인트는 CSS Custom Properties(`var(--*)`)와 Tailwind `@theme` 기준을 사용하라. 간격·크기·타이포 스케일은 프로젝트 맥락에 맞는 CSS 직접값 또는 Tailwind rem 임의값(`p-[2.4rem]`, `gap-[0.8rem]`, `text-[1.7rem] leading-[1.6]`)으로 작성한다(R-01). 루트 글자 크기가 62.5%(1rem = 10px)라서 Tailwind 기본 스케일(`p-4`, `gap-2`, `text-sm`, `leading-6`, `max-w-md`)은 37.5% 작게 렌더되므로 쓰지 않는다(R-37).

| 단계 | 파일 | 갱신 정책 |
|------|------|----------|
| 불변 계층 | `tokens/foundation.json` | gray·상태색·의미 토큰·브레이크포인트. 프로젝트에서 수정 금지 |
| 교체 계층 | `tokens/brand.json` | 브랜드 팔레트(primary/secondary/point) + `--font-sans`. 프로젝트가 고치는 유일한 토큰 파일 |
| 빌드 산출물 | `tokens/build/tokens.css` | `npm run build:tokens` 자동 생성 — 직접 수정 금지 |

빌드 흐름: `foundation.json` + `brand.json` → `build-tokens.js`(깊은 병합) → Tailwind v4 `@theme` 형태의 `tokens.css`.

브랜드를 바꾸면 `npm run check:contrast`가 WCAG 2.1 AA 위반을 잡는다. 기존 위반은 `tokens/contrast-baseline.json`에 기록돼 있고, **여기에 항목을 추가해 새 위반을 덮지 않는다.**

---

## CSS 구조 (ITCSS 5레이어)

```
src/styles/
  style.css                  # 메인 진입점 — Tailwind v4 + tokens.css + ITCSS 레이어 import
  docs.css                   # 문서 사이트 전용 진입점
  3-generic/                 # 리셋
  4-elements/                # HTML 태그 베이스
  5-objects/                 # 레이아웃 패턴 — BEM 적용
  6-components/              # KRDS 기반 UI 컴포넌트 (BEM)
  7-utilities/               # 유틸리티
```

> 1-settings(토큰)는 `tokens/`로 분리, 2-tools(SCSS 믹스인)는 Tailwind v4 utilities로 대체됐다. BEM은 **5-objects, 6-components 레이어에만** 적용한다.

---

## 반응형 가이드

모바일 퍼스트로 작성하고 Tailwind v4 variant `mobile:` / `tablet:` / `laptop:` / `pc:`만 사용한다. 단순 속성 변경은 CSS 파일 내부에서도 `@apply tablet:*`, `@apply laptop:*`, `@apply pc:*`를 우선한다.

```css
.block {
  @apply p-[1.6rem] tablet:p-[2.4rem] pc:p-[4rem];
}
```

복잡한 중첩 선택자나 여러 하위 요소를 동시에 제어해야 할 때만 `@media`를 사용한다. 이 경우에도 관련 선택자 내부에 중첩하고, 파일 하단에 브레이크포인트별 블록을 몰아두지 않는다.

```css
.block {
  @apply grid gap-[2.4rem];

  @media (min-width: 1280px) {
    @apply grid-cols-2;
  }
}
```

- 브레이크포인트 — 모바일 360 기준, 태블릿 768 이상, 노트북 1024 이상, PC 1280 이상 (KRDS 표준형 small·medium·large·xlarge)
- 글자 크기의 mobile→pc 전환은 768(`tablet:`), 메인 메뉴↔전체메뉴·서브 LNB 2단·레이아웃 간격 전환은 1024(`laptop:`)다
- `@media (min-width: var(--breakpoint-*))`는 표준으로 쓰지 않는다
- 표준 CSS nesting과 Tailwind v4 `@apply` 사용 가능

---

## 컴포넌트 카탈로그 (KRDS 기반)

| 그룹 | 컴포넌트 |
|------|---------|
| A — 폼/액션 | `btn` · `check-radio` · `file-upload` · `form` · `select` · `switch` |
| B — 컨테이너/레이아웃 | `accordion` · `card` · `disclosure` · `modal` · `side-panel` · `tab` |
| C — 내비게이션 | `breadcrumb` · `footer` · `header` · `main-menu` · `mobile-menu` · `pagination` |
| D — 피드백 | `alert` · `badge` · `notice-bar` · `progress` · `spinner` · `step-indicator` · `tag` · `toast` · `tooltip` |
| E — 콘텐츠/표현 | `calendar` · `carousel` · `error-page` · `list` · `table` |

각 컴포넌트는 다음 4종 자료가 동일한 BEM Block명으로 정렬되어 있다 — CSS(`src/styles/6-components/{name}.css`) · 스니펫(`src/snippets/{name}.md`) · 플레이그라운드(`src/playground/{name}.html`) · 문서(`site/components/{name}.md`).

> 상세 카탈로그(BEM·접근성·토큰 매핑) — `references/krds-components.md`

---

## LLM 컨텍스트 파일

`prompts/` 폴더에 작업 유형별 컨텍스트가 있다. 필요한 파일을 대화에 첨부하거나 읽어서 사용하라.

| 파일 | 용도 |
|------|------|
| `prompts/context.md` | 컴포넌트/CSS 작업 시 규칙 + 토큰 요약 |
| `prompts/tokens.md` | 전체 토큰 목록 |
| `prompts/components.md` | 컴포넌트 스니펫 마크업 |
| `prompts/design-rules.md` | 디자인 품질 규칙 |
| `prompts/publishing.md` | 퍼블리싱 체크리스트 |

`mcp/` — infoUX MCP 서버(`@infomind-ux/infoux-mcp`). 팀원 전달의 단일 경로다 — 등록 한 줄로 Claude Code·Codex·Cursor 어디서든 같은 기준이 간다. 도구 목록은 `mcp/README.md`를 참조한다. 데이터는 `npm run build:mcp`로 생성하며 직접 수정하지 않는다.

`references/` — 기준 본체. `CONTRACT.md`(작업 컨트랙트) + krds-tokens · krds-components · tailwind-mapping · accessibility · forbidden-patterns · html-semantics · project-profiles · korean-web-patterns(한국형 메인 레시피·서브·헤더·푸터) + `workflows/`(작업 절차 7종). 생성물은 `npm run build:references`, MCP 번들 반영은 `npm run build:mcp`.

---

## 절대 금지 (요약 — 상세는 `references/forbidden-patterns.md`)

- Raw hex/rgb/hsl 색상
- 간격/크기/타이포 스케일은 CSS 직접값 또는 Tailwind rem 임의값(`p-[2.4rem]`) 사용. 색상 raw 값은 금지
- Tailwind 기본 팔레트 raw 컬러 유틸
- Tailwind 기본 스케일(`text-sm`, `leading-6`, `p-4`, `gap-2`, `max-w-md` 등) — 62.5% 루트에서 37.5% 작게 렌더된다(R-37)
- 장식 효과 — 장식 그라데이션·그라데이션 글자·글래스(`backdrop-*`)·큰 블러·컬러 글로우 그림자(R-34). 사진 위 스크림과 KRDS 검정 알파 그림자만 쓴다
- 이모지를 아이콘·불릿·배지·제목 장식으로 쓰기(R-36) — 아이콘은 카탈로그에서
- 가짜·자리 콘텐츠(R-23) — 채움 문구, placeholder 핫링크, '자주 묻는 질문 1·2' 같은 연번 레이블, '페이지 제목' 같은 자리값 제목, 064-000-0000·○○ 같은 비실재 표기를 납품 페이지에 남기기
- 실제 목적지 없는 링크(`href="#"`·`javascript:`)(R-30) — 이동은 a, 동작은 button
- 1.3rem 미만 글자, body 1.6rem·설명 요소 1.5rem 미만(R-38), 루트 글자 크기 변경(R-31)
- 정지 버튼 없는 자동 전환·무한 롤링 마키(R-33), 1.2rem 넘는 반경·알약 버튼(R-35), 화면 높이 히어로·스크롤 유도 화살표·중간 히어로(R-42)
- 확정되지 않은 공식 배너·정부 상징(R-46), 고지 없는 개인정보 동의·미리 체크·주민등록번호(R-47), 모바일 360px 넘는 고정 폭(R-48)
- 영문 전용 UI 레이블(VIEW MORE)·lang 없는 언어 링크·선택만으로 이동하는 select(R-45), 근거 없는 최상급·공공 화면 해요체(R-44 경고), 과한 섹션 여백(R-49 경고)
- 번역투·2인칭 마케팅 카피('당신', '~을 경험하세요', '지금 바로'), '~하세요'로 끝나는 버튼, 공공 화면의 느낌표(R-43) — 합쇼체 사실 서술, 버튼은 KRDS 동사형('신청하기')
- 옛 버튼 variant (`btn--ghost`, `btn--outline`, `btn--link`, `btn--sm`, `btn--lg`)
- `!important` (사유 주석 없을 시)
- 인라인 `style="..."` (CSS 변수 주입 외)
- 카탈로그 밖 컴포넌트는 UX팀 판단 후 프로젝트 패턴 또는 공통 컴포넌트로 확장
- BEM element 2단계 중첩 (`.card__body__title`)
- `:focus { outline: none }`
- `div/span 클릭 핸들러 패턴`
- 이미지 `alt` 누락, 폼 `<label>` 누락
- 모바일 터치 영역 44px 미만

---

## 명령어

```bash
# 검사
npm run check           # 위반 패턴 전체 스캔 (훅에서도 자동 실행)
npm run lint:css        # Stylelint (src/styles/**/*.css)
npm run lint:css:fix    # Stylelint 자동 수정

# 빌드
npm run build:tokens    # foundation.json + brand.json → tokens/build/tokens.css
npm run check:contrast  # 대비 검사 (WCAG 2.1 AA)
npm run build:css       # Tailwind v4 → dist/css/style.css
npm run build:docs-css  # 문서 사이트 CSS → dist/css/docs.css
npm run build:rules     # rules.json → site/conventions/ + CLAUDE.md 자동 주입
npm run build:prompts   # prompts/*.md 재생성
npm run build:references # references/ 생성물 빌드
npm run build:mcp       # mcp/data 번들 (MCP 서버가 읽는 문서)
npm run build           # 위 전부 + Eleventy 사이트 빌드

# 발행
npm run sync:starter    # iux-pub/starter 저장소로 동기화

# 개발 / 검증
npm run serve           # Tailwind 워치 + 11ty 서브 (concurrently)
npm run test:a11y       # pa11y-ci 접근성 검증
npm test                # 전체 CI (check → tokens → lint → build → a11y)
```

---

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 세미콜론: CSS 사용, JS/HTML 미사용
- 주석 언어: 한국어
