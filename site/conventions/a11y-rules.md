---
title: 접근성 규칙
order: 5
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

KWCAG/WCAG 2.1 AA 기반 접근성 필수 규칙이다.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-11 | 포커스 스타일 필수 — :focus { outline: none } 금지 | error | check-violations.js |
| R-12 | 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상 | error | pa11y-ci |
| R-13 | 터치 영역 최소 44×44px — 터치 입력 기기 기준 | error | manual |
| R-14 | 건너뛰기 링크 필수 — .skip-to-content | error | check-violations.js |
| R-16 | 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다 | error | check-html-structure.js |
| R-21 | html lang 속성 필수 — 문서 기본 언어 명시 | error | check-html-structure.js |
| R-22 | 모션 최소화 선호 존중 — prefers-reduced-motion 가드 | warning | check-violations.js, manual |
| R-28 | 확대 차단 금지 — viewport에 user-scalable=no·0 또는 maximum-scale 2 미만 금지 | error | check-html-structure.js |
| R-33 | 자동 전환·자동 재생에는 정지 버튼(첫 포커스)이 있어야 하고, 무한 롤링 마키는 쓰지 않는다 | error | check-html-structure.js, check-violations.js |

---

## R-11 — 포커스 스타일 필수 — :focus { outline: none } 금지

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 키보드만 사용하는 사용자가 현재 포커스 위치를 파악할 수 없다. WCAG 2.4.7 Focus Visible (AA). KRDS는 4px 외곽선 + offset을 reset.css에서 전역 관리하므로 컴포넌트에서 제거 금지.

**금지 예시**

```css
:focus { outline: none; }   // 포커스 제거 — 절대 금지
*:focus { outline: 0; }   // 전역 포커스 제거 — 절대 금지
```

**올바른 형식**

```css
:focus-visible {
  outline: 4px solid var(--color-primary);
  outline-offset: 2px;
}   // 마우스 클릭은 포커스 표시 안 함, 키보드는 표시
```

---

## R-12 — 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상

**심각도:** `error` &nbsp; **검증:** pa11y-ci

> 시력이 약한 사용자와 밝은 환경에서도 콘텐츠를 인식할 수 있어야 한다. WCAG 1.4.3 Contrast Minimum (AA). 큰 텍스트 기준: 24px 이상 또는 18.67px bold 이상. INFOUX 토큰은 AA 통과 조합으로 설계되어 있으므로 임의 색상 대신 시맨틱 토큰을 사용한다.

**금지 예시**

```css
color: #b1b8be; /* 흰 배경 대비 2.7:1 */   // 하드코딩 + 대비 부족
```

**올바른 형식**

```css
color: var(--color-text-secondary); /* KRDS gray-700 — 흰 배경 대비 5.7:1 */   // AA 기준 통과
```

---

## R-13 — 터치 영역 최소 44×44px — 터치 입력 기기 기준

**심각도:** `error` &nbsp; **검증:** manual

> 손가락으로 정확히 터치하기 어려운 작은 버튼은 오작동을 유발한다. 시각적 크기는 작더라도 padding으로 터치 영역을 확보한다. 적용 범위는 터치 입력(모바일·태블릿)이며, 마우스처럼 정밀한 포인터를 쓰는 데스크탑 dense UI에는 강제하지 않는다 — btn xsmall(32px)·small(40px)이 데스크탑에서 허용되는 근거다. 근거: Apple HIG 44pt / Android 48dp, WCAG 2.5.5 Target Size (AAA). AA 의무선은 WCAG 2.2의 2.5.8 Target Size (Minimum) 24×24이고 간격 대체가 허용되므로, 44px은 팀이 터치 환경에 한정해 상향한 기준이다. KRDS 모바일 권장 사이즈는 medium(48px) 이상이다.

**금지 예시**

```css
.icon-btn {
  width: 24px;
  height: 24px;
}   // 터치 영역 너무 작음
```

**올바른 형식**

```css
.icon-btn {
  width: 24px;
  height: 24px;
  padding: 1.6rem; /* 터치 영역 ≥ 44px */
}   // padding으로 터치 영역 확보
```

---

## R-14 — 건너뛰기 링크 필수 — .skip-to-content

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 키보드 사용자가 반복 네비게이션을 건너뛰고 본문으로 바로 이동할 수 있어야 한다. WCAG 2.4.1 Bypass Blocks (A).

**금지 예시**

```html
<!-- 건너뛰기 링크 없음 -->   // 키보드 사용자는 nav를 전부 탭해야 함
```

