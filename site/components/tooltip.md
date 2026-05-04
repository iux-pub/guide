---
title: 툴팁
order: 24
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/tooltip.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#tooltip)에 있다.

## 기본 마크업

```html
<button type="button" class="tooltip-trigger" aria-describedby="tip-1">
  도움말
</button>
<div id="tip-1" class="tooltip" role="tooltip" hidden>
  도움말 설명 텍스트
</div>
```

## 접근성 핵심

- 트리거에 `aria-describedby="툴팁id"` 연결
- 툴팁에 `role="tooltip"` 필수
- ESC로 닫기 가능 (JS 처리)
- 툴팁은 hover/focus 양쪽으로 트리거 가능해야 함 (WCAG 1.4.13)

## 파일

- 마크업: `src/snippets/tooltip.md`
- CSS: `src/styles/6-components/tooltip.css`
- 카탈로그: [krds-components.md#tooltip](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#tooltip)
