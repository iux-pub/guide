---
title: 그리드 토큰
order: 5
---

그리드 토큰은 `src/scss/1-settings/_tokens-grid.scss`에 정의되어 있다. KRDS 표준형 기반의 3단계 반응형 그리드이다.

## 그리드 토큰

| 토큰 | 모바일 (0~767px) | 태블릿 (768~1279px) | PC (1280px~) |
|------|-----------------|-------------------|-------------|
| `--grid-columns` | 4 | 12 | 12 |
| `--grid-gutter` | 16px | 24px | 24px |
| `--grid-margin` | 16px | 24px | 40px |
| `--container-max-width` | 100% | 100% | 1200px |

## 브레이크포인트

`src/scss/1-settings/_breakpoints.scss`에 정의된 브레이크포인트이다.

| 이름 | 값 | 범위 |
|------|-----|------|
| 모바일 | 기본 | 0 ~ 767px |
| 태블릿 | `768px` | 768px ~ 1279px |
| PC | `1280px` | 1280px ~ |
| `tablet-up` | `768px` | 768px ~ (태블릿+PC 공통) |

## Container 오브젝트

`.container` 클래스는 `src/scss/5-objects/_container.scss`에 정의되어 있다.

```scss
// container 사용
<div class="container">
  <!-- 콘텐츠 -->
</div>
```

- 모바일: 좌우 마진 16px, 전체 너비
- 태블릿: 좌우 마진 24px, 전체 너비
- PC: 최대 너비 1200px, 좌우 자동 마진으로 중앙 정렬

## Grid 오브젝트

`.grid` 클래스는 `src/scss/5-objects/_grid.scss`에 정의되어 있다.

```html
<div class="grid">
  <div class="grid__col-6">왼쪽 절반</div>
  <div class="grid__col-6">오른쪽 절반</div>
</div>
```

- 12컬럼 기반 (`--grid-columns`)
- 거터(gap)는 `--grid-gutter` 토큰 사용
- `grid__col-{n}` 클래스로 컬럼 너비 지정 (1~12)

## 반응형 믹스인

```scss
@use '../2-tools/responsive' as resp;

.layout {
  // 모바일: 1컬럼 (기본)
  display: block;

  @include resp.respond-to('tablet') {
    // 태블릿: 2컬럼
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--grid-gutter);
  }

  @include resp.respond-to('pc') {
    // PC: 3컬럼
    grid-template-columns: repeat(3, 1fr);
  }
}
```
