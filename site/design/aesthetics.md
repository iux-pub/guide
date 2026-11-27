---
title: 프론트엔드 미학
order: 7
---

생성한 화면이 어디서나 본 모양이 되지 않게 하는 기준이다. 인포마인드 디자인 시스템 위에 적용하고, 제품 UI와 메인·랜딩 페이지의 적용 수준을 구분한다. 메인·랜딩의 판단 절차(컨셉 → 방향 라운드 → 블록 형식 → 렌더 비평)는 `references/design-intelligence.md`가 정본이고, 이 문서는 그 요약과 제품별 적용을 다룬다.

> **정본 관계** — KRDS(컴포넌트·패턴·타이포그래피 지침) → `contracts/art-direction.json`(MCP `get_art_direction`)·`contracts/profiles.json`(`get_profile`) → 이 문서. 충돌하면 앞선 것이 이긴다. 이 문서의 표와 예시는 참고 자료다. 표현 요소(시그니처·모션 강도·다크 모드 등)의 허용 범위는 프로필 표현 등급(`profiles.json` expression)이 상한이며, 이 문서의 스타일 예시가 그 상한을 넓히지 않는다. 장식 효과 — 장식 그라디언트·글래스(`backdrop-filter`)·큰 블러·색 글로·글자 그라디언트 — 는 등급이 넓혀 주지 않는다(R-34, 아래 「5. 면과 깊이」). KRDS에는 글래스가 없다.

## AI 슬롭 안티패턴

생성한 화면이 거절되는 이유는 세 단계다. 앞 단계를 고쳐도 다음 단계가 남는다.

| 단계 | 증상 | 막는 수단 |
|------|------|-----------|
| 슬롭 | 보라 그라데이션, 글래스, 이모지 아이콘, 가짜 수치, 번역투 문구 | 규칙 검사(R-23·R-34·R-36·R-43·R-51) |
| 무개성 | 규칙은 지켰는데 흰 바탕과 가는 선만 남아 관리자 화면처럼 보인다 | 크기 대비, 색 면, 사진(아래 「미학 원칙」) |
| 전형 조립 | 사진 히어로 → 원형 아이콘 바로가기 → 탭 게시판 → 링크 목록. 검사는 모두 통과하는데 이름만 바꾸면 다른 기관 사이트다 | 컨셉, 방향 라운드, 블록 형식 선택, 렌더 비평(`design-intelligence.md`) |

아래는 한국어 화면에서 자주 보이는 징후다. 쓰지 않는다.

| 안티패턴 | 왜 문제인가 |
|----------|------------|
| 표제가 본문과 두 배도 차이 나지 않는다 | 화면에 주인공이 없다. 메인 표제는 KRDS display 단계(6.0/4.4rem 또는 4.4/3.2rem)로 올린다 |
| 흰 바탕에 강조색을 점점이 뿌린다 | 면이 없어 구역이 구분되지 않는다. 한 색이 넓은 면을 맡게 한다 |
| 전면 사진 + 어두운 스크림 + 흰 표제 + 버튼 두 개 | 가장 흔한 첫 화면이다. 여섯 형식 가운데 하나일 뿐이다(`design-intelligence.md` §6-1) |
| 원이나 사각 배경 안의 아이콘 + 레이블을 같은 크기로 늘어놓는다 | 한국 공공 메인의 기본값이다. 글자 목록, 대표 + 나머지, 색 띠 같은 다른 형식을 먼저 본다 |
| 콘텐츠와 무관하게 복제한 섹션 구성(중앙 제목 + 카드 3열 반복) | 틀에 내용을 맞춘 구성이다. 같은 위치에 같은 기능을 두는 KRDS 탐색 일관성과는 다르다(R-25) |
| 제목 위 영문 대문자 분류 표지, 01·02·03 장식 번호, 모든 섹션의 등장 효과 | 대상과 상관없이 붙는 장식이다(R-51) |
| 음수 자간, 1.5 미만 행간, 가는(300 이하) 본문 | 한글 판독성이 떨어지고 KRDS 타이포 표를 벗어난다(R-24) |
| 장식 효과로 깊이감 흉내 — 그라디언트 덩어리·글래스·색 글로 | 정보 위계 대신 효과가 눈을 끌고, 뒤 배경에 따라 글자 대비가 달라진다(R-34) |
| 「지금 바로 시작하세요」「당신의 ~을 경험하세요」 | 번역투다. 합쇼체 사실 서술과 KRDS 동사형 버튼으로 쓴다(R-43) |

