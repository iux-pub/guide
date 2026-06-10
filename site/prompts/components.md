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
# INFOMIND 컴포넌트 스니펫 프롬프트

> **목적:** AI 도구에 INFOMIND 컴포넌트 HTML 마크업과 접근성 패턴을 제공하기 위한 프롬프트
> **대상 AI:** Cursor, Copilot, Windsurf, Claude Code, ChatGPT, v0

> 기존 카탈로그 패턴을 우선 사용한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 확장한다.

---

## 1. HTML Snippet Scope

### 기본 마크업

```html

```

---

## 2. 아코디언 (Accordion) — KRDS

### 기본 마크업

```html
<div class="accordion">
  <details class="accordion__item">
    <summary class="accordion__summary">자주 묻는 질문 1</summary>
    <div class="accordion__panel">
      <p>답변 1 내용</p>
    </div>
  </details>
  <details class="accordion__item">
    <summary class="accordion__summary">자주 묻는 질문 2</summary>
    <div class="accordion__panel">
      <p>답변 2 내용</p>
    </div>
  </details>
  <details class="accordion__item" open>
    <summary class="accordion__summary">기본 열린 항목</summary>
    <div class="accordion__panel">
      <p><code>open</code> 속성으로 초기 열림 상태</p>
    </div>
  </details>
</div>
```

### 접근성

- native `<details>`/`<summary>` 사용 시 키보드/스크린리더 자동 지원
- `<summary>`는 자동으로 button role + aria-expanded 처리됨 — 별도 ARIA 불필요
- 최소 터치 영역 보장: `--touch-target-min` (44px)

---

## 3. 알림 (Alert / Critical Alerts) — KRDS

### 기본 마크업

```html
<div class="alert alert--info" role="alert">
  <div class="alert__icon" aria-hidden="true">ℹ</div>
  <div class="alert__body">
    <p class="alert__title">신청 기간 안내</p>
    <p class="alert__message">2026년 5월 1일부터 31일까지 신청 가능합니다.</p>
  </div>
  <button type="button" class="alert__close" aria-label="닫기">×</button>
</div>
```

### Variant / Size

| Variant | 클래스 | 용도 |
|---------|--------|------|
| Info | `.alert--info` | 일반 정보 |
| Success | `.alert--success` | 성공 알림 |
| Warning | `.alert--warning` | 주의 |
| Danger / Critical | `.alert--danger` 또는 `.alert--critical` | 오류·긴급 |

### 접근성

- 일반 알림: `role="alert"` (즉시 안내) 또는 `role="status"` (정중한 안내)
- 긴급(Critical)은 `role="alert"` + `aria-live="assertive"`
- 일반 정보성은 `role="status"` + `aria-live="polite"` 권장
- 아이콘은 장식용 — `aria-hidden="true"` (텍스트가 의미 전달)
- 닫기 버튼 `aria-label="닫기"` 필수

---

## 4. 배지 (Badge) — KRDS

### 기본 마크업

```html
<!-- 숫자 배지 -->
<button class="btn btn--text">
  알림 <span class="badge">3</span>
</button>

<!-- 점만 (dot 변형) -->
<span class="badge badge--dot" aria-label="새 알림 있음"></span>
```

### 접근성

- 숫자 배지: 텍스트로 의미 전달됨 (별도 ARIA 불필요)
- Dot 배지: 시각만 — `aria-label="새 알림 있음"` 필수

---

## 5. 브레드크럼 (Breadcrumb) — KRDS

### 기본 마크업

```html
<nav class="breadcrumb" aria-label="페이지 경로">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="/">홈</a></li>
    <li class="breadcrumb__item"><a href="/services">서비스</a></li>
    <li class="breadcrumb__item" aria-current="page">신청하기</li>
  </ol>
</nav>
```

### 접근성

- `<nav aria-label="페이지 경로">` 필수 (스크린리더용 식별자)
- `<ol>` 사용 — 순서가 의미를 가짐
- 현재 페이지: `aria-current="page"` + `<a>` 없이 텍스트만 (링크 아님)
- 구분자(`›`)는 CSS `::before`로 그려서 스크린리더에 노출 안 됨 (불필요한 읽기 방지)

---

## 6. 버튼 (Button) — KRDS

