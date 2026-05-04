---
title: 배지
order: 18
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/badge.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#badge)에 있다.

## 기본 마크업

```html
<!-- 숫자 배지 -->
<button class="btn btn--text">
  알림 <span class="badge">3</span>
</button>

<!-- 점만 (dot 변형) -->
<span class="badge badge--dot" aria-label="새 알림 있음"></span>
```

## 접근성 핵심

- 숫자 배지: 텍스트로 의미 전달됨 (별도 ARIA 불필요)
- Dot 배지: 시각만 — `aria-label="새 알림 있음"` 필수

## 파일

- 마크업: `src/snippets/badge.md`
- CSS: `src/styles/6-components/badge.css`
- 카탈로그: [krds-components.md#badge](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#badge)
