---
title: CSS 규칙
order: 2
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

CSS 파일 작성 시 적용되는 값·문법 규칙이다. Tailwind v4 + INFOUX 토큰 기반.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-01 | 색은 어디에 쓰든 var(--color-*)만 — 선언 값·Tailwind 팔레트·흑백·임의값·style 속성 안까지. 간격·크기는 rem 임의값(R-37) | error | check-violations.js |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | check-violations.js |
| R-03 | SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용 | error | check-violations.js |
| R-19 | 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지 | error | check-violations.js |
| R-20 | 호환성 위험 CSS 선택자 금지 — 핵심 CSS에서 :has() 사용 금지 | error | check-violations.js |
| R-24 | 한글 조판 하한 — keep-all 존재 필수·leading-none 금지·line-height 1.5 미만 경고 | error | check-violations.js |
| R-26 | 폰트 스택 한글 fallback 필수 — --font-sans·--font-heading에 한글 가용 폰트 포함 | error | build-tokens.js |
| R-31 | 루트 글자 크기는 62.5%로 고정한다 — 다른 값·vw 금지(경고) | warn | check-violations.js |
| R-34 | 장식 효과 금지 — 장식 그라데이션·그라데이션 글자·글래스(backdrop)·큰 블러·컬러 글로우 그림자 | error | check-violations.js |
| R-35 | 반경은 KRDS 상한 1.2rem, 완전 원형은 지정 블록·정사각 원형만, 그림자 blur는 2.4rem 이하 | error | check-violations.js |
| R-37 | Tailwind 기본 타입·행간·간격·컨테이너 스케일 금지 — 62.5% 루트에서 37.5% 작아진다, rem 임의값을 쓴다 | error | check-violations.js |
| R-38 | KRDS 최소 글자 — 1.3rem 미만 금지, body 1.6rem·본문 성격 요소 1.5rem 이상, 단계 밖 크기 경고 | error | check-violations.js |
| R-48 | 모바일 우선 — 360px 넘는 모바일 고정 폭 금지, 모바일 기본 열 없는 3열 이상 그리드 경고 | error | check-violations.js |

---