### 기본 마크업

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
```

### Variant / Size

| Variant | 클래스 | 용도 |
|---------|--------|------|
| Primary | `.btn--primary` | 메인 CTA (저장, 제출, 확인) |
| Secondary | `.btn--secondary` | 보조 액션 (primary 톤 옅은 채움 + primary border) |
| Tertiary | `.btn--tertiary` | 약한 액션 (투명 + gray border) |
| Text | `.btn--text` | 텍스트 링크형 (배경/border 없음) |

### 접근성

- `<button type="button">` 태그 사용 필수. `<a>` 태그를 버튼 용도로 쓰지 않는다
- 아이콘만 있는 버튼은 `aria-label` 필수: `<button class="btn" aria-label="메뉴 열기">...</button>`
- 비활성은 `disabled` 속성 (또는 `aria-disabled="true"`)
- 포커스 outline은 `reset.css`에서 전역 관리 (4px primary 외곽선) — 컴포넌트에서 제거 금지
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 자동 비활성 (Phase 6에서 추가)

---

## 7. 달력 (Calendar) — KRDS

### 기본 마크업

```html
<div class="calendar" role="application" aria-label="날짜 선택">
  <div class="calendar__head">
    <button type="button" class="calendar__nav" aria-label="이전 달">‹</button>
    <h2 class="calendar__title" aria-live="polite">2026년 4월</h2>
    <button type="button" class="calendar__nav" aria-label="다음 달">›</button>
  </div>

  <table class="calendar__grid" role="grid">
    <thead>
      <tr>
        <th scope="col" abbr="일요일">일</th>
        <th scope="col" abbr="월요일">월</th>
        <th scope="col" abbr="화요일">화</th>
        <th scope="col" abbr="수요일">수</th>
        <th scope="col" abbr="목요일">목</th>
        <th scope="col" abbr="금요일">금</th>
        <th scope="col" abbr="토요일">토</th>
      </tr>
    </thead>
    <tbody>
      <tr role="row">
        <td role="gridcell">
          <button type="button" class="calendar__day calendar__day--other-month" aria-label="2026년 3월 30일">30</button>
        </td>
        <td role="gridcell">
          <button type="button" class="calendar__day" aria-label="2026년 4월 1일">1</button>
        </td>
        <td role="gridcell">
          <button type="button" class="calendar__day calendar__day--today" aria-label="2026년 4월 2일 (오늘)">2</button>
        </td>
        <td role="gridcell">
          <button type="button" class="calendar__day calendar__day--selected" aria-selected="true" aria-label="2026년 4월 3일 (선택됨)">3</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 접근성

- 컨테이너 `role="application"` + `aria-label`
- `<table role="grid">` 그리드 ARIA
- 일자 버튼은 전체 날짜 컨텍스트로 `aria-label="YYYY년 M월 D일"` (그래야 스크린리더가 "1"이 아닌 "4월 1일"로 읽음)
- 선택 상태: `aria-selected="true"`
- 키보드: 화살표(일 단위), Page Up/Down(월), Home/End(주 시작/끝)

---

## 8. 카드 (Card) — KRDS

### 기본 마크업

```html
<article class="card">
  <header class="card__header">
    <h3 class="card__title">카드 제목</h3>
  </header>
  <div class="card__body">
    <p>카드 본문 내용</p>
  </div>
  <footer class="card__footer">
    <button type="button" class="btn btn--text btn--small">자세히</button>
  </footer>
</article>
```

### 접근성

- 시맨틱 컨테이너: `<article>` (독립 콘텐츠) / `<section>` (관련 섹션) / `<div>` (장식)
- 카드 전체가 링크면 `<a class="card">` 또는 카드 내부 `<a>`만 링크 (이중 링크 금지)
- 카드 내 인터랙티브 요소는 `aria-label`로 컨텍스트 명시 권장

---

## 9. 캐러셀 (Carousel) — KRDS

### 기본 마크업

