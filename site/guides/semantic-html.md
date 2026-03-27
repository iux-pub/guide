---
title: 시맨틱 HTML 마크업
order: 2
---

HTML 태그를 의미에 맞게 사용하면 접근성, SEO, 유지보수성이 모두 향상된다. 이 가이드는 팀 표준 시맨틱 마크업 규칙을 정리한다.

## Heading 계층 (h1-h6)

페이지당 heading 계층은 문서 개요(outline)를 형성한다. 올바른 계층 구조는 스크린리더 사용자가 페이지를 탐색하는 핵심 수단이다.

### 규칙

1. **h1은 페이지당 1개만** 사용한다 -- 페이지의 주제를 나타낸다
2. **계층을 건너뛰지 않는다** -- h1 다음에 h3를 사용하지 않는다
3. **시각적 크기가 아닌 의미로** 선택한다 -- 작은 글씨가 필요하면 CSS로 조정한다
4. **섹션마다 heading을 부여**한다 -- 콘텐츠 영역의 시작을 명확히 한다

### Do / Don't

```html
<!-- DO: 올바른 heading 계층 -->
<h1>서비스 소개</h1>
  <h2>주요 기능</h2>
    <h3>대시보드</h3>
    <h3>리포트</h3>
  <h2>요금제</h2>
    <h3>무료</h3>
    <h3>프로</h3>
```

```html
<!-- DON'T: 계층 건너뛰기 -->
<h1>서비스 소개</h1>
  <h3>주요 기능</h3>    <!-- h2를 건너뜀 -->
  <h4>대시보드</h4>     <!-- 계층 혼란 -->
```

```html
<!-- DON'T: 스타일 목적으로 heading 선택 -->
<h4>서비스 소개</h4>    <!-- h1이어야 하지만 작게 보이려고 h4 사용 -->

<!-- DO: CSS로 크기 조정 -->
<h1 class="page__title--sm">서비스 소개</h1>
```

## 시맨틱 섹셔닝 태그

### section vs article vs div

| 태그 | 용도 | 조건 |
|------|------|------|
| `<section>` | 주제별 콘텐츠 그룹 | heading을 가질 수 있는 의미 있는 영역 |
| `<article>` | 독립적 콘텐츠 | 그 자체로 완결된 콘텐츠 (뉴스 기사, 블로그 글, 카드) |
| `<div>` | 의미 없는 그룹 | 스타일링/레이아웃 목적의 래퍼 |

```html
<!-- DO: 의미에 맞는 태그 선택 -->
<main id="main-content">
  <section>
    <h2>공지사항</h2>
    <article>
      <h3>시스템 점검 안내</h3>
      <p>2026년 3월 30일 02:00-06:00 시스템 점검이 있습니다.</p>
    </article>
    <article>
      <h3>신규 기능 출시</h3>
      <p>대시보드 v2가 출시되었습니다.</p>
    </article>
  </section>
</main>
```

```html
<!-- DON'T: 모든 곳에 div 사용 -->
<div id="main-content">
  <div class="section">
    <h2>공지사항</h2>
    <div class="article">
      <h3>시스템 점검 안내</h3>
    </div>
  </div>
</div>
```

### nav

네비게이션 링크 그룹에 사용한다. 페이지 내 주요 네비게이션에만 적용한다.

```html
<!-- DO: 주요 네비게이션 -->
<nav aria-label="주 메뉴">
  <ul>
    <li><a href="/">홈</a></li>
    <li><a href="/about/">소개</a></li>
    <li><a href="/contact/">문의</a></li>
  </ul>
</nav>

<!-- DO: 보조 네비게이션 (aria-label로 구분) -->
<nav aria-label="브레드크럼">
  <ol>
    <li><a href="/">홈</a></li>
    <li><a href="/guides/">가이드</a></li>
    <li aria-current="page">시맨틱 HTML</li>
  </ol>
</nav>
```

```html
<!-- DON'T: 모든 링크 목록에 nav 사용 -->
<nav>
  <a href="/terms/">이용약관</a>
  <a href="/privacy/">개인정보처리방침</a>
</nav>
<!-- 푸터 링크는 nav 없이 ul/li로 충분하다 -->
```

### aside

본문과 관련이 있지만 분리 가능한 부가 콘텐츠에 사용한다.

