# 사이트 유형 판정 기준

KRDS 체크리스트는 모든 프로젝트에 같은 방식으로 적용하지 않는다. 코드 생성 전 사이트 유형을 먼저 판정하고, 공통 품질 규칙과 조건부 정부/공공 규칙을 분리한다.

<!-- profiles:begin — contracts/profiles.json에서 자동 생성. 직접 수정 금지. npm run build:profiles -->

## 사이트 유형

| 유형 | id | 적용 대상 | 기본 생성 | 정부 아이덴티티 |
|------|----|-----------|-----------|-----------------|
| 일반사이트 | `general-site` | 민간 기업, 브랜드, 캠페인, 포트폴리오, 회사 홈페이지 | 시맨틱 구조, 접근성, 색상 토큰, 반응형, 브랜드 표현 | 제외 |
| 공공서비스 | `public-service` | 중앙부처·지자체·공공기관이 시민에게 제공하는 민원, 신청, 조회, 정책, 참여 서비스 | KRDS 접근성·컴포넌트·서비스 패턴 적극 적용. 신청/검색/로그인/알림 흐름 보강 | 조건부 — 과업·기관 정책 확인 시만 |
| 공공기관 | `public-institution` | 공기업, 출자·출연기관, 산하기관, 재단, 공공기관 대표 홈페이지 | 공공 톤의 헤더/푸터, 기관 식별, 정보공개/공지/홍보 구조 | 조건부 — 과업·기관 정책 확인 시만 |
| CMS·관리자 | `cms-admin` | CMS, 관리자, 사내 업무 시스템, 운영 콘솔 | 고밀도 정보 구조, 폼/테이블/검색/필터/상태 패턴, 접근성 | 제외 |
| 커머스·예약 | `commerce-reservation` | 쇼핑몰, 면세점, 예약, 결제, 이벤트·프로모션 | 상품/주문/결제 접근성, 명확한 CTA, 전환 흐름 | 제외 |

## 유형별 Page Shell

사이트 유형 판정은 HTML 구조 선택으로 이어져야 한다. 정부/공공 아이덴티티 요소는 조건부 생성 항목이며 아래 shell에 기본 포함하지 않는다.

| 유형 | 기본 section 흐름 | 우선 컴포넌트 | 밀도 | 표현 등급 |
|------|-------------------|---------------|------|-----------|
| 일반사이트 | `section--intro` → `section--content` → `section--list`<br>또는 `section--intro` → `section--content` → `section--notice` | header, main-menu, card, list, btn | 여유 | 표현형 |
| 공공서비스 | `section--search` → `section--process` → `section--form` → `section--notice`<br>또는 `section--intro` → `section--process` → `section--data` → `section--notice` | breadcrumb, step-indicator, form, alert, table | 여유 | 절제형 |
| 공공기관 | `section--intro` → `section--notice` → `section--list` → `section--content` | header, main-menu, breadcrumb, card, pagination | 여유 | 절제형 |
| CMS·관리자 | `section--search` → `section--data` → `section--form`<br>또는 `section--search` → `section--data` → `section--notice` | form, select, table, pagination, badge, toast | 고밀도 | 기능형 |
| 커머스·예약 | `section--intro` → `section--list` → `section--form` → `section--notice`<br>또는 `section--intro` → `section--list` → `section--process` → `section--notice` | card, btn, form, step-indicator, alert | 여유 | 표현형 |

## 밀도 기준

간격은 토큰이 아니라 직접값이다. 아래는 유형별 출발점이며, 프로젝트 맥락에서 조정할 수 있다.

| 밀도 | section 패딩 (PC / 모바일) | 폼 행 간격 | 표 셀 패딩 | 기준 |
|------|---------------------------|------------|------------|------|
| 여유 | 8rem / 4rem | 2.4rem | 1.6rem | 읽기 중심 화면. 한 화면에 담는 정보보다 가독성을 우선한다. |
| 고밀도 | 4rem / 2.4rem | 1.6rem | 1rem | 반복 작업 화면. 스크롤과 클릭 수를 줄이는 쪽을 우선한다. 터치 입력 기기에서는 44px 하한을 그대로 지키고(R-13), 마우스 기반 데스크탑 화면에는 강제하지 않는다. |

## 표현 등급 기준

등급은 상한이지 목표가 아니다. 아래는 유형별 기본값이며, task contract의 expression 필드로 덮어쓸 수 있다.
모션 수치는 장식·스크롤 진입 모션 한정이다. 컴포넌트 피드백 모션(모달·토스트·인풋 전환)은 interaction-timing.md 소유로 등급 무관이다.

