---
title: 푸터
order: 30
playground_src: /playground/footer.html
preview_height: 640
---

페이지 shell의 `footer#footer` 랜드마크 안에 쓰는 공통 푸터 패턴. 권위 있는 소스는 `src/snippets/footer.md`이며, 사이트 유형에 따라 구성 요소를 덜어 쓴다.

## 기본 마크업

```html
<footer id="footer" class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <a class="site-footer__brand" href="/">
        <img class="site-footer__logo" src="/images/logo.svg" alt="기관명">
      </a>
      <nav class="site-footer__nav" aria-label="푸터 메뉴">
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-about">소개</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-about">
            <li><a class="site-footer__link" href="/about/greeting">인사말</a></li>
            <li><a class="site-footer__link" href="/about/history">연혁</a></li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="site-footer__bottom">
      <div class="site-footer__info">
        <nav class="site-footer__legal" aria-label="약관 및 정책">
          <ul class="site-footer__legal-list">
            <li><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보처리방침</a></li>
            <li><a class="site-footer__link" href="/terms">이용약관</a></li>
          </ul>
        </nav>
        <address class="site-footer__address">제주특별자치도 제주시 한라로 100<br>대표전화 064-123-4567</address>
        <small class="site-footer__copy">© 2026 기관명. All rights reserved.</small>
      </div>
    </div>
  </div>
</footer>
```

## 변형

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 | `.site-footer` | 푸터 메뉴 + 하단 고지. 일반사이트·공공기관 |
| 소형 | `.site-footer--compact` | 하단 고지만. 공공서비스·관리자 화면 |
| 반전 | `.site-footer--inverse` | 어두운 바탕. 일반사이트·커머스 표현형 한정 |

## 접근성 핵심

- `<footer>`는 페이지에 하나. 푸터 안 `nav`가 여럿이면 `aria-label`로 구분한다
- 그룹 제목은 `h2` + 목록 `aria-labelledby`로 연결한다
- 링크 터치 영역 44×44px 이상 (R-13)
- 패밀리 사이트는 링크 클릭으로만 이동한다 — `<select>` 선택만으로 페이지가 바뀌지 않게 한다 (WCAG 3.2.2)
- 사업자 정보·법정 고지 문구는 발주처가 확인해 준 값만 쓴다 (R-23)

## 파일

- 마크업: `src/snippets/footer.md`
- CSS: `src/styles/6-components/footer.css`