```html
<div class="carousel" aria-roledescription="carousel" aria-label="추천 항목">
  <div class="carousel__viewport">
    <ol class="carousel__track">
      <li class="carousel__slide" aria-roledescription="slide" aria-label="1 / 3">
        <img src="/img1.jpg" alt="설명">
      </li>
      <li class="carousel__slide" aria-roledescription="slide" aria-label="2 / 3">
        <img src="/img2.jpg" alt="설명">
      </li>
      <li class="carousel__slide" aria-roledescription="slide" aria-label="3 / 3">
        <img src="/img3.jpg" alt="설명">
      </li>
    </ol>
  </div>

  <button type="button" class="carousel__nav carousel__nav--prev" aria-label="이전 슬라이드">‹</button>
  <button type="button" class="carousel__nav carousel__nav--next" aria-label="다음 슬라이드">›</button>

  <div class="carousel__indicators" role="tablist">
    <button type="button" class="carousel__dot" role="tab" aria-selected="true" aria-label="1번 슬라이드"></button>
    <button type="button" class="carousel__dot" role="tab" aria-selected="false" aria-label="2번 슬라이드"></button>
    <button type="button" class="carousel__dot" role="tab" aria-selected="false" aria-label="3번 슬라이드"></button>
  </div>
</div>
```

### 접근성

- 자동 재생은 **기본 OFF** 권장 — 사용자 통제권 (WCAG 2.2.2)
- 자동 재생 시: 일시정지 버튼 필수 + `prefers-reduced-motion: reduce` 시 자동 비활성
- 인디케이터는 키보드 작동 가능
- 슬라이드별 `aria-label="N / 총수"`로 위치 안내

---

## 10. 체크박스 & 라디오 — KRDS Form check

### 기본 마크업

```html
<label class="check">
  <input type="checkbox" name="agree" value="true">
  <span class="check__box" aria-hidden="true"></span>
  <span class="check__label">개인정보 수집·이용에 동의합니다</span>
</label>
```

### 접근성

- `<label>`로 input + box + 텍스트를 묶어 클릭 영역 전체 확보
- 라디오 그룹은 `<fieldset><legend>`로 묶기
- 시각 박스(`__box`)는 `aria-hidden="true"` (스크린리더는 native input만 인식)

---

## 11. 디스클로저 (Disclosure) — KRDS

### 기본 마크업

```html
<button type="button" class="disclosure" aria-expanded="false" aria-controls="more-info">
  자세히 보기
</button>
<div id="more-info" class="disclosure__panel" hidden>
  <p>접혀 있던 추가 정보</p>
</div>
```

### 접근성

- `aria-expanded` 상태값 필수 (열림/닫힘)
- `aria-controls`로 패널 id 연결
- 패널 `hidden` 속성 또는 CSS `display: none` 사용 (레이아웃에서 완전 제거)

---

## 12. 파일 업로드 (File Upload) — KRDS

### 기본 마크업

```html
<label class="file-upload">
  <input type="file" id="file" accept="image/*">
  <span class="file-upload__trigger">파일 선택</span>
  <span class="file-upload__filename" aria-live="polite">선택된 파일 없음</span>
</label>
```

### 접근성

- `<label>`로 input과 트리거를 묶어 키보드 포커스 시 트리거 외곽선 노출
- `aria-live="polite"`로 파일명 변경을 스크린리더에 안내
- `accept` 속성으로 허용 파일 타입 명시 (브라우저 필터링 + 사용자 안내)
- 업로드 진행률은 별도 `<progress>` 또는 토스트로 표시

---

## 13. 폼 필드 (Form Field) — KRDS

### 기본 마크업

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

### 접근성

- `<label for="id">` + `<input id="id">` 연결 필수
- 필수 항목은 `required` 속성 + 시각 표시(`*`)
- 에러는 `aria-invalid="true"` + `aria-describedby="에러메시지id"`
- 보조설명은 `aria-describedby`로 연결 권장
- placeholder만으로 레이블 대체 금지

---

## 14. 사이트 헤더 (Site Header)

### 기본 마크업

```html
<header id="header" class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__brand" href="/">
      <img src="/logo.svg" alt="기관명">
      <span class="site-header__brand-name">기관명</span>
    </a>

    <nav class="site-header__nav" aria-label="주 메뉴">
      <ul class="site-header__menu">
        <li><a href="/about">소개</a></li>
        <li><a href="/services" aria-current="page">서비스</a></li>
        <li><a href="/notice">공지</a></li>
      </ul>
    </nav>

    <div class="site-header__actions">
      <button type="button" class="btn btn--text btn--small">로그인</button>
      <button type="button" class="site-header__toggle" aria-label="메뉴 열기" aria-expanded="false">☰</button>
    </div>
  </div>
</header>
```