| 등급 | 정의 | hero | 시그니처 | 모션 | 제목 폰트 | 레이아웃 |
|------|------|------|----------|------|-----------|----------|
| 기능형 (`utility`) | 반복 업무 화면. 표현 요소가 과업 효율을 침해하지 않는 최소 수준. | none, text | 없음 | fade · 100~200ms | body-only | symmetric-grid |
| 절제형 (`restrained`) | 신뢰가 우선인 공공 톤. 브랜드는 색·서체 수준에서 드러나고 장식은 절제한다. | text, image, carousel | 최대 1 — 그래픽 패턴, 포토 톤 통일, 커스텀 일러스트 | fade, translate-16, scroll-fade-in-once · 150~300ms | body-first | alternating |
| 표현형 (`expressive`) | 브랜드 개성이 기억에 남아야 하는 사이트. 시그니처·타이포·섹션 리듬으로 정체성을 만든다. | text, image, carousel, video | 최대 3 — 그래픽 패턴, 커스텀 일러스트, 포토 트리트먼트, 타이포 모티프, 커스텀 불릿·구분선 | fade, translate-24, scale-2pct, stagger-50-80 · 200~400ms | heading-pairing | asymmetric |

- **기능형** — 브랜드 식별은 로고와 primary 색상으로만 한다. point 색은 상태·배지·필수 표시 등 기능적 용도 외 사용하지 않는다.
- **절제형** — 시그니처는 hero·인트로 구간 한정. displayFont body-first = 본문 폰트 기본, 기관 CI 전용 서체 또는 카탈로그 페어링이 계약된 경우만 제목 페어링.
- **표현형** — 제목 페어링은 contracts/art-direction.json 카탈로그에서 선택 — 재배포 가능 라이선스 + 한글 폴백 스택 필수. 본문 콘텐츠 영역은 그리드 유지.

## 조건부 생성

| 항목 | 생성 조건 | 생성하지 않는 경우 |
|------|-----------|--------------------|
| 공식 배너 | 공공서비스 중 정부 상징 사용이 명시되었거나 과업에서 요구됨 | 일반사이트, CMS·관리자, 커머스, 기관 정책 미확인 |
| 정부 상징 로고 | 정부 상징 사용 대상 서비스로 확인됨 | 자체 CI/BI가 우선인 일반사이트·공공기관·사내 프로젝트 |
| 운영기관 식별자 | 상위 운영기관 표시가 과업에 포함됨 | 운영기관 계층이 없거나 브랜드 사이트인 경우 |
| 공공 푸터 필수 링크 | 공공서비스 또는 공공기관 웹사이트 납품/운영 요구가 있음 | 일반사이트는 해당 법정/운영 링크로 대체 |

## 유형별 주의

- **일반사이트** — 정부 상징·공식 배너·운영기관 식별자를 생성하지 않는다.
- **공공서비스** — 공식 배너·정부 상징·운영기관 식별자는 과업지시서나 기관 정책이 확인된 경우에만 생성한다. 관광·홍보 성격 서비스는 task contract에서 expression을 expressive로 상향할 수 있다. 단 publicIdentity가 required면 restrained 상한.
- **공공기관** — 정부 상징은 기본값이 아니다. 기관 CI/BI와 과업 요구가 우선한다.
- **CMS·관리자** — 공공 운영 CMS라도 관리자 화면에는 업무 효율을 우선한다. 마케팅형 hero나 장식 카드 중심 구성을 피한다.
- **커머스·예약** — 법정 링크와 환불/교환/개인정보 안내가 필요하다. 공공기관이 운영하면 public-institution 조건을 병행한다. 주문·결제·인증 페이지의 task contract는 expression을 utility로 강등해 작성한다.

<!-- profiles:end -->

## 표현 등급 운용 원칙

등급 정의와 유형별 기본값은 위 생성 구간의 표가 정본이다. 운용은 다음 다섯 원칙을 따른다.

1. 등급은 상한이지 목표가 아니다 — "허용되니까"는 근거가 아니다.
2. 상향은 task contract `expression` 필드로만 하고, 근거 기록이 필수다. 하향은 언제나 자유다.
3. 페이지 단위 강등 — 폼·결제·인증·오류·검색결과는 사이트 등급 무관 utility~restrained 수위로 작성한다. 운반체는 페이지 단위 task contract, 확인은 납품 전 리뷰 체크리스트 항목이다.
4. 축 단위 예외 — 등급 묶음에서 축 하나만 열 때는 `exceptions[]`에 `"rule": "expression.hero"` 형식으로 근거와 함께 기록한다(예: 공공기관 메인 영상 배경 발주 요구). 통째 상향보다 이 경로를 우선한다.
5. publicIdentity 캡 — `required` 확정 시 상한은 restrained다(task contract 스키마가 강제한다). `unconfirmed` 상태에서는 상향을 보류한다.

### 표현 등급 판정 예시

실프로젝트의 등급 매핑은 저장소에 등재하지 않는다. 아래는 익명화한 판정 예시다.

| 입력 단서 | 판정 | 이유 |
|-----------|------|------|
| "군 단위 지자체의 관광 안내 사이트" | public-service + expressive 상향 후보 | 관광·홍보 성격 — task contract에 상향 근거를 기록한다. publicIdentity가 required로 확정되면 상한은 restrained |
| "출연 재단 대표 홈페이지, 정부 상징 사용 확인됨" | public-institution + restrained | publicIdentity required — 스키마가 상한 restrained를 강제한다 |
| "지역 특산물 온라인 스토어의 프로모션 시즌 개편" | commerce-reservation + expressive | 기본 등급 유지. 단 주문·결제·인증 페이지의 task contract는 utility로 강등한다 |

