---
title: BEM 네이밍
order: 2
---

모든 CSS 클래스명은 BEM(Block__Element--Modifier) 패턴을 따른다. 팀 합의 사항이며, Stylelint로 자동 검증한다.

## BEM 패턴

| 패턴 | 형식 | 예시 |
|------|------|------|
| Block | `.block-name` | `.card`, `.btn`, `.site-header` |
| Block + Modifier | `.block--modifier` | `.btn--primary`, `.card--featured` |
| Block + Element | `.block__element` | `.card__header`, `.form__input` |
| Block + Element + Modifier | `.block__element--modifier` | `.form__input--error`, `.card__title--highlight` |

## SCSS 작성 규칙

- Element는 반드시 `&__element-name`으로 중첩 작성한다
- Modifier는 반드시 `&--modifier-name`으로 중첩 작성한다
- Element 2단계 중첩을 금지한다: `.card__header__title` -> `.card__title`로 평탄화한다
- Modifier는 Block 또는 Element에만 부착한다

## 금지 패턴

| 잘못된 패턴 | 올바른 BEM | 이유 |
|-------------|-----------|------|
| `.btn-primary` | `.btn--primary` | modifier에는 `--` 사용 필수 |
| `.card-header` | `.card__header` | element에는 `__` 사용 필수 |
| `.input-box.error` | `.form__input--error` | 별도 클래스 조합 대신 modifier 사용 |
| `.card-header h4` | `.card__title` | 요소 선택자 의존 금지 |
| `.btn-gray` | `.btn--secondary` | 시각적 속성 이름 금지, 의미적 이름 사용 |
| `.card__header__title` | `.card__title` | element 2단계 중첩 금지, 평탄화 |

## SCSS BEM 중첩 예시

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

## ITCSS 레이어별 BEM 적용 범위

| 레이어 | BEM 적용 | 설명 |
|--------|---------|------|
| 1-settings | 적용 안함 | 변수, 토큰 정의 (클래스 없음) |
| 2-tools | 적용 안함 | 믹스인, 함수 (CSS 출력 없음) |
| 3-generic | 적용 안함 | reset/normalize, 요소 선택자만 |
| 4-elements | 적용 안함 | HTML 태그 선택자 |
| **5-objects** | **필수** | `.container`, `.grid`, `.grid__col-*` 등 |
| **6-components** | **필수** | `.card`, `.btn`, `.form` 등 모든 UI |
| 7-utilities | 부분 적용 | `.sr-only`, `.hidden` 등 |

## 린트 검증

Stylelint가 BEM 패턴을 자동 검증한다.

```bash
# BEM 검증 포함 린트
npm run lint:css

# 위반 시 경고 메시지 예시
# BEM 패턴 위반: "btn-primary" -> .block__element--modifier 형태로 작성하세요
```

현재 BEM 위반은 warning 수준이다. 빌드는 성공하되 경고가 출력된다.
