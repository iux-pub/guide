# 히어로 블리드 (Hero Bleed) — 풀블리드 인트로 패턴

화면 가로 전체를 쓰는 도입 섹션이다. section 자체에 클래스를 얹어 쓰고, 내부 `.container`가 본문 폭을 잡는다. 배경 이미지 위에 텍스트를 얹을 때는 `--scrim`을 함께 쓴다.

> 이 패턴은 메인 비주얼의 여러 형식 가운데 「전면 사진 + 스크림 + 표제」 하나다. 가장 흔한 형식이라 기본값으로 고르면 어디서나 본 첫 화면이 된다. 메인·랜딩에서는 `references/design-intelligence.md` §6-1의 여섯 형식(분할 표제·사진 창·과업 히어로·모자이크·장면·소식 결합)을 먼저 비교하고, 방향 라운드의 세 안 가운데 많아야 한 안에만 이 형식을 쓴다.

## 기본 마크업

```html
<section class="section section--intro hero-bleed hero-bleed--scrim" aria-labelledby="intro-title">
  <div class="hero-bleed__media">
    <img class="hero-bleed__img" src="/images/hero-harbor.jpg" alt="">
  </div>
  <div class="container hero-bleed__content">
    <h1 class="hero-bleed__title" id="intro-title">항구도시 문화재단</h1>
    <p class="hero-bleed__desc">공연·전시·교육 프로그램을 한곳에서 찾고 신청할 수 있습니다.</p>
    <div class="hero-bleed__actions">
      <a class="btn btn--primary btn--large" href="/program">프로그램 신청하기</a>
    </div>
  </div>
</section>
```

## Variant

- `.hero-bleed` — 기본 (배경색 `--color-bg-inverse` 위 흰 텍스트)
- `.hero-bleed--scrim` — 배경 이미지 위 단색 스크림(alpha-black-50). 이미지 위 텍스트는 반드시 이 변형과 함께 쓴다

## 사용 조건

- 페이지당 1회, 문서 최상단 도입 구간 전용 — 본문 중간에 반복하지 않는다
- 주 행동 버튼은 하나다. 두 번째 행동이 필요하면 바로 아래 과업 진입 블록에 둔다(「제목 + 설명 + 버튼 두 개」는 해외 랜딩 문법이다 — `korean-web-patterns.md` KR-M20)
- 사진은 밝고 맑은 것을 고르고, 글은 사진의 조용한 영역(하늘·바다·벽) 쪽에 둔다. 어둡고 탁한 사진에 스크림을 더 덮지 않는다
- 공공서비스 프로필은 장식 hero를 화면 1/2 이하로 유지한다 (`contracts/profiles.json` rhythm)
- CMS·관리자 프로필은 hero 없음 — 이 패턴을 쓰지 않는다
- 배경 영상 hero는 표현 등급 expressive + task contract 근거가 전제다 (references/art-direction.md §1)

## 접근성

- 배경 이미지는 장식이다 — `alt=""` 고정. 의미 있는 이미지는 본문 콘텐츠로 옮긴다
- 텍스트 대비 4.5:1은 스크림 위에서 실측한다 — 스크림 없이 이미지 위 텍스트 금지
- 제목이 섹션의 접근 가능한 이름이 되도록 `aria-labelledby`로 연결한다

## 출처

- 높이·간격은 프로젝트 밀도에 맞는 CSS 값·Tailwind rem 임의값 사용
- CSS: `src/styles/5-objects/hero-bleed.css`
- 이미지 트리트먼트·스크림 기준: `references/art-direction.md` §7
