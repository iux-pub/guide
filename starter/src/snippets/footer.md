# 푸터 (Site Footer) — KRDS

KRDS 푸터(component_02_04) 기준의 페이지 하단 공통 영역. 페이지 shell의 `footer#footer` 랜드마크 안에 쓴다. 사이트 유형에 따라 항목을 덜어 쓰되, **정보 순서는 바꾸지 않는다**.

## KRDS 정보 순서

**서비스 로고 → 연락처 → 유틸리티 링크 → 정책 링크 → 저작권 정보** (명확한 이유 없이 바꾸지 않는다. 좁은 화면에서도 같은 순서로 쌓는다.)

- 서비스 로고·연락처·유틸리티 링크는 한 그룹(`__info`)으로 묶어 보이게 한다.
- 서비스 내비게이션(푸터 메뉴)은 선택이다. 두면 **메인 메뉴의 최상위 링크를 모두 같은 구조·레이블로** 넣는다.
- 운영기관 식별자는 공식 디지털 정부서비스(`publicIdentity: required`)일 때만, 푸터 안 마지막 구획에 둔다.

## 기본 마크업

```html
<footer id="footer" class="site-footer">
  <div class="container">
    <!-- 서비스 내비게이션(선택): 메인 메뉴 최상위 링크를 모두 같은 레이블로 -->
    <div class="site-footer__top">
      <nav class="site-footer__nav" aria-label="푸터 메뉴">
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-about">기관 소개</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-about">
            <li><a class="site-footer__link" href="/about/greeting">인사말</a></li>
            <li><a class="site-footer__link" href="/about/location">오시는 길</a></li>
          </ul>
        </div>
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-service">주요 사업</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-service">
            <li><a class="site-footer__link" href="/service/support">지원 사업</a></li>
            <li><a class="site-footer__link" href="/service/education">교육</a></li>
          </ul>
        </div>
        <div class="site-footer__group">
          <h2 class="site-footer__heading" id="footer-group-news">알림마당</h2>
          <ul class="site-footer__list" aria-labelledby="footer-group-news">
            <li><a class="site-footer__link" href="/news/notice">공지사항</a></li>
            <li><a class="site-footer__link" href="/news/press">보도자료</a></li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="site-footer__bottom">
      <!-- ① 서비스 로고 ② 연락처 ③ 유틸리티 링크 — 한 그룹 -->
      <div class="site-footer__info">
        <a class="site-footer__brand" href="/">
          <img class="site-footer__logo" src="/images/logo.svg" alt="기관명">
        </a>
        <!-- contentSources: 주소·대표전화·운영시간 — 아래는 형식 예시다 -->
        <address class="site-footer__address">
          (우)00000 제주특별자치도 제주시 ○○로 00<br>
          대표전화 064-000-0000 · 평일 09:00~18:00
        </address>
        <ul class="site-footer__utility" aria-label="바로가기">
          <li><a class="site-footer__link" href="/about/location">오시는 길</a></li>
          <li><a class="site-footer__link" href="/sitemap">사이트맵</a></li>
          <li>
            <details class="site-footer__family">
              <summary class="site-footer__family-summary">
                관련 기관
                <svg class="site-footer__family-icon icon icon--xsmall" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-down"></use></svg>
              </summary>
              <ul class="site-footer__family-list">
                <li><a class="site-footer__family-link" href="https://www.example.go.kr/">○○시청</a></li>
                <li><a class="site-footer__family-link" href="https://www.example.or.kr/">○○문화재단</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>

      <!-- ④ 정책 링크 — 개인정보 처리방침은 명칭 고정·강조 -->
      <nav class="site-footer__legal" aria-label="약관 및 정책">
        <ul class="site-footer__legal-list">
          <li><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></li>
          <li><a class="site-footer__link" href="/accessibility">웹 접근성 정책</a></li>
          <li><a class="site-footer__link" href="/copyright">저작권 정책</a></li>
        </ul>
      </nav>

      <!-- ⑤ 저작권 정보 -->
      <small class="site-footer__copy">© 2026 기관명. All rights reserved.</small>
    </div>
  </div>
</footer>
```

