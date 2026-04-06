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

## 1. 버튼 (Button)

### 기본 마크업

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
```

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.btn--primary` | 주요 동작 (제출, 저장) |
| `.btn--secondary` | 보조 동작 |
| `.btn--outline` | 테두리만, 덜 강조 |
| `.btn--text` | 배경/테두리 없음 |
| `.btn--ghost` | 투명, 호버 시 배경 표시 |
| `.btn--link` | 링크 스타일 (밑줄) |
| `.btn--sm` | 높이 32px (min-height: 4.4rem으로 터치 영역 44px 보장), `--font-size-sm` |
| `.btn--lg` | 높이 48px, `--font-size-md` |
| `:disabled` 속성 | `opacity: 0.5`, `cursor: not-allowed` |

### 접근성

- `<button>` 태그 사용 필수. `<a>` 태그를 버튼 용도로 사용하지 않는다
- 아이콘만 있는 버튼은 반드시 `aria-label` 속성을 추가한다: `<button type="button" class="btn btn--ghost" aria-label="메뉴 열기">...</button>`
- 비활성 버튼은 `disabled` 속성을 사용한다 (`aria-disabled` 아님)
- 최소 터치 영역 44px x 44px 보장 (`.btn--sm`도 `min-height: 4.4rem` 적용)
- `focus-visible` 스타일 제공: `outline: 2px solid var(--color-primary); outline-offset: 2px`
- 링크 역할이 필요한 경우에만 `<a class="btn btn--link" href="...">` 사용
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 비활성화
- 반응형 패딩: 모바일/태블릿/PC에서 패딩이 차등 적용됨

---

## 2. 폼 (Form)

### 기본 마크업

```html
<div class="form__group">
  <label for="username" class="form__label">이름</label>
  <input type="text" id="username" class="form__input" placeholder="이름을 입력하세요">
</div>
```

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.form__group` | label + input 래퍼 |
| `.form__label` | 입력 필드 레이블 (폰트 16px, `--font-size-base`) |
| `.form__label--required` | 필수 항목 표시 (* 추가) |
| `.form__input` | 텍스트, 이메일, 패스워드 등 |
| `.form__select` | 드롭다운 선택 |
| `.form__textarea` | 여러 줄 입력 |
| `.form__checkbox` | 체크박스 + 레이블 래퍼 |
| `.form__checkbox-input` | 체크박스 입력 |
| `.form__checkbox-label` | 체크박스 텍스트 |
| `.form__radio` | 라디오 + 레이블 래퍼 |
| `.form__radio-input` | 라디오 입력 |
| `.form__radio-label` | 라디오 텍스트 |
| `.form__help` | 입력 안내 텍스트 |
| `.form__input--error` | 빨간 테두리 |
| `.form__message--error` | 빨간 에러 텍스트 |
| `.form__input--success` | 초록 테두리 |
| `.form__message--success` | 초록 성공 텍스트 |
| `:disabled` 속성 | 비활성 스타일 |
| `.form--inline` | tablet-up에서 가로 배치 |

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

- `<label for="">` 필수 연결: 모든 입력 필드에 `id`와 매칭되는 `for` 속성 필수
- 에러 상태 시 `aria-invalid="true"` + `aria-describedby="에러메시지-id"` 필수
- 에러 메시지에 `role="alert"` 추가하여 스크린리더가 즉시 읽도록 처리
- 필수 필드는 `required` 속성 + `.form__label--required` 클래스 동시 적용
- 도움말 텍스트가 있으면 `aria-describedby`로 입력 필드와 연결
- 체크박스/라디오는 `<label>` 래퍼로 감싸 클릭 영역 확대
- 비활성 필드는 `disabled` 속성 사용
- `focus-visible` 스타일 제공: `outline: 2px solid` + `outline-offset: 2px` (box-shadow가 아닌 outline 사용 -- 고대비 모드 호환)
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 비활성화
- 반응형 패딩: 모바일/태블릿/PC에서 패딩이 차등 적용됨

---

## 3. 카드 (Card)

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
| -------- | ------ |
| `.card` | 세로 레이아웃 (header/body/footer) |
| `.card--horizontal` | tablet-up에서 이미지 좌측 + 콘텐츠 우측 |
| `.card--image` | 상단 이미지 + 콘텐츠 |
| `.card--featured` | accent 테두리 강조 (2px primary) |
| `.card__header` | 상단 영역 |
| `.card__title` | 제목 |
| `.card__body` | 본문 영역 |
| `.card__text` | 본문 텍스트 |
| `.card__footer` | 하단 영역 (액션 버튼 등) |
| `.card__media` | 미디어(이미지) 래퍼 |
| `.card__image` | 이미지 요소 |

### 접근성

- `<article>` 시맨틱 태그 사용 (독립적인 콘텐츠 단위)
- 이미지에 반드시 `alt` 속성 제공 (장식용 이미지는 `alt=""`)
- 카드 제목은 적절한 heading 레벨 사용 (문서 구조에 맞게 `h2`~`h4`)
- 카드 전체가 링크인 경우 `<a>` 래퍼보다 제목에 링크를 걸고 `::after` pseudo-element로 클릭 영역 확장 권장
- 반응형 패딩: header/body/footer 영역이 모바일/태블릿/PC에서 차등 패딩

---

## 4. 테이블 (Table)

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
      <tr class="table__row">
        <td class="table__td">김영희</td>
        <td class="table__td">kim@example.com</td>
        <td class="table__td">2026-02-20</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.table` | 시맨틱 테이블 (caption + thead + tbody) |
