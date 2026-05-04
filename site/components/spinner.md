---
title: 스피너
order: 20
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/spinner.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#spinner)에 있다.

## 기본 마크업

```html
<span class="spinner" role="status" aria-label="로딩 중"></span>
```

## 접근성 핵심

- `role="status"` + `aria-label="로딩 중"` 필수
- `prefers-reduced-motion: reduce` 자동 대응 (회전 속도 절반으로)

## 파일

- 마크업: `src/snippets/spinner.md`
- CSS: `src/styles/6-components/spinner.css`
- 카탈로그: [krds-components.md#spinner](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#spinner)