**대안**: 대상에서 출발한다. 대상의 산업·풍경·재료에서 눈에 보이는 소재를 뽑고, 그것으로 컨셉 한 문장과 첫 화면의 장면을 정한다. 깊이와 분위기는 효과가 아니라 단색 토큰 면·KRDS 그림자 단계·사진·글자 크기 대비·여백으로 만든다. 서체와 색은 카탈로그와 토큰 안에서 고른다 — 개성은 무엇을 고르느냐가 아니라 어떻게 배치하느냐에서 나온다.

### Before / After 비교: 카드 컴포넌트

**Before -- AI 슬롭 카드 (금지 예시)**

```css
/* 금지 예시 — 토큰 미사용, 하드코딩, 개성 없음 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;

  h3 {
    font-size: 18px;         /* 요소 선택자 의존 */
    color: #333;             /* 하드코딩 색상 */
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }

  .btn {                     /* 버튼 블록을 카드 안에서 다시 칠한다 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* 보라색 그라디언트 */
    color: white;
    border-radius: 8px;
    padding: 12px 24px;
  }
}
```

**After -- 의도적 카드 (inCMS 대시보드용)**

카탈로그 `card`를 그대로 쓴다. 카드 전체가 목록으로 가는 링크이므로 링크형 카드(`card--link`)로 만들고, 안에 버튼을 따로 두지 않는다.

```html
<a class="card card--small card--link" href="/complaints?status=pending">
  <h3 class="card__title">처리 대기 민원</h3>
  <p class="card__body">오늘 접수 12건 중 담당자 미지정 3건</p>
</a>
```

대시보드 맥락에 맞는 값만 프로젝트 CSS에서 덧씌운다. 선택자는 `card.css`에 있는 전체 이름을 쓴다 — 표준 CSS nesting의 `&`는 이름을 이어 붙이지 않으므로, `.card` 안에서 `&` 뒤에 `__title`을 붙이면 `__title.card`가 되어 아무 요소에도 맞지 않는다.

```css
/* inCMS 대시보드 프로젝트 CSS — Flat + Minimalism */
.card__title {
  @apply text-[1.9rem] mb-[0.8rem];
}

.card__body {
  @apply text-[1.5rem] leading-[1.6] text-[var(--color-text-subtle)];
}

/* Flat — 링크형 카드는 그림자·들어 올리기 대신 테두리 색으로 반응한다 */
a.card,
.card--link {
  @apply [transition:border-color_0.15s_ease-in-out];
}

a.card:hover,
.card--link:hover {
  @apply [box-shadow:none] [transform:none] border-[var(--color-border-primary)];
}
```

핵심 차이점:

| 항목 | AI 슬롭 | 의도적 설계 |
|------|---------|------------|
| 색상 | 하드코딩 `#333`, `#666` | 토큰 `var(--color-text-subtle)`, `var(--color-border-primary)` |
| 레이아웃 | 매직넘버 `24px`, `12px` | 카탈로그 크기 변형 `card--small` + rem 직접값 `0.8rem` |
| 네이밍 | `.btn`, `h3`, `p` 요소 선택자 | `card.css`에 있는 BEM element `.card__title`, `.card__body` |
| 행동 유도 | 보라색 그라디언트 버튼 | 카드 전체를 링크(`card--link`)로 — 버튼을 따로 칠하지 않는다 |
| 폰트 | `Inter` 기본값 | `var(--font-sans)`(Pretendard GOV) 상속 |
| 모션 | 없음 | 호버 시 테두리 색 0.15s 전환 — Flat이라 그림자·들어 올리기는 끈다 |

### Before / After 비교: 히어로 섹션

**Before -- AI 슬롭 히어로 (금지 예시)**

```html
<!-- ❌ 금지 예시 — 보라색 그라디언트, generic 문구, 맥락 없음, 인라인 style -->
<section style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 80px 20px; text-align: center;">
  <h1 style="color: white; font-size: 48px;">Welcome to Our Platform</h1>
  <p style="color: rgba(255,255,255,0.8);">The best solution for your needs</p>
</section>
```