| `.table--striped` | 짝수 행 배경색 (가독성 향상) |
| `.table--bordered` | 모든 셀 테두리 |
| `.table__wrapper` | 모바일 가로 스크롤 |
| `.table__head` | thead 스타일 |
| `.table__th` | th 스타일 (bold, nowrap) |
| `.table__body` | tbody 스타일 |
| `.table__row` | tr 스타일 |
| `.table__td` | td 스타일 |
| `.table__empty` | 데이터 없음 안내 |

### 접근성

- `<caption>` 필수 제공 (시각적으로 숨길 경우 `.sr-only` 클래스 사용)
- 헤더 셀에 `scope="col"` 또는 `scope="row"` 필수 지정
- 빈 상태 시 `<td colspan="전체컬럼수">` 안내 텍스트 제공
- 반응형 래퍼 `.table__wrapper`로 모바일 가로 스크롤 지원
- 복잡한 테이블은 `<th id="">` + `<td headers="">` 패턴 사용
- 정렬 가능한 컬럼은 `aria-sort` 속성 추가 (`ascending` / `descending` / `none`)
- 기본 폰트 16px(`--font-size-base`) 이상
- 반응형 패딩: th/td가 모바일/태블릿/PC에서 차등 패딩

---

## 5. 모달 (Modal)

### 기본 마크업

```html
<!-- 트리거 버튼 -->
<button type="button" class="btn btn--primary" data-modal-open="modal-example">
  모달 열기
</button>

<!-- 모달 -->
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

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.modal` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| `.modal__overlay` | 반투명 배경 (클릭 시 닫기) |
| `.modal__container` | 실제 대화상자 (모바일: 전체화면, tablet-up: max-width 56rem) |
| `.modal__header` | 제목 + 닫기 버튼 |
| `.modal__title` | 모달 제목 (`aria-labelledby` 타겟) |
| `.modal__body` | 본문 콘텐츠 |
| `.modal__footer` | 액션 버튼 영역 |
| `.modal__close` | 닫기 버튼 (`aria-label="닫기"`) -- 44x44px 터치 타겟 보장 |
| `.modal--active` | JS가 열 때 추가. 열림 애니메이션 트리거 |

### 접근성

- `role="dialog"` + `aria-modal="true"` 필수 지정
- `aria-labelledby`로 모달 제목 요소 연결 필수
- `aria-hidden="true"` 기본 상태, JS가 열릴 때 `"false"`로 변경
- **포커스 트랩**: 모달이 열리면 Tab/Shift+Tab이 모달 내부에서만 순환
- **ESC 닫기**: Escape 키로 모달 닫기 지원
- 모달 열릴 때 첫 번째 포커스 가능 요소에 포커스 이동
- 모달 닫힐 때 트리거 버튼으로 포커스 복귀
- `body overflow: hidden` 처리 (배경 스크롤 방지)
- 닫기 버튼에 `aria-label="닫기"` 필수 -- 44x44px 터치 타겟 보장
- 반응형: 모바일: 전체화면 / 태블릿: max-width 56rem, max-height 90vh / PC: max-height 85vh
- 열기: `data-modal-open="모달id"` 속성을 트리거 버튼에 추가
- 닫기: `data-modal-close` 속성을 닫기 버튼에 추가

---

## 6. 탭 (Tab)

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
    <button type="button" class="tab__button" role="tab"
            id="tab-3" aria-controls="panel-3" aria-selected="false" tabindex="-1">
      탭 3
    </button>
  </div>

  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <p>탭 1 콘텐츠입니다.</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <p>탭 2 콘텐츠입니다.</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    <p>탭 3 콘텐츠입니다.</p>
  </div>
</div>
```

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.tab` | 탭 전체 래퍼 |
| `.tab__list` | `role="tablist"`, 탭 버튼 목록 (모바일: 가로 스크롤) |
| `.tab__button` | `role="tab"`, 패딩 12px/20px (모바일), 반응형 확대 |
| `.tab__panel` | `role="tabpanel"`, 탭 콘텐츠 영역 |

### 접근성

