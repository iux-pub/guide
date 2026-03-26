---
title: 폼
order: 2
playground_src: /playground/form.html
preview_height: 800
---

## 기본 마크업

```html
<div class="form__group">
  <label for="username" class="form__label">이름</label>
  <input type="text" id="username" class="form__input" placeholder="이름을 입력하세요">
</div>
```

## Variant 목록

| Element/Variant | 클래스 | 용도 |
|-----------------|--------|------|
| 폼 그룹 | `.form__group` | label + input 래퍼 |
| 레이블 | `.form__label` | 입력 필드 레이블 |
| 필수 레이블 | `.form__label--required` | 필수 항목 표시 |
| Input | `.form__input` | 텍스트, 이메일, 패스워드 등 |
| Select | `.form__select` | 드롭다운 선택 |
| Textarea | `.form__textarea` | 여러 줄 입력 |
| Checkbox | `.form__checkbox` | 체크박스 + 레이블 래퍼 |
| Radio | `.form__radio` | 라디오 + 레이블 래퍼 |
| 도움말 | `.form__help` | 입력 안내 텍스트 |
| Error 상태 | `.form__input--error` | 빨간 테두리 |
| Error 메시지 | `.form__message--error` | 빨간 에러 텍스트 |
| Success 상태 | `.form__input--success` | 초록 테두리 |
| Disabled | `:disabled` 속성 | 비활성 스타일 |

## 필수 입력 필드

```html
<div class="form__group">
  <label for="email" class="form__label form__label--required">이메일</label>
  <input type="email" id="email" class="form__input" required placeholder="이메일을 입력하세요">
</div>
```

## 에러 상태

```html
<div class="form__group">
  <label for="password" class="form__label form__label--required">비밀번호</label>
  <input type="password" id="password" class="form__input form__input--error"
         aria-invalid="true" aria-describedby="password-error" required>
  <span id="password-error" class="form__message form__message--error" role="alert">
    비밀번호는 8자 이상이어야 합니다.
  </span>
</div>
```

## Select

```html
<div class="form__group">
  <label for="category" class="form__label">카테고리</label>
  <select id="category" class="form__select">
    <option value="">선택하세요</option>
    <option value="1">카테고리 1</option>
    <option value="2">카테고리 2</option>
  </select>
</div>
```

## Checkbox / Radio

```html
<!-- 체크박스 -->
<label class="form__checkbox">
  <input type="checkbox" class="form__checkbox-input" id="agree">
  <span class="form__checkbox-label">이용약관에 동의합니다</span>
</label>

<!-- 라디오 -->
<label class="form__radio">
  <input type="radio" class="form__radio-input" name="gender" value="male" id="male">
  <span class="form__radio-label">남성</span>
</label>
```

## 접근성 주의사항

- `<label for="">` 필수 연결: 모든 입력 필드에 `id`와 매칭되는 `for` 속성 필수
- 에러 상태 시 `aria-invalid="true"` + `aria-describedby` 필수
- 에러 메시지에 `role="alert"` 추가
- 필수 필드는 `required` 속성 + `.form__label--required` 동시 적용
- 체크박스/라디오는 `<label>` 래퍼로 감싸 클릭 영역 확대

## SCSS 파일

`src/scss/6-components/_form.scss`

## 관련 문서

- [피그마 컴포넌트 네이밍](/figma/component-naming/) -- 피그마에서의 폼 네이밍 규칙과 BEM 매핑
- [접근성: 폼](/accessibility/form/) -- 폼 접근성 가이드