### 접근성

- `<header id="header">` 시맨틱 태그 사용 (페이지당 하나)
- 주 메뉴는 `<nav aria-label="주 메뉴">` (페이지에 nav가 여러 개면 label 필수)
- 현재 페이지 메뉴: `aria-current="page"`
- 모바일 토글: `aria-label="메뉴 열기/닫기"` + `aria-expanded` 상태 토글
- 로고 `<img>` `alt` 텍스트 필수 (KRDS R-09)

---

## 15. 목록 (List) — KRDS Text list / Structured list

### 기본 마크업

```html
<!-- 글머리표 -->
<ul class="list--text">
  <li>첫 번째 항목</li>
  <li>두 번째 항목
    <ul>
      <li>중첩 항목</li>
    </ul>
  </li>
</ul>

<!-- 번호 -->
<ol class="list--text list--ordered">
  <li>1단계</li>
  <li>2단계</li>
</ol>
```

### 접근성

- 순서 의미 — `<ol>` (있음) / `<ul>` (없음)
- 정의 목록 — `<dl>/<dt>/<dd>` 시맨틱 사용
- 모바일에선 정의 목록이 자동으로 1열로 변환

---

## 16. 주 메뉴 (Main Menu) — KRDS

### 기본 마크업

```html
<nav class="main-menu" aria-label="주 메뉴">
  <ul class="main-menu__list">
    <li class="main-menu__item">
      <a class="main-menu__link" href="/about">소개</a>
    </li>

    <li class="main-menu__item">
      <button type="button" class="main-menu__link" aria-haspopup="true" aria-expanded="false" aria-controls="submenu-services">
        서비스
      </button>
      <ul id="submenu-services" class="main-menu__submenu" hidden>
        <li><a href="/services/a">서비스 A</a></li>
        <li><a href="/services/b">서비스 B</a></li>
        <li><a href="/services/c" aria-current="page">서비스 C</a></li>
      </ul>
    </li>

    <li class="main-menu__item">
      <a class="main-menu__link" href="/contact">문의</a>
    </li>
  </ul>
</nav>
```

### 접근성

- 서브메뉴 트리거는 `<button>` 권장 (`<a>` 아님 — 링크가 아니므로)
- `aria-haspopup="true"` + `aria-expanded` 상태값
- `aria-controls`로 서브메뉴 id 연결
- 서브메뉴 `<ul>`은 `hidden` 속성으로 노출 제어
- 현재 페이지: `aria-current="page"`

---

## 17. 모달 (Modal / Dialog) — KRDS

### 기본 마크업

```html
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal__overlay"></div>
  <div class="modal__content modal__content--medium">
    <header class="modal__header">
      <h2 id="modal-title" class="modal__title">제목</h2>
      <button type="button" class="modal__close" aria-label="닫기">×</button>
    </header>
    <div class="modal__body">
      <p>모달 본문 내용</p>
    </div>
    <footer class="modal__footer">
      <button type="button" class="btn btn--tertiary">취소</button>
      <button type="button" class="btn btn--primary">확인</button>
    </footer>
  </div>
</div>
```

### 접근성

- `role="dialog"` + `aria-modal="true"` 필수
- `aria-labelledby="제목id"`로 모달 제목 연결 (또는 `aria-label`)
- 본문 설명이 길면 `aria-describedby`도 추가
- 닫기 버튼은 `aria-label="닫기"` 필수
- 첫 포커스는 모달 내부 첫 인터랙티브 요소 (또는 닫기 버튼)
- ESC 키로 닫기 가능
- 백드롭은 `--color-bg-dim`

---

## 18. 페이지네이션 (Pagination) — KRDS

### 기본 마크업

