---
title: 조합 패턴
order: 11
layout: layouts/page.njk
section: components
tags: component
---

개별 컴포넌트를 조합하여 실제 화면을 구성하는 패턴입니다. 모달+폼, 카드 그리드+페이지네이션, 검색+테이블 등 실무에서 자주 사용하는 조합을 정리합니다.

---

## 1. 모달 + 폼

### 사용 시나리오

회원가입, 로그인, 데이터 입력 등 사용자에게 폼 입력을 요청할 때 모달 안에 폼을 배치합니다. 모달의 포커스 트랩이 폼 필드 간 탭 이동에도 적용되므로 접근성이 자연스럽게 보장됩니다.

### 미리보기

<div class="preview">
  <div class="preview__frame">
    <iframe
      src="/playground/combo-modal-form.html"
      title="모달 + 폼 조합 패턴 미리보기"
      height="400"
      loading="lazy"
      class="preview__iframe"
    ></iframe>
  </div>
</div>

### 핵심 마크업

```html
<!-- 트리거 버튼 -->
<button type="button" class="btn btn--primary" data-modal-open="modal-signup">회원가입</button>

<!-- 모달 안에 폼 배치 -->
<div class="modal" id="modal-signup" role="dialog" aria-modal="true"
     aria-labelledby="modal-signup-title" hidden>
  <div class="modal__overlay"></div>
  <div class="modal__content modal__content--medium">
    <header class="modal__header">
      <h2 class="modal__title" id="modal-signup-title">회원가입</h2>
      <button type="button" class="modal__close" aria-label="닫기" data-modal-close>&times;</button>
    </header>
    <div class="modal__body">
      <form id="signup-form">
        <div class="form-field">
          <label class="form-field__label" for="signup-name">
            이름<span class="form-field__required" aria-label="필수">*</span>
          </label>
          <input type="text" id="signup-name" class="input" placeholder="이름을 입력하세요" required aria-required="true">
        </div>
        <div class="form-field">
          <label class="form-field__label" for="signup-email">
            이메일<span class="form-field__required" aria-label="필수">*</span>
          </label>
          <input type="email" id="signup-email" class="input" placeholder="이메일을 입력하세요" required aria-required="true">
        </div>
        <div class="form-field">
          <label class="form-field__label" for="signup-password">
            비밀번호<span class="form-field__required" aria-label="필수">*</span>
          </label>
          <p id="signup-password-hint" class="form-field__hint">8자 이상, 영문+숫자 조합</p>
          <input type="password" id="signup-password" class="input" placeholder="비밀번호를 입력하세요"
            required aria-required="true" aria-describedby="signup-password-hint">
        </div>
      </form>
    </div>
    <footer class="modal__footer">
      <button type="button" class="btn btn--secondary" data-modal-close>취소</button>
      <button type="submit" class="btn btn--primary" form="signup-form">가입하기</button>
    </footer>
  </div>
</div>
```

### 조합 포인트

| 항목 | 설명 |
|------|------|
| 닫힌 상태 | 모달은 `hidden` 속성으로 시작하고, 열 때 `hidden`을 걷어 낸다 |
| 포커스 트랩 | `modal.js`가 Tab 키를 모달 내부 폼 필드에서 순환시킴 |
| ESC 닫기 | 폼 작성 중 ESC로 모달 닫기 가능 |
| `aria-labelledby` | 모달 제목이 폼의 맥락을 스크린리더에 전달 |
| 필수 입력 | `form-field__required` 표시(`*`) + `required` + `aria-required="true"` 조합 |
| 보조설명 | `form-field__hint`를 `aria-describedby`로 입력 필드에 연결 |
| 푸터 제출 버튼 | 버튼이 `<form>` 밖(`modal__footer`)에 있으므로 `form="signup-form"`으로 폼에 연결 |

---

## 2. 카드 그리드 + 페이지네이션

### 사용 시나리오

프로젝트 목록, 게시판 카드 뷰, 상품 목록 등 여러 카드를 그리드로 배치하고 페이지 단위로 탐색하는 패턴입니다. 카드는 모바일 1열, 태블릿 2열, PC 3열로 배치합니다. 공통 grid 오브젝트가 없으므로 열 수와 간격은 프로젝트 레이아웃 CSS에서 지정합니다.

### 미리보기

<div class="preview">
  <div class="preview__frame">
    <iframe
      src="/playground/combo-card-grid.html"
      title="카드 그리드 + 페이지네이션 조합 패턴 미리보기"
      height="700"
      loading="lazy"
      class="preview__iframe"
    ></iframe>
  </div>
</div>

### 핵심 마크업

