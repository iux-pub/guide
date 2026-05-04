---
title: 토글 스위치
order: 6
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/switch.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#switch)에 있다.

## 기본 마크업

```html
<label class="switch">
  <input type="checkbox" name="notify" role="switch">
  <span class="switch__track" aria-hidden="true"></span>
  <span class="switch__label">알림 받기</span>
</label>
```

## 접근성 핵심

- `role="switch"` 권장 — 스크린리더가 "스위치"로 안내
- 시각 트랙(`__track`)은 `aria-hidden="true"`
- 상태 변경은 native `:checked`만으로 충분 (별도 aria-checked 불필요)

## 파일

- 마크업: `src/snippets/switch.md`
- CSS: `src/styles/6-components/switch.css`
- 카탈로그: [krds-components.md#switch](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#switch)
