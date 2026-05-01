# 금지 패턴 — info-design 컨트랙트

이 문서의 패턴이 코드에서 발견되면 **즉시 작업 중단**하고 사용자에게 보고한다.

---

## 1. 색상 — Raw 사용 금지

### ❌ 금지

```css
/* hex/rgb/hsl 직접 작성 */
.btn { background: #256ef4; }
.card { color: rgb(30, 33, 36); }
.alert { border-color: hsl(220, 50%, 50%); }
```

```html
<!-- Tailwind raw 컬러 유틸리티 -->
<div class="bg-red-500 text-gray-700 border-blue-300">...</div>
<div class="bg-white">...</div>
```

```jsx
{/* 인라인 style 색상 */}
<div style={{ color: "#256ef4" }}>...</div>
```

### ✅ 허용

```css
.btn { background: var(--color-primary); }
.btn { background: var(--krds-light-color-button-primary-fill); }
.alert { border-color: var(--color-border-light); }
```

```html
<div class="bg-primary text-text border-border-light">...</div>
<div class="bg-bg">...</div>
```

### Raw → 시맨틱 매핑표

| Raw 시도 | 올바른 토큰 |
|---------|-------------|
| `bg-white`, `#fff` | `bg-bg` 또는 `var(--color-bg)` |
| `bg-gray-50`, `#f4f5f6` | `bg-bg-subtler` |
| `bg-gray-100` | `bg-bg-subtle` |
| `text-gray-400` | `text-text-disabled` |
| `text-gray-500/600/700` | `text-text-subtle` |
| `text-gray-800/900` | `text-text-bolder` |
| `text-black` | `text-text-bolder` |
| `border-gray-200/300` | `border-border-light` |
| `border-gray-400+` | `border-border` 또는 `border-border-dark` |
| `text-red-*` / `bg-red-500+` | `text-danger` / `bg-danger` |
| `bg-red-50/100` | `bg-danger-surface` |
| `text-blue-*` (브랜드) | `text-primary` |
| `bg-blue-500+` | `bg-primary` |
| `bg-blue-50/100` | `bg-primary-5` 또는 `var(--krds-light-color-surface-primary-subtler)` |
| `text-green-*` | `text-success` |
| `bg-green-50/100` | `bg-success-surface` |
| `text-amber-*` / `text-yellow-*` | `text-warning` |
| `bg-amber-50/100` | `bg-warning-surface` |

---

## 2. 간격/크기 — Raw 사용 금지

### ❌ 금지

```css
.card { padding: 16px; margin-top: 24px; }
.btn { height: 48px; gap: 8px; }
```

```html
<div class="p-[16px] mt-[24px] h-[48px]">...</div>
```

### ✅ 허용

```css
/* KRDS number primitive 기반 */
.card { padding: var(--krds-number-8); margin-top: var(--krds-number-10); }
.btn { height: var(--krds-size-height-7); gap: var(--krds-gap-3); }
```

```html
<!-- Tailwind 유틸 (KRDS spacing 매핑) -->
<div class="p-8 mt-10 h-size-height-7">...</div>
```

### Spacing 토큰 표 (1rem = 10px)

| 토큰 | 값 | px |
|------|-----|-----|
| `--spacing-0` | 0 | 0 |
| `--spacing-1` | 0.1rem | 1 |
| `--spacing-2` | 0.2rem | 2 |
| `--spacing-3` | 0.4rem | **4** |
| `--spacing-5` | 0.8rem | **8** |
| `--spacing-7` | 1.2rem | **12** |
| `--spacing-8` | 1.6rem | **16** |
| `--spacing-10` | 2.4rem | **24** |
| `--spacing-12` | 3.2rem | **32** |
| `--spacing-14` | 4.0rem | **40** |
| `--spacing-16` | 4.8rem | **48** |
| `--spacing-18` | 6.4rem | **64** |

---

## 3. 폰트 — Raw 사이즈 금지

### ❌ 금지

```css
h1 { font-size: 32px; }
.title { font-size: 1.5rem; }
.body { font-family: "Pretendard"; }
```

```html
<h1 class="text-2xl font-bold">제목</h1>
<p class="text-base text-sm">본문</p>
```

### ✅ 허용

```css
h1 { font-size: var(--text-heading-large); }
.title { font-size: var(--text-heading-medium); }
body { font-family: var(--font-sans); }
```

```html
<h1 class="text-heading-large">제목</h1>
<p class="text-body-medium">본문</p>
<small class="text-body-small">보조 텍스트</small>
```

### 폰트 사이즈 토큰

- **Display**: `text-display-{large|medium|small}` (60/44/36 px)
- **Heading**: `text-heading-{xlarge|large|medium|small|xsmall|xxsmall}` (40/32/24/19/17/15)
- **Body**: `text-body-{large|large-bold|medium|medium-bold|small|small-bold|xsmall|xsmall-bold}`
- **Label**: `text-label-{large|medium|small|xsmall}`
- **Navigation**: `text-navigation-*`

---

## 4. 버튼 — 옛 variant 사용 금지

### ❌ 금지

```html
<button class="btn btn--ghost">고스트</button>
<button class="btn btn--outline">아웃라인</button>
<button class="btn btn--link">링크</button>
<button class="btn btn--sm">작은 버튼</button>
<button class="btn btn--lg">큰 버튼</button>
```

