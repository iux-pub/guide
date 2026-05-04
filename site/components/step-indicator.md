---
title: 단계 표시기
order: 21
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/step-indicator.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#step-indicator)에 있다.

## 기본 마크업

```html
<ol class="step-indicator" aria-label="진행 단계">
  <li class="step-indicator__item step-indicator__item--done">
    <span class="step-indicator__num" aria-hidden="true">1</span>
    <span class="step-indicator__label">정보 입력</span>
  </li>
  <li class="step-indicator__item step-indicator__item--current" aria-current="step">
    <span class="step-indicator__num" aria-hidden="true">2</span>
    <span class="step-indicator__label">확인</span>
  </li>
  <li class="step-indicator__item">
    <span class="step-indicator__num" aria-hidden="true">3</span>
    <span class="step-indicator__label">완료</span>
  </li>
</ol>
```

## 접근성 핵심

- `<ol>` 사용 — 순서 의미 보존
- 현재 단계: `aria-current="step"`
- 번호는 시각만 — `aria-hidden="true"` (레이블이 텍스트로 의미 전달)

## 파일

- 마크업: `src/snippets/step-indicator.md`
- CSS: `src/styles/6-components/step-indicator.css`
- 카탈로그: [krds-components.md#step-indicator](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#step-indicator)