**After -- SmartFarm 랜딩 히어로 (Organic Biophilic)**

`.farm-hero`는 **SmartFarm 프로젝트 고유 블록 예시**다(infoUX 카탈로그에 없다). 배경 사진을 까는 풀블리드 도입부라면 카탈로그의 `hero-bleed` 패턴(`src/snippets/hero-bleed.md`)을 먼저 쓴다. 이 프로젝트에서만 쓰는 모양이므로 `hero--biophilic` 같은 변형을 만들지 않고 블록 이름에 맥락을 담는다 — 스타일 이름(`biophilic`)은 허용 modifier 어휘가 아니다(R-18).

```html
<section class="farm-hero">
  <div class="container">
    <h1 class="farm-hero__title">스마트팜 통합 모니터링</h1>
    <p class="farm-hero__desc">온실 환경과 생육 데이터를 한 화면에서 확인합니다.</p>
    <a href="/demo" class="btn btn--primary btn--xlarge">데모 신청하기</a>
  </div>
</section>
```

SmartFarm은 `tokens/brand.json`에서 primary를 녹색, secondary를 흙색 계열로 바꾼다. 배경은 그 브랜드 단계 색 하나로 칠한 단색 면이다 — raw hex·`rgba()`를 쓰지 않고(R-01), 그라디언트로 분위기를 내지 않는다(R-34). 자연 감성은 큰 제목·여백·흙색 단색 띠로 내고, 실제 온실 사진을 깔 때는 카탈로그 `hero-bleed`의 스크림 변형(`hero-bleed--scrim`)으로 글자 대비를 확보한다.

```css
/* SmartFarm 프로젝트 CSS — 녹색 단색 면 + 아래 흙색 단색 띠 */
.farm-hero {
  @apply py-[6.4rem] bg-[var(--color-primary-5)] border-b-[0.4rem] border-[var(--color-secondary-50)];
}

/* KRDS display medium(mobile 3.2 / pc 4.4rem) · 행간 150% · 자간 0.1rem */
.farm-hero__title {
  @apply text-[3.2rem] font-bold leading-[1.5] tracking-[0.1rem] text-[var(--color-text)] m-0 tablet:text-[4.4rem];
}

.farm-hero__desc {
  @apply text-[1.9rem] leading-[1.7] text-[var(--color-text-subtle)] mt-[0.8rem] mb-[3.2rem];
}
```

**금지 예시** — 토큰 색으로 칠해도 그라디언트 덩어리는 장식 효과다.

```css
/* 금지 예시 — 장식 그라디언트 덩어리로 분위기를 낸다(R-34) */
.farm-hero {
  background-image:
    radial-gradient(ellipse at 20% 50%, var(--color-primary-10) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, var(--color-secondary-10) 0%, transparent 50%);
}
```

## 시작 전에 정할 것

코드를 쓰기 전에 아래를 정한다. 제품 UI(관리자·업무 화면)는 앞의 네 줄이면 되고, 메인·랜딩은 일곱 줄 모두를 `docs/design-plan.md`(서식 `contracts/design-plan.md`)에 적는다.

| 정할 것 | 질문 | 적는 곳 |
|---------|------|---------|
| 사이트 유형과 과업 | 다섯 프로필 가운데 무엇인가? 사용자가 가장 먼저 하려는 일은? | Task Contract `profile`·`primaryTask` |
| 색 | 발주처 CI 색이 있는가? 한 색이 넓은 면을 맡는 전략(절제·몰입·풀 팔레트)은 무엇인가? | `tokens/brand.json`, 계획 「색」 |
| 서체 | 카탈로그 페어링 다섯 가지 가운데 무엇인가? 역할별 KRDS 단계는? | 계획 「서체」 |
| 밀도 | 촘촘한 업무 화면인가, 여유 있는 소개 화면인가? | Task Contract `designDials.density` |
| 컨셉 | 대상을 무엇처럼 보여 주는가? 이름만 바꿔 다른 기관에 쓸 수 없는가? | 계획 「컨셉」 |
| 방향 | 두 축 이상에서 서로 다른 세 안 가운데 무엇을 골랐는가? | `docs/directions/`, 계획 「방향」 |
| 블록 형식 | 레시피의 블록마다 어떤 모양을 골랐는가? | 계획 「레이아웃」 |

