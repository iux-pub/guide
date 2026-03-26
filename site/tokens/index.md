---
title: 디자인 토큰
order: 1
---

디자인 토큰은 색상, 타이포그래피, 간격, 그리드 등 프로젝트 전반에서 사용되는 스타일 값을 CSS Custom Properties로 정의한 것이다. 하드코딩된 값 대신 토큰을 사용하여 일관성을 유지하고, 프로젝트별 오버라이드를 가능하게 한다.

## 토큰 사용 원칙

- **하드코딩 금지:** 색상, 크기, 간격 등의 값을 직접 입력하지 않는다
- **CSS Custom Properties 우선:** `var(--token-name)` 형태로 사용한다
- **프로젝트별 오버라이드:** `_project-overrides.scss`에서 `:root` 변수를 재정의하여 프로젝트에 맞게 조정한다

## 토큰 카테고리

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| [색상](/tokens/color/) | `_tokens-color.scss` | Primary, Gray scale, Semantic, Text, Background, Border |
| [타이포그래피](/tokens/typography/) | `_tokens-typography.scss` | Font family, size, weight, line-height |
| [간격](/tokens/spacing/) | `_tokens-spacing.scss` | 4px 기반 스케일 (xs ~ 3xl) |
| [그리드](/tokens/grid/) | `_tokens-grid.scss` | 컬럼, 거터, 마진, 컨테이너 |
| 기타 | `_tokens-misc.scss` | Border radius, shadow, transition, z-index |

## 하드코딩 vs 토큰 비교

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

## 토큰 파일 위치

모든 토큰은 `src/scss/1-settings/` 디렉토리에 정의되어 있다. ITCSS 구조에서 가장 상위 레이어로, CSS 출력을 생성하지 않고 변수 정의만 담당한다.