```html
<!-- 카드 그리드 (모바일 1열, 태블릿 2열, PC 3열)
     공통 grid 오브젝트가 없다. 이 부모 div에 프로젝트 레이아웃 CSS에서 정의한
     그리드 클래스를 붙여 열 수와 간격을 지정한다. 붙이기 전에는 카드가 한 열로 쌓인다. -->
<div>
  <article class="card">
    <header class="card__header">
      <h3 class="card__title">프로젝트 A</h3>
    </header>
    <div class="card__body">
      <p>홈페이지 리뉴얼 프로젝트입니다. 디자인 시스템 적용 예정.</p>
    </div>
    <footer class="card__footer">
      <button type="button" class="btn btn--secondary">상세보기</button>
    </footer>
  </article>
  <!-- 카드 반복 -->
</div>

<!-- 페이지네이션 -->
<nav class="pagination" aria-label="프로젝트 목록 페이지 탐색">
  <button type="button" class="pagination__nav" aria-label="이전 페이지" disabled>‹</button>
  <ol class="pagination__list">
    <li><a class="pagination__item" href="?page=1"
      aria-current="page" aria-label="1페이지">1</a></li>
    <li><a class="pagination__item" href="?page=2" aria-label="2페이지">2</a></li>
    <li><a class="pagination__item" href="?page=3" aria-label="3페이지">3</a></li>
  </ol>
  <button type="button" class="pagination__nav" aria-label="다음 페이지">›</button>
</nav>
```

### 조합 포인트

| 항목 | 설명 |
|------|------|
| 반응형 배치 | 모바일 1열 → 태블릿(768px 이상) 2열 → PC(1280px 이상) 3열. 카드 부모에 프로젝트 레이아웃 CSS의 그리드 클래스를 붙여 지정한다(공통 grid 오브젝트 없음) |
| 미리보기 배치 | 미리보기 화면의 `pg__card-grid`는 플레이그라운드 전용이라 프로젝트 코드로 옮기지 않는다 |
| 카드 구조 | `header.card__header` → `div.card__body`(본문은 클래스 없는 `<p>`) → `footer.card__footer` |
| `aria-label` | 페이지네이션에 "프로젝트 목록" 맥락 명시 |
| 현재 페이지 | `aria-current="page"`만 — CSS가 이 속성으로 표시한다(R-17). 상태 modifier를 덧붙이지 않는다 |
| 첫 페이지 비활성 | 이전 버튼(`pagination__nav`)에 `disabled` |

---

## 3. 검색 폼 + 테이블 + 브레드크럼

### 사용 시나리오

관리자 페이지에서 가장 흔한 패턴입니다. 브레드크럼으로 현재 위치를 알려주고, 검색 폼으로 필터링한 결과를 테이블로 표시합니다. 공공기관 사이트의 목록 조회 화면에 바로 적용할 수 있습니다.

### 미리보기

<div class="preview">
  <div class="preview__frame">
    <iframe
      src="/playground/combo-search-table.html"
      title="검색 폼 + 테이블 + 브레드크럼 조합 패턴 미리보기"
      height="600"
      loading="lazy"
      class="preview__iframe"
    ></iframe>
  </div>
</div>

### 핵심 마크업

```html
<!-- 브레드크럼 -->
<nav class="breadcrumb" aria-label="브레드크럼">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="/">홈</a></li>
    <li class="breadcrumb__item"><a href="/admin">관리</a></li>
    <li class="breadcrumb__item" aria-current="page">사용자 목록</li>
  </ol>
</nav>

<!-- 검색 폼 -->
<form role="search" aria-label="사용자 검색">
  <div class="form-field">
    <label class="form-field__label" for="search-keyword">검색어</label>
    <input type="text" id="search-keyword" class="input" placeholder="이름 또는 이메일 검색">
  </div>
  <div class="form-field">
    <label class="form-field__label" for="search-category">카테고리</label>
    <select id="search-category" class="select">
      <option value="">전체</option>
      <option value="admin">관리자</option>
      <option value="editor">편집자</option>
      <option value="viewer">뷰어</option>
    </select>
  </div>
  <button type="submit" class="btn btn--primary">검색</button>
</form>

<!-- 결과 테이블 -->
<div class="table-wrap" tabindex="0" role="region" aria-labelledby="user-list-caption">
  <table class="table table--striped">
    <caption class="table__caption" id="user-list-caption">사용자 목록</caption>
    <thead>
      <tr>
        <th scope="col">이름</th>
        <th scope="col">이메일</th>
        <th scope="col">역할</th>
        <th scope="col">가입일</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>홍길동</td>
        <td>hong@example.com</td>
        <td>관리자</td>
        <td>2025-01-15</td>
      </tr>
      <!-- 행 반복 -->
    </tbody>
  </table>
</div>
```

### 조합 포인트

| 항목 | 설명 |
|------|------|
| 브레드크럼 위치 | 검색 폼 상단에 배치하여 현재 페이지 맥락 제공. `nav`의 구획 제목은 KRDS대로 `aria-label="브레드크럼"` |
| 현재 위치 | 마지막 `breadcrumb__item`에 `aria-current="page"` — 링크 없이 텍스트만 |
| `role="search"` | 검색 폼에 랜드마크 역할 부여 |
| `table--striped` | 행 구분을 위한 줄무늬 테이블 Modifier |
| `table-wrap` | 모바일 가로 스크롤 대응. `tabindex="0"` + `role="region"` + `aria-labelledby`(caption `id`)로 키보드 스크롤과 영역 이름을 준다 |
| `table__caption` | 표 제목을 화면과 스크린리더에 함께 전달 |