### 프로젝트 시작 체크리스트

- [ ] 사이트 유형을 다섯 프로필 가운데 하나로 판정하고 주 사용자의 숙련도(전문가·일반인·고령자)를 적었는가
- [ ] 실제 기관 용어·메뉴·사진의 출처(`contentSources`)를 확보했는가
- [ ] 브랜드 색을 `tokens/brand.json`의 primary·secondary·point 단계로 바꾸고 `npm run build:tokens && npm run check:contrast`를 통과했는가
- [ ] 배경·글자·테두리 의미 토큰과 상태색(danger/warning/success/info)을 `tokens/foundation.json` 그대로 쓰는가 — 프로젝트에서 재정의하지 않는다
- [ ] 어두운 제품 테마가 필요한가 (BigData, inPOS 등) — 필요하면 프로젝트에서 토큰을 덮지 말고 UX팀 결정을 받는다
- [ ] 360·768·1024·1280 폭마다 레이아웃이 어떻게 바뀌는지 정했는가(메인 메뉴↔전체메뉴 전환은 1024)
- [ ] 글자 크기는 KRDS 타이포 단계에서 골랐는가 — 크기를 토큰으로 만들지 않고 rem 값으로 쓴다(R-37·R-38)
- [ ] 웹폰트는 프로젝트 안에 두고 `font-display: swap`으로 불러오는가(R-26)
- [ ] 메인·랜딩이면 방향 라운드를 거쳐 `docs/design-plan.md`를 썼는가

## 미학 원칙 5가지

### 1. 글자

- 서체는 카탈로그 페어링 다섯 가지(`references/art-direction.md` §3) 안에서 고른다. 본문은 `var(--font-sans)`(Pretendard GOV)로 고정하고, 제목에만 페어링 서체를 쓴다. 카탈로그 밖 서체를 불러오지 않는다(R-26)
- 개성은 서체를 바꿔서가 아니라 **크기 대비**로 낸다. 메인 표제는 KRDS display 단계로 올려 본문의 2.5배 이상이 되게 하고, 나란히 놓인 두 글은 KRDS 단계를 하나 건너뛴다
- 한 화면에 쓰는 글자 크기는 다섯 가지 이하, 굵기는 400과 700을 기본으로 한다
- **인포마인드 제품 UI**: `PretendardGOV` + `JetBrains Mono`가 표준이다. 메인·랜딩에서는 표현 등급이 허용하면 제목 페어링(`formal-serif`·`product-modern` 등)을 방향 라운드의 한 안으로 검토한다
- **한국어 줄바꿈**: 모든 한국어 텍스트 블록에 `word-break: keep-all; overflow-wrap: break-word;`를 준다. 단어 중간에서 줄이 바뀌면 읽기 어렵다
- **한국어 행간**: `line-height: 1`(leading-none) 사용 금지. 한국어는 라틴보다 글자 높이가 커서 본문 1.6~1.7, 제목 1.5(KRDS 150%)를 지키고 1.5 미만으로 내리지 않는다(R-24)

### 2. 색

- 색을 고르기 전에 전략을 고른다: 절제(중립 바탕 + 강조 하나), 몰입(짙은 색 한 가지가 화면의 30~60%), 풀 팔레트(역할이 정해진 3~4색). 기능형·서브는 절제, 공공기관·관광 메인은 몰입을 먼저 검토한다
- 섹션을 위에서부터 적고 각 바탕 토큰을 쓰는 「면 지도」를 그린다. 흰색과 연회색만 번갈아 쓰면 면이 구분되지 않는다. 면이 바뀌는 곳은 페이지에 2~4곳이다
- 짙은 면 위의 버튼·선·초점 링은 그 면에 맞게 바꾼다. 보조 글자는 회색이 아니라 같은 색의 밝은 단계를 쓴다
- **인포마인드 제품 UI**: 토큰 팔레트를 우선 사용한다. 랜딩 페이지에서도 색 표현은 브랜드 단계(primary·secondary·point 5~95) 안에서 넓힌다

### 3. 모션 집중

