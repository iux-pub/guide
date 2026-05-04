---
title: 그리드 토큰
order: 5
---

KRDS 표준형 기반 3단계 반응형 그리드. 모바일 4컬럼 / 태블릿·PC 12컬럼 시스템이다.

## 그리드 사양

| 항목 | 모바일 (0~767px) | 태블릿 (768~1279px) | PC (1280px~) |
|------|-----------------|-------------------|-------------|
| 컬럼 수 | 4 | 12 | 12 |
| 거터(gutter) | 16px | 24px | 24px |
| 좌우 마진 | 16px | 24px | 40px |
| 컨테이너 max-width | 100% | 100% | **1200px** |

## 브레이크포인트

KRDS 표준 브레이크포인트.

| 이름 | 값 | 범위 |
|------|-----|------|
| 모바일 | 기본 | 0 ~ 767px |
| 태블릿 | `768px` | 768px ~ 1279px |
| PC | `1280px` | 1280px ~ |

CSS `@media` 또는 Tailwind v4 변종으로 직접 사용 (SCSS `respond-to` 믹스인 폐기).

## Container 오브젝트

`.container` 클래스는 `src/styles/5-objects/container.css`에 정의되어 있다.

```html
<div class="container">
  <!-- 콘텐츠 -->
</div>
```

- 모바일: 좌우 패딩 16px, 전체 너비
- 태블릿: 좌우 패딩 24px, 전체 너비
- PC: 최대 너비 1200px, 좌우 자동 마진으로 중앙 정렬, 좌우 패딩 40px

## 반응형 작성 패턴

CSS `@media` 직접 사용 — 모바일 퍼스트.

```css
.layout {
  /* 모바일: 1컬럼 (기본) */
  display: block;
}

@media (min-width: 768px) {
  .layout {
    /* 태블릿: 2컬럼 */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--krds-gap-5);
  }
}

@media (min-width: 1280px) {
  .layout {
    /* PC: 3컬럼 */
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Tailwind v4 반응형 variant

Tailwind v4의 `md:` (768+) / `lg:` (1280+) 같은 variant도 KRDS 브레이크포인트와 정합한다 (Tailwind 기본 sm:는 비활성, KRDS는 768/1280 2단계만 사용).

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--krds-gap-5)]">
  <!-- 콘텐츠 -->
</div>
```

> Tailwind raw 컬러(`bg-red-500`)/비활성 스케일(`text-base`/`rounded-lg`/`sm:`)은 사용 금지(R-01, R-06). 토큰 직접 참조(`bg-[var(--color-bg)]`) 또는 KRDS 매핑 클래스 사용.

## 절대 금지

- 옛 SCSS 믹스인 (`@include resp.respond-to('tablet')`) — SCSS 폐기 (R-03)
- 임의 브레이크포인트 (예: 1024px·1440px) — KRDS 표준만
- raw px 거터 (`gap: 16px`) — `var(--krds-gap-5)` 등 토큰 사용