- 예시의 주소·전화·기관명은 형식 예시다(`○○`, `000-0000`). 실제 값은 Task Contract `contentSources`에서만 가져오고, 예시 값을 납품물에 복사하지 않는다(R-23).

## 시맨틱 구조

- **Root 태그**: `<footer id="footer" class="site-footer">` — 페이지에 하나, `main` 바깥 (R-15 page shell). 푸터의 모든 요소는 `<footer>` 안에 둔다(KRDS).
- **자식**: `.container` → `__top`(서비스 내비게이션, 선택) → `__bottom`(`__info`[로고·연락처·유틸리티] → `__legal` → `__biz`(선택) → `__copy`)
- **내비게이션**: 푸터 안 `nav`가 둘 이상이면 각각 `aria-label`로 구분한다 (`푸터 메뉴`, `약관 및 정책`)
- **연락처**: `<address>`는 이 사이트의 연락처에만 쓴다
- **저작권**: `<small>` — 부가 고지임을 나타낸다

> 상세: `references/html-semantics.md#site-footer`

## Variant

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 | `.site-footer` | 서비스 내비게이션 + 하단 정보. 일반사이트·공공기관 |
| 소형 | `.site-footer--compact` | `__top` 없이 `__bottom`만. 공공서비스·관리자 화면. 그래도 로고·연락처·정책 링크·저작권 순서는 지킨다 |
| 반전 | `.site-footer--inverse` | 어두운 바탕. 일반사이트·커머스 표현형 한정 |

```html
<!-- 소형: 서비스 내비게이션 없이 KRDS 정보 순서만 -->
<footer id="footer" class="site-footer site-footer--compact">
  <div class="container">
    <div class="site-footer__bottom">
      <div class="site-footer__info">
        <a class="site-footer__brand" href="/"><img class="site-footer__logo" src="/images/logo.svg" alt="서비스명"></a>
        <address class="site-footer__address">민원 문의 064-000-0000 · 평일 09:00~18:00</address>
      </div>
      <nav class="site-footer__legal" aria-label="약관 및 정책">
        <ul class="site-footer__legal-list">
          <li><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></li>
        </ul>
      </nav>
      <small class="site-footer__copy">© 2026 기관명</small>
    </div>
  </div>
</footer>
```

### 전자상거래 — 이용약관·사업자 정보

전자상거래가 있으면 이용약관과 사업자 정보를 반드시 표시한다(KRDS). 정책 링크 뒤, 저작권 앞에 둔다.

```html
<nav class="site-footer__legal" aria-label="약관 및 정책">
  <ul class="site-footer__legal-list">
    <li><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></li>
    <li><a class="site-footer__link" href="/terms">이용약관</a></li>
    <li><a class="site-footer__link" href="/refund">교환·환불 안내</a></li>
  </ul>
</nav>
<!-- contentSources: 사업자 정보 — 아래는 비실재 형식 예시다 -->
<dl class="site-footer__biz">
  <div><dt>상호</dt><dd>○○면세점</dd></div>
  <div><dt>대표자</dt><dd>○○○</dd></div>
  <div><dt>사업자등록번호</dt><dd>000-00-00000</dd></div>
  <div><dt>통신판매업 신고번호</dt><dd>제0000-○○○○-0000호</dd></div>
</dl>
```

## 표기 항목 카탈로그 (사이트 유형별)

