# 오류 페이지 (Error Page) — infoUX

요청한 페이지를 보여줄 수 없을 때(404 · 403 · 500 · 점검) 한 화면으로 보여주는 패턴. 사용자는 이 화면을 구경하러 온 것이 아니라 **빠져나가러** 왔다. 장식보다 탈출 경로가 먼저다.

## 기본 마크업

페이지 shell(skip link · `header#header` · `main#main` · `footer#footer`)은 그대로 두고 `main` 안에 한 섹션으로 넣는다.

```html
<section class="section section--content" aria-labelledby="error-title">
  <div class="container">
    <div class="error-page">
      <h1 class="error-page__title" id="error-title">요청하신 페이지를 찾을 수 없습니다</h1>
      <p class="error-page__desc">주소가 바뀌었거나 삭제된 페이지일 수 있습니다. 아래 방법으로 원하시는 내용을 찾아보세요.</p>

      <div class="error-page__actions">
        <a class="btn btn--primary" href="/">홈으로 이동</a>
        <a class="btn btn--tertiary" href="/sitemap">사이트맵 보기</a>
      </div>

      <form class="error-page__search" role="search" action="/search" method="get">
        <label class="sr-only" for="error-search">검색어</label>
        <input class="input" type="search" id="error-search" name="q" autocomplete="off">
        <button type="submit" class="btn btn--secondary">검색</button>
      </form>

      <nav class="error-page__help" aria-labelledby="error-help-title">
        <h2 class="error-page__help-title" id="error-help-title">많이 찾는 페이지</h2>
        <ul class="error-page__help-list">
          <li><a class="error-page__help-link" href="/notice">공지사항</a></li>
          <li><a class="error-page__help-link" href="/apply">신청하기</a></li>
          <li><a class="error-page__help-link" href="/lookup">처리 현황 조회</a></li>
          <li><a class="error-page__help-link" href="/faq">자주 묻는 질문</a></li>
        </ul>
      </nav>

      <p class="error-page__contact">계속 같은 화면이 나오면 대표전화 064-123-4567(평일 09:00~18:00)로 알려 주세요.</p>
    </div>
  </div>
</section>
```

## 시맨틱 구조

- **Root 태그**: `<div class="error-page">` — `main > section > .container` 안의 컴포넌트 루트
- **자식**: `h1.__title` → `p.__desc` → `div.__actions` → (선택) `form.__search` → `nav.__help` → (선택) `p.__contact`
- **제목**: 오류 화면의 `h1`은 하나다. 섹션 이름은 `aria-labelledby`로 이 `h1`에 연결한다
- **검색 폼**: `role="search"` + `<label>`. 시각적으로 레이블을 숨기려면 `.sr-only`를 쓴다 (placeholder만으로 레이블을 대신하지 않는다)
- **바로가기**: `nav` + `aria-labelledby`로 이름을 받는다. 페이지에 nav가 여럿이므로 이름이 서로 달라야 한다

> 상세: `references/html-semantics.md#error-page`

## 오류 유형별 문안

[마이크로카피 3-Part 공식](/design/microcopy/) — **무엇이 잘못됐는지 + (왜) + 어떻게 해결하는지**. 사용자를 탓하지 않고, 내부 오류 코드를 문장에 노출하지 않는다.

| 유형 | 제목 예 | 안내 예 | 주 행동 |
|------|---------|---------|---------|
| 404 없는 페이지 | 요청하신 페이지를 찾을 수 없습니다 | 주소가 바뀌었거나 삭제된 페이지일 수 있습니다. | 홈 · 검색 · 바로가기 |
| 403 접근 권한 없음 | 이 페이지를 볼 수 있는 권한이 없습니다 | 로그인이 필요하거나 접근이 제한된 페이지입니다. | 로그인 · 권한 신청 |
| 500 서버 오류 | 일시적으로 페이지를 보여드릴 수 없습니다 | 잠시 뒤에 다시 시도해 주세요. 문제가 계속되면 문의해 주세요. | 새로고침 · 문의 |
| 503 점검 | 서비스 점검 중입니다 | 점검 시간 안내(확인된 일시만) | 점검 종료 후 이동 · 공지 |

