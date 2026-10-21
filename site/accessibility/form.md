---
title: 폼
order: 6
---

# 폼 접근성 가이드

> 스니펫 코드는 `src/snippets/form.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `for` / `id` | `<label>` + `<input>` | 매칭 id 값 | label 클릭 시 입력 필드 포커스. 스크린리더가 필드 이름을 읽음 |
| `aria-invalid` | 유효성 실패 입력 필드 | `true` | 스크린리더가 "잘못된 항목" 상태를 전달 |
| `aria-describedby` | 도움말/에러 연결 입력 필드 | 도움말 요소 id | 입력 필드에 포커스 시 추가 설명을 읽어줌 |
| `aria-required` | 필수 입력 필드 | `true` | HTML `required`와 함께 사용. 일부 스크린리더에서 보완적으로 인식 |
| `role="alert"` | 에러 메시지 | - | 동적으로 나타나는 에러를 스크린리더가 즉시 읽도록 함 |
| `role="group"` | 관련 입력 그룹 | - | `<fieldset>`을 사용할 수 없는 경우 대체 |

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Tab` | 다음 입력 필드/버튼으로 이동 |
| `Shift+Tab` | 이전 입력 필드/버튼으로 이동 |
| `Space` | 체크박스 토글, 라디오 선택 |
| `ArrowUp` / `ArrowDown` | 라디오 그룹 내 항목 이동, `<select>` 옵션 이동 |
| `Enter` | 폼 제출 (submit 버튼이 있는 경우) |
| `Escape` | select 드롭다운 닫기 |

## label-input 연결의 중요성

**왜 필수인가:** label이 연결되지 않은 입력 필드는 스크린리더가 "편집 가능한 텍스트"로만 읽는다. 사용자는 무엇을 입력해야 하는지 알 수 없다.

**placeholder는 label 대체가 불가능하다:** placeholder는 입력 시 사라지고, 일부 스크린리더에서 읽히지 않으며, 색상 대비가 낮아 저시력 사용자에게 불리하다.

## Do / Don't

### Do (올바른 예)

```html
<!-- 에러 상태: aria-invalid + aria-describedby(보조설명 + 에러) + role="alert" -->
<div class="form-field">
  <label for="email" class="form-field__label">
    이메일<span class="form-field__required" aria-label="필수">*</span>
  </label>
  <p id="email-hint" class="form-field__hint">예: hong@example.com</p>
  <input type="email" id="email" class="input input--error"
         aria-invalid="true" aria-describedby="email-hint email-error" required>
  <p id="email-error" class="form-field__message form-field__message--error" role="alert">
    올바른 이메일 형식을 입력해 주세요
  </p>
</div>

<!-- 라디오 그룹: fieldset + legend -->
<fieldset>
  <legend class="form-field__label">결제 방법</legend>
  <label class="radio">
    <input type="radio" name="payment" value="card">
    <span class="radio__box" aria-hidden="true"></span>
    <span class="radio__label">카드 결제</span>
  </label>
  <label class="radio">
    <input type="radio" name="payment" value="bank">
    <span class="radio__box" aria-hidden="true"></span>
    <span class="radio__label">계좌이체</span>
  </label>
</fieldset>
```

### Don't (잘못된 예)

```html
<!-- 금지 예시: label 없이 placeholder만 사용 -->
<input type="text" class="input" placeholder="이름을 입력하세요">

<!-- 금지 예시: 에러 상태를 빨간 테두리(input--error)로만 표시
     aria-invalid가 없고 메시지가 aria-describedby로 연결되지 않아 스크린리더는 오류를 모른다 -->
<div class="form-field">
  <label for="email-bad" class="form-field__label">이메일</label>
  <input type="email" id="email-bad" class="input input--error">
  <p class="form-field__message form-field__message--error">잘못된 이메일</p>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 5.3.3 | 명확한 지시사항 제공 | 입력 형식 안내(예: "YYYY-MM-DD")를 색상/위치 외 텍스트로 제공하는지 확인 |
| 5.4.1 | 색에 무관한 콘텐츠 인식 | 에러/성공 상태를 색상만이 아닌 아이콘+텍스트로 구분하는지 확인 |
| 6.1.1 | 키보드 사용 보장 | Tab 키로 모든 입력 필드 순회 가능한지 확인 |
| 6.5.3 | 레이블과 네임 | 시각적 label 텍스트와 `<label>` 연결이 일치하는지 확인 |
| 7.2.1 | 사용자 요구에 따른 실행 | 입력 값 변경만으로 자동 제출되지 않는지 확인 (submit 버튼 필수) |
| 7.3.1 | 오류 정정 | 에러 메시지가 문제와 수정 방법을 함께 안내하는지 확인 |
| 7.3.2 | 레이블 제공 | 모든 입력 필드에 `<label for="...">`가 연결되어 있는지 확인 |