- CSS 기반 애니메이션을 우선한다
- **상태 변화에 집중**: 모션은 열림·닫힘·선택 같은 상태 변화를 알리는 데 쓴다. 0.1~0.5초, 장식 모션은 표현 등급 상한(기능형 200·절제형 300·표현형 400ms) 안에서만 쓴다(R-22)
- 스크롤 진입 모션은 기능형 화면에서 쓰지 않고, 절제형은 fade·1회·300ms 이하로 둔다. 무한 반복은 로딩 표시에만 쓴다(R-22)

### 4. 레이아웃 변주

- 기본은 KRDS 그리드 정렬이다 — 같은 위치에 같은 기능이 있어야 탐색이 빠르다
- 메인의 주요 섹션 가운데 적어도 두 곳은 6:6이 아닌 열 비율(7:5·8:4·4:8)을 쓰고, 섹션 제목의 위치(내용 위·왼쪽 열·색 면 안)를 달리한다. 모든 섹션이 「왼쪽 제목 → 아래 내용」이면 같은 틀의 반복이다
- 격자에 빈 칸을 남기지 않는다. 크기가 다른 사진 칸(벤토)은 칸 수별 배치표(`design-intelligence.md` §5-3)를 쓴다
- 변주는 섹션 리듬으로 만든다: 같은 archetype 3연속·카드 그리드 반복을 피하고 section-media(이미지-텍스트 교차)·시그니처 요소를 사이에 둔다(R-25)
- 겹침·그리드 밖 배치 같은 실험은 표현형(expressive) 등급에서만, 시그니처 개수 상한 안에서 쓴다(contracts/profiles.json expression)
- 여백은 밀도 프리셋(contracts/profiles.json density)을 따른다 — 공공·관리자 화면은 정보 밀도가 우선이다(R-49)

### 5. 면과 깊이

배경은 단색 토큰 면이 기본이다. 깊이와 분위기는 장식 효과가 아니라 면의 구분·그림자 단계·사진·타이포로 만든다(R-34).

- **면 구분**: `--color-surface`·`--color-bg-subtle`·`--color-bg-subtler` 같은 단색 토큰 면을 번갈아 써서 구역을 나눈다
- **높이**: KRDS 그림자 3단계만 쓴다 — 검정 알파(`#0000000d`·`#00000014`·`#0000001f`)에 위치·블러 값만 바꾼다. 색이 있는 그림자는 쓰지 않는다
- **사진**: 사진 위 글자는 스크림(투명 → 검정 알파)으로 대비를 확보한다(`hero-bleed--scrim`). 대비 4.5:1은 스크림 위에서 실측한다
- **강조**: 글자 크기 대비·굵기·여백으로 위계를 만든다
- **시그니처**: 그래픽 패턴·포토 톤 통일·커스텀 일러스트 같은 요소는 표현 등급이 허용하는 개수만 쓴다(기능형 0 · 절제형 1 · 표현형 3)
- **스크롤 힌트**: 가로로 넘치는 영역의 끝을 알리는 단색 페이드(한 가지 색 → 투명)는 쓸 수 있다
- **포커스 링**: 블러 없이 퍼짐(spread)만 있는 `box-shadow`는 쓸 수 있다

**금지 예시** — 쓰지 않는 장식 효과(R-34).

- 장식 그라디언트 — 배경·글자 모두. 기능형·절제형에서는 오류, 표현형에서도 경고다. 보라·남색 계열(색상각 225~300°, 채도 0.25 이상)은 어느 등급에서도 오류다
- 글래스 — `backdrop-filter`·`backdrop-blur-*`. KRDS에는 글래스가 없다
- 큰 블러 — `blur` 4px 이상
- 색 글로 — 블러가 있는 `box-shadow`·`text-shadow`·`drop-shadow`에 검정이 아닌 색
- 글자 그라디언트 — `background-clip: text`

## 메인과 서브·업무 화면

같은 사이트 안에서도 페이지 유형에 따라 수위가 다르다.

| | 메인·랜딩(`pageType: main`) | 서브·게시판·폼·업무 화면 |
|---|------------------------------|---------------------------|
| 목표 | 기억에 남는 첫 화면과 과업 진입 | 빠르고 틀림없는 과업 수행 |
| 표현 | 표현 등급 상한 근처에서 시작한다. 사진을 넉넉히, 색 면을 분명히 | 기능형~절제형으로 낮춘다 |
| 색 전략 | 몰입 또는 풀 팔레트를 먼저 검토 | 절제 |
| 표제 | KRDS display 단계 | heading-xlarge 이하 |
| 절차 | 컨셉 → 방향 라운드 → 계획 → 렌더 비평 | 사이트의 기존 계획을 따른다 |

