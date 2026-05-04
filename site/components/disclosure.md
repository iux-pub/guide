---
title: 디스클로저
order: 9
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/disclosure.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#disclosure)에 있다.

## 기본 마크업

```html
<button type="button" class="disclosure" aria-expanded="false" aria-controls="more-info">
  자세히 보기
</button>
<div id="more-info" class="disclosure__panel" hidden>
  <p>접혀 있던 추가 정보</p>
</div>
```

## 접근성 핵심

- `aria-expanded` 상태값 필수 (열림/닫힘)
- `aria-controls`로 패널 id 연결
- 패널 `hidden` 속성 또는 CSS `display: none` 사용 (레이아웃에서 완전 제거)

## 파일

- 마크업: `src/snippets/disclosure.md`
- CSS: `src/styles/6-components/disclosure.css`
- 카탈로그: [krds-components.md#disclosure](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#disclosure)