## R-01 — 색은 어디에 쓰든 var(--color-*)만 — 선언 값·Tailwind 팔레트·흑백·임의값·style 속성 안까지. 간격·크기는 rem 임의값(R-37)

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 색상은 브랜드·상태·접근성·테마(고대비) 변경의 영향이 크므로 반드시 토큰으로 관리한다. 검사는 줄이 아니라 선언 단위로 본다 — border·box-shadow·그라데이션 안의 raw 색, var(--x, #폴백), Tailwind 임의값(bg-[#f5f2ee], text-[white]), 팔레트·흑백 유틸(bg-gray-50, text-white, from-violet-600 — 이 프로젝트는 @theme 팔레트를 비워 CSS가 생성되지 않거나 KRDS 단계와 명도가 다르다), --커스텀 속성이 함께 있는 style 속성까지 잡는다. 색 속성에 쓴 CSS 이름 색(white 등)도 raw다(transparent·currentColor·시스템 색 제외). 그림자의 KRDS 검정 알파 3값(#0000000d·#00000014·#0000001f)은 알파 토큰이 생길 때까지 한시 허용한다. 색을 정의하는 곳은 tokens/와 문서 코드 테마(src/styles/1-settings/docs-code-theme.css의 --color-code-*)뿐이다. 간격·크기·타이포 스케일은 KRDS 값을 참고해 rem 임의값으로 쓴다(Tailwind 기본 스케일은 R-37).

**금지 예시**

```css
.card { border: 1px solid #ddd; box-shadow: 0 20px 50px rgba(124, 58, 237, .5); }   // 선언 값 안의 raw 색
<section class="section bg-[#f5f2ee] text-white">   // 임의값 raw 색, 흑백 유틸(CSS가 생성되지 않는다)
<div style="--x: 1; background: #7c3aed">   // 커스텀 속성이 있어도 나머지 선언의 raw 색은 잡힌다
.btn:focus-visible { outline: 2px solid white; }   // 색 속성의 CSS 이름 색
color: var(--color-primary, #7c3aed);   // var 폴백의 raw 색
```

**올바른 형식**

```css
color: var(--color-primary);   // 토큰
<a class="btn btn--primary bg-[var(--color-primary)] text-[var(--color-text-inverse)]">   // 임의값 안에서도 토큰
@apply shadow-[0_0_0.2rem_0_#00000014,_0_0.8rem_1.6rem_0_#0000001f];   // KRDS 검정 알파 그림자(한시 허용)
background: color-mix(in srgb, var(--color-primary) 10%, transparent);   // 토큰만 섞은 color-mix
gap: 1.6rem;   // 간격은 rem 값
```

**참고:** tokens/foundation.json, tokens/brand.json, tokens/build/tokens.css, scripts/lib/visual-signature.js

---

## R-02 — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수

**심각도:** `warning` &nbsp; **검증:** check-violations.js

> 캐스케이드 우선순위를 강제 무력화하여 이후 오버라이드를 불가능하게 만든다. 외부 라이브러리 인라인 스타일을 덮어야 하는 등 불가피한 경우에만 허용하며 반드시 사유를 주석으로 명시한다.

**금지 예시**

```css
.element { color: var(--color-primary) !important; }   // 사유 없는 !important
```

**올바른 형식**

```css
.pagefind-ui__input { font-size: 1.7rem !important; /* pagefind 인라인 스타일 오버라이드 */ }   // 사유 주석 명시
```

---

## R-03 — SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 프로젝트는 SCSS 빌드 파이프라인을 사용하지 않는다. .scss 확장자, @use/@forward, SCSS 변수($var), SCSS 전용 함수/믹스인 사용을 금지한다. 단, 표준 CSS nesting과 Tailwind v4의 @theme/@apply/@utility 등 CSS 기반 문법은 허용한다.

**금지 예시**

```css
/* style.scss */   // .scss 확장자 — 빌드 파이프라인 없음
@use '../1-settings' as settings;   // Dart Sass @use
@forward 'btn';   // Dart Sass @forward
$primary: #256ef4;   // SCSS 변수
```

**올바른 형식**

```css
/* style.css */   // .css 확장자만
.tab__item { &[aria-selected="true"] { color: var(--color-primary); } }   // 표준 CSS nesting — 속성·의사 클래스를 잇는다(&__·&--로 이름을 잇지는 못한다, R-05)
.btn { @apply inline-flex items-center; }   // Tailwind @apply
@import "tailwindcss";   // Tailwind v4 import
```

**참고:** src/styles/style.css, tokens/build/tokens.css

---

## R-19 — 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 반복되는 레이아웃, 정렬, 표시 상태, 커서, overflow 같은 유틸리티 성격의 선언은 Tailwind v4 @apply로 작성해 CSS 구조를 간결하게 유지한다. 색상, 간격, 크기, radius, shadow, typography처럼 KRDS/INFOMIND 토큰 의미가 중요한 값은 Tailwind 기본 유틸로 억지 변환하지 않고 var(--token)을 유지한다.

**금지 예시**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}   // @apply로 표현 가능한 raw utility 선언
```

**올바른 형식**

```css
.btn {
  @apply inline-flex items-center justify-center;
  color: var(--color-text);
}   // 유틸은 @apply, 토큰 값은 var() 유지
.card {
  @apply relative overflow-hidden;
  border-radius: 0.6rem;
}   // 구조 유틸과 INFOUX 토큰 병행
```

**참고:** src/styles/**/*.css, starter/src/styles/**/*.css

---

## R-20 — 호환성 위험 CSS 선택자 금지 — 핵심 CSS에서 :has() 사용 금지

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 공공서비스·공공기관·일반 납품물은 최신 브라우저 기준을 따르더라도 사용자의 실제 업데이트 상태와 임베디드/모바일 브라우저 차이를 고려해야 한다. `:has()`는 강력하지만 지원되지 않는 환경에서는 선택자 블록 전체가 무시된다. 핵심 상태 표현은 ARIA 속성 selector와 sibling selector로 구현한다(R-17 — 상태는 ARIA·hidden 속성이 먼저).

**금지 예시**

```css
.field:has(input:disabled) { opacity: .5; }   // 부모 상태를 :has()에 의존
.check:hover:not(:has(input:disabled)) .check__box { border-color: var(--color-border-dark); }   // 비활성 상태 처리에 :has() 의존
```

**올바른 형식**

```css
.field input:disabled ~ .field__label { color: var(--color-text-disabled); }   // 기존 DOM 구조에서 sibling selector 사용
.disclosure[aria-expanded="true"] + .disclosure__panel { display: block; }   // ARIA 상태 속성으로 관계 표현
.tab__item[aria-selected="true"] { color: var(--color-primary); }   // ARIA 상태 속성 선택자로 시각 상태 표현(R-17)
```

**참고:** site/testing/browser-testing.md, package.json#browserslist

---

## R-24 — 한글 조판 하한 — keep-all 존재 필수·leading-none 금지·line-height 1.5 미만 경고

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 한글은 단어 중간 줄바꿈(keep-all 부재)과 좁은 행간에서 가독성이 급락한다. reset 계층(3-generic/reset.css)의 word-break: keep-all 부재와 HTML의 leading-none 클래스는 error, CSS line-height 1.5 미만은 warn으로 검출한다. 임계값 1.5의 정본은 contracts/art-direction.json hangul.bodyLineHeight.lintFloor이며 단위 테스트가 동일성을 강제한다. badge·tag·btn처럼 한 줄로 고정되는 단행 컴포넌트 CSS 파일은 예외다.

**금지 예시**

```css
p { line-height: 1.3; }   // 본문 하한(1.5) 미만 — warn
/* 3-generic/reset.css에 word-break: keep-all 부재 */   // 한글 조판 기본값 누락 — error
```

**올바른 형식**

```css
body {
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.7;
}   // 한글 조판 기본값 (3-generic/reset.css 소유)
.badge { line-height: 1; }   // 단행 컴포넌트 예외 — badge·tag·btn
```

**참고:** contracts/art-direction.json, references/art-direction.md, src/styles/3-generic/reset.css

---

## R-26 — 폰트 스택 한글 fallback 필수 — --font-sans·--font-heading에 한글 가용 폰트 포함

**심각도:** `error` &nbsp; **검증:** build-tokens.js

> 영문 전용 폰트 스택은 한글이 시스템 기본 폰트로 떨어져 fallback 미설계 조판이 된다. scripts/lib/token-source.js가 build:tokens·check:presets 경로에서 --font-sans·--font-heading 값에 한글 가용 폰트(Pretendard·Noto Sans/Serif KR·Wanted Sans 등) 포함을 강제하며, 미포함이면 빌드가 실패한다. 미정의 슬롯은 하위호환으로 통과한다.

**금지 예시**

```css
--font-sans: 'Inter', sans-serif;   // 한글 가용 폰트 없음 — build:tokens 실패
```

**올바른 형식**

```css
--font-sans: 'Pretendard GOV', Pretendard, 'Apple SD Gothic Neo', sans-serif;   // 한글 가용 폰트 + 시스템 폴백
```

**참고:** scripts/lib/token-source.js, tokens/brand.json, contracts/art-direction.json

---

## R-31 — 루트 글자 크기는 62.5%로 고정한다 — 다른 값·vw 금지(경고)

**심각도:** warn &nbsp; **검증:** check-violations.js

> infoUX의 rem 단계(1rem = 10px)는 KRDS 방식의 62.5% 루트를 전제한다. html·:root의 font-size를 다른 값으로 줄이거나 vw로 두면 사용자의 브라우저 글자 크기 설정(WCAG 1.4.4)과 rem 단계가 함께 무너진다(국내 13곳 관찰). html·:root의 font-size가 62.5%가 아니면 경고다. 글자 크기 조절 기능은 html[data-font-scale]로 두며 예외다(scripts/lib/type-floor.js).

**금지 예시**

```css
html { font-size: 56.25%; }   // 루트 축소
:root { font-size: calc(0.5rem + 0.5vw); }   // vw 스케일
```

**올바른 형식**

```css
html { font-size: 62.5%; }   // 고정
html[data-font-scale="large"] { font-size: 75%; }   // 글자 크기 조절
```

**참고:** references/krds-tokens.md, scripts/lib/type-floor.js

---

## R-34 — 장식 효과 금지 — 장식 그라데이션·그라데이션 글자·글래스(backdrop)·큰 블러·컬러 글로우 그림자

**심각도:** `error` &nbsp; **검증:** check-violations.js

> AI가 만든 화면을 알아보게 하는 첫 서명이 보라→파랑 그라데이션, 글래스 카드, 흐린 블롭, 색 번진 그림자다(AP-3·AP-4). KRDS에는 글래스·글로우가 없고, 공공·기관 화면의 신뢰 톤과 고대비 모드를 깨뜨린다. 그라데이션은 표현 등급(infoux.json profile → contracts/profiles.json expression, 없으면 restrained)으로 판정한다 — utility·restrained는 error, expressive는 warn. 보라·남색 계열(hue 225~300°, 채도 0.25 이상, 토큰은 실제 색으로 풀어 본다)은 등급과 상관없이 error다. 사진 위 글자 대비 스크림(투명 → 검정 알파·바탕 한 색의 선형 페이드)과 가로 스크롤 힌트는 허용하고, 무채색 그라데이션(스켈레톤 반짝임)은 warn이다. background-clip:text, backdrop-filter·backdrop-*, 4px(0.4rem) 이상 블러, blur가 있는데 색이 검정 계열이 아닌 그림자(box-shadow·text-shadow·drop-shadow·shadow-[…]·그림자 모양 커스텀 속성)는 error다. spread만 있는 포커스 링(0 0 0 0.4rem var(--color-border-primary))은 그림자가 아니라 통과한다. 문서 사이트 크롬(src/styles/docs.css)은 제외한다.

**금지 예시**

```css
.cta { background: linear-gradient(90deg, var(--color-primary-50), var(--color-secondary-60)); }   // 장식 그라데이션(restrained 이하 error)
<h1 class="bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-blue-600">   // 그라데이션 글자 + 보라 계열
<article class="card backdrop-blur-xl">   // 글래스
.card:hover { box-shadow: 0 0 4rem var(--color-primary-40); }   // 컬러 글로우
.blob { filter: blur(4rem); }   // 흐린 장식 블롭
```

**올바른 형식**

```css
.hero-bleed__media::after { background: linear-gradient(to bottom, transparent, var(--color-alpha-black-50)); }   // 사진 위 글자 대비 스크림
@apply shadow-[0_0_0.2rem_0_#00000014,_0_0.8rem_1.6rem_0_#0000001f];   // KRDS 검정 알파 그림자
focus-visible:shadow-[0_0_0_0.4rem_var(--color-border-primary)]   // spread만 있는 포커스 링
.section--intro { background: var(--color-surface-primary-subtler); }   // 단색 토큰 면
```

**참고:** contracts/profiles.json, references/art-direction.md, scripts/lib/visual-signature.js

---

## R-35 — 반경은 KRDS 상한 1.2rem, 완전 원형은 지정 블록·정사각 원형만, 그림자 blur는 2.4rem 이하

**심각도:** `error` &nbsp; **검증:** check-violations.js

> KRDS Shape는 반경 2~12px(Xlarge 12px)이고 Elevation은 검정 알파 3단계(Level-3 blur 24px)다. 22~24px 둥근 카드와 알약 버튼은 AI 슬롭 서명이다. CSS 선언(border-radius·border-*-radius), @apply·class의 rounded-[N]·rounded(-방향)-full·[border-radius:N]을 본다(scripts/lib/shape-motion.js). 1.2rem 넘는 반경은 오류. 완전 원형(rounded-full·50% 이상·100rem 이상)은 contracts/art-direction.json shape.pillBlocks(switch·avatar) 블록과 정사각 원형(같은 블록·class에 w-[x]=h-[x]·size-[x]·aspect-square·aspect-ratio:1)만 통과하고 그 밖은 오류다 — 배지 점(badge--dot)·아이콘 원은 정사각이라 통과, tag·chip·pagination·progress·버튼은 KRDS가 비원형 반경을 정해 오류다. 허용 블록 안의 2rem 이상(switch 100px)은 원형 의도로 본다. box-shadow·shadow-[…]의 blur가 2.4rem을 넘으면 경고다. 이름 스케일(rounded-lg 등)은 R-01 경고가 본다.

**금지 예시**

```css
.feature { @apply rounded-[2.4rem]; }   // 24px 카드
<a class="btn btn--primary rounded-full" href="/apply">신청하기</a>   // 알약 버튼
```

**올바른 형식**

```css
.card { @apply rounded-[1rem]; }   // KRDS 반경
.badge--dot { @apply w-[0.8rem] h-[0.8rem] rounded-full; }   // 정사각 원형
```

**참고:** contracts/art-direction.json, references/krds-source.md, scripts/lib/shape-motion.js

---

## R-37 — Tailwind 기본 타입·행간·간격·컨테이너 스케일 금지 — 62.5% 루트에서 37.5% 작아진다, rem 임의값을 쓴다

**심각도:** `error` &nbsp; **검증:** check-violations.js

> KRDS 방식대로 루트 글자 크기가 62.5%(1rem = 10px)라, rem으로 정의된 Tailwind 기본 스케일은 의도보다 37.5% 작게 렌더된다 — text-base = 10px, p-4 = 10px, max-w-md = 280px. AI는 Tailwind 기본값을 습관처럼 쓰므로 화면 전체가 소리 없이 작아진다. 금지: text-xs~9xl(text-sm/6 단축형 포함), 숫자 행간(leading-6), 숫자 간격·크기(p·m·gap·space·w·h·min/max·size·inset·top… ·translate·scroll-m/p·indent·basis), 컨테이너 폭(w/max-w/basis/columns-md 등). rem 임의값(text-[1.7rem], p-[1.6rem], gap-[0.8rem], max-w-[56rem])을 쓴다. 0·px·full·auto·분수, 이름 행간(leading-relaxed — 단위 없는 비율), max-w-prose(ch 단위)는 통과한다. KRDS 문서의 gap-3(8px)은 여기서 gap-[0.8rem]이다. 행간 하한은 R-24가 본다. 반경(rounded-lg = 5px)도 같은 원인이지만 지금은 경고(R-01)로 둔다.

**금지 예시**

```css
<p class="text-base leading-6">   // 10px 글자, 15px 고정 행간
.page-title { @apply text-3xl; }   // 18.75px
.btn { @apply min-h-12 gap-2; }   // 30px·5px
<div class="max-w-md mt-10">   // 280px·25px
```

**올바른 형식**

```css
<p class="text-[1.7rem] leading-[1.7]">   // rem 임의값 + 비율 행간
.btn { @apply min-h-[4.8rem] gap-[0.4rem] px-[1.6rem]; }   // rem 임의값
<div class="w-full h-auto mx-auto p-0 max-w-prose">   // 스케일과 무관한 유틸
```

**참고:** references/tailwind-mapping.md, references/krds-source.md, scripts/lib/visual-signature.js

---

## R-38 — KRDS 최소 글자 — 1.3rem 미만 금지, body 1.6rem·본문 성격 요소 1.5rem 이상, 단계 밖 크기 경고

**심각도:** `error` &nbsp; **검증:** check-violations.js

> KRDS 타이포 최소 단계는 13px, 본문은 16px이다. 62.5% 루트에서 1rem = 10px이므로 1.3rem 미만은 오류, body는 1.6rem 미만이면 오류, 설명·본문 성격 element(__desc·__description·__body·__lead·__excerpt·__content)는 1.5rem 미만이면 오류다. 1.3~1.5rem 사이(1.4rem 등)는 KRDS 단계 밖이라 경고, p·li·td·dd·blockquote의 1.3rem은 주석·각주 허용이라 경고다. CSS 선언(font-size·font 단축), @apply의 text-[N]·[font-size:N], HTML <style>·class의 text-[N]·style 속성을 본다(scripts/lib/type-floor.js). 아이콘 글리프(__icon·__close·__remove·__arrow·__mark·__dot, .icon, icon-font), 기호만 그리는 ::before·::after, 코드(pre·code·kbd·samp·monospace), em·%처럼 rem으로 바꿀 수 없는 값은 보지 않는다(clamp는 최솟값). Tailwind 기본 text-xs~xl은 R-37이 본다.

**금지 예시**

```css
.board__count { @apply text-[1.2rem]; }   // 12px
body { @apply text-[1.5rem]; }   // body 15px
.card__desc { font-size: 1.4rem; }   // 설명 14px
```

**올바른 형식**

```css
.badge__text { @apply text-[1.3rem]; }   // 배지 최소 단계
.card__desc { @apply text-[1.5rem]; }   // 설명 15px
```

**참고:** references/krds-tokens.md, scripts/lib/type-floor.js

---

## R-48 — 모바일 우선 — 360px 넘는 모바일 고정 폭 금지, 모바일 기본 열 없는 3열 이상 그리드 경고

**심각도:** `error` &nbsp; **검증:** check-violations.js

> KRDS 반응형은 모바일(360px) 기준에서 시작한다. AI는 데스크톱 폭을 그대로 고정해 모바일에서 가로 스크롤을 만든다. 접두 없는(모바일 기본) w-[N]·min-w-[N]·[width:N]·[min-width:N], CSS width·min-width(min-width 768px 이상 @media 밖)가 36rem(360px)을 넘으면 오류다(scripts/lib/layout-rules.js). tablet:·laptop:·pc:·print: 접두는 넓은 화면 값이라 빼고 mobile:·max-*·상태 접두는 본다. 같은 요소의 max-w-full·max-w-[≤100%], 모바일에서 숨긴 요소(hidden + tablet:block 등), 가로 스크롤 래퍼(.table-wrap·overflow-x-auto·overflow-auto) 안, 데스크톱 전용 메뉴(.site-header__nav·.main-menu)는 뺀다. 접두 없는 grid-cols-3 이상(같은 요소에 tablet:·laptop:·pc: grid-cols가 없을 때)과 @media 밖 grid-template-columns: repeat(3 이상)은 경고다.

**금지 예시**

```css
<div class="w-[120rem]">…</div>   // 모바일 1200px 고정
<ul class="grid grid-cols-4">   // 모바일 4열(경고)
```

**올바른 형식**

```css
<div class="w-full max-w-[120rem]">…</div>   // 유연한 폭
<ul class="grid grid-cols-1 tablet:grid-cols-2 pc:grid-cols-4">   // 모바일 1열부터
```

**참고:** references/tailwind-mapping.md, scripts/lib/layout-rules.js

---
