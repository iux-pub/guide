# 컴포넌트 스니펫 프롬프트

대상: 모든 코드 생성 AI

이 컴포넌트 패턴을 따라 HTML을 생성하라.

## 버튼

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
```

Variant: `--primary`, `--secondary`, `--outline`, `--text`, `--ghost`, `--link`, `--sm`, `--lg`

## 폼

```html
<div class="form__group">
  <label class="form__label form__label--required" for="name">이름</label>
  <input type="text" class="form__input" id="name" aria-required="true">
</div>
```

Variant: `__input`, `__select`, `__textarea`, `__checkbox`, `__radio`, `--error`, `--success`

## 카드

```html
<article class="card">
  <div class="card__header"><h3 class="card__title">제목</h3></div>
  <div class="card__body"><p class="card__text">내용</p></div>
  <div class="card__footer"><button class="btn btn--primary">확인</button></div>
</article>
```

Variant: `--horizontal`, `--image`, `--featured`

## 테이블

```html
<div class="table__wrapper">
  <table class="table">
    <caption class="sr-only">테이블 제목</caption>
    <thead class="table__head">
      <tr><th class="table__th" scope="col">항목</th></tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row"><td class="table__td">내용</td></tr>
    </tbody>
  </table>
</div>
```

## 모달

```html
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-hidden="true">
  <div class="modal__overlay" data-modal-close></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 class="modal__title" id="modal-title">제목</h2>
      <button class="modal__close" data-modal-close aria-label="닫기">&times;</button>
    </div>
    <div class="modal__body">내용</div>
    <div class="modal__footer"><button class="btn btn--primary">확인</button></div>
  </div>
</div>
```

JS: `modal--active` 클래스 토글로 열림 애니메이션 제어

## 탭

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="탭 메뉴">
    <button class="tab__button" role="tab" aria-selected="true" aria-controls="panel-1">탭 1</button>
    <button class="tab__button" role="tab" aria-selected="false" aria-controls="panel-2">탭 2</button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1">내용 1</div>
  <div class="tab__panel" role="tabpanel" id="panel-2" hidden>내용 2</div>
</div>
```

## 페이지네이션

```html
<nav class="pagination" aria-label="페이지 네비게이션">
  <ul class="pagination__list">
    <li class="pagination__item">
      <a class="pagination__link pagination__link--prev" href="#" aria-label="이전 페이지">&lt;</a>
    </li>
    <li class="pagination__item">
      <a class="pagination__link" href="#" aria-label="페이지 1">1</a>
    </li>
    <li class="pagination__item">
      <a class="pagination__link pagination__link--current" href="#" aria-current="page" aria-label="페이지 2">2</a>
    </li>
    <li class="pagination__item">
      <a class="pagination__link pagination__link--next" href="#" aria-label="다음 페이지">&gt;</a>
    </li>
  </ul>
</nav>
```

## 브레드크럼

```html
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="/">홈</a></li>
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="/section">섹션</a></li>
    <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">현재 페이지</span></li>
  </ol>
</nav>
```
