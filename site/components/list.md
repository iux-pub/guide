---
title: 목록
order: 27
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/list.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#list)에 있다.

## 기본 마크업

```html
<!-- 글머리표 -->
<ul class="list--text">
  <li>첫 번째 항목</li>
  <li>두 번째 항목
    <ul>
      <li>중첩 항목</li>
    </ul>
  </li>
</ul>

<!-- 번호 -->
<ol class="list--text list--ordered">
  <li>1단계</li>
  <li>2단계</li>
</ol>
```

## 접근성 핵심

- 순서 의미 — `<ol>` (있음) / `<ul>` (없음)
- 정의 목록 — `<dl>/<dt>/<dd>` 시맨틱 사용
- 모바일에선 정의 목록이 자동으로 1열로 변환

## 파일

- 마크업: `src/snippets/list.md`
- CSS: `src/styles/6-components/list.css`
- 카탈로그: [krds-components.md#list](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#list)
