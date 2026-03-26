---
title: 퍼블리싱 AI 프롬프트
order: 4
---

## 대상 AI 도구

Cursor, Copilot, Windsurf, Claude Code

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# 퍼블리싱 AI 프롬프트

> **목적:** 코드 작성 AI에서 인포마인드 UX팀 퍼블리싱 규칙을 적용하기 위한 프롬프트
> **대상 AI:** Cursor, Copilot, Windsurf, Claude Code

---

## BEM 네이밍 규칙

모든 CSS 클래스명은 BEM(Block__Element--Modifier) 패턴을 따르라.

### 필수 패턴

| 패턴 | 형식 | 예시 |
|------|------|------|
| Block | `.block-name` | `.card`, `.btn`, `.site-header` |
| Block + Modifier | `.block--modifier` | `.btn--primary`, `.card--featured` |
| Block + Element | `.block__element` | `.card__header`, `.form__input` |
| Block + Element + Modifier | `.block__element--modifier` | `.form__input--error` |

### SCSS 작성 규칙

- Element는 반드시 `&__element-name`으로 중첩 작성하라
- Modifier는 반드시 `&--modifier-name`으로 중첩 작성하라
- Element 2단계 중첩을 금지한다: `.card__header__title` -> `.card__title`로 평탄화하라
- Modifier는 Block 또는 Element에만 부착하라

### 금지 패턴

| 잘못된 패턴 | 올바른 BEM | 이유 |
|-------------|-----------|------|
| `.btn-primary` | `.btn--primary` | modifier에는 `--` 사용 필수 |
| `.card-header` | `.card__header` | element에는 `__` 사용 필수 |
| `.input-box.error` | `.form__input--error` | 별도 클래스 조합 대신 modifier 사용 |
| `.card-header h4` | `.card__title` | 요소 선택자 의존 금지 |
| `.btn-gray` | `.btn--secondary` | 시각적 속성 이름 금지, 의미적 이름 사용 |
| `.card__header__title` | `.card__title` | element 2단계 중첩 금지, 평탄화 |

### SCSS BEM 중첩 예시

```scss
// 카드 컴포넌트
.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);

  &__header {
    padding: var(--spacing-md);
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);

    &--highlight {
      color: var(--color-primary);
    }
  }

  &__body {
    padding: var(--spacing-md);
  }

  &--featured {
    border-color: var(--color-primary);
  }
}
```

---

## ITCSS 7레이어 구조

```
src/scss/
  style.scss              # 메인 진입점 (@use로 각 레이어 로드)
  _project-overrides.scss # 프로젝트별 토큰 오버라이드 (맨 마지막)
  1-settings/             # 토큰, 변수, 브레이크포인트 (CSS 출력 없음)
  2-tools/                # 믹스인, 함수 (CSS 출력 없음)
  3-generic/              # 리셋, 노멀라이즈 (요소 선택자만)
  4-elements/             # HTML 태그 기본 스타일 (h1, a, p 등)
  5-objects/              # 레이아웃 패턴 (BEM 필수)
  6-components/           # UI 컴포넌트 (BEM 필수)
  7-utilities/            # 유틸리티 클래스
```

### 파일 위치 규칙

- 새 컴포넌트: `src/scss/6-components/_컴포넌트명.scss` 생성 후 `6-components/_index.scss`에 `@forward` 추가
- 새 유틸리티: `src/scss/7-utilities/_유틸리티명.scss` 생성 후 `7-utilities/_index.scss`에 `@forward` 추가
- `style.scss`에 새 레이어 `@use` 추가 (이미 있으면 생략)

### 레이어별 BEM 적용 범위

| 레이어 | BEM 적용 | 설명 |
|--------|---------|------|
| 1-settings | 적용 안함 | 변수, 토큰 정의 (클래스 없음) |
| 2-tools | 적용 안함 | 믹스인, 함수 (CSS 출력 없음) |
| 3-generic | 적용 안함 | reset/normalize, 요소 선택자만 |
| 4-elements | 적용 안함 | HTML 태그 선택자 |
| **5-objects** | **필수** | `.container`, `.grid`, `.grid__col-*` |
| **6-components** | **필수** | `.card`, `.btn`, `.form` 등 모든 UI |
| 7-utilities | 부분 적용 | `.sr-only`, `.hidden` 등 |

### 모듈 시스템

- `@use`/`@forward`를 사용하라. `@import` 사용을 금지한다
- 숫자 접두사 폴더는 `@use` 시 `as` 별칭 필수: `@use '1-settings' as settings`
- 각 레이어의 `_index.scss`에서 `@forward`로 내부 파일 공개

