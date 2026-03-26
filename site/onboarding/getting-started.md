---
title: 시작 가이드
order: 2
---

신규 팀원이 가이드 시스템을 설치하고 활용하기까지의 과정을 6단계로 안내한다. 각 단계마다 심화 문서 링크를 제공하므로 필요한 부분을 깊이 있게 학습할 수 있다.

## 새 프로젝트 시작

스타터 킷을 clone하여 바로 시작한다. 가이드 문서 사이트, 테스트 도구 등 불필요한 파일 없이 SCSS + HTML + JS만 포함된 최소 구성이다.

```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project
npm install
npm run build:css
```

빌드 성공 시 `dist/css/style.css`가 생성된다. `index.html`을 브라우저에서 열어 확인한다.

커스터마이징은 `src/scss/_project-overrides.scss`에서 Primary 색상을 변경하는 것부터 시작한다.

> **가이드 문서 열람:** [https://github.com/iux-pub/guide](https://github.com/iux-pub/guide) 저장소의 문서 사이트 참조

---

## Step 1: 설치 (가이드 시스템 전체)

가이드 시스템 전체를 로컬에서 실행하려면 guide 저장소를 사용한다.

```bash
git clone https://github.com/iux-pub/guide.git
cd guide
npm install --legacy-peer-deps
npm run build:css
```

빌드가 성공하면 `dist/css/style.css` 파일이 생성된다. 에러가 발생하면 Node.js 버전(18 이상)과 npm 버전을 확인한다.

## Step 2: SCSS 구조 이해

이 프로젝트는 **ITCSS(Inverted Triangle CSS)** 7레이어 구조를 사용한다. 각 레이어는 특정성(specificity)이 낮은 순서에서 높은 순서로 배치된다.

```
src/scss/
  1-settings/    # 토큰, 변수 (CSS 출력 없음)
  2-tools/       # 믹스인, 함수 (CSS 출력 없음)
  3-generic/     # 리셋, 노멀라이즈
  4-elements/    # HTML 태그 기본 스타일
  5-objects/     # 레이아웃 패턴 (BEM 필수)
  6-components/  # UI 컴포넌트 (BEM 필수)
  7-utilities/   # 유틸리티 클래스
```

- `style.scss`가 메인 진입점이며, `@use`로 각 레이어를 로드한다
- 새 컴포넌트는 `6-components/`에 파일을 생성하고 `_index.scss`에 `@forward`를 추가한다

심화: [SCSS 구조 가이드](/conventions/scss-structure/)

## Step 3: 디자인 토큰 사용

모든 스타일 값은 CSS Custom Properties(토큰)를 사용한다. 하드코딩 색상, 크기, 간격을 금지한다.

```scss
// 잘못된 예 (하드코딩 금지)
.card {
  color: #222;
  padding: 16px;
}

// 올바른 예 (토큰 사용)
.card {
  color: var(--color-gray-900);
  padding: var(--spacing-md);
}
```

토큰은 `src/scss/1-settings/` 디렉토리에 정의되어 있다.

| 카테고리 | 토큰 파일 | 예시 |
|----------|----------|------|
| 색상 | `_tokens-color.scss` | `var(--color-primary)`, `var(--color-gray-900)` |
| 타이포그래피 | `_tokens-typography.scss` | `var(--font-size-base)`, `var(--font-weight-bold)` |
| 간격 | `_tokens-spacing.scss` | `var(--spacing-sm)`, `var(--spacing-md)` |
| 그리드 | `_tokens-grid.scss` | `var(--grid-columns)`, `var(--container-max-width)` |
| 기타 | `_tokens-misc.scss` | `var(--radius-base)`, `var(--shadow-base)` |

심화: [토큰 개요](/tokens/)

## Step 4: 컴포넌트 활용

기존 컴포넌트를 활용할 때는 스니펫을 복사하여 사용한다.

1. `src/snippets/` 디렉토리에서 필요한 컴포넌트의 마크다운 파일을 연다
2. HTML 마크업 예제를 복사한다
3. variant(modifier)를 필요에 따라 변경한다
4. `src/playground/` 디렉토리의 HTML 파일에서 미리보기를 확인한다

| 컴포넌트 | 스니펫 파일 | Playground |
|----------|------------|------------|
| 버튼 | `src/snippets/btn.md` | `src/playground/btn.html` |
| 폼 | `src/snippets/form.md` | `src/playground/form.html` |
| 카드 | `src/snippets/card.md` | `src/playground/card.html` |
| 테이블 | `src/snippets/table.md` | `src/playground/table.html` |
| 모달 | `src/snippets/modal.md` | `src/playground/modal.html` |
| 탭 | `src/snippets/tab.md` | `src/playground/tab.html` |

심화: [컴포넌트 개요](/components/)

## Step 5: BEM 네이밍

모든 CSS 클래스명은 BEM(Block__Element--Modifier) 패턴을 따른다.

```scss
// BEM 패턴
.block {}              // Block
.block--modifier {}    // Block + Modifier
.block__element {}     // Block + Element
.block__element--modifier {}  // Block + Element + Modifier

// SCSS 중첩 작성
.card {
  &__header { }        // .card__header
  &__title { }         // .card__title
  &--featured { }      // .card--featured
}
```

**금지 패턴:**
- `.btn-primary` -> `.btn--primary` (modifier에는 `--` 사용)
- `.card-header` -> `.card__header` (element에는 `__` 사용)
- `.card__header__title` -> `.card__title` (2단계 중첩 금지, 평탄화)

코드 작성 후 Stylelint로 BEM 규칙 위반을 검사한다.

```bash
npm run lint:css
```

심화: [BEM 네이밍](/conventions/bem/)

## Step 6: 접근성 체크

KWCAG/WCAG 2.1 AA 기준을 준수한다. 코드 작성 후 접근성 검사를 실행한다.

```bash
npm run test:a11y
```

**필수 체크 항목:**
- 이미지에 `alt` 속성 제공
- 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블 제공
- 키보드 네비게이션 지원 (탭 순서, 포커스 표시)
- 색상 대비 4.5:1 이상 유지
- 본문 건너뛰기 링크 제공

심화: [접근성 개요](/accessibility/)

## 다음 단계

- [피그마→코드 핸드오프](/onboarding/handoff/) -- 디자이너-퍼블리셔 간 전달 규칙
- [컨벤션 개요](/conventions/) -- BEM, SCSS 구조 상세 규칙