```html
<nav class="pagination" aria-label="페이지 내비게이션">
  <button type="button" class="pagination__nav" aria-label="이전 페이지">‹</button>
  <ol class="pagination__list">
    <li><a class="pagination__item" href="?p=1">1</a></li>
    <li><a class="pagination__item pagination__item--current" href="?p=2" aria-current="page">2</a></li>
    <li><a class="pagination__item" href="?p=3">3</a></li>
    <li><a class="pagination__item" href="?p=4">4</a></li>
    <li><a class="pagination__item" href="?p=5">5</a></li>
  </ol>
  <button type="button" class="pagination__nav" aria-label="다음 페이지">›</button>
</nav>
```

### 접근성

- `<nav aria-label="페이지 내비게이션">` 필수
- 현재 페이지: `aria-current="page"`
- 이전/다음 버튼: `aria-label="이전 페이지"` / `aria-label="다음 페이지"` 필수
- `aria-disabled="true"` + `disabled` 같이 사용 (첫/마지막 페이지)

---

## 19. 진행률 (Progress) — KRDS

### 기본 마크업

```html
<div class="progress">
  <div class="progress__label">
    <span>업로드 중</span>
    <span>60%</span>
  </div>
  <progress class="progress__bar" value="60" max="100" aria-label="업로드 진행률 60%">60%</progress>
</div>
```

### 접근성

- native `<progress>` 사용 — 자동 ARIA 처리
- `aria-label` 또는 `aria-labelledby`로 진행 항목 명시
- 무한 로딩(불확정 시간)은 `<progress>` 대신 `.spinner` 사용

---

## 20. 셀렉트 (Select) — KRDS

### 기본 마크업

```html
<div class="form-field">
  <label for="category" class="form-field__label">카테고리</label>
  <select id="category" class="select">
    <option value="">선택하세요</option>
    <option value="a">옵션 A</option>
    <option value="b">옵션 B</option>
  </select>
</div>
```

### 접근성

- 첫 옵션은 `<option value="">선택하세요</option>` 같은 placeholder 권장
- `<label for>` + `<select id>` 연결 필수
- 옵션 텍스트는 명확하고 간결하게

---

## 21. 사이드 패널 (Side Panel) — KRDS Help panel 응용

### 기본 마크업

```html
<aside class="side-panel" role="dialog" aria-labelledby="panel-title" aria-hidden="true">
  <header class="side-panel__header">
    <h2 id="panel-title" class="side-panel__title">상세 정보</h2>
    <button type="button" class="side-panel__close" aria-label="닫기">×</button>
  </header>
  <div class="side-panel__body">
    <p>패널 본문 내용</p>
  </div>
  <footer class="side-panel__footer">
    <button type="button" class="btn btn--tertiary">닫기</button>
    <button type="button" class="btn btn--primary">저장</button>
  </footer>
</aside>
```

### 접근성

- `role="dialog"` + `aria-labelledby`
- 닫기 버튼 `aria-label="닫기"` 필수
- ESC 키 닫기 권장
- 포커스 트랩은 선택 (모달과 달리 본문 인터랙션 허용)
- `aria-hidden` 토글로 스크린리더 노출 제어

---

## 22. 스피너 (Spinner) — KRDS

### 기본 마크업

```html
<span class="spinner" role="status" aria-label="로딩 중"></span>
```

### 접근성

- `role="status"` + `aria-label="로딩 중"` 필수
- `prefers-reduced-motion: reduce` 자동 대응 (회전 속도 절반으로)

---

## 23. 단계 표시기 (Step Indicator) — KRDS

### 기본 마크업

```html
<ol class="step-indicator" aria-label="진행 단계">
  <li class="step-indicator__item step-indicator__item--done">
    <span class="step-indicator__num" aria-hidden="true">1</span>
    <span class="step-indicator__label">정보 입력</span>
  </li>
  <li class="step-indicator__item step-indicator__item--current" aria-current="step">
    <span class="step-indicator__num" aria-hidden="true">2</span>
    <span class="step-indicator__label">확인</span>
  </li>
  <li class="step-indicator__item">
    <span class="step-indicator__num" aria-hidden="true">3</span>
    <span class="step-indicator__label">완료</span>
  </li>
</ol>
```

### 접근성

- `<ol>` 사용 — 순서 의미 보존
- 현재 단계: `aria-current="step"`
- 번호는 시각만 — `aria-hidden="true"` (레이블이 텍스트로 의미 전달)

---

