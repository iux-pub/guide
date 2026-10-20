# 컴포넌트 스니펫 프롬프트 — KRDS 기반

대상: 모든 코드 생성 AI

이 컴포넌트 패턴을 우선 따라 HTML을 생성하라. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 확장한다.

> 전체 마크업·variant·접근성 노트의 권위 있는 소스: `src/snippets/{name}.md`
> 자동 합본: `site/prompts/components.md`
> 컴포넌트 카탈로그(BEM·접근성·토큰 매핑): `references/krds-components.md`

---

## 그룹 A — 폼/액션

### 버튼 (btn)

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
<button type="button" class="btn btn--secondary btn--small">취소</button>
<button type="button" class="btn btn--tertiary btn--large">더보기</button>
<button type="button" class="btn btn--text">자세히</button>
<button type="button" class="btn btn--primary btn--block">전체 너비 제출</button>
```

KRDS Variant: `--primary` `--secondary` `--tertiary` `--text`
KRDS Size: `--xsmall` `--small` (없음=medium, 기본) `--large` `--xlarge`
**금지**: `--ghost` `--outline` `--link` `--sm` `--lg` `--hero` (옛 variant)

### 폼 필드 (form)

```html
<div class="form-field">
  <label for="name" class="form-field__label">
    이름<span class="form-field__required" aria-label="필수">*</span>
  </label>
  <p id="name-hint" class="form-field__hint">주민등록상 실명을 입력하세요</p>
  <input type="text" id="name" class="input" required aria-describedby="name-hint">
</div>

<div class="form-field">
  <label for="email" class="form-field__label">이메일</label>
  <input type="email" id="email" class="input input--error" aria-invalid="true" aria-describedby="email-error">
  <p id="email-error" class="form-field__message form-field__message--error">올바른 이메일 형식이 아닙니다</p>
</div>
```

KRDS 순서: 레이블 → 보조설명 → 입력 → 시스템 메시지. 오류는 `input--error` + `aria-invalid="true"` + 메시지 연결(`aria-describedby`).

### 체크박스·라디오 (check-radio)

```html
<label class="check">
  <input type="checkbox" name="agree" value="true">
  <span class="check__box" aria-hidden="true"></span>
  <span class="check__label">개인정보 수집·이용에 동의합니다</span>
</label>
```

파일은 `check-radio.css` 하나지만 블록은 `.check`(체크박스)·`.radio`(라디오) 둘이다(`references/class-naming.md` 대응표).

### 셀렉트 (select)

```html
<div class="form-field">
  <label for="region" class="form-field__label">지역</label>
  <select id="region" class="select">
    <option value="">선택하세요</option>
    <option value="seoul">서울</option>
  </select>
</div>
```

### 파일 업로드 (file-upload), 스위치 (switch)

→ `src/snippets/{file-upload,switch}.md` 참조

---

## 그룹 B — 컨테이너/레이아웃

### 카드 (card)

```html
<article class="card">
  <header class="card__header">
    <h3 class="card__title">도서관 휴관일 안내</h3>
  </header>
  <div class="card__body">
    <p>매주 월요일과 법정 공휴일에는 휴관합니다. 휴관일에도 무인 반납함은 이용할 수 있습니다.</p>
  </div>
  <footer class="card__footer">
    <button type="button" class="btn btn--primary">확인</button>
  </footer>
</article>
```

### 모달 (modal)

```html
<div class="modal" id="modal-confirm" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal__overlay"></div>
  <div class="modal__content modal__content--medium">
    <header class="modal__header">
      <h2 class="modal__title" id="modal-title">작성 내용 임시 저장</h2>
      <button type="button" class="modal__close" data-modal-close aria-label="닫기">×</button>
    </header>
    <div class="modal__body"><p>작성 중인 내용을 임시 저장합니다. 임시 저장한 글은 30일 동안 보관합니다.</p></div>
    <footer class="modal__footer">
      <button type="button" class="btn btn--primary">확인</button>
    </footer>
  </div>
</div>
```

열고 닫는 상태는 `hidden` 속성 하나다. 여는 버튼은 `data-modal-open="modal-confirm"`(`src/js/modal.js`).

### 탭 (tab)

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="탭 메뉴">
    <button type="button" class="tab__item" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">관람 시간</button>
    <button type="button" class="tab__item" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">관람료</button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <p>화요일~일요일 09:00~18:00, 매주 월요일 휴관</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <p>성인 2,000원, 청소년·어린이 1,000원</p>
  </div>
</div>
```

