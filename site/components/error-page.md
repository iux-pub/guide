---
title: 오류 페이지
order: 33
playground_src: /playground/error-page.html
preview_height: 720
---

요청한 페이지를 보여줄 수 없을 때(404 · 403 · 500 · 점검) 한 화면으로 보여주는 패턴. 권위 있는 소스는 `src/snippets/error-page.md`이며, 사용자는 구경이 아니라 **빠져나가러** 온 것이므로 장식보다 탈출 경로가 먼저다.

## 기본 마크업

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

      <nav class="error-page__help" aria-labelledby="error-help-title">
        <h2 class="error-page__help-title" id="error-help-title">많이 찾는 페이지</h2>
        <ul class="error-page__help-list">
          <li><a class="error-page__help-link" href="/notice">공지사항</a></li>
          <li><a class="error-page__help-link" href="/faq">자주 묻는 질문</a></li>
        </ul>
      </nav>
    </div>
  </div>
</section>
```

## 유형별 수위

오류 화면은 사이트 표현 등급과 무관하게 **utility~restrained**다 (art-direction §1 원칙 3).

| 유형 | 허용 | 쓰지 않는 것 |
|------|------|--------------|
| 공공서비스·공공기관 | 제목 · 안내 · 홈/검색/바로가기 · 문의 | 일러스트 · 큰 상태 코드 · 유머 문구 |
| CMS·관리자 | 제목 · 안내 · 이전 화면/대시보드로 이동 | 장식 전부 |
| 일반사이트 | 위 + 장식 일러스트 한 점(`alt=""`) | 게임 · 글리치 · 3D · 움직이는 장식 |
| 커머스·예약 | 위 + 상품 추천 링크 | 프로모션 배너 · 쿠폰 팝업 |

## 서버 · 문서 측 요건

- HTTP 상태 코드를 **실제 값으로** 응답한다 (404는 404). 화면만 오류 문구이고 상태가 200이면 soft 404다
- 없는 주소를 홈으로 자동 이동시키지 않는다
- `<title>`에 오류를 밝히고 `noindex`를 둔다. 전체 페이지 shell(헤더·메뉴·푸터)을 유지한다
- 점검 문안의 일시·기간은 확인된 값만 쓴다 (R-23)

## 접근성 핵심

- 페이지 `h1`은 오류 제목 하나, 바로가기 제목은 `h2`
- 제목·안내를 `role="alert"`로 낭독시키지 않는다 — 사용자가 직접 들어온 화면이고 `<title>`과 `h1`이 상황을 전한다
- 문안은 [마이크로카피 3-Part 공식](/design/microcopy/)을 따르고 사용자를 탓하지 않는다
- 링크는 밑줄 + 대비 4.5:1 이상, 터치 영역 44×44px 이상 (R-13)

## 파일

- 마크업: `src/snippets/error-page.md`
- CSS: `src/styles/6-components/error-page.css`