### ✅ 허용 (KRDS 4 variant × 5 size)

```html
<!-- variant -->
<button class="btn btn--primary">메인 CTA</button>
<button class="btn btn--secondary">보조</button>
<button class="btn btn--tertiary">약한</button>
<button class="btn btn--text">텍스트</button>

<!-- size -->
<button class="btn btn--xsmall">32px</button>
<button class="btn btn--small">40px</button>
<button class="btn">48px (medium 기본)</button>
<button class="btn btn--large">56px</button>
<button class="btn btn--xlarge">64px</button>
```

### 옛 → KRDS 변환표

| 옛 | KRDS |
|---|------|
| `.btn--outline` | `.btn--secondary` |
| `.btn--ghost` | `.btn--tertiary` 또는 `.btn--text` |
| `.btn--link` | `.btn--text` (밑줄은 별도 추가) |
| `.btn--sm` | `.btn--small` |
| `.btn--lg` | `.btn--large` |

---

## 5. CSS 작성 — 시스템 우회 금지

### ❌ 금지

```css
/* !important — 토큰 시스템 우회 */
.btn { background: var(--color-primary) !important; }

/* @apply 안에서 커스텀 클래스 사용 */
.my-btn { @apply text-primary bg-primary-light; } /* primary-light가 토큰명이면 OK, 임의 클래스면 NG */

/* SCSS 문법 */
.btn {
  &--primary { ... }
  &__icon { ... }
}
@use 'breakpoints';
@forward 'tokens';
```

### ✅ 허용

```css
/* !important 정당화: 외부 라이브러리 오버라이드만, 사유 주석 필수 */
.tabulator-cell {
  /* tabulator 인라인 스타일 오버라이드 — 라이브러리 한계 */
  padding: var(--krds-padding-5) !important;
}

/* BEM 평면 작성 (Tailwind v4는 SCSS 네스팅 미지원) */
.btn--primary { ... }
.btn__icon { ... }

/* CSS @import만 사용 */
@import "tailwindcss";
@import "../../tokens/build/tokens.css";
```

---

## 6. HTML 시맨틱 — div onclick 금지

### ❌ 금지

```html
<div onclick="open()" class="cursor-pointer">메뉴 열기</div>
<span onClick={handler}>버튼처럼 보이는 span</span>
<a href="javascript:void(0)" onclick="...">앵커 남용</a>
```

### ✅ 허용

```html
<button type="button" onclick="open()">메뉴 열기</button>
<a href="/menu">메뉴 페이지</a>
```

---

## 7. 접근성 — 누락 금지

### ❌ 금지

```html
<img src="/logo.svg">                          <!-- alt 누락 -->
<input type="text" placeholder="이름">         <!-- label 누락, placeholder만 -->
<button onclick="...">×</button>                <!-- aria-label 누락 (아이콘만) -->
.btn:focus { outline: none; }                  <!-- focus 제거 -->
```

### ✅ 허용

```html
<img src="/logo.svg" alt="기관명">
<label for="name">이름</label>
<input type="text" id="name" placeholder="홍길동">
<button onclick="..." aria-label="닫기">×</button>
/* :focus { outline: none } 자체가 금지. focus-visible은 reset.css 전역 처리됨 */
```

---

## 8. 컴포넌트 — 카탈로그 외 임의 생성 금지

`references/krds-components.md`에 없는 컴포넌트가 필요해 보이면:

### ❌ 금지

```css
/* 카탈로그에 없는 컴포넌트를 그냥 새로 만들기 */
.my-fancy-card { ... }
.custom-button { ... }
.dropdown-menu { ... }
```

### ✅ 절차

1. 작성 중단
2. 사용자에게 보고
3. (a) 기존 컴포넌트 조합으로 구현 가능한가? — 우선 시도
4. (b) 정말 새 컴포넌트가 필요하면 — UX팀에 신규 컴포넌트 제안 (사용자 명시 지시받고 일회성 인라인 구현, 주석에 `TODO: UX팀 정식 컴포넌트화 필요`)

---

## 9. 빌드 시스템 — SCSS 사용 금지

이 가이드는 **Tailwind v4 + 순수 CSS** 기반이다. SCSS는 폐기됨.

### ❌ 금지

- `*.scss` 파일 작성
- `@use 'module' as alias`
- `@forward 'module'`
- SCSS 변수 (`$color: red`)
- SCSS 네스팅 (Tailwind v4는 native CSS 네스팅 지원하지만, 권장은 평면 BEM)

### ✅ 허용

- `*.css` (Tailwind v4 + native CSS)
- `@import "..."` (CSS native)
- `@theme { ... }` (Tailwind v4 토큰 정의)
- `@apply` (Tailwind v4 component layer)
- `@layer base, components, utilities` (Tailwind v4 cascade layer)

---

## 위반 발견 시 보고 형식

```
[info-design 컨트랙트 위반 감지]

위반 항목: [위 1~9 중 어느 카테고리]
구체 내용: [어느 줄에서 무엇을]
근거: [이 문서의 어느 항목]

옵션:
1. 토큰으로 교체 — [구체적 토큰명 제시]
2. 사용자 확인 필요 — [모호한 부분 설명]

작성을 일시 중단합니다. 어떻게 진행할까요?
```