한국 공공기관의 발주처와 이용자는 사진이 넉넉하고 색 면이 분명한 메인을 선호한다. 해외 제품 사이트의 「덜어내기」를 공공 메인에 그대로 적용하면 관리자 화면처럼 된다. 덜어낼 것은 템플릿 장식과 군더더기 문구이고, 사진·색 면·칸 구성이 아니다.

## INFOMIND 제품별 UI 스타일 매핑

| 제품/프로젝트 | 권장 스타일 | 색상 방향 | 레이아웃 특성 | 금지 스타일 |
|-------------|------------|----------|-------------|------------|
| **inCMSv3** | Flat + Minimalism | Primary Blue(`--color-primary`) + 넓은 White 여백 | 사이드바 네비게이션, 12컬럼 컨텐츠 그리드. 모달은 단색 면 + KRDS 그림자 | Glassmorphism, Brutalism, Claymorphism, Cyberpunk |
| **inPOS** | Flat + Dark Mode(선택 — UX팀 결정) | 고대비 Dark(`--color-bg-inverse`) + Accent Green | 고밀도 POS 레이아웃, 큰 터치 타겟(48px+) | 과도한 Motion-Driven |
| **in_S / inSWING** | Minimalism + Flat | Primary Blue 계열, 깔끔한 Gray 스케일 | 탑바 네비게이션, 폼 중심 레이아웃 | Neubrutalism, Y2K |
| **BigData 플랫폼** | Data-Dense + Dark Mode(UX팀 결정) | Dark Navy(`#0d1117`) + Cyan/Green 데이터 강조 | 다중 패널 대시보드(패널은 단색 면으로 구분), 차트 그리드 3~4열 | Glassmorphism, Organic Biophilic, Claymorphism |
| **SmartFarm** | Organic Biophilic + Minimalism | Green 계열(`#228738`) + Earth tone 보조 | 카드 기반 모니터링, 지도 중심 레이아웃 | Cyberpunk, HUD |
| **면세 플랫폼** | Feature-Rich Showcase + 상품 사진 중심 | Luxury Gold(`#b8860b`) + 어두운 중성 배경(`--color-bg-inverse`) | 상품 그리드, 풀블리드 히어로(가로 전체, 화면 높이는 채우지 않는다 — R-42) | Glassmorphism, Brutalism |
| **랜딩/마케팅** | Hero-Centric + Storytelling | 브랜드 단계 색의 단색 면 + 사진(스크림) | 섹션 단위 서사(첫 섹션만 풀블리드 — R-42, 진입 모션은 R-22 예산 안) | Aurora UI, Glassmorphism, 장식 그라디언트(R-34) |
| **WEB/SI** | 서브·업무 화면은 Flat + Minimalism. 메인은 위 「메인과 서브·업무 화면」 표를 따른다 | 기관 CI 색상을 `brand.json` 브랜드 단계로 | 공공 웹 표준 레이아웃, 본문 건너뛰기 필수. 메인은 한국형 메인 레시피 + 블록 형식 선택 | 표현 등급 상한을 넘는 표현 — 넘으면 Task Contract `exceptions`에 근거 기록 |

### 제품별 브랜드 색 바꾸기

프로젝트가 바꿀 수 있는 색은 `tokens/brand.json`의 브랜드 단계 — primary·secondary·point 각 5~95 — 뿐이다. 배경·글자·테두리·입력 의미 토큰, 상태색(danger·warning·success·information), gray 스케일은 `tokens/foundation.json`(불변 계층)이 소유하므로 프로젝트에서 재정의하지 않는다. CSS `:root`에서 `--color-*`를 다시 정의하는 방법도 쓰지 않는다 — `tokens/` 밖 CSS의 raw 색은 R-01 위반이고 대비 검사도 거치지 않는다.

SmartFarm 예 — primary를 녹색 계열로 바꾼다(`--color-primary`는 primary 50 단계를 가리킨다).

```json
{
  "primitive": {
    "color": {
      "light": {
        "primary": {
          "50": { "value": "#228738", "type": "color" }
        }
      }
    }
  }
}
```