## 항상 생성에 반영

- `html lang`, 고유한 `<title>`, viewport
- `<a href="#main" class="skip-to-content">본문 바로가기</a>`
- `header#header`, `main#main`, `footer#footer`
- `main > section > .container`
- 각 `section`의 heading 또는 `aria-labelledby`/`aria-label`
- 버튼/링크/폼/이미지/테이블의 접근성 기본값
- `var(--color-*)` 색상 토큰, `var(--font-*)` 기본 폰트
- 포커스 표시, 키보드 접근, 터치 영역 44x44px 이상
- 상태 표현은 색상 + 텍스트/아이콘/ARIA를 함께 사용

공통 page shell:

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>

<header id="header" class="site-header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section section--content" aria-labelledby="section-title">
    <div class="container">
      <h1 id="section-title">페이지 제목</h1>
      ...
    </div>
  </section>
</main>

<footer id="footer" class="site-footer">
  <div class="container">...</div>
</footer>
```

## 조건부 생성

| 항목 | 생성 조건 | 생성하지 않는 경우 |
|------|-----------|--------------------|
| 공식 배너 | 공공서비스 중 정부 상징 사용이 명시되었거나 과업에서 요구됨 | 일반사이트, CMS·관리자, 커머스, 기관 정책 미확인 |
| 정부 상징 로고 | 정부 상징 사용 대상 서비스로 확인됨 | 자체 CI/BI가 우선인 일반사이트·공공기관·사내 프로젝트 |
| 운영기관 식별자 | 상위 운영기관 표시가 과업에 포함됨 | 운영기관 계층이 없거나 브랜드 사이트인 경우 |
| 공공 푸터 필수 링크 | 공공서비스 또는 공공기관 웹사이트 납품/운영 요구가 있음 | 일반사이트는 해당 법정/운영 링크로 대체 |
| 검색/로그인/신청/정책 서비스 패턴 | 해당 사용자 여정이 실제 화면에 존재함 | 해당 기능이 없는 화면 |

## 판정 규칙

1. 사이트 유형이 명시되어 있으면 그 유형을 따른다.
2. 명시가 없으면 일반사이트 또는 CMS·관리자로 가정하고 정부 아이덴티티 요소는 생성하지 않는다.
3. 공공서비스와 공공기관을 구분한다. 민원/신청/조회/정책 처리처럼 사용자 과업이 중심이면 공공서비스, 기관 소개/공지/정보공개/홍보가 중심이면 공공기관이다.
4. 공공기관 프로젝트라도 공식 배너와 정부 상징은 과업지시서, 기관 정책, 운영 주체가 확인된 경우에만 생성한다.
5. 적용 제외 항목은 체크리스트에서 `N/A`로 기록한다.
6. KRDS 패턴을 변형하면 `조건부 PASS`로 사유와 대체 기준을 기록한다.

## LLM 판정 절차

코드 생성 전에 다음 순서로 사이트 유형을 판정한다.

1. 사용자의 명시 표현을 찾는다: 정부, 지자체, 공공기관, 공기업, 산하기관, 민간, 기업, 브랜드, 쇼핑몰, 관리자, CMS, 사내 시스템.
2. 클라이언트/운영 주체를 확인한다: 일반 회사면 일반사이트, 내부 업무 시스템이면 CMS·관리자, 중앙부처·지자체·공공기관이면 공공서비스 또는 공공기관 후보로 둔다.
3. 사이트 목적을 확인한다: 민원/신청/정책/조회/참여 중심이면 공공서비스, 기관 소개/공지/정보공개/홍보 중심이면 공공기관, 상품/예약/결제면 커머스·예약, 운영/관리/통계면 CMS·관리자다.
4. 정부 상징 사용 여부를 별도 판정한다. 공공서비스·공공기관이라도 정부 상징 사용이 확인되지 않으면 공식 배너와 정부 상징 로고는 생성하지 않는다.
5. 증거가 부족하면 사용자에게 짧게 확인한다. 단, 구현을 계속해야 하는 상황에서는 정부 아이덴티티 요소를 제외하고 공통 접근성/구조 규칙만 적용한다.

## 판정 예시

| 입력 단서 | 판정 | 생성 방향 |
|-----------|------|-----------|
| "인포마인드 홈페이지 리뉴얼" | 일반사이트 | 회사 홈페이지. 브랜드 표현 + 접근성/시맨틱 구조. 정부 아이덴티티 N/A |
| "JDC면세점 반응형 홈페이지" | 공공기관 + 커머스·예약 성격 | 기관 운영 맥락과 상품/구매 흐름 병행. 공식 배너는 요구 확인 전 생성 금지 |
| "CMS inSTACK 관리자" | CMS·관리자 | 고밀도 폼/테이블/검색. 정부 아이덴티티 N/A |
| "지자체 민원 신청 서비스" | 공공서비스 | 신청 서비스 패턴 적용. 정부 상징/공식 배너는 과업 확인 후 |
| "쇼핑몰 이벤트 페이지" | 커머스·예약 또는 일반사이트 | 상품/구매 흐름과 법정 링크 중심 |