## 24. 토글 스위치 (Switch) — KRDS

### 기본 마크업

```html
<label class="switch">
  <input type="checkbox" name="notify" role="switch">
  <span class="switch__track" aria-hidden="true"></span>
  <span class="switch__label">알림 받기</span>
</label>
```

### 접근성

- `role="switch"` 권장 — 스크린리더가 "스위치"로 안내
- 시각 트랙(`__track`)은 `aria-hidden="true"`
- 상태 변경은 native `:checked`만으로 충분 (별도 aria-checked 불필요)

---

## 25. 탭 (Tab) — KRDS

### 기본 마크업

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="섹션">
    <button class="tab__item" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
      개요
    </button>
    <button class="tab__item" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">
      상세
    </button>
    <button class="tab__item" role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">
      후기
    </button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    개요 내용
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    상세 내용
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    후기 내용
  </div>
</div>
```

### 접근성

- `role="tablist"` + 각 탭에 `role="tab"`, 패널에 `role="tabpanel"`
- 탭 ↔ 패널 연결: `aria-controls` (탭 → 패널 id), `aria-labelledby` (패널 → 탭 id)
- 활성 표시는 `aria-selected="true"` (시각 인디케이터는 CSS가 자동 처리)
- `aria-label` 또는 `aria-labelledby`로 탭 그룹의 목적 명시 권장

---

## 26. 표 (Table) — KRDS

### 기본 마크업

```html
<div class="table-wrap">
  <table class="table">
    <caption class="table__caption">2026년 1분기 신청 현황</caption>
    <thead>
      <tr>
        <th scope="col">번호</th>
        <th scope="col">신청자</th>
        <th scope="col">신청일</th>
        <th scope="col">상태</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>홍길동</td>
        <td>2026-04-01</td>
        <td><span class="tag tag--success">완료</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 접근성

- `<th scope="col">` 또는 `scope="row">` 필수
- `<caption>`으로 표 제목 명시
- 정렬 헤더는 `aria-sort="ascending|descending|none"`
- 선택 행은 `aria-selected="true"`
- 모바일 가로 스크롤은 `<div class="table-wrap">` 래퍼로 감싸기

---

## 27. 태그 (Tag) — KRDS

### 기본 마크업

```html
<!-- 정적 태그 -->
<span class="tag">기본</span>

<!-- 클릭 가능 (필터 등) -->
<button type="button" class="tag tag--primary">선택됨</button>

<!-- 제거 가능 (선택된 필터) -->
<span class="tag tag--info">
  카테고리: 디자인
  <button type="button" class="tag__close" aria-label="카테고리: 디자인 제거">×</button>
</span>

<!-- 링크형 -->
<a class="tag tag--success" href="?category=ui">UI</a>
```

### 접근성

- 제거 버튼은 `aria-label="태그명 제거"` 형식으로 컨텍스트 명시
- 클릭 가능 태그는 `<button>` 또는 `<a>` 사용 (div onclick 금지)

---

## 28. 토스트 (Toast) — KRDS

### 기본 마크업

```html
<div class="toast-stack">
  <div class="toast toast--success" role="status">
    <span class="toast__icon" aria-hidden="true">✓</span>
    <p class="toast__message">저장되었습니다</p>
    <button type="button" class="toast__close" aria-label="닫기">×</button>
  </div>
</div>
```

### 접근성

- `role="status"` + `aria-live="polite"` (스크린리더 정중 안내)
- 위급 시에만 `role="alert"` + `aria-live="assertive"`
- 자동 닫힘 토스트도 사용자 옵션으로 일시정지/지속 가능해야 함 (WCAG 2.2.1)

---

## 29. 툴팁 (Tooltip) — KRDS

### 기본 마크업

```html
<button type="button" class="tooltip-trigger" aria-describedby="tip-1">
  도움말
</button>
<div id="tip-1" class="tooltip" role="tooltip" hidden>
  도움말 설명 텍스트
</div>
```

### 접근성

- 트리거에 `aria-describedby="툴팁id"` 연결
- 툴팁에 `role="tooltip"` 필수
- ESC로 닫기 가능 (JS 처리)
- 툴팁은 hover/focus 양쪽으로 트리거 가능해야 함 (WCAG 1.4.13)

````
