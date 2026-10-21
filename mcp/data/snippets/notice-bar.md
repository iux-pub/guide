# 긴급 공지 (Notice Bar) — KRDS

KRDS 긴급 공지(Critical alerts) — 지금 대부분의 사용자가 알아야 하는 **한시적 사실 하나**를 본문 맨 위에 띠로 알린다. 블록 이름은 `notice-bar`다.

## 기본 마크업

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

- 예시 문구·날짜는 형식 예시다. 실제 값은 `contentSources`에서 가져온다(R-23).
- 링크는 **하나까지**다. 자세한 안내 페이지가 없으면 `<a>` 없이 문장만 쓴다.

## 배치 — 본문의 첫 요소

KRDS는 긴급 공지를 메인 메뉴와 히어로 사이, **본문 콘텐츠의 첫 요소**로 화면 폭 전체에 둔다. infoUX page shell에서는 `main#main`의 첫 `section`이다. 건너뛰기 링크로 본문에 들어온 사용자도 가장 먼저 읽는다.

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>

<header id="header" class="site-header">
  <div class="container">
    <!-- 로고, 메인 메뉴 -->
  </div>
</header>

<main id="main">
  <!-- 긴급 공지: main의 첫 section (메인 메뉴 다음, 히어로 앞) -->
  <section class="notice-bar notice-bar--warning" aria-label="사이트 공지">
    <div class="container notice-bar__inner">
      <svg class="notice-bar__icon icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#warning"></use></svg>
      <span class="notice-bar__label">예고</span>
      <p class="notice-bar__message">
        <a class="notice-bar__link" href="/notice/maintenance">10월 12일 0~6시 점검으로 온라인 신청 중단</a>
      </p>
    </div>
  </section>

  <section class="hero-bleed" aria-labelledby="intro-title">
    <div class="container hero-bleed__content">
      <h1 class="hero-bleed__title" id="intro-title">항구도시 문화재단</h1>
    </div>
  </section>
</main>

<footer id="footer" class="site-footer">
  <div class="container">
    <!-- 로고, 연락처, 저작권 -->
  </div>
</footer>
```

- `header#header` 앞이나 건너뛰기 링크 앞에 두지 않는다 — 본문 밖에 놓이면 건너뛰기 링크가 공지를 건너뛴다.
- root가 `section` + `.container` 직계 자식 + `aria-label`이라 main의 section 규칙(R-15)을 그대로 만족한다.

## Variant — 긴급도 (KRDS 상·중·하)

| 긴급도 | 상황 | 클래스 | 라벨 | 아이콘 |
|--------|------|--------|------|--------|
| 상 | 국가 재난·비상 상황, 갑작스러운 서비스 장애 | `.notice-bar--danger` | 긴급 | `error` |
| 중 | 서비스 중단 사전 예고 | `.notice-bar--warning` | 예고 | `warning` |
| 하 | 대부분의 사용자가 알아야 하지만 큰 영향은 없는 상황 | (클래스 없음 — 기본) | 안내 | `info` |

긴급도는 색만으로 전하지 않는다 — 라벨 텍스트가 같은 뜻을 전한다(WCAG 1.4.1). 아이콘은 장식이라 `aria-hidden="true"`다.

## 시맨틱 구조

- **Root 태그**: `<section class="notice-bar" aria-label="사이트 공지">` — 이름 있는 영역(region)이 되어 스크린리더 랜드마크 탐색에 잡힌다
- **자식**: `.container.notice-bar__inner` → `svg.notice-bar__icon`(장식) · `span.notice-bar__label`(긴급도) · `p.notice-bar__message`(짧은 문장, 링크 0~1개)
- **필수 ARIA**: `aria-label` (영역 이름)
- **라이브 영역을 쓰지 않는다**: `role="alert"` · `aria-live`는 붙이지 않는다. 페이지를 열 때 이미 있는 정적 안내이고, 낭독을 강제하면 매 페이지마다 방해가 된다

> 상세: `references/html-semantics.md#notice-bar`

## 사용 조건 (KRDS)

- **닫기·숨기기·접기 버튼을 두지 않는다.** 상황이 유효한 동안 모두가 봐야 하는 공지다. 상황이 끝나면 운영자가 내린다 — 그래서 JS가 없다
- **한 번에 하나만** 둔다. 긴급 공지 여러 개를 동시에 띄우지 않는다. 더 알릴 것은 공지사항 목록으로 안내한다
- 문장은 **한 줄**로 쓴다. 좁은 화면에서도 두 줄을 넘지 않게 짧게 쓰고, 자세한 내용은 링크한 안내 페이지에 둔다
- 상황이 유효한 동안만 둔다. 끝나면 바로 내린다 — 기간 없는 상시 안내(약관 변경 등)에 쓰지 않는다
- 홍보·이벤트·일반 공지에 쓰지 않는다(→ 공지사항 목록·배너). 폼 입력 결과·오류 안내에 쓰지 않는다(→ `alert`·입력 필드 메시지)
- 자동으로 넘어가거나 굴러가는 형태(롤링·마키)로 만들지 않는다. 5초 넘게 움직이는 콘텐츠는 멈출 수 있어야 한다(WCAG 2.2.2)
- 쿠키·개인정보 동의 배너와 다르다 — 동의 요청은 이 컴포넌트로 만들지 않는다
- 사이트 유형: 공공서비스·공공기관·일반사이트·커머스에서 쓴다. CMS·관리자는 시스템 공지를 `alert`로 화면 안에 둔다

### 다른 알림 컴포넌트와의 구분

| | 긴급 공지 | Alert | Toast |
|---|---------|-------|-------|
| 위치 | 본문 첫 요소(main 첫 section) | 해당 콘텐츠 영역 안 | 화면 모서리 |
| 성격 | 지금 대부분이 알아야 할 한시적 사실 (정적) | 이 화면의 상태 메시지 | 방금 한 동작의 결과 |
| 사라짐 | 운영자가 내릴 때까지 (닫기 없음) | 상태가 바뀔 때 | 몇 초 뒤 자동 |
| 라이브 영역 | 쓰지 않음 | `role="alert"`/`status` | `role="status"`/`alert` |

## 접근성

- 영역 이름 `aria-label="사이트 공지"` — 한 번에 하나만 두므로 이름이 겹치지 않는다
- 링크는 밑줄로 구분한다. 색 차이만으로 링크임을 전하지 않는다
- 터치 영역: 링크 `min-h-[4.4rem]` (R-13)
- 대비: 본문 텍스트 `--color-text`, 라벨은 `--color-text-inverse` on `--color-information-60`/`--color-warning-60`/`--color-danger-60` (4.5:1 이상)
- 페이지를 보는 중에 새로 생긴 긴급 안내(장애 발생 직후 등)를 동적으로 알릴 때는 이 컴포넌트가 아니라 [alert](alert.md)의 `role="alert"`를 쓴다

## 출처

- 기준: KRDS 긴급 공지 https://www.krds.go.kr/html/site/component/component_04_02.html
- 색상은 `--color-info-surface` · `--color-information-20` · `--color-information-60` (긴급도별 warning/danger 동일 구조)
- 간격·타이포는 프로젝트 밀도에 맞는 CSS 값·Tailwind rem 임의값 사용
- CSS: `src/styles/6-components/notice-bar.css` (JS 없음)
- 아이콘: `info` · `warning` · `error` 스프라이트 — `/assets/icons/sprite.svg` (아이콘 카탈로그, R-27)