- 점검 문안의 **일시·기간은 확인된 값만** 쓴다. 지어내거나 "곧 완료됩니다" 같은 추측을 쓰지 않는다 (R-23)
- 제목에 "에러", "Error 404", 기술 용어를 쓰지 않는다. 상태 코드가 필요하면 `__code`를 작게 따로 둔다

## 사이트 유형별 수위

오류 화면은 사이트의 표현 등급과 무관하게 **utility~restrained**다 (art-direction §1 원칙 3 — 페이지 단위 강등).

| 유형 | 수위 | 허용 | 쓰지 않는 것 |
|------|------|------|--------------|
| 공공서비스 | restrained | 제목 · 안내 · 홈/검색/바로가기 · 문의 | 일러스트 · 큰 상태 코드 |
| 공공기관 | restrained | 위와 동일 + 기관 대표 연락처 | 일러스트 · 유머 문구 |
| CMS·관리자 | utility | 제목 · 안내 · 이전 화면/대시보드로 이동 | 일러스트 · 장식 전부 |
| 일반사이트 | restrained | 위 + **장식 일러스트 한 점**(`__visual`, `alt=""`) · 상태 코드 | 게임 · 글리치 · 3D · 움직이는 장식 |
| 커머스·예약 | restrained | 위 + 상품 추천 링크 | 프로모션 배너 · 쿠폰 팝업 |

404 화면을 눈에 띄는 연출로 만드는 갤러리 사례가 많지만, 공공 사이트에서는 **재미보다 탈출 경로**가 먼저다. 연출이 필요하면 일반사이트에서 일러스트 한 점으로 끝낸다.

## 서버 · 문서 측 요건

HTML만으로 끝나지 않는다. 아래는 구현팀과 함께 확인한다.

- **HTTP 상태 코드를 실제 값으로 응답한다** (404는 404). 화면만 오류 문구이고 상태가 200이면 검색 엔진·보조기기가 오류를 알 수 없다(soft 404)
- 없는 주소를 **홈으로 자동 이동(redirect)시키지 않는다.** 사용자가 어디서 길을 잃었는지 알 수 없게 된다
- `<title>`에 오류를 밝힌다: `페이지를 찾을 수 없습니다 | 사이트명`
- 검색 엔진에 색인되지 않도록 `<meta name="robots" content="noindex">`를 둔다
- 오류 화면에서도 전체 페이지 shell(헤더 · 메뉴 · 푸터)을 유지한다 — 일반 내비게이션이 길 찾기의 첫 수단이다

## 접근성

- 페이지 `h1`은 오류 제목 하나다. 바로가기 제목은 `h2`
- 제목·안내는 `role="alert"`로 낭독시키지 않는다. 사용자가 직접 이 주소로 들어온 화면이고, 페이지 제목(`<title>`)과 `h1`이 상황을 전한다
- 검색 입력에는 `<label>`이 필요하다. `autocomplete="off"`는 검색어 재입력 보호용이며 선택이다
- 링크는 밑줄로 구분하고 본문 링크 대비 4.5:1 이상(`--color-primary-pressed`)
- 터치 영역 44×44px 이상 (R-13): 바로가기 링크 `min-h-[4.4rem]`, 버튼은 `btn` 기본 크기(48px)
- 상태 코드(`__code`)는 장식이 아니라 정보다. 크게 쓰더라도 `aria-hidden`을 주지 않는다
- 움직이는 요소를 두지 않는다. 장식 일러스트는 정지 이미지이며 `alt=""`

## 출처

- 색상은 `--color-primary` · `--color-primary-pressed` · `--color-text` · `--color-text-subtle` · `--color-border-light`
- 간격·타이포는 프로젝트 밀도에 맞는 CSS/Tailwind 직접값 사용
- CSS: `src/styles/6-components/error-page.css`
- 문안 기준: `site/design/microcopy.md` (에러 메시지 3-Part 공식)
- 수위 기준: `references/art-direction.md` §1 (페이지 단위 강등)