**올바른 형식**

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>   // body 최상단에 배치
```

---

## R-16 — 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> modal/tab/accordion/tooltip/disclosure/carousel/calendar 등 위젯 컴포넌트는 스크린리더가 의미를 파악할 수 있도록 ARIA로 상태·관계·역할을 명시해야 한다. 네이티브 시맨틱만으로 부족한 영역이며, KRDS와 WAI-ARIA 1.2 APG가 정의한 패턴을 따른다. WCAG 1.3.1 Info and Relationships (A) / 4.1.2 Name, Role, Value (A) — KWCAG 대응 항목은 5.3.2 콘텐츠의 선형구조 / 8.2.1 웹 애플리케이션 접근성 준수다.

**금지 예시**

```html
<button class="disclosure">자세히</button>
<div class="disclosure__panel">...</div>   // aria-expanded, aria-controls 누락
<div role="dialog" class="modal">...</div>   // aria-modal과 aria-labelledby 누락
<button class="tab__item">탭1</button>   // role="tab", aria-selected, aria-controls 누락
```

**올바른 형식**

```html
<button class="disclosure" aria-expanded="false" aria-controls="more">자세히</button>
<div id="more" class="disclosure__panel" hidden>...</div>   // 트리거-패널 ARIA 연결
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">...</div>   // 다이얼로그 3종 세트
<button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">탭1</button>   // 탭 ARIA 4종 세트
```

**참고:** references/html-semantics.md, references/accessibility.md

---

## R-21 — html lang 속성 필수 — 문서 기본 언어 명시

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 스크린리더가 올바른 발음·언어 엔진을 선택하려면 <html>에 문서 기본 언어가 명시되어야 한다. WCAG 3.1.1 Language of Page (A) / KWCAG. 한국어 페이지는 lang="ko"를 사용한다.

**금지 예시**

```html
<html>   // lang 속성 없음 — 문서 언어 미정
<html class="no-js">   // lang 누락
```

**올바른 형식**

```html
<html lang="ko">   // 한국어 문서 언어 명시
```

**참고:** references/accessibility.md

---

## R-22 — 모션 최소화 선호 존중 — prefers-reduced-motion 가드

**심각도:** `warning` &nbsp; **검증:** check-violations.js · manual

> 전정기관 장애·멀미 민감 사용자를 위해 큰 이동·확대·회전·자동재생 애니메이션은 @media (prefers-reduced-motion: reduce)에서 축소·정지해야 한다. WCAG 2.3.3 Animation from Interactions (AAA) / 2.2.2 Pause, Stop, Hide (A). check-violations.js가 animation·@keyframes 사용 파일의 가드 누락을 경고로 자동 검출하며, 실제 모션 강도의 적절성은 수동 QA로 확인한다.

**금지 예시**

```css
.carousel__track { animation: slide 5s infinite; }   // reduced-motion 가드 없는 자동 애니메이션
```

**올바른 형식**

```css
@media (prefers-reduced-motion: reduce) {
  .carousel__track { animation: none; }
}   // 모션 최소화 선호 시 정지
```

**참고:** site/guides/css-animation.md, references/accessibility.md

---

## R-28 — 확대 차단 금지 — viewport에 user-scalable=no·0 또는 maximum-scale 2 미만 금지

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 저시력 사용자는 손가락 확대로 글자를 읽는다. viewport meta로 확대를 막으면 모바일에서 200% 확대가 불가능해 WCAG 1.4.4 텍스트 크기 조정(AA)을 어긴다. 국내 웹사이트 97곳 중 51곳이 확대를 막고 있어 관행으로 흘러들기 쉽다. maximum-scale이 2 이상 5 미만이면 경고한다 — 지정하지 않는 것이 가장 낫다. body touch-action 같은 CSS 제스처 차단은 이 규칙 범위 밖이며 리뷰에서 본다.

**금지 예시**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">   // 확대를 완전히 막는다
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">   // user-scalable=0도 같은 차단이다
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.5">   // 200% 확대에 못 미친다
```

**올바른 형식**

```html
<meta name="viewport" content="width=device-width, initial-scale=1">   // 확대 제한을 두지 않는다
```

**참고:** references/accessibility.md

---

## R-33 — 자동 전환·자동 재생에는 정지 버튼(첫 포커스)이 있어야 하고, 무한 롤링 마키는 쓰지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js · check-violations.js

> KRDS 캐러셀(component_04_09)은 자동 전환에 정지 버튼을 요구하고 WCAG 2.2.2는 5초 넘게 움직이는 콘텐츠를 멈출 수 있어야 한다고 정한다. 마크업(scripts/lib/page-rules.js): data-carousel-autoplay가 0보다 크거나 data-autoplay가 false·0·off·no가 아닌 루트, Swiper·Splide·slick 인라인 autoplay 옵션에 정지 버튼([data-carousel-toggle]·[data-media-toggle] 또는 이름에 정지·일시정지·멈춤·pause·stop이 든 button)이 없으면 오류, 있어도 루트 안 첫 포커스 요소가 아니면 오류다. 간격 5000ms 미만은 경고(팀 기준 — KRDS는 '적절한 간격'만 정한다). video[autoplay]는 muted가 없으면 오류, controls도 정지 버튼도 없으면 오류다. <marquee>는 오류. CSS(scripts/lib/shape-motion.js): 선택자에 logo·partner·marquee·ticker·rolling·banner-zone·carousel·slider·swiper·slide가 든 규칙의 무한 애니메이션(animation·[animation:…infinite]·animate-[…])은 오류다. 스피너·스켈레톤·로딩 표시는 R-22 소관이라 뺀다. 초점·호버 진입 시 정지는 src/js/carousel.js 동작과 수동 QA로 본다.

**금지 예시**

```html
<div class="carousel" data-autoplay="true"><ul class="carousel__list">…</ul></div>   // 정지 버튼 없음
.partner-logos__track { animation: marquee 20s linear infinite; }   // 무한 롤링 마키
```

**올바른 형식**

```html
<div class="carousel" data-carousel-autoplay="6000"><button type="button" data-carousel-toggle aria-label="자동 재생 정지"></button>…</div>   // 정지 버튼이 첫 포커스
```

**참고:** src/snippets/carousel.md, scripts/lib/page-rules.js, scripts/lib/shape-motion.js

---
