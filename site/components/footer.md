---
title: 푸터
order: 30
playground_src: /playground/footer.html
preview_height: 640
---

페이지 shell의 `footer#footer` 랜드마크 안에 쓰는 KRDS 푸터(component_02_04). 권위 있는 소스는 `src/snippets/footer.md`이며, 사이트 유형에 따라 항목을 덜어 쓰되 **정보 순서는 바꾸지 않는다**.

## KRDS 정보 순서

**서비스 로고 → 연락처 → 유틸리티 링크 → 정책 링크 → 저작권 정보** — 좁은 화면에서도 같은 순서로 쌓는다. 서비스 내비게이션(푸터 메뉴)을 두면 메인 메뉴의 최상위 링크를 모두 같은 레이블로 넣는다.

## 기본 마크업 (요약)

```html
<footer id="footer" class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <nav class="site-footer__nav" aria-label="푸터 메뉴">
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-about">기관 소개</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-about">
            <li><a class="site-footer__link" href="/about/greeting">인사말</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <div class="site-footer__bottom">
      <div class="site-footer__info">
        <a class="site-footer__brand" href="/"><img class="site-footer__logo" src="/images/logo.svg" alt="기관명"></a>
        <address class="site-footer__address">(우)00000 제주특별자치도 제주시 ○○로 00<br>대표전화 064-000-0000 · 평일 09:00~18:00</address>
        <ul class="site-footer__utility" aria-label="바로가기">
          <li><a class="site-footer__link" href="/about/location">오시는 길</a></li>
          <li><a class="site-footer__link" href="/sitemap">사이트맵</a></li>
        </ul>
      </div>
      <nav class="site-footer__legal" aria-label="약관 및 정책">
        <ul class="site-footer__legal-list">
          <li><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></li>
          <li><a class="site-footer__link" href="/copyright">저작권 정책</a></li>
        </ul>
      </nav>
      <small class="site-footer__copy">© 2026 기관명. All rights reserved.</small>
    </div>
  </div>
</footer>
```

## 변형

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 | `.site-footer` | 서비스 내비게이션 + 하단 정보. 일반사이트·공공기관 |
| 소형 | `.site-footer--compact` | 하단 정보만. 공공서비스·관리자 화면 — 그래도 KRDS 순서를 지킨다 |
| 반전 | `.site-footer--inverse` | 어두운 바탕. 일반사이트·커머스 표현형 한정 |

전자상거래가 있으면 이용약관과 사업자 정보(`dl.site-footer__biz`)를 반드시 표시한다. 사이트 유형별 표기 항목 카탈로그는 `src/snippets/footer.md`에 있다.

## 접근성·KRDS 핵심

- `<footer>`는 페이지에 하나. 푸터의 모든 요소는 `<footer>` 안에 둔다. 안의 `nav`가 여럿이면 `aria-label`로 구분한다
- 개인정보 처리방침은 모든 사이트에서 필수 — 명칭 「개인정보 처리방침」을 쓰고 굵기·색으로 다른 고지와 구분한다
- 그룹 제목은 `h2` + 목록 `aria-labelledby`로 연결한다
- 링크 터치 영역 44×44px 이상 (R-13)
- 관련 기관은 링크 클릭으로만 이동한다 — `<select>` 선택만으로 페이지가 바뀌지 않게 한다 (WCAG 3.2.2)
- 주소·전화·사업자 정보는 발주처가 확인해 준 값만 쓴다. 예시 값은 형식 예시다 (R-23)

## 파일

- 마크업·카탈로그: `src/snippets/footer.md`
- CSS: `src/styles/6-components/footer.css`
- 미리보기: `src/playground/footer.html`
- 기준: KRDS 푸터 https://www.krds.go.kr/html/site/component/component_02_04.html