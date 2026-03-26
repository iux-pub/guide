---
title: 컴포넌트 스니펫 프롬프트
order: 5
---

## 대상 AI 도구

Cursor, Copilot, Windsurf, Claude Code, ChatGPT, v0

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# 컴포넌트 스니펫 프롬프트

> **목적:** AI 도구에 인포마인드 UX팀 컴포넌트 HTML 마크업과 접근성 패턴을 제공하기 위한 프롬프트
> **대상 AI:** Cursor, Copilot, Windsurf, Claude Code, ChatGPT, v0

---

## 1. 버튼 (btn)

### 기본 마크업

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
```

### Variant

| 클래스 | 용도 |
|--------|------|
| `.btn--primary` | 주요 동작 (제출, 저장) |
| `.btn--secondary` | 보조 동작 |
| `.btn--outline` | 테두리만, 덜 강조 |
| `.btn--text` | 배경/테두리 없음 |
| `.btn--ghost` | 투명, 호버 시 배경 |
| `.btn--link` | 링크 스타일 (밑줄) |
| `.btn--sm` | 작은 크기 (높이 32px, 터치 44px 보장) |
| `.btn--lg` | 큰 크기 (높이 48px) |

### 접근성

- `<button>` 태그 사용 필수. `<a>` 태그를 버튼 용도로 사용하지 않는다
- 아이콘만 있는 버튼: `aria-label` 필수 -- `<button type="button" class="btn btn--ghost" aria-label="메뉴 열기">...</button>`
- 비활성: `disabled` 속성 사용
- 최소 터치 영역 44px x 44px 보장
- `focus-visible`: `outline: 2px solid var(--color-primary); outline-offset: 2px`

---

## 2. 폼 (form)

### 기본 마크업

```html
<div class="form__group">
  <label for="username" class="form__label">이름</label>
  <input type="text" id="username" class="form__input" placeholder="이름을 입력하세요">
</div>
```

### Variant

| 클래스 | 용도 |
|--------|------|
| `.form__group` | label + input 래퍼 |
| `.form__label` | 레이블 |
| `.form__label--required` | 필수 항목 (`*` 표시) |
| `.form__input` | 텍스트 입력 |
| `.form__input--error` | 에러 상태 (빨간 테두리) |
| `.form__input--success` | 성공 상태 (초록 테두리) |
| `.form__select` | 드롭다운 |
| `.form__textarea` | 여러 줄 입력 |
| `.form__checkbox` | 체크박스 래퍼 |
| `.form__radio` | 라디오 래퍼 |
| `.form__help` | 도움말 텍스트 |
| `.form__message--error` | 에러 메시지 |
| `.form__message--success` | 성공 메시지 |
| `.form--inline` | 가로 배치 (tablet-up) |

### 에러 상태 마크업

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

### 접근성

- `<label for="">` 필수 연결
- 에러: `aria-invalid="true"` + `aria-describedby` + `role="alert"`
- 필수: `required` 속성 + `.form__label--required`
- 체크박스/라디오는 `<label>` 래퍼로 감싸 클릭 영역 확대
- placeholder만으로 레이블 대체를 금지한다

---

## 3. 카드 (card)

### 기본 마크업

```html
<article class="card">
  <div class="card__header">
    <h3 class="card__title">카드 제목</h3>
  </div>
  <div class="card__body">
    <p class="card__text">카드 본문 텍스트입니다.</p>
  </div>
  <div class="card__footer">
    <button type="button" class="btn btn--primary">확인</button>
  </div>
</article>
```

### Variant

| 클래스 | 용도 |
|--------|------|
| `.card` | 기본 세로 레이아웃 |
| `.card--horizontal` | 가로형 (tablet-up: 이미지 좌측 + 콘텐츠 우측) |
| `.card--image` | 상단 이미지 + 콘텐츠 |
| `.card--featured` | accent 테두리 강조 |
| `.card__header` | 상단 영역 |
| `.card__title` | 제목 |
| `.card__body` | 본문 영역 |
| `.card__text` | 본문 텍스트 |
| `.card__footer` | 하단 영역 |
| `.card__media` | 이미지 래퍼 |
| `.card__image` | 이미지 요소 |

### 접근성

- `<article>` 시맨틱 태그 사용
- 이미지에 `alt` 속성 필수 (장식용은 `alt=""`)
- 적절한 heading 레벨 사용 (문서 구조에 맞게)

---

## 4. 테이블 (table)

### 기본 마크업

```html
<div class="table__wrapper">
  <table class="table">
    <caption class="sr-only">회원 목록</caption>
    <thead class="table__head">
      <tr>
        <th class="table__th" scope="col">이름</th>
        <th class="table__th" scope="col">이메일</th>
        <th class="table__th" scope="col">가입일</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__td">홍길동</td>
        <td class="table__td">hong@example.com</td>
        <td class="table__td">2026-01-15</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Variant

| 클래스 | 용도 |
|--------|------|
| `.table` | 기본 테이블 |
| `.table--striped` | 줄무늬 (짝수 행 배경색) |
| `.table--bordered` | 모든 셀 테두리 |
| `.table__wrapper` | 모바일 가로 스크롤 래퍼 |
| `.table__head` | thead |
| `.table__th` | th (bold, nowrap) |
| `.table__body` | tbody |
| `.table__row` | tr |
| `.table__td` | td |
| `.table__empty` | 데이터 없음 안내 |