---

## 토큰 사용법

모든 스타일 값은 CSS Custom Properties(토큰)를 사용하라. 하드코딩 색상, 크기, 간격을 금지한다.

### 하드코딩 vs 토큰

```scss
// 잘못된 예 (하드코딩 금지)
.card {
  color: #222;
  padding: 16px;
  font-size: 14px;
  border-radius: 8px;
}

// 올바른 예 (토큰 사용)
.card {
  color: var(--color-gray-900);
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-base);
}
```

### 주요 토큰 카테고리

- **색상:** `var(--color-*)` -- primary, gray-50~900, danger/warning/success/info, text, bg, border
- **폰트 크기:** `var(--font-size-*)` -- 2xl/xl/lg/md/base/sm/xs (32~12px)
- **폰트 굵기:** `var(--font-weight-*)` -- regular(400)/medium(500)/semibold(600)/bold(700)
- **줄 간격:** `var(--leading-*)` -- tight(1.2)/base(1.6)/loose(1.8)
- **간격:** `var(--spacing-*)` -- xs(4)/sm(8)/md(16)/lg(24)/xl(32)/2xl(48)/3xl(64)
- **반지름:** `var(--radius-*)` -- sm(4)/base(8)/lg(12)/xl(16)/full(9999)
- **그림자:** `var(--shadow-*)` -- sm/base/lg
- **트랜지션:** `var(--transition-*)` -- fast(0.15s)/base(0.3s)/slow(0.5s)
- **z-index:** `var(--z-*)` -- dropdown(100)/sticky(200)/fixed(300)/modal-backdrop(400)/modal(500)/toast(600)

---

## 반응형

### 모바일 퍼스트

```scss
@use '../2-tools/responsive' as resp;

.card {
  padding: var(--spacing-sm);          // 모바일 기본

  @include resp.respond-to('tablet') {
    padding: var(--spacing-md);        // 태블릿 (768px ~ 1279px)
  }

  @include resp.respond-to('pc') {
    padding: var(--spacing-lg);        // PC (1280px ~)
  }
}
```

### 브레이크포인트

| 이름 | 범위 |
|------|------|
| 모바일 | 0 ~ 767px (기본 스타일) |
| 태블릿 | 768px ~ 1279px |
| PC | 1280px ~ |
| tablet-up | 768px ~ (태블릿+PC 공통) |

### 62.5% REM 트릭

- `html { font-size: 62.5% }` 적용 -- 1rem = 10px
- px -> rem 변환: px값 / 10 (예: 16px = 1.6rem, 24px = 2.4rem)
- 토큰 값이 이미 rem으로 정의되어 있으므로 토큰을 우선 사용하라

---

## 공용 믹스인

```scss
@use '../2-tools/mixins' as mix;

@include mix.flex-center;              // flex 센터 정렬 (row)
@include mix.flex-center(column);      // flex 센터 정렬 (column)
@include mix.full;                     // width + height 100%
@include mix.ellipsis;                 // 한 줄 말줄임
@include mix.ellipsis-multiline(3);    // 여러 줄 말줄임
@include mix.bg-cover;                 // 배경 이미지 커버
@include mix.placeholder(var(--color-gray-500));  // placeholder 스타일
```

---

## 접근성 (KWCAG/WCAG 2.1 AA)

1. 이미지에 `alt` 속성을 필수로 제공하라. 장식용은 `alt=""` + `role="presentation"`
2. 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블을 필수로 제공하라
3. 키보드 네비게이션을 지원하라 (탭 순서, 포커스 표시)
4. 색상 대비 4.5:1 이상을 유지하라
5. 본문 건너뛰기 링크를 제공하라: `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`
6. 스크린 리더 전용 텍스트: `.sr-only` 클래스를 사용하라
7. 에러 상태: `aria-invalid="true"` + `aria-describedby`로 에러 메시지 연결
8. 모달: `role="dialog"` + `aria-modal="true"` + 포커스 트랩 + ESC 닫기
9. 탭: `role="tablist/tab/tabpanel"` + `aria-selected` + 화살표 키 탐색

---

## CSS 규칙

- `!important` 사용을 금지한다 (부득이한 경우 주석으로 사유 필수)
- 인라인 스타일 사용을 금지한다

---

## 코딩 스타일

- 들여쓰기: 2 spaces (탭 금지)
- 따옴표: single quote 사용
- 세미콜론: SCSS에서는 세미콜론 사용, JS/HTML에서는 없음
- 주석은 한국어로 작성하라
````