- `role="tablist"` + `role="tab"` + `role="tabpanel"` WAI-ARIA 패턴 필수
- `aria-selected="true"` / `"false"`: 현재 활성 탭 표시
- `aria-controls`: 탭 버튼이 제어하는 패널 id 연결
- `aria-labelledby`: 패널이 참조하는 탭 버튼 id 연결
- 비활성 탭은 `tabindex="-1"` (키보드 탭 순서에서 제외, 화살표로만 접근)
- 비활성 패널은 `hidden` 속성으로 숨김
- `tablist`에 `aria-label` 속성으로 탭 그룹 설명 제공
- `focus-visible` 스타일: `outline: 2px solid` + `outline-offset: 2px`
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 비활성화

---

## 7. 페이지네이션 (Pagination)

### 기본 마크업

```html
<nav class="pagination" aria-label="페이지 네비게이션">
  <ul class="pagination__list">
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--prev" aria-label="이전 페이지">
        &lt;
      </a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 1">1</a>
    </li>
    <li class="pagination__item pagination__item--mobile-hidden">
      <a href="#" class="pagination__link" aria-label="페이지 2">2</a>
    </li>
    <li class="pagination__item pagination__item--mobile-hidden">
      <a href="#" class="pagination__link pagination__link--current" aria-current="page" aria-label="페이지 3">3</a>
    </li>
    <li class="pagination__item pagination__item--mobile-hidden">
      <a href="#" class="pagination__link" aria-label="페이지 4">4</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 5">5</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--next" aria-label="다음 페이지">
        &gt;
      </a>
    </li>
  </ul>
</nav>
```

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.pagination` | `<nav aria-label="페이지 네비게이션">` |
| `.pagination__list` | `<ul>` 목록 |
| `.pagination__item` | `<li>` 항목 |
| `.pagination__item--mobile-hidden` | 모바일에서 숨김, tablet-up에서 표시 |
| `.pagination__link` | `<a>` 페이지 링크 -- 최소 44x44px 터치 타겟 |
| `.pagination__link--current` | 현재 페이지 (primary 배경색) |
| `.pagination__link--prev` | "이전" 버튼 |
| `.pagination__link--next` | "다음" 버튼 |
| `.pagination__link--disabled` | 첫/마지막 페이지에서 비활성 |

### 접근성

- `<nav>` 태그 + `aria-label="페이지 네비게이션"` 필수
- 각 숫자에 `aria-label="페이지 N"` 제공
- 현재 페이지에 `aria-current="page"` 필수 지정
- 이전/다음 버튼에 `aria-label="이전 페이지"` / `aria-label="다음 페이지"` 필수
- 비활성 상태는 `<span>` + `aria-disabled="true"` 사용 (링크가 아닌 요소로 변경)
- `focus-visible` 스타일 제공: `outline: 2px solid var(--color-primary); outline-offset: 2px`
- 링크 간 간격 8px 이상 (`gap: --spacing-sm`)
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 비활성화

---

## 8. 브레드크럼 (Breadcrumb)

### 기본 마크업

```html
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item breadcrumb__item--mobile-hidden">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item breadcrumb__item--mobile-hidden">
      <a href="/category" class="breadcrumb__link">카테고리</a>
    </li>
    <li class="breadcrumb__item">
      <a href="/category/sub" class="breadcrumb__link">하위 카테고리</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">현재 페이지</span>
    </li>
  </ol>
</nav>
```

### Variant

| 클래스 | 용도 |
| -------- | ------ |
| `.breadcrumb` | `<nav aria-label="현재 위치">` |
| `.breadcrumb__list` | `<ol>` 순서 있는 목록 |
| `.breadcrumb__item` | `<li>` 항목 |
| `.breadcrumb__item--mobile-hidden` | 모바일에서 숨김, tablet-up에서 표시 |
| `.breadcrumb__link` | 이전 페이지 링크 |
| `.breadcrumb__current` | 현재 위치 (링크 아님, 텍스트) |
| CSS `::before` | `/` 구분자 (스크린리더 자동 무시) |

### 접근성

- `<nav>` 태그 + `aria-label="현재 위치"` 필수
- `<ol>` 순서 목록 사용 (경로의 계층 구조를 의미적으로 표현)
- 현재 위치 항목에 `aria-current="page"` 필수 지정
- 현재 위치는 링크가 아닌 `<span>` 사용 (이동할 수 없는 현재 페이지)
- 구분자는 CSS `::before` pseudo-element로 처리 (스크린리더에서 자동 무시)
- `<ol>` 목록이므로 스크린리더가 "N개 항목 중 M번째"로 읽어줌
- 모바일에서 `.breadcrumb__item--mobile-hidden`으로 상위 경로 숨김 (마지막 2단계만 표시)
- 아이템 간 간격 8px 이상 (`gap: --spacing-sm`)
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 비활성화
- 태블릿 이상에서 폰트 사이즈 16px(`--font-size-base`)로 상향
````