```html
<!-- DO: 사이드바, 관련 링크, 부가 정보 -->
<main id="main-content">
  <article>
    <h1>CSS Grid 가이드</h1>
    <p>CSS Grid는 2차원 레이아웃 시스템이다...</p>
  </article>
  <aside aria-label="관련 가이드">
    <h2>관련 가이드</h2>
    <ul>
      <li><a href="/guides/css-performance/">CSS 성능</a></li>
    </ul>
  </aside>
</main>
```

### header / footer

```html
<!-- 페이지 전체 구조 -->
<body>
  <a href="#main-content" class="skip-to-content">본문 바로가기</a>
  <header class="site-header">
    <h1 class="site-header__logo">사이트명</h1>
    <nav aria-label="주 메뉴">...</nav>
  </header>

  <main id="main-content">
    <!-- 콘텐츠 -->
  </main>

  <footer class="site-footer">
    <p>&copy; 2026 인포마인드</p>
  </footer>
</body>
```

## Landmark 역할과 접근성

시맨틱 태그는 암묵적 ARIA landmark 역할을 가진다. 중복 지정하지 않는다.

| HTML 태그 | 암묵적 ARIA 역할 | `role` 추가 필요 |
|-----------|-----------------|-----------------|
| `<header>` (페이지) | `banner` | 불필요 |
| `<nav>` | `navigation` | 불필요 |
| `<main>` | `main` | 불필요 |
| `<aside>` | `complementary` | 불필요 |
| `<footer>` (페이지) | `contentinfo` | 불필요 |
| `<section>` | `region` (aria-label 있을 때) | 불필요 |
| `<form>` | `form` (aria-label 있을 때) | 불필요 |

```html
<!-- DON'T: 중복 role 지정 -->
<nav role="navigation">...</nav>
<main role="main">...</main>

<!-- DO: 시맨틱 태그만으로 충분 -->
<nav aria-label="주 메뉴">...</nav>
<main id="main-content">...</main>
```

## 체크리스트

마크업 작성 후 아래 항목을 점검한다.

- [ ] h1이 페이지당 1개인가
- [ ] heading 계층이 순서대로인가 (h1 > h2 > h3, 건너뛰기 없음)
- [ ] 의미 있는 영역에 section/article을 사용했는가
- [ ] 레이아웃 목적의 래퍼는 div를 사용했는가
- [ ] nav에 aria-label이 있는가 (2개 이상일 때 구분 가능한가)
- [ ] main이 페이지당 1개인가
- [ ] 본문 건너뛰기 링크가 있는가
- [ ] 시맨틱 태그에 중복 role을 지정하지 않았는가
- [ ] heading 앵커에 `scroll-margin-top` 설정했는가
- [ ] `text-wrap: balance` 또는 `text-pretty`를 heading에 적용했는가
- [ ] 텍스트 컨테이너가 긴 콘텐츠를 처리하는가 (truncate, line-clamp, break-words)
- [ ] flex 자식에 `min-width: 0`을 설정하여 텍스트 말줄임이 동작하는가
- [ ] 빈 상태(empty state)를 처리하는가 (빈 문자열/배열에 깨진 UI 없음)
- [ ] 사용자 입력 콘텐츠의 짧은/보통/매우 긴 경우를 모두 대응하는가

## 폼 마크업 규칙

| 규칙 | 설명 |
|------|------|
| `autocomplete` 속성 | 로그인/결제 폼 input에 필수. 비인증 필드에는 `autocomplete="off"` |
| `type` 속성 | `email`, `tel`, `url`, `number` 등 정확한 type 사용 (모바일 키보드 대응) |
| `inputmode` 속성 | 숫자 입력 시 `inputmode="numeric"` 사용 |
| `spellCheck={false}` | 이메일, 코드, 사용자명 필드에 맞춤법 검사 비활성화 |
| paste 차단 금지 | `onPaste` + `preventDefault` 사용 금지 |
| label 클릭 영역 | `for` 속성 또는 label이 input을 감싸서 클릭 가능하게 |
| 에러 위치 | 필드 옆 인라인 표시, 제출 시 첫 에러에 focus |
| placeholder | `…`으로 끝나게, 예시 패턴 표시 (레이블 대체 금지) |
| 미저장 경고 | 변경 사항 있을 때 페이지 이탈 전 경고 (`beforeunload`)