선택은 `aria-selected`만으로 표시한다(modifier 없음). 모든 탭이 Tab 순서에 들어간다 — `tabindex="-1"`을 주지 않는다. 탭은 6개 이하, 비활성 탭·페이지 링크용 탭 금지(KRDS).

### 아코디언 (accordion), 디스클로저 (disclosure), 사이드 패널 (side-panel)

→ `src/snippets/{accordion,disclosure,side-panel}.md` 참조

---

## 그룹 C — 내비게이션

### 브레드크럼 (breadcrumb)

```html
<nav class="breadcrumb" aria-label="브레드크럼">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="/">홈</a></li>
    <li class="breadcrumb__item"><a href="/services">서비스</a></li>
    <li class="breadcrumb__item" aria-current="page">신청하기</li>
  </ol>
</nav>
```

`nav`의 구획 제목은 KRDS대로 `aria-label="브레드크럼"`이다.

### 페이지네이션 (pagination)

```html
<nav class="pagination" aria-label="페이지 내비게이션">
  <button type="button" class="pagination__nav" aria-label="이전 페이지">‹</button>
  <ol class="pagination__list">
    <li><a class="pagination__item" href="?p=1">1</a></li>
    <li><a class="pagination__item" href="?p=2" aria-current="page">2</a></li>
    <li><a class="pagination__item" href="?p=3">3</a></li>
  </ol>
  <button type="button" class="pagination__nav" aria-label="다음 페이지">›</button>
</nav>
```

현재 페이지는 `aria-current="page"`만 — CSS가 이 속성으로 표시한다. 첫·마지막 페이지의 이전·다음 버튼은 `disabled`.

### 헤더 (header), 메인 메뉴 (main-menu)

→ `src/snippets/{header,main-menu}.md` 참조

---

## 그룹 D — 피드백

### 알림 (alert)

```html
<div class="alert alert--success" role="status">
  <strong class="alert__title">저장 완료</strong>
  <p class="alert__message">변경 사항이 저장되었습니다.</p>
</div>
```

KRDS variant: `--success` `--warning` `--danger` `--info`

### 긴급 공지 (notice-bar)

```html
<section class="notice-bar notice-bar--danger" aria-label="사이트 공지">
  <div class="container notice-bar__inner">
    <svg class="notice-bar__icon icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#error"></use></svg>
    <span class="notice-bar__label">긴급</span>
    <p class="notice-bar__message">
      <a class="notice-bar__link" href="/notice/typhoon-closure">태풍으로 10월 12일 전 시설을 임시 휴관합니다</a>
    </p>
  </div>
</section>
```

KRDS 긴급 공지. 자리는 `main#main`의 첫 section(메인 메뉴 다음, 히어로 앞), 한 번에 하나. 긴급도 상·중·하 = `--danger`(긴급)·`--warning`(예고)·기본(안내) — 라벨 텍스트를 함께 쓴다. **닫기 버튼을 두지 않는다**. 문장은 한 줄, 링크는 하나까지.

### 토스트 (toast), 툴팁 (tooltip), 배지 (badge), 태그 (tag), 진행 (progress), 스피너 (spinner), 단계 표시 (step-indicator)

→ `src/snippets/{toast,tooltip,badge,tag,progress,spinner,step-indicator}.md` 참조

---

## 그룹 E — 콘텐츠/표현

### 테이블 (table)

```html
<div class="table-wrap" tabindex="0" role="region" aria-labelledby="user-list-caption">
  <table class="table">
    <caption class="table__caption" id="user-list-caption">사용자 목록</caption>
    <thead>
      <tr>
        <th scope="col">이름</th>
        <th scope="col">역할</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>홍길동</td>
        <td>관리자</td>
      </tr>
    </tbody>
  </table>
</div>
```

`.table-wrap`은 가로 스크롤 래퍼다. 키보드로도 스크롤하도록 `tabindex="0"` + `role="region"` + `aria-labelledby`(caption `id`)를 함께 둔다.

### 리스트 (list), 캘린더 (calendar), 캐러셀 (carousel)

→ `src/snippets/{list,calendar,carousel}.md` 참조
