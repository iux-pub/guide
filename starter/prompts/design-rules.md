# 디자인 규칙

> 생성물이다 — `npm run build:prompts`가 site/design/*.md와 references/*.md에서 만든다. 직접 고치지 않는다.
> 핵심만 추렸다. 전체 내용은 절마다 적힌 원문을 본다. KRDS가 언제나 우선한다.

## KRDS 준수 체크리스트

- [ ] RFP 또는 과업지시서에서 요구하는 KRDS 준수 범위를 확인했다
- [ ] 필수, 권장, 우수 중 이번 사업에서 목표로 하는 준수 수준을 정했다
- [ ] 오류 발생 시 원인과 해결 방법을 명확히 제공한다
- [ ] 색상만으로 상태나 정보를 전달하지 않는다
- [ ] 브랜드 색상 오버라이드는 접근성 대비를 통과한다
- [ ] 기본 글꼴은 프로젝트 기준 글꼴을 사용한다
- [ ] 줄간격과 문단 간격이 읽기 흐름을 방해하지 않는다
- [ ] 화면 큰 영역은 기존 인포마인드 패턴인 `.skip-to-content`, `header#header`, `main#main`, `footer#footer` 구조를 유지한다
- [ ] `main` 내부는 `section > .container` 단위로 구성한다
- [ ] 각 `section`은 heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름을 제공한다

| 판정 | 의미 |
|------|------|
| PASS | KRDS 지침을 충족하며 구현·증빙이 가능하다 |
| 조건부 PASS | 서비스 맥락상 변형했으나 사유와 대체 기준을 문서화했다 |
| FAIL | KRDS 필수 지침, 접근성, 사용성, 상호작용 기준을 충족하지 못한다 |
| N/A | 해당 화면·기능에 적용 대상이 아니다 |

> 상세: site/design/krds-compliance-checklist.md


---

## 마이크로카피

- **사용자를 탓하지 않는다** -- 「잘못 입력했습니다」가 아니라 「형식이 올바르지 않습니다」처럼 상태를 서술한다
- **기술 용어 금지** -- Error 500, null reference 같은 내부 오류 코드를 노출하지 않는다
- **다시 시도할 경로 제공** -- 가능하면 「다시 시도」 버튼을 함께 둔다
- **사용자 입력 유지** -- 오류가 나도 입력값을 지우지 않는다
- **대상을 밝힌다**: 「삭제」보다 「게시글 삭제」 — 되돌릴 수 없는 동작은 무엇을 지우는지 쓴다
- **짧게 쓴다**: 두세 어절 안에서 끝낸다. 버튼 안에서 줄을 바꾸지 않는다
- **같은 개념에는 같은 단어**: 「삭제」와 「제거」를 섞지 않는다
- **경어 수준 통일**: 한 화면에서 합쇼체와 해요체를 섞지 않는다(R-44)
- **성공 메시지는 짧게**: 일상적인 저장·등록에 축하 표현을 쓰지 않는다
- 입력 조건(글자 수, 형식)은 placeholder가 아니라 보조설명(`form-field__hint`)에 쓰고 `aria-describedby`로 연결한다.

| 잘못된 예 | 올바른 예 |
|-----------|-----------|
| "오류가 발생했습니다" | "저장하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주십시오." |
| "잘못된 입력입니다" | "이메일 주소 형식이 올바르지 않습니다. name@example.kr 형식으로 입력해 주십시오." |
| "에러" | "파일 크기가 10MB를 넘습니다. 10MB 이하 파일을 선택해 주십시오." |

> 상세: site/design/microcopy.md


---

## 사이트 유형 판정 기준

### 사이트 유형

| 유형 | id | 적용 대상 | 기본 생성 | 정부 아이덴티티 |
|------|----|-----------|-----------|-----------------|
| 일반사이트 | `general-site` | 민간 기업, 브랜드, 캠페인, 포트폴리오, 회사 홈페이지 | 시맨틱 구조, 접근성, 색상 토큰, 반응형, 브랜드 표현 | 제외 |
| 공공서비스 | `public-service` | 중앙부처·지자체·공공기관이 시민에게 제공하는 민원, 신청, 조회, 정책, 참여 서비스, 단일 업무 시스템(청약·예약·통계·신고·데이터 포털) | KRDS 접근성·컴포넌트·서비스 패턴 적극 적용. 신청/검색/로그인/알림 흐름 보강 | 조건부 — 과업·기관 정책 확인 시만 |
| 공공기관 | `public-institution` | 공기업, 출자·출연기관, 산하기관, 재단, 공공기관 대표 홈페이지, 부처·지자체·공공기관 대표 누리집(포털형) | 공공 톤의 헤더/푸터, 기관 식별, 정보공개/공지/홍보 구조 | 조건부 — 과업·기관 정책 확인 시만 |
| CMS·관리자 | `cms-admin` | CMS, 관리자, 사내 업무 시스템, 운영 콘솔 | 고밀도 정보 구조, 폼/테이블/검색/필터/상태 패턴, 접근성 | 제외 |
| 커머스·예약 | `commerce-reservation` | 쇼핑몰, 면세점, 예약, 결제, 이벤트·프로모션 | 상품/주문/결제 접근성, 명확한 CTA, 전환 흐름 | 제외 |

### 유형별 Page Shell

사이트 유형 판정은 HTML 구조 선택으로 이어져야 한다. 정부/공공 아이덴티티 요소는 조건부 생성 항목이며 아래 shell에 기본 포함하지 않는다.

| 유형 | 기본 section 흐름 | 우선 컴포넌트 | 밀도 | 표현 등급 |
|------|-------------------|---------------|------|-----------|
| 일반사이트 | `section--intro` → `section--content` → `section--list` / 또는 `section--intro` → `section--content` → `section--notice` | header, main-menu, card, list, btn | 여유 | 표현형 |
| 공공서비스 | `section--search` → `section--process` → `section--form` → `section--notice` / 또는 `section--intro` → `section--process` → `section--data` → `section--notice` | breadcrumb, step-indicator, form, alert, table | 여유 | 절제형 |
| 공공기관 | `section--intro` → `section--notice` → `section--list` → `section--content` | header, main-menu, breadcrumb, card, pagination | 여유 | 절제형 |
| CMS·관리자 | `section--search` → `section--data` → `section--form` / 또는 `section--search` → `section--data` → `section--notice` | form, select, table, pagination, badge, toast | 고밀도 | 기능형 |
| 커머스·예약 | `section--intro` → `section--list` → `section--form` → `section--notice` / 또는 `section--intro` → `section--list` → `section--process` → `section--notice` | card, btn, form, step-indicator, alert | 여유 | 표현형 |

> 상세: references/project-profiles.md


---

## 인터랙션 타이밍

### 전환 시간

| 종류 | 시간 | 적용 |
|------|------|------|
| 사용자 동작에 답하는 전환 | 150~250ms | 호버, 초점, 누름, 선택, 열림·닫힘. 등급과 상관없이 빠짐없이 준다 |
| 장식·스크롤 진입 모션 — 기능형 | 200ms 이하 | 페이드만. 스크롤 진입 모션은 쓰지 않는다(R-22) |
| 장식·스크롤 진입 모션 — 절제형 | 300ms 이하 | 페이드, 16px 이동, 한 번만 나타나는 스크롤 페이드 |
| 장식·스크롤 진입 모션 — 표현형 | 400ms 이하 | 페이드, 24px 이동, 2% 확대, 50~80ms 간격의 순차 등장 |
| 모든 전환 | 500ms 초과 금지 | 로딩 표시(`spinner`)의 회전만 예외다 |

- 카탈로그의 기본 전환은 **150ms**다. 새 컴포넌트도 150ms에서 시작하고, 이동 거리가 큰 전환만 250ms까지 늘린다.
- 무한 반복은 로딩 표시에만 쓴다. 로고 마키, 떠다니는 장식, 반복되는 강조 효과는 쓰지 않는다(R-22·R-33).
- 의도한 등장 효과는 페이지에 하나다. 모든 섹션이 떠오르는 화면은 템플릿 서명이다(R-51).
- 영상은 자동 재생하지 않는다. 무음 배경 영상도 사용자가 재생한다(KRDS).

### Do / Don't

| Do | Don't |
|----|-------|
| 사용자 동작에 답하는 전환 150~250ms | 500ms를 넘는 전환 |
| 호버·초점·누름·비활성 상태를 모두 만든다 | 초점 상태 없이 납품 |
| 색으로 답하는 호버 | 호버에서 크기가 바뀌어 주변을 미는 요소 |
| `transform`·`opacity` 전환 | `top`·`left`·`width`·`height` 전환을 새로 추가 |
| 의도한 등장 효과 한 곳 | 모든 섹션의 페이드·슬라이드 등장 |
| 로딩 표시에만 무한 반복 | 로고 마키, 반복되는 장식 모션 |
| 사용자가 재생하는 영상 | 자동 재생 영상(무음 포함) |
| `prefers-reduced-motion` 가드 | 가드 없는 `animation`·`@keyframes` |
| 감속 이징(`ease-out` 계열) | overshoot·bounce, 패럴랙스, scroll-jacking |

> 상세: site/design/interaction-timing.md


---

## UI 상태 패턴

### 컴포넌트별 상태 셋

납품 전에 아래 상태를 컴포넌트마다 실물로 확인한다. 상태는 ARIA·`hidden`·`disabled` 속성으로 먼저 표현하고 `.is-*`·`.has-*` 클래스는 쓰지 않는다(R-17).

| 컴포넌트 | 갖출 상태 | 마크업·클래스 |
|----------|-----------|----------------|
| `btn` | default · hover · focus-visible · active · disabled · loading | hover·active는 `--color-button-{variant}-fill-hover`·`-pressed`, 초점 링은 전역(`reset.css`), 비활성은 `disabled`. loading은 전용 클래스가 없다 — 아래 「로딩 상태」 |
| `form`(`input`·`textarea`·`select`) | default · hover · focus · disabled · read-only · error | error는 `input--error` 또는 `aria-invalid="true"` + `form-field__message--error`를 `aria-describedby`로 연결 |
| `check`·`radio`·`switch` | default · hover · focus-visible · checked · disabled | `input`의 `:checked`·`:disabled`가 모양을 바꾼다. 별도 클래스 없음 |
| `table`·`list` | empty · loading · error | 전용 클래스가 없다 — 빈 상태는 사실 문장, 로딩은 `spinner`, 오류는 `alert alert--danger` |
| `alert` | 4톤 | `alert--info` · `alert--success` · `alert--warning` · `alert--danger` |
| `badge` | 4톤 | `badge`(기본 = danger 색) · `badge--info` · `badge--success` · `badge--warning`. 그 밖에 `badge--primary`·`badge--neutral`·`badge--dot` |
| `pagination` | 양끝 disabled, 현재 페이지 | 첫·마지막 페이지의 `pagination__nav`에 `disabled` + `aria-disabled="true"`, 현재 페이지는 `aria-current="page"` |
| `tab` | default · hover · focus-visible · selected | 선택은 `aria-selected="true"`. 비활성 탭은 만들지 않는다(KRDS) |

버튼의 상태별 토큰:

| 상태 | `btn--primary` | 그 밖의 variant |
|------|----------------|-----------------|
| default | `--color-button-primary-fill` | `--color-button-{variant}-fill` |
| hover | `--color-button-primary-fill-hover` | `--color-button-{variant}-fill-hover` |
| active | `--color-button-primary-fill-pressed` | `--color-button-{variant}-fill-pressed` |
| focus-visible | `outline: 0.4rem solid var(--color-border-primary)`, `outline-offset: 2px` | 같음 |
| disabled | `--color-button-disabled-fill` · `--color-text-disabled` · `--color-button-disabled-border` | 같음 |

전환 시간은 인터랙션 타이밍을 따른다.

> 상세: site/design/ui-states.md


---

## 아이콘 시스템

- **표정 혼용 금지**: 슬림·레귤러·볼드·필 표정은 스프라이트 파일(`sprite-slim.svg`·`sprite.svg`·`sprite-bold.svg`·`sprite-fill.svg`)로 갈린다. 한 제품 안에서 표정을 통일한다
- **같은 아이콘 = 같은 의미**: 한 제품에서 ★이 "즐겨찾기"이면, 다른 곳에서 ★을 "평점"으로 사용하지 않는다
- `.icon`은 `vertical-align: -0.125em`과 `flex-shrink: 0`을 가진다 — 텍스트 흐름 안에서 글자 기준선에 맞고, flex 안에서 줄어들지 않는다
- 텍스트 흐름 안에서 글자 크기를 따라가야 하면 `.icon--inherit`(1em)를 쓴다

### Do / Don't

| Do | Don't |
|----|-------|
| 카탈로그 세트 1종, 표정 1종 | 출처·표정 혼용 |
| 크기: 16/20/24/32/40px (`.icon` 사이즈 클래스) | 18/22/26/28/36px 사용, `width`·`height` 직접 지정 |
| 터치 타겟 44x44px 확보 (`.btn`) | 24px 아이콘을 그냥 버튼으로 |
| 보이는 레이블과 함께 쓴다 | 레이블 없는 아이콘만 늘어놓기 |
| 아이콘은 글자 옆에 배경 없이 | 원·사각 배경에 넣은 같은 크기 아이콘 나열 |
| 아이콘만 있는 버튼에 `aria-label` | 접근 가능한 이름이 없는 아이콘 버튼 |
| 같은 아이콘 = 같은 의미 | 맥락마다 다른 의미로 재사용 |
| 스프라이트 `<use>` + `aria-hidden="true"` | `<img>` 태그로 아이콘 삽입, path를 직접 그린 SVG |
| `currentColor`로 색상 상속 | 아이콘에 하드코딩 색상 |

> 상세: site/design/icon-system.md


---

## 프론트엔드 미학

- [ ] 실제 기관 용어·메뉴·사진의 출처(`contentSources`)를 확보했는가
- [ ] 배경·글자·테두리 의미 토큰과 상태색(danger/warning/success/info)을 `tokens/foundation.json` 그대로 쓰는가 — 프로젝트에서 재정의하지 않는다
- [ ] 글자 크기는 KRDS 타이포 단계에서 골랐는가 — 크기를 토큰으로 만들지 않고 rem 값으로 쓴다(R-37·R-38)
- 서체는 카탈로그 페어링 다섯 가지(`references/art-direction.md` §3) 안에서 고른다. 본문은 `var(--font-sans)`(Pretendard GOV)로 고정하고, 제목에만 페어링 서체를 쓴다. 카탈로그 밖 서체를 불러오지 않는다(R-26)
- 한 화면에 쓰는 글자 크기는 다섯 가지 이하, 굵기는 400과 700을 기본으로 한다
- **인포마인드 제품 UI**: `PretendardGOV` + `JetBrains Mono`가 표준이다. 메인·랜딩에서는 표현 등급이 허용하면 제목 페어링(`formal-serif`·`product-modern` 등)을 방향 라운드의 한 안으로 검토한다
- **한국어 행간**: `line-height: 1`(leading-none) 사용 금지. 한국어는 라틴보다 글자 높이가 커서 본문 1.6~1.7, 제목 1.5(KRDS 150%)를 지키고 1.5 미만으로 내리지 않는다(R-24)
- 색을 고르기 전에 전략을 고른다: 절제(중립 바탕 + 강조 하나), 몰입(짙은 색 한 가지가 화면의 30~60%), 풀 팔레트(역할이 정해진 3~4색). 기능형·서브는 절제, 공공기관·관광 메인은 몰입을 먼저 검토한다
- 섹션을 위에서부터 적고 각 바탕 토큰을 쓰는 「면 지도」를 그린다. 흰색과 연회색만 번갈아 쓰면 면이 구분되지 않는다. 면이 바뀌는 곳은 페이지에 2~4곳이다
- 짙은 면 위의 버튼·선·초점 링은 그 면에 맞게 바꾼다. 보조 글자는 회색이 아니라 같은 색의 밝은 단계를 쓴다

| 단계 | 증상 | 막는 수단 |
|------|------|-----------|
| 슬롭 | 보라 그라데이션, 글래스, 이모지 아이콘, 가짜 수치, 번역투 문구 | 규칙 검사(R-23·R-34·R-36·R-43·R-51) |
| 무개성 | 규칙은 지켰는데 흰 바탕과 가는 선만 남아 관리자 화면처럼 보인다 | 크기 대비, 색 면, 사진(아래 「미학 원칙」) |
| 전형 조립 | 사진 히어로 → 원형 아이콘 바로가기 → 탭 게시판 → 링크 목록. 검사는 모두 통과하는데 이름만 바꾸면 다른 기관 사이트다 | 컨셉, 방향 라운드, 블록 형식 선택, 렌더 비평(`design-intelligence.md`) |

> 상세: site/design/aesthetics.md


---

## 아트 디렉션

### 1. 표현 등급

| 등급 | 정의 | hero | 시그니처 | 모션 | 제목 폰트 | 레이아웃 |
|------|------|------|----------|------|-----------|----------|
| 기능형 (`utility`) | 반복 업무 화면. 표현 요소가 과업 효율을 침해하지 않는 최소 수준. | none, text | 없음 | fade · 100~200ms | body-only | symmetric-grid |
| 절제형 (`restrained`) | 신뢰가 우선인 공공 톤. 브랜드는 색·서체 수준에서 드러나고 장식은 절제한다. | text, image, carousel | 최대 1 — 그래픽 패턴, 포토 톤 통일, 커스텀 일러스트 | fade, translate-16, scroll-fade-in-once · 150~300ms | body-first | alternating |
| 표현형 (`expressive`) | 브랜드 개성이 기억에 남아야 하는 사이트. 시그니처·타이포·섹션 리듬으로 정체성을 만든다. | text, image, carousel, video | 최대 3 — 그래픽 패턴, 커스텀 일러스트, 포토 트리트먼트, 타이포 모티프, 커스텀 불릿·구분선 | fade, translate-24, scale-2pct, stagger-50-80 · 200~400ms | heading-pairing | asymmetric |

| 유형 | 기본 등급 | 타이포 후보 | 팔레트 후보 | 섹션 리듬 | 카피 톤 |
|------|-----------|-------------|-------------|-----------|---------|
| 일반사이트 (`general-site`) | 표현형 (`expressive`) | standard-gov, product-modern, formal-serif, retro-display | coast-teal, market-terracotta | 풀블리드 인트로(hero-bleed)→이미지-텍스트 교차(section-media)→리스트 변주 허용 | 합쇼체 기본. 버튼 레이블은 동사형(KRDS) — 완료·닫기·취소·추가·삭제 같은 일반 작업만 명사형. 직역체·2인칭 '당신' 금지 |
| 공공서비스 (`public-service`) | 절제형 (`restrained`) | standard-gov | trust-blue, coast-teal | 과업 진입(search) 우선. 장식 hero는 화면 1/2 이하 | 합쇼체 고정. 느낌표 금지. KRDS 용어 우선 |
| 공공기관 (`public-institution`) | 절제형 (`restrained`) | standard-gov, formal-serif | trust-blue | 기관 정체성+공지 결합형 인트로. 슬라이더는 정지 컨트롤 필수 | 합쇼체 고정. 성과 홍보 어조 금지 — 사실 서술 |
| CMS·관리자 (`cms-admin`) | 기능형 (`utility`) | standard-gov, technical-global | trust-blue | hero 없음(profiles 소유 참조). 첫 화면은 검색/필터+데이터 | 개조식. 문장 최소화. 버튼 레이블은 동사형(KRDS) — 일반 작업(완료·닫기·취소·추가·삭제)과 길이 제약이 있을 때만 명사형 |
| 커머스·예약 (`commerce-reservation`) | 표현형 (`expressive`) | standard-gov, product-modern | market-terracotta, trust-blue | 상품·프로모션 중심, 전환 CTA 1개 원칙. 결제 플로우는 utility 강등 | 합쇼체 기본. 근거 없는 최상급 금지. 가격·기간 사실 정보 우선 |

등급 운용은 여섯 원칙을 따른다.

1. 등급은 상한이지 목표가 아니다 — "허용되니까"는 근거가 아니다.
2. 상향은 task contract `expression` 필드로만 하고, 근거 기록이 필수다. 하향은 언제나 자유다.
3. 페이지 단위 강등 — 폼·결제·인증·오류·검색결과는 사이트 등급 무관 utility~restrained 수위로 작성한다. 운반체는 페이지 단위 task contract, 확인은 납품 전 리뷰 체크리스트(§9)다.
4. 축 단위 예외 — 등급 묶음에서 축 하나만 열 때는 `exceptions[]`에 `"rule": "expression.hero"` 형식으로 근거와 함께 기록한다(예: 공공기관 메인 영상 배경 발주 요구). 통째 상향보다 이 경로를 우선한다.
5. publicIdentity 캡 — `required` 확정 시 상한은 restrained다(task contract 스키마가 강제). `unconfirmed` 상태에서는 상향을 보류한다.
6. 메인·랜딩 예외 — 메인·랜딩 생성에서는 이 등급을 디자인 상한으로 쓰지 않는다(`design-intelligence.md` §1-3). 바닥 검사(R-번호)와 KRDS 대조는 그대로 적용한다.

컴포넌트 피드백 모션(모달·토스트·인풋 전환)은 interaction-timing 소유로 등급 무관이다. 위 표의 모션 수치는 장식·스크롤 진입 모션에만 적용된다.

point 색 사용 수위 — point는 시선을 한 곳으로 모으는 색이다. 섹션당 1~2회, 화면 면적의 10% 이내 감각을 지키고, utility 등급에서는 상태·배지·필수 표시 등 기능적 용도 외에 쓰지 않는다. 이 수치는 계약이 아니라 저작 감각 기준이다.

### 2. 한글 조판

| 항목 | 값 |
|------|-----|
| word-break / overflow-wrap | `keep-all` / `break-word` |
| 본문 line-height | 1.6~1.7 (기본 1.7, 고밀도 기본 1.6, lint 하한 1.5) |
| 제목 line-height | 1.5~1.5 |
| 제목 letter-spacing | 0~0.1rem (3.2rem 이상부터) |
| 제목 최대 줄수 | 2 |
| weight | 본문 기본 400 · 인라인 강조 상한 700 · 제목 상한 700 · 화면당 4종 이하 |

> lintFloor는 R-24 검출기의 warn 임계(이 값 미만이 warn), min~max는 저작 기준값. 제목 line-height 1.5와 letter-spacing(3.2rem 이상 제목·디스플레이 0.1rem, 그 밖 0. 예외: 2.4rem 이상 제목 블록만 -0.03em 이내(em 단위, 2026-11-23 오너 승인 — 국내 수상 공공사이트 다섯 곳 모두 제목 자간 -0.01~-0.06em, R-24 검출기가 같은 블록의 글자 크기를 본다))은 KRDS 타이포그래피 표(모든 스타일 150%, display·heading xlarge·large 1px)를 따른다 — 음수 자간은 쓰지 않는다. bodyEmphasisMax 700은 인라인 강조 한정 — 연속 문단 볼드 금지. headingMax 700은 h1~h2급 한정. 상세 산문: references/art-direction.md §2.

- 본문 줄길이는 28~42자(공백 포함)를 권장한다. 게시판 목록·약관·표처럼 문서형 콘텐츠는 예외다 — 줄길이를 맞추려고 컨테이너를 쪼개지 않는다.
- 숫자가 정렬되는 화면(표·가격·통계)은 `font-variant-numeric: tabular-nums` 또는 `--font-mono`를 쓴다.
- 폰트 로딩 — `font-display: swap` 기본. preload는 본문 400 + 제목 대표 1종만 한다. 서브셋 기준은 KS X 1001 완성형 2,350자다.
- WCAG 1.4.12 텍스트 간격 내성 — 사용자가 행간·자간을 키워도 잘리거나 겹치지 않아야 한다. 고정 높이 컨테이너에 본문 텍스트를 담지 않는다.
- 단어가 어색하게 갈라지면 `&nbsp;` 강제 병기 대신 카피를 고친다.

### 10. 안티패턴 색인

기계 검출 규칙은 rules.json이 정본이다 — R-23 가짜·자리 콘텐츠(5번의 출처 없는 수치·가짜 후기는 경고), R-24 한글 조판 하한, R-25 섹션 리듬, R-26 폰트 한글 fallback, R-34 장식 효과(3번의 보라 그라데이션·4번의 글래스모피즘 포함), R-36 이모지 아이콘·장식, R-43 카피 톤(6번). 아래 10건은 산문 판정 목록이며 이 문서가 유일한 등재처다.

1. AI 에디토리얼 룩 — 크림 오프화이트+세리프+테라코타 조합 서명. brand 저작 시점에 판정한다. [owner: art-direction]
2. AI 다크테크 룩 — 니어블랙+애시드그린+소문자 mono. [owner: art-direction]
3. 보라→파랑 그라데이션 CTA·히어로. [owner: art-direction / 버튼 체계는 krds-components]
4. 전면 글래스모피즘·전 요소 과대 라운딩. [owner: art-direction]
5. 근거 없는 통계 히어로·가짜 후기 캐러셀. [owner: art-direction / 수치 근거는 수동 검수]
6. 직역 마케팅 카피 — "지금 시작하세요"·"당신"·느낌표 남발. [owner: microcopy — 세부 위임]
7. 어두운 오버레이+중앙 흰 문구+스크롤 화살표 히어로. [owner: art-direction]
8. 무한 롤링 로고 마키·scroll-jacking·500ms 초과 장식 모션·**장식/스크롤 진입 모션의** overshoot easing. 모달·토스트·인풋 전환 같은 컴포넌트 피드백 모션은 이 금지의 대상이 아니다 — interaction-timing 소유(등급 무관, `contracts/profiles.json` 모션 note). [owner: interaction-timing / R-22]
9. 요구에 없는 다크모드 토글 — infoUX는 high-contrast 2모드 체계다. [owner: tokens]
10. weight 700 남발·영문 display 폰트의 한글 fallback 미설계. [owner: art-direction hangul / R-26]

서명 목록은 `design-intelligence.md` §7이 정본이다. §7-1은 검사를 통과하는 전형 조립(사진 히어로 → 원형 아이콘 바로가기 → 탭 게시판 → 링크 3열), §7-2는 템플릿 장식(제목 위 분류 표지, 장식 번호, 전 섹션 등장 효과, 굵은 색 옆선, 같은 크기 카드 구조 등)이다. 기계 검출은 R-51(경고)이고 전형 조립은 렌더 비평의 결함 문항(§8-3)으로 본다.

> 상세: references/art-direction.md


---

## 한국형 웹 패턴

### 9. AI 슬롭 방지 — 한국형 메인

규정은 지켰는데 「AI가 만든 티」가 나는 메인의 증상과, 그 대신 할 것이다. `art-direction.md` §10 안티패턴과 겹치는 항목은 그 번호로 링크한다. 납품 전 `art-direction.md` §9 리뷰 체크리스트(KRDS 대조 포함)와 함께 1회 점검한다.

기계 검사가 맡는 것 — 자리 문구·지어낸 연락처·출처 없는 수치(R-23), 번역투·재촉형 버튼·공공 느낌표(R-43), 푸터 개인정보 처리방침(R-32), 공공 통합검색·공공 메인 과업 진입·마케팅 섹션(R-40), 서브 브레드크럼·서브 히어로(R-41), 장식 효과(R-34), 이모지(R-36). 아래 표의 나머지는 리뷰로 본다.

| 번호 | 증상 | 왜 문제인가 | 대신 할 것 | 연결 |
|------|------|-------------|------------|------|
| KR-M20 | 해외 SaaS 랜딩 문법을 공공·관광 메인에 적용 — 중앙 대형 헤드라인 + 서브카피 + CTA 2개 히어로, 기능 3열 카드, 고객 로고 띠, 요금·FAQ 블록, 「지금 시작하세요」 | 공공·관광 사용자는 공지·바로가기·일정·검색을 찾으러 온다. 과업 진입이 밀리고 레시피와 어긋난다 | §2 레시피 순서를 따른다. 히어로 다음은 1순위 과업 정적 블록(KR-M01)이다. 카피는 기관 용어(`contentSources`)로 쓴다 | §2, `art-direction.md` §5·§10-6 |
| KR-M21 | 카드 그리드 남발 — 모든 섹션이 「중앙 제목 + 3~4열 카드」 | 정보 위계가 사라지고 훑어보기 어렵다. R-25 위반·경고 | 공지는 `list--text` 목록, 일정은 `table`·목록 + 상태 배지, 수치는 `dl`, 소개는 `section-media` 1왕복으로 만든다. 카드 그리드는 페이지당 2개 이하이고 연속 금지다. 크기가 다른 사진 칸(벤토)도 카드형 요소 세 개 이상이면 카드 그리드로 센다 — 벤토는 페이지에 한 번만 쓰고, 사진 칸은 `card`가 아니라 링크가 든 `figure`·프로젝트 블록으로 만든다(`design-intelligence.md` §5-3·§6-4) | R-25, `art-direction.md` §5·§9 |
| KR-M22 | 가짜 수치·후기 — 「누적 이용자 100만+」「만족도 98%」, 별점 후기 캐러셀, 사진·이름을 지어낸 후기 | R-23 위반, 신뢰 훼손. 공공은 감사 대상이다 | 출처·기준일이 있는 `contentSources` 수치만 쓴다(KS-08). 없으면 블록을 빼고 실데이터를 요청한다. 후기는 과업 요구 + 실데이터일 때만 둔다(KR-M07) | `art-direction.md` §10-5, R-23 |
| KR-M23 | 영문 eyebrow 남발 — 섹션 제목마다 「OUR SERVICES」「NEWS & NOTICE」 대문자 라벨 | 국문 사이트에 장식 소음을 더하고, `lang` 없이 영문을 한국어 음성으로 읽게 한다 | 섹션 제목은 국문 heading만 쓴다. 영문 eyebrow는 쓰지 않는다. 브랜드 표어처럼 꼭 필요하면 `exceptions`에 근거를 적고 한 곳에만, `lang="en"`으로 쓴다(KR-T09) | KR-T09 |
| KR-M24 | 과한 음수 자간·화면 따라 커지는 초대형 제목 | KRDS 자간 토큰은 0과 0.1rem뿐이다(2.4rem 이상 제목만 -0.03em 이내 예외). 판독성·확대 내성이 떨어진다 | KR-T05·KR-T06 | `art-direction.md` §2 |
| KR-M25 | 장식 그라데이션·글래스모피즘 — 보라→파랑 그라데이션 CTA·히어로, 반투명 블러 카드, 과대 라운딩, 글로우 | 공공 신뢰 톤과 어긋나고 대비를 실측할 수 없다 | `brand.json` 토큰 단색 면을 쓴다. 이미지 위 글자는 `hero-bleed--scrim`. 시그니처는 등급 상한 안에서 `signature.md`로 | `art-direction.md` §10-3·§10-4 |
| KR-M26 | 진입 모달 겹침 — 들어가자마자 행사 팝업 2~3장, 「오늘 하루 보지 않기」 체크박스 | KRDS 자동 실행 모달 금지, 초점 상실 | 행사는 팝업존·공지 목록으로, 긴급은 긴급 공지로 둔다(KR-M00·KR-M08) | KR-M08 |
| KR-M27 | 텍스트 이미지 배너 — 기간·대상·문구가 박힌 이미지 슬라이드 | WCAG 1.4.5, KRDS 캐러셀 텍스트 이미지 금지. 확대·번역·검색이 안 된다 | HTML 텍스트 + 글자 없는 배경 이미지(KS-02, §8) | `carousel.md` |
| KR-M28 | 정보 없는 키비주얼 — 어두운 오버레이 + 중앙 흰 문구 + 스크롤 화살표 | 첫 화면에 과업이 없다 | 히어로에 제목·기간·링크 같은 정보를 싣거나 텍스트 히어로 + 검색으로 둔다. 바로 아래에 과업 블록을 둔다 | `art-direction.md` §10-7 |
| KR-M29 | 지어낸 아이콘·클래스 — 섹션마다 큰 원형 아이콘 3개, 이모지 불릿, 카탈로그 밖 SVG, `card--featured`처럼 CSS에 없는 변형. 인라인 `<style>`이나 프로젝트 CSS에 지어낸 변형(`promo--featured`)·카탈로그 블록 element(`card__img`)를 정의해 검사를 통과시키는 것도 같다 | R-27·R-29 위반. 화면은 기본 모양인데 변형인 척한다. 인라인·프로젝트 CSS 정의는 검사가 아직 못 잡는 경로다 | 아이콘은 퀵링크·상태처럼 기능이 있을 때만 카탈로그에서 가져온다(R-27). 클래스는 `class-naming.md` 결정 순서와 허용 어휘로, 카탈로그 CSS에 실재하는 것만 쓴다(R-18·R-29). 블록 고유 변형이 꼭 필요하면 UX팀 결정으로 카탈로그 CSS와 `blockModifiers`에 먼저 넣는다 | `class-naming.md`, R-27·R-29 |

| KR-M30 | 전형 조립 — 전면 사진 + 스크림 + 흰 표제, 히어로에 걸친 원 배경 아이콘 바로가기, 왼쪽 탭 게시판 + 오른쪽 보조 상자, 소제목 + 링크 세 개의 3열, 흰색·연회색 교대 바탕, 본문과 두 배 차이가 안 나는 표제가 한 페이지에 셋 이상 | 규칙 검사는 모두 통과하는데 이름만 바꾸면 다른 기관 사이트가 된다. 2026-10-23 제주관광공사 시안이 이 상태로 「심심하고 전형적」 판정을 받았다 | 컨셉 한 문장과 시그니처 장면을 먼저 정하고, 서로 다른 세 방향의 첫 화면에서 하나를 고른 뒤, 블록마다 형식을 고른다. 별도 평가자의 렌더 비평에서 무거운 결함 문항이 없고 사람 판정이 「승인」이어야 납품한다 | `design-intelligence.md` §2·§3·§6·§7-1·§8 |

- 무한 롤링 로고 마키·과한 모션·요구에 없는 다크모드 토글은 `art-direction.md` §10-8·§10-9를 따른다.

> 상세: references/korean-web-patterns.md


---

## 디자인 디렉션

### 1. 절차

| 순서 | 할 일 | 누가 |
|------|-------|------|
| 1 | 재료 확보 | 만드는 에이전트 · 발주자 |
| 2 | 짧은 브리프 | 만드는 에이전트 |
| 3 | 자유 생성 | 만드는 에이전트 |
| 4 | 바닥 교정 | 만드는 에이전트 · 검사기 |
| 5 | 사람 수정과 판정 | 디자이너 · 운영자 · 발주자 |

#### 1-1. 재료 확보

- 실제 메뉴명, 공지, 사업명, 연락처를 `contentSources`에서 가져온다. 지어내지 않는다(R-23).
- 첫 화면에 쓸 사진은 기관이 가진 고해상 사진이나 라이선스를 확인한 사진이다. 출처와 라이선스를 적는다.
- 사진을 아직 못 받았으면 실제 비율의 이미지 자리를 표시하고 교체 목록을 함께 낸다. 사진 대신 SVG 그림으로 장면을 지어 메우지 않는다.

#### 1-2. 짧은 브리프

다섯 줄 이내로 쓴다. 이것이 생성에 주는 지시의 전부다.

```
기관: <이름 · 하는 일 한 줄>
1순위 과업: <첫 화면이나 바로 아래에서 끝나야 하는 일>
사용자: <누가 주로 들어오는가>
기준 수준: <발주자 답 원문 — 견줄 사이트가 있으면 이름>
피할 것: <발주자 답 원문>
```

#### 1-3. 자유 생성

- 브리프와 재료만으로 Claude가 디자인한다. 구도, 색, 서체 크기와 굵기, 사진 처리, 섹션 구성은 생성 모델이 정한다.
- 이 단계에서는 옛 컨셉 공식, 형식표(H1~H6 등), 블록 카탈로그, 견본, 결함 문항을 읽히지 않는다. 블록 카탈로그(`list_blocks`·`compose_page`)는 서브 페이지와 마크업 참고용으로만 쓴다.
- 표현 등급(`art-direction.md` §1)은 메인·랜딩 생성의 상한으로 쓰지 않는다. 바닥 검사(R-번호)는 그대로 적용한다.
- 시안 수는 발주자가 정한다. 정하지 않았으면 한 안을 끝까지 만든다.

#### 1-4. 바닥 교정

생성한 화면에 아래만 적용한다. 디자인을 다시 하지 않는다.

1. `npm run check`, `npm run lint`의 오류를 고친다.
2. `references/release-checklist.md`의 접근성·과업 흐름 항목과 `art-direction.md` §9의 「KRDS 대조」를 확인한다.
3. 카피는 기관명·메뉴명·사실로 쓴다. 미사여구, 지어낸 표어, 성과 홍보 어조를 걷어 낸다(R-43·R-44).

교정은 가장 좁게 한다.

- 대비가 모자라면 그 색의 명도만 바꾼다. 팔레트를 바꾸지 않는다.
- 터치 영역이 모자라면 그 요소의 안쪽 여백만 늘린다. 배치를 바꾸지 않는다.
- 검사 규칙과 디자인이 정면으로 부딪치면(예: 장식 그라데이션 R-34, 반경 R-35) 디자인을 지우기 전에 `infoux.json` `exceptions[]`에 근거와 함께 예외로 올리고 사람 판정에 넘긴다.
- 교정하면서 새 장식, 새 섹션, 새 효과를 더하지 않는다.
- 무엇을 왜 바꿨는지 `docs/design-plan.md` 「교정 기록」에 한 줄씩 적는다.

#### 1-5. 사람 수정과 판정

- 생성 결과는 디자이너가 수정하는 출발점이다. 에이전트의 결과를 완성본으로 넘기지 않는다.
- 운영자나 발주자가 캡처나 실제 화면을 보고 「승인」 또는 「불통과」를 정하고, 사유를 원문 그대로 `docs/design-plan.md` 「사람 판정」에 적는다. 에이전트가 대신 채우지 않는다.
- 「승인」이 없으면 `npm run check:release`가 실패한다.

### 2. 하네스가 하지 않는 것

- 미감을 규칙으로 가르치지 않는다. 회차에서 배운 디자인 교훈을 생성 지침에 더하지 않는다. 구체적인 사례일수록 다음 생성에서 정답으로 읽혀 새 전형이 된다.
- 모델 평가자의 판정으로 디자인을 채택하거나 버리지 않는다. 별도 평가자 지시문(`contracts/render-critique-evaluator.md`)과 견본(`assets/exemplars/`)은 사람이 원할 때 쓰는 선택 도구로만 남긴다.
- 사람 수정 단계를 대신하지 않는다.

### 3. 충돌하면

위가 이긴다. KRDS는 이 목록보다 위다.

1. 접근성
2. 과업 진입(1순위 과업이 첫 화면이나 바로 아래)
3. 실제 콘텐츠(가짜·지어낸 내용 없음)
4. 생성된 디자인

바닥 규칙은 디자인을 막는 근거로 쓰지 않는다. 위반한 그 지점만 고친다.

> 상세: references/design-intelligence.md