| 항목 | 공공 포털 | 공공 업무 (compact) | 일반·기업 | 커머스·예약 | CMS·관리자 |
|------|-----------|---------------------|-----------|-------------|------------|
| 서비스 로고 | 필수 | 필수 | 필수 | 필수 | 권장 |
| 연락처(주소·대표/민원 전화·운영시간) | 필수 | 필수(민원 연락처) | 필수 | 필수 | 선택 |
| 유틸리티 링크(오시는 길·사이트맵·관련 기관·SNS) | 권장 | 선택 | 권장 | 권장 | 없음 |
| **개인정보 처리방침**(명칭 고정·강조) | **필수** | **필수** | **필수** | **필수** | **필수** |
| 이용약관 | 서비스 이용 약관이 있으면 | 같음 | 같음 | **필수(전자상거래)** | 같음 |
| 사업자 정보(상호·대표자·사업자등록번호·통신판매업 신고) | — | — | 법정 요구 시 | **필수(전자상거래)** | — |
| 웹 접근성 정책·저작권 정책·공공누리·이메일무단수집거부·영상정보처리기기 운영방침 | 요구 확인 시 | 요구 확인 시 | 요구 확인 시 | 요구 확인 시 | — |
| 인증마크(웹 접근성 품질인증 등) | 보유 시 | 보유 시 | 보유 시 | 보유 시 | — |
| 저작권 정보 | 필수 | 필수 | 필수 | 필수 | 필수 |
| 운영기관 식별자 | 공식 디지털 정부서비스일 때만(마지막 구획) | 같음 | 쓰지 않음 | 쓰지 않음 | 쓰지 않음 |

- 「요구 확인 시」 항목의 문구·값은 발주처 정책·과업지시서로 확인한 것만 쓴다. 지어내지 않는다(R-23).
- 인증마크 `alt`에는 이미지에 표기된 인증명·유효기간만 쓴다. 유효기간이 지난 인증마크는 내린다.

## 사용 조건

- 서비스 내비게이션을 두면 메인 메뉴의 모든 최상위 링크를 같은 레이블로 넣는다(KRDS). 하위 링크를 넣으면 메인 메뉴와 같은 구조를 따른다.
- 개인정보 처리방침은 **「개인정보 처리방침」** 명칭을 쓰고(구 명칭 「개인정보취급방침」 금지), 글자 굵기·색으로 다른 고지와 구분한다(`--important`는 이 링크에만).
- 관련 기관(패밀리 사이트)은 **링크 클릭으로만** 이동한다. `<select>` 선택만으로 페이지가 바뀌지 않게 한다 (WCAG 3.2.2)
- 존재하지 않는 페이지로 가는 링크, `#`·`javascript:` 링크를 두지 않는다.
- 본문이 뷰포트보다 짧으면 푸터가 뷰포트 하단에 오게 한다(page shell의 `body` 레이아웃).

## 접근성

- 랜드마크: `<footer>`는 `contentinfo`로 노출된다. 페이지에 하나만 둔다
- 푸터 `nav`가 여럿이면 `aria-label`이 서로 달라야 한다
- 그룹 제목은 `h2` + 목록 `aria-labelledby`로 연결해 스크린리더가 그룹 이름을 읽게 한다
- 링크 터치 영역 44×44px 이상 (R-13) — `__link`는 `min-h-[4.4rem]`를 포함한다
- 관련 기관 `details`는 키보드 `Enter`/`Space`로 열고 닫는다. JS가 필요 없다
- 반전 변형: 일반 텍스트 4.5:1 이상을 유지한다 (`--color-gray-20` on `--color-bg-inverse`)
- 외부 사이트 링크는 새 창을 열지 않는다. 새 창이 필요하면 링크 텍스트나 `aria-label`에 "새 창"을 밝힌다

## 출처

- 기준: KRDS 푸터 https://www.krds.go.kr/html/site/component/component_02_04.html
- 색상은 `--color-bg-subtler` · `--color-text` · `--color-text-subtle` · 반전은 `--color-bg-inverse` · `--color-text-inverse` · `--color-gray-20`
- CSS: `src/styles/6-components/footer.css`
- 아이콘: `chevron-down` 스프라이트 — `/assets/icons/sprite.svg` (아이콘 카탈로그, R-27)
