---
title: 스크린리더 전용
order: 4
---

# 스크린리더 전용 콘텐츠 (.sr-only) 패턴 가이드

> CSS 유틸리티 코드는 `src/scss/7-utilities/_sr-only.scss` 참조.

## .sr-only 클래스란

`.sr-only`는 콘텐츠를 시각적으로 화면에서 숨기되, 스크린리더는 정상적으로 읽을 수 있도록 하는 CSS 패턴이다. `display: none`이나 `visibility: hidden`과 달리, 보조 기술(스크린리더)에게는 콘텐츠가 존재하는 것으로 인식된다.

**핵심 원리:** 요소를 1px x 1px 크기로 줄이고, `overflow: hidden` + `clip`으로 시각적 렌더링을 제거한다. `position: absolute`로 레이아웃에 영향을 주지 않으면서 DOM에는 남아 있다.

## 사용 시나리오

### 1. 아이콘 버튼의 텍스트 레이블

아이콘만 있는 버튼은 스크린리더가 내용을 전달할 수 없다. `.sr-only`로 텍스트 레이블을 추가한다.

```html
<button type="button" class="btn btn--ghost">
  <svg aria-hidden="true"><!-- 검색 아이콘 --></svg>
  <span class="sr-only">검색</span>
</button>
```

**왜 `aria-label` 대신 `.sr-only`를 쓰는가:**
- `aria-label`도 동일한 결과를 제공하지만, `.sr-only`는 자동 번역 도구(Google Translate 등)가 텍스트를 감지하여 번역할 수 있다
- 두 방식 모두 허용되지만, 다국어 사이트에서는 `.sr-only`가 유리하다
- 이 프로젝트에서는 `aria-label`을 기본으로 사용하되, 다국어 지원이 필요한 경우 `.sr-only`를 선택한다

### 2. 테이블 캡션

디자인에서 테이블 위에 별도 제목이 있어 `<caption>`을 시각적으로 표시할 필요가 없을 때 사용한다.

```html
<table class="table">
  <caption class="sr-only">2024년 분기별 매출 현황</caption>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

**왜 필요한가:** `<caption>`을 아예 생략하면 스크린리더 사용자가 테이블의 목적을 파악할 수 없다. 시각적으로 숨기되 접근성 정보는 유지해야 한다.

### 3. 건너뛰기 링크

본문 바로가기 링크는 평소 숨겨져 있다가 포커스 시에만 나타난다. 이 경우 `.sr-only`와 유사하지만 포커스 시 표시되는 별도 패턴(`.skip-to-content`)을 사용한다.

```html
<a href="#main-content" class="skip-to-content">본문 바로가기</a>
```

**주의:** 건너뛰기 링크에는 `.sr-only`를 직접 사용하지 않는다. 포커스 시 시각적으로 나타나야 하므로 `:focus` 상태에서 위치/크기를 복원하는 별도 스타일이 필요하다.

### 4. 상태 변경 알림

동적으로 변경되는 콘텐츠를 스크린리더에게 알릴 때 `aria-live` 영역과 조합한다.

```html
<div aria-live="polite" class="sr-only" id="status-message">
  <!-- JS가 동적으로 텍스트 삽입 -->
</div>
```

```javascript
// 장바구니에 상품 추가 시
document.getElementById('status-message').textContent = '장바구니에 상품이 추가되었습니다'
```

### 5. 폼 필수 항목 안내

필수 표시(`*`)의 의미를 시각 장애 사용자에게 전달한다.

```html
<p class="sr-only">* 표시는 필수 입력 항목입니다</p>

<label for="name" class="form__label form__label--required">
  이름
</label>
<input type="text" id="name" class="form__input" required>
```

### 6. 링크/버튼의 추가 맥락

동일한 텍스트("더보기")를 가진 링크가 여러 개일 때 맥락을 추가한다.

```html
<a href="/news/more">
  더보기 <span class="sr-only">뉴스 목록</span>
</a>

<a href="/events/more">
  더보기 <span class="sr-only">이벤트 목록</span>
</a>
```

## Do / Don't

### Do

- 아이콘만 있는 버튼/링크에 `.sr-only` 텍스트 제공
- 시각적으로 불필요하지만 접근성에 필수인 정보(caption, 안내문)에 사용
- `aria-live` 영역과 조합하여 동적 상태 알림에 활용
- 중복되지 않는 맥락 정보를 추가할 때 사용

### Don't

- `display: none`이나 `visibility: hidden`을 `.sr-only` 대신 사용하지 않는다 (스크린리더도 읽지 못한다)
- `aria-hidden="true"`와 `.sr-only`를 같은 요소에 동시 적용하지 않는다 (서로 모순)
- 이미 있는 정보를 `.sr-only`로 중복 추가하지 않는다
- 대량의 텍스트를 `.sr-only`로 숨기지 않는다

## CSS 구현

`src/scss/7-utilities/_sr-only.scss`에 구현되어 있다.

```scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 관련 KWCAG 항목

| 항목 번호 | 항목명 | .sr-only와의 관계 |
|-----------|--------|------------------|
| 5.1.1 | 적절한 대체 텍스트 제공 | 아이콘 버튼, 이미지 등의 대체 텍스트를 `.sr-only`로 제공 |
| 5.3.1 | 표의 구성 | 테이블 `<caption>`을 `.sr-only`로 숨김 처리 |
| 6.4.1 | 반복 영역 건너뛰기 | 건너뛰기 링크에 유사 패턴 적용 |
| 6.4.3 | 적절한 링크 텍스트 | "더보기" 등 모호한 링크에 `.sr-only`로 맥락 추가 |
