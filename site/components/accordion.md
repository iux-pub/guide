---
title: 아코디언
order: 7
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/accordion.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#accordion)에 있다.

## 기본 마크업

```html
<div class="accordion">
  <details class="accordion__item">
    <summary class="accordion__summary">자주 묻는 질문 1</summary>
    <div class="accordion__panel">
      <p>답변 1 내용</p>
    </div>
  </details>
  <details class="accordion__item">
    <summary class="accordion__summary">자주 묻는 질문 2</summary>
    <div class="accordion__panel">
      <p>답변 2 내용</p>
    </div>
  </details>
  <details class="accordion__item" open>
    <summary class="accordion__summary">기본 열린 항목</summary>
    <div class="accordion__panel">
      <p><code>open</code> 속성으로 초기 열림 상태</p>
    </div>
  </details>
</div>
```

## 접근성 핵심

- native `<details>`/`<summary>` 사용 시 키보드/스크린리더 자동 지원
- `<summary>`는 자동으로 button role + aria-expanded 처리됨 — 별도 ARIA 불필요
- 최소 터치 영역 보장: `--touch-target-min` (44px)

## 파일

- 마크업: `src/snippets/accordion.md`
- CSS: `src/styles/6-components/accordion.css`
- 카탈로그: [krds-components.md#accordion](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#accordion)
