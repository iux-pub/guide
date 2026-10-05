# 푸터 (Site Footer) — infoUX

페이지 하단 공통 영역. 페이지 shell의 `footer#footer` 랜드마크 안에 쓴다. 사이트 유형에 따라 구성 요소를 덜어 쓰는 패턴이라, 모든 요소를 채우는 것이 목표가 아니다.

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
          <h2 class="site-footer__heading" id="footer-group-about">재단 소개</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-about">
            <li><a class="site-footer__link" href="/about/greeting">인사말</a></li>
            <li><a class="site-footer__link" href="/about/history">연혁</a></li>
            <li><a class="site-footer__link" href="/about/location">오시는 길</a></li>
          </ul>
        </div>
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-program">프로그램</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-program">
            <li><a class="site-footer__link" href="/program/exhibition">전시</a></li>
            <li><a class="site-footer__link" href="/program/performance">공연</a></li>
            <li><a class="site-footer__link" href="/program/education">교육</a></li>
          </ul>
        </div>
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-news">알림마당</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-news">
            <li><a class="site-footer__link" href="/news/notice">공지사항</a></li>
            <li><a class="site-footer__link" href="/news/press">보도자료</a></li>
          </ul>
        </div>
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-help">이용 안내</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-help">
            <li><a class="site-footer__link" href="/help/faq">자주 묻는 질문</a></li>
            <li><a class="site-footer__link" href="/help/sitemap">사이트맵</a></li>
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
            <li><a class="site-footer__link" href="/copyright">저작권 정책</a></li>
          </ul>
        </nav>
        <address class="site-footer__address">
          제주특별자치도 제주시 한라로 100<br>
          대표전화 064-123-4567 · 이메일 contact@example.org
        </address>
        <small class="site-footer__copy">© 2026 기관명. All rights reserved.</small>
      </div>

      <details class="site-footer__family">
        <summary class="site-footer__family-summary">
          패밀리 사이트
          <svg class="site-footer__family-icon icon icon--xsmall" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-down"></use></svg>
        </summary>
        <ul class="site-footer__family-list">
          <li><a class="site-footer__family-link" href="https://example.org/museum">미술관</a></li>
          <li><a class="site-footer__family-link" href="https://example.org/library">도서관</a></li>
        </ul>
      </details>
    </div>
  </div>
</footer>
```

## 시맨틱 구조

- **Root 태그**: `<footer id="footer" class="site-footer">` — 페이지에 하나, `main` 바깥 (R-15 page shell)
- **자식**: `.container` → `__top`(브랜드 + 푸터 메뉴) → `__bottom`(정책 링크·연락처·저작권·패밀리 사이트)
- **내비게이션**: 푸터 안 `nav`가 둘 이상이면 각각 `aria-label`로 구분한다 (`푸터 메뉴`, `약관 및 정책`)
- **연락처**: `<address>`는 이 사이트의 연락처에만 쓴다. 임의의 주소 문장에 쓰지 않는다
- **저작권**: `<small>` — 부가 고지임을 나타낸다

> 상세: `references/html-semantics.md#site-footer`

## Variant

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 | `.site-footer` | 푸터 메뉴 + 하단 고지. 일반사이트·공공기관 |
| 소형 | `.site-footer--compact` | `__top` 없이 `__bottom`만. 공공서비스·관리자 화면 |
| 반전 | `.site-footer--inverse` | 어두운 바탕. 일반사이트·커머스 표현형 한정 |

```html
<!-- 소형: 상단 메뉴 없이 정책 링크와 저작권만 -->
<footer id="footer" class="site-footer site-footer--compact">
  <div class="container">
    <div class="site-footer__bottom">
      <div class="site-footer__info">
        <nav class="site-footer__legal" aria-label="약관 및 정책">
          <ul class="site-footer__legal-list">
            <li><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보처리방침</a></li>
            <li><a class="site-footer__link" href="/terms">이용약관</a></li>
          </ul>
        </nav>
        <small class="site-footer__copy">© 2026 기관명</small>
      </div>
    </div>
  </div>
</footer>
```

## 사이트 유형별 구성

| 유형 | 변형 | 구성 | 비고 |
|------|------|------|------|
| 일반사이트 | 기본 / 반전 | 푸터 메뉴 + 정책 링크 + 연락처 + 저작권 (+ 패밀리 사이트) | 표현형이라 브랜드 톤을 푸터에서 가장 크게 연다 |
| 공공서비스 | 소형 | 정책 링크 + 저작권 | 과업 화면을 방해하지 않는다. 기관 식별자는 발주처 지침이 확인된 경우에만 |
| 공공기관 | 기본 | 푸터 메뉴 + 정책 링크 + 연락처 + 저작권 + 패밀리 사이트 | 공공 푸터 필수 링크는 과업지시서·기관 정책 확인 후 추가 |
| CMS·관리자 | 소형 | 저작권·버전 표기 정도 | utility 등급. 장식 없음 |
| 커머스·예약 | 기본 / 반전 | 약관·환불·개인정보 링크 + 사업자 정보 | 법정 표기 항목은 발주처·법무 확인 후 채운다 |

## 사용 조건

- 푸터 메뉴는 사이트맵을 복제하는 곳이 아니다 — 자주 찾는 경로만 3~5개 그룹으로 추린다
- 한 그룹의 링크는 5개 안팎으로 둔다. 길어지면 그룹을 나눈다
- 정책 링크 중 가장 중요한 하나(개인정보처리방침 등)에만 `--important`를 준다
- 패밀리 사이트는 **링크 클릭으로만** 이동한다. `<select>` 선택만으로 페이지가 바뀌지 않게 한다 (WCAG 3.2.2)
- 사업자 정보·법정 고지 문구는 지어내지 않는다 — 발주처가 확인해 준 값만 쓴다 (R-23)

## 접근성

- 랜드마크: `<footer>`는 `contentinfo`로 노출된다. 페이지에 하나만 둔다
- 푸터 `nav`가 여럿이면 `aria-label`이 서로 달라야 한다
- 그룹 제목은 `h2` + 목록 `aria-labelledby`로 연결해 스크린리더가 그룹 이름을 읽게 한다
- 링크 터치 영역 44×44px 이상 (R-13) — `__link`는 `min-h-[4.4rem]`를 포함한다
- 패밀리 사이트 `details`는 키보드 `Enter`/`Space`로 열고 닫는다. JS가 필요 없다
- 반전 변형: 일반 텍스트 4.5:1 이상을 유지한다 (`--color-gray-20` on `--color-bg-inverse`)
- 외부 사이트 링크는 새 창을 열지 않는다. 새 창이 필요하면 링크 텍스트나 `aria-label`에 "새 창"을 밝힌다
- 초점 외곽선: 칸을 꽉 채우는 링크(`__family-link`)는 `outline-offset`을 음수로 두어 안쪽에 그린다

## 출처

- 색상은 `--color-bg-subtler` · `--color-text` · `--color-text-subtle` · 반전은 `--color-bg-inverse` · `--color-text-inverse` · `--color-gray-20`
- 간격·타이포는 프로젝트 밀도에 맞는 CSS/Tailwind 직접값 사용
- CSS: `src/styles/6-components/footer.css`
- 아이콘: `chevron-down` 스프라이트 — `/assets/icons/sprite.svg` (아이콘 카탈로그, R-27)