위는 대표 단계 하나만 보인 발췌다. 실제로는 primary 5~95 열한 단계를 모두 바꾸고 `high-contrast` 모드 값도 함께 채운다 — 빠지면 `build:tokens`가 실패한다. 바꾼 뒤 토큰을 다시 만들고 대비를 검사한다.

```bash
npm run build:tokens && npm run check:contrast
```

`check:contrast`가 WCAG 2.1 AA 위반을 알리면 단계 값을 고친다. `tokens/contrast-baseline.json`에 항목을 더해 새 위반을 덮지 않는다.

BigData·inPOS처럼 **어두운 제품 테마**가 필요하면 배경·글자·테두리 의미 토큰을 바꿔야 하므로 프로젝트 안에서 해결하지 않는다 — UX팀 결정이 필요하다. infoUX는 light·high-contrast 두 모드 체계다(art-direction 안티패턴 9).

**금지 예시** — CSS에서 의미 토큰을 raw 색으로 덮는다.

```css
/* 금지 예시 — foundation이 소유한 의미 토큰을 :root에서 raw hex로 덮는다(R-01) */
:root {
  --color-bg: #0d1117;
  --color-text: #e6edf3;
  --color-border: #30363d;
}
```

### 주요 스타일 설명

| 스타일 | 특징 |
|--------|------|
| **Flat Design** | 그림자 없음, 솔리드 컬러. 깊이감 부재는 타이포로 보완 |
| **Minimalism** | 여백, 그리드, 타이포 중심. 지루해지지 않도록 타이포 강조 |
| **Dark Mode (OLED)** | 어두운 바탕, 고대비. 배경·글자 의미 토큰을 바꿔야 하므로 프로젝트에서 덮지 않고 UX팀 결정을 받는다 |
| **Data-Dense Dashboard** | 정보 압축, 고밀도 레이아웃. 실시간 모니터링에 적합 |
| **Organic Biophilic** | 자연 형태, 둥근 모서리, 자연색 단색 면과 사진. 환경/지속가능성 제품에 적합 |

**금지 예시** — 이름이 자주 오르내리지만 장식 효과 자체라 쓰지 않는 스타일(R-34).

| 스타일 | 쓰지 않는 이유 |
|--------|---------------|
| **Glassmorphism** | `backdrop-filter: blur` 반투명 레이어. KRDS에 없고, 뒤 배경에 따라 글자 대비가 달라져 검증할 수 없으며, 저사양 기기에서 느리다(art-direction 안티패턴 4) |
| **Aurora UI** | 흐르는 그라디언트와 빛 번짐 — 장식 그라디언트와 색 글로 그 자체다 |

### 인포마인드 디자인 시스템 연계

**제품 UI** (inPOS, in_S, inCMS 등):
- 토큰 시스템을 그대로 적용한다
- 폰트: `PretendardGOV` + `JetBrains Mono`
- 이 가이드의 미학 원칙은 레이아웃, 모션, 공간 활용에서 참고한다

**메인·랜딩·프로모션 페이지**:
- 토큰 시스템 위에서 컨셉과 시그니처 장면을 세운다(`references/design-intelligence.md` §2)
- 제목 페어링 서체(카탈로그 안), 브랜드 단계 색의 넓은 면, 비대칭 구도를 쓸 수 있다
- 자유도는 글자 크기 대비·구도·사진·시그니처에서 낸다. 장식 효과(R-34)는 랜딩에서도 쓰지 않는다
- 납품 전에 360·768·1024·1280·1440 캡처를 별도 평가자에게 맡긴다. 만든 에이전트는 자기 화면을 평가하지 않고, 마지막 판정은 사람이 한다

## 관련 문서

- 디자인 디렉션(`references/design-intelligence.md`) -- 컨셉·방향 라운드·블록 형식·렌더 비평
- 아트 디렉션(`references/art-direction.md`) -- 표현 등급·서체 페어링·팔레트·한글 조판
- [토큰 개요](/tokens/) -- CSS Custom Properties 정의 및 사용법
- [디자인 감사](/design/design-audit/) -- 디자인 품질 평가 체크리스트
- [인터랙션 타이밍](/design/interaction-timing/) -- 모션 & 전환 명세
