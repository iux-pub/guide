---
title: 토스트
order: 23
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/toast.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#toast)에 있다.

## 기본 마크업

```html
<div class="toast-stack">
  <div class="toast toast--success" role="status">
    <span class="toast__icon" aria-hidden="true">✓</span>
    <p class="toast__message">저장되었습니다</p>
    <button type="button" class="toast__close" aria-label="닫기">×</button>
  </div>
</div>
```

## 접근성 핵심

- `role="status"` + `aria-live="polite"` (스크린리더 정중 안내)
- 위급 시에만 `role="alert"` + `aria-live="assertive"`
- 자동 닫힘 토스트도 사용자 옵션으로 일시정지/지속 가능해야 함 (WCAG 2.2.1)

## 파일

- 마크업: `src/snippets/toast.md`
- CSS: `src/styles/6-components/toast.css`
- 카탈로그: [krds-components.md#toast](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#toast)