### 접근성

- `<caption>` 필수 (시각 숨김 가능: `.sr-only`)
- `<th scope="col">` 또는 `scope="row"` 필수
- 빈 상태: `<td colspan="전체컬럼수">` 안내 텍스트
- 정렬 가능 컬럼: `aria-sort` 속성 추가

---

## 5. 모달 (modal)

### 기본 마크업

```html
<button type="button" class="btn btn--primary" data-modal-open="modal-example">
  모달 열기
</button>

<div class="modal" id="modal-example" role="dialog" aria-modal="true"
     aria-labelledby="modal-example-title" aria-hidden="true">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 class="modal__title" id="modal-example-title">모달 제목</h2>
      <button type="button" class="modal__close" data-modal-close aria-label="닫기">
        &times;
      </button>
    </div>
    <div class="modal__body">
      <p>모달 본문 콘텐츠입니다.</p>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn btn--secondary" data-modal-close>취소</button>
      <button type="button" class="btn btn--primary">확인</button>
    </div>
  </div>
</div>
```

### 접근성

- `role="dialog"` + `aria-modal="true"` 필수
- `aria-labelledby`로 모달 제목 연결 필수
- `aria-hidden="true"` 기본, JS가 열릴 때 `"false"`로 변경
- **포커스 트랩:** Tab/Shift+Tab이 모달 내부에서만 순환
- **ESC 닫기:** Escape 키 지원
- 열릴 때 첫 번째 포커스 가능 요소에 포커스 이동
- 닫힐 때 트리거 버튼으로 포커스 복귀
- 닫기 버튼에 `aria-label="닫기"` 필수

---

## 6. 탭 (tab)

### 기본 마크업

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="콘텐츠 탭">
    <button type="button" class="tab__button" role="tab"
            id="tab-1" aria-controls="panel-1" aria-selected="true" tabindex="0">
      탭 1
    </button>
    <button type="button" class="tab__button" role="tab"
            id="tab-2" aria-controls="panel-2" aria-selected="false" tabindex="-1">
      탭 2
    </button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <p>탭 1 콘텐츠입니다.</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <p>탭 2 콘텐츠입니다.</p>
  </div>
</div>
```

### 접근성

- `role="tablist"` + `role="tab"` + `role="tabpanel"` 필수
- `aria-selected="true/false"` 활성 상태 표시
- `aria-controls`로 탭-패널 연결
- `aria-labelledby`로 패널-탭 연결
- 비활성 탭: `tabindex="-1"`, 비활성 패널: `hidden`
- 키보드: ArrowRight/ArrowLeft로 탭 이동, Home/End로 첫번째/마지막

---

## 7. 페이지네이션 (pagination)

### 기본 마크업

```html
<nav class="pagination" aria-label="페이지 네비게이션">
  <ul class="pagination__list">
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--prev" aria-label="이전 페이지">&lt;</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 1">1</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--current"
         aria-current="page" aria-label="페이지 2">2</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 3">3</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--next" aria-label="다음 페이지">&gt;</a>
    </li>
  </ul>
</nav>
```

### Variant

| 클래스 | 용도 |
|--------|------|
| `.pagination` | Block (`<nav aria-label>`) |
| `.pagination__list` | 목록 |
| `.pagination__item` | 항목 |
| `.pagination__item--mobile-hidden` | 모바일 숨김 |
| `.pagination__link` | 페이지 링크 |
| `.pagination__link--current` | 현재 페이지 |
| `.pagination__link--prev` | 이전 버튼 |
| `.pagination__link--next` | 다음 버튼 |
| `.pagination__link--disabled` | 비활성 |

### 접근성

- `<nav>` + `aria-label="페이지 네비게이션"` 필수
- 각 숫자에 `aria-label="페이지 N"` 제공
- 현재 페이지에 `aria-current="page"` 필수
- 비활성: `<span>` + `aria-disabled="true"` (링크가 아닌 요소)

---

## 8. 브레드크럼 (breadcrumb)

### 기본 마크업

```html
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item">
      <a href="/category" class="breadcrumb__link">카테고리</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">현재 페이지</span>
    </li>
  </ol>
</nav>
```

### Variant

| 클래스 | 용도 |
|--------|------|
| `.breadcrumb` | Block (`<nav aria-label>`) |
| `.breadcrumb__list` | 순서 목록 (`<ol>`) |
| `.breadcrumb__item` | 항목 |
| `.breadcrumb__item--mobile-hidden` | 모바일 숨김 |
| `.breadcrumb__link` | 링크 |
| `.breadcrumb__current` | 현재 위치 (텍스트, 링크 아님) |

### 접근성

- `<nav>` + `aria-label="현재 위치"` 필수
- `<ol>` 순서 목록 사용 (계층 구조 의미 표현)
- 현재 위치: `aria-current="page"`, `<span>` 사용 (링크 아님)
- 구분자는 CSS `::before`로 처리 (스크린리더 자동 무시)
````
