---
title: 셀렉트
order: 5
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/select.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#select)에 있다.

## 기본 마크업

```html
<div class="form-field">
  <label for="category" class="form-field__label">카테고리</label>
  <select id="category" class="select">
    <option value="">선택하세요</option>
    <option value="a">옵션 A</option>
    <option value="b">옵션 B</option>
  </select>
</div>
```

## 접근성 핵심

- 첫 옵션은 `<option value="">선택하세요</option>` 같은 placeholder 권장
- `<label for>` + `<select id>` 연결 필수
- 옵션 텍스트는 명확하고 간결하게

## 파일

- 마크업: `src/snippets/select.md`
- CSS: `src/styles/6-components/select.css`
- 카탈로그: [krds-components.md#select](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#select)
