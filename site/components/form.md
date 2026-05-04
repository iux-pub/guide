---
title: 폼 필드
order: 4
playground_src: /playground/form.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/form.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#form)에 있다.

## 기본 마크업

```html
<div class="form-field">
  <label for="name" class="form-field__label">
    이름<span class="form-field__required" aria-label="필수">*</span>
  </label>
  <p class="form-field__hint">사업자등록증에 기재된 대표자명</p>
  <input type="text" id="name" class="input" placeholder="홍길동" required>
  <p class="form-field__message">최대 20자까지 입력 가능합니다</p>
</div>
```

## 접근성 핵심

- `<label for="id">` + `<input id="id">` 연결 필수
- 필수 항목은 `required` 속성 + 시각 표시(`*`)
- 에러는 `aria-invalid="true"` + `aria-describedby="에러메시지id"`
- 보조설명은 `aria-describedby`로 연결 권장
- placeholder만으로 레이블 대체 금지

## 파일

- 마크업: `src/snippets/form.md`
- CSS: `src/styles/6-components/form.css`
- 카탈로그: [krds-components.md#form](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#form)
