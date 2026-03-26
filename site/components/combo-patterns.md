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

<div class="preview" style="margin-bottom: 2.4rem">
  <iframe
    src="/playground/combo-modal-form.html"
    title="모달 + 폼 조합 패턴 미리보기"
    style="width: 100%; height: 400px; border: 1px solid var(--color-border-light); border-radius: var(--radius-base)"
    loading="lazy"
  ></iframe>
</div>

### 핵심 마크업

```html
<!-- 트리거 버튼 -->
<button type="button" class="btn btn--primary" data-modal-open="modal-signup">회원가입</button>

<!-- 모달 안에 폼 배치 -->
<div class="modal" id="modal-signup" role="dialog" aria-modal="true"
     aria-labelledby="modal-signup-title" aria-hidden="true">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 class="modal__title" id="modal-signup-title">회원가입</h2>
      <button type="button" class="modal__close" data-modal-close aria-label="닫기">&times;</button>
    </div>
    <div class="modal__body">
      <form>
        <div class="form__group">
          <label class="form__label form__label--required" for="signup-name">이름</label>
          <input type="text" id="signup-name" class="form__input" required aria-required="true">
        </div>
        <div class="form__group">
          <label class="form__label form__label--required" for="signup-email">이메일</label>
          <input type="email" id="signup-email" class="form__input" required aria-required="true">
        </div>
        <div class="form__group">
          <label class="form__label form__label--required" for="signup-password">비밀번호</label>
          <input type="password" id="signup-password" class="form__input" required aria-required="true">
          <span class="form__help">8자 이상, 영문+숫자 조합</span>
        </div>
      </form>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn btn--outline" data-modal-close>취소</button>
      <button type="submit" class="btn btn--primary">가입하기</button>
    </div>
  </div>
</div>
```

### 조합 포인트

| 항목 | 설명 |
|------|------|
| 포커스 트랩 | `modal.js`가 Tab 키를 모달 내부 폼 필드에서 순환시킴 |
| ESC 닫기 | 폼 작성 중 ESC로 모달 닫기 가능 |
| `aria-labelledby` | 모달 제목이 폼의 맥락을 스크린리더에 전달 |
| 필수 입력 | `form__label--required` + `aria-required="true"` 조합 |

---

## 2. 카드 그리드 + 페이지네이션

### 사용 시나리오

프로젝트 목록, 게시판 카드 뷰, 상품 목록 등 여러 카드를 그리드로 배치하고 페이지 단위로 탐색하는 패턴입니다. `.grid` + `.grid__col-4`로 PC 3열 배치, 모바일에서는 1열로 자동 전환됩니다.

### 미리보기

<div class="preview" style="margin-bottom: 2.4rem">
  <iframe
    src="/playground/combo-card-grid.html"
    title="카드 그리드 + 페이지네이션 조합 패턴 미리보기"
    style="width: 100%; height: 700px; border: 1px solid var(--color-border-light); border-radius: var(--radius-base)"
    loading="lazy"
  ></iframe>
</div>

### 핵심 마크업

```html
<!-- 카드 그리드: grid__col-4 = 12컬럼 중 4컬럼 (PC 3열) -->
<div class="grid">
  <article class="card grid__col-4">
    <div class="card__header">
      <h3 class="card__title">프로젝트 A</h3>
    </div>
    <div class="card__body">
      <p class="card__text">프로젝트 설명 텍스트</p>
    </div>
    <div class="card__footer">
      <button type="button" class="btn btn--outline">상세보기</button>
    </div>
  </article>
  <!-- 카드 반복... -->
</div>

<!-- 페이지네이션 -->
<nav class="pagination" aria-label="프로젝트 목록 페이지 탐색">
  <ul class="pagination__list">
    <li class="pagination__item">
      <span class="pagination__link pagination__link--prev pagination__link--disabled"
        aria-disabled="true">이전</span>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--current"
        aria-current="page" aria-label="현재 페이지, 1페이지">1</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--next"
        aria-label="다음 페이지">다음</a>
    </li>
  </ul>
</nav>
```

### 조합 포인트

| 항목 | 설명 |
|------|------|
| 반응형 그리드 | 모바일 4컬럼(1열), 태블릿+PC 12컬럼(2~3열) 자동 전환 |
| `grid__col-4` | 12컬럼 시스템에서 4컬럼 = PC 3열 배치 |
| `aria-label` | 페이지네이션에 "프로젝트 목록" 맥락 명시 |
| 첫 페이지 비활성 | `pagination__link--disabled` + `aria-disabled="true"` |

---

## 3. 검색 폼 + 테이블 + 브레드크럼

### 사용 시나리오

관리자 페이지에서 가장 흔한 패턴입니다. 브레드크럼으로 현재 위치를 알려주고, 검색 폼으로 필터링한 결과를 테이블로 표시합니다. 공공기관 사이트의 목록 조회 화면에 바로 적용할 수 있습니다.

### 미리보기

<div class="preview" style="margin-bottom: 2.4rem">
  <iframe
    src="/playground/combo-search-table.html"
    title="검색 폼 + 테이블 + 브레드크럼 조합 패턴 미리보기"
    style="width: 100%; height: 600px; border: 1px solid var(--color-border-light); border-radius: var(--radius-base)"
    loading="lazy"
  ></iframe>
</div>

### 핵심 마크업

```html
<!-- 브레드크럼 -->
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item">
      <a href="#" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item">
      <a href="#" class="breadcrumb__link">관리</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">사용자 목록</span>
    </li>
  </ol>
</nav>

<!-- 검색 폼 -->
<form role="search" aria-label="사용자 검색">
  <div class="form__group">
    <label class="form__label" for="search-keyword">검색어</label>
    <input type="text" id="search-keyword" class="form__input"
      placeholder="이름 또는 이메일 검색">
  </div>
  <div class="form__group">
    <label class="form__label" for="search-category">카테고리</label>
    <select id="search-category" class="form__select">
      <option value="">전체</option>
      <option value="admin">관리자</option>
    </select>
  </div>
  <button type="submit" class="btn btn--primary">검색</button>
</form>

<!-- 결과 테이블 -->
<div class="table__wrapper">
  <table class="table table--striped">
    <caption class="sr-only">사용자 목록</caption>
    <thead class="table__head">
      <tr class="table__row">
        <th class="table__th" scope="col">이름</th>
        <th class="table__th" scope="col">이메일</th>
        <th class="table__th" scope="col">역할</th>
        <th class="table__th" scope="col">가입일</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__td">홍길동</td>
        <td class="table__td">hong@example.com</td>
        <td class="table__td">관리자</td>
        <td class="table__td">2025-01-15</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 조합 포인트

| 항목 | 설명 |
|------|------|
| 브레드크럼 위치 | 검색 폼 상단에 배치하여 현재 페이지 맥락 제공 |
| `role="search"` | 검색 폼에 랜드마크 역할 부여 |
| `table--striped` | 행 구분을 위한 줄무늬 테이블 Modifier |
| `table__wrapper` | 모바일 가로 스크롤 대응 |
| `sr-only` caption | 테이블 목적을 스크린리더에 전달 |
