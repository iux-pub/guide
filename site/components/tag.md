---
title: 태그
order: 22
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/tag.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#tag)에 있다.

## 기본 마크업

```html
<!-- 정적 태그 -->
<span class="tag">기본</span>

<!-- 클릭 가능 (필터 등) -->
<button type="button" class="tag tag--primary">선택됨</button>

<!-- 제거 가능 (선택된 필터) -->
<span class="tag tag--info">
  카테고리: 디자인
  <button type="button" class="tag__close" aria-label="카테고리: 디자인 제거">×</button>
</span>

<!-- 링크형 -->
<a class="tag tag--success" href="?category=ui">UI</a>
```

## 접근성 핵심

- 제거 버튼은 `aria-label="태그명 제거"` 형식으로 컨텍스트 명시
- 클릭 가능 태그는 `<button>` 또는 `<a>` 사용 (div onclick 금지)

## 파일

- 마크업: `src/snippets/tag.md`
- CSS: `src/styles/6-components/tag.css`
- 카탈로그: [krds-components.md#tag](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#tag)
