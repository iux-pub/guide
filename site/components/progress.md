---
title: 진행률
order: 19
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/progress.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#progress)에 있다.

## 기본 마크업

```html
<div class="progress">
  <div class="progress__label">
    <span>업로드 중</span>
    <span>60%</span>
  </div>
  <progress class="progress__bar" value="60" max="100" aria-label="업로드 진행률 60%">60%</progress>
</div>
```

## 접근성 핵심

- native `<progress>` 사용 — 자동 ARIA 처리
- `aria-label` 또는 `aria-labelledby`로 진행 항목 명시
- 무한 로딩(불확정 시간)은 `<progress>` 대신 `.spinner` 사용

## 파일

- 마크업: `src/snippets/progress.md`
- CSS: `src/styles/6-components/progress.css`
- 카탈로그: [krds-components.md#progress](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#progress)
