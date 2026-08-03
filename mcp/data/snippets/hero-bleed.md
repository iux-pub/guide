# 히어로 블리드 (Hero Bleed) — 풀블리드 인트로 패턴

화면 가로 전체를 쓰는 도입 섹션이다. section 자체에 클래스를 얹어 쓰고, 내부 `.container`가 본문 폭을 잡는다. 배경 이미지 위에 텍스트를 얹을 때는 `--scrim`을 함께 쓴다.

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
      <a class="btn btn--primary btn--large" href="/program">프로그램 신청</a>
      <a class="btn btn--secondary btn--large" href="/space">공간 대관 안내</a>
    </div>
  </div>
</section>
```

## Variant

- `.hero-bleed` — 기본 (배경색 `--color-bg-inverse` 위 흰 텍스트)
- `.hero-bleed--scrim` — 배경 이미지 위 단색 스크림(alpha-black-50). 이미지 위 텍스트는 반드시 이 변형과 함께 쓴다

## 사용 조건

- 페이지당 1회, 문서 최상단 도입 구간 전용 — 본문 중간에 반복하지 않는다
- 공공서비스 프로필은 장식 hero를 화면 1/2 이하로 유지한다 (`contracts/profiles.json` rhythm)
- CMS·관리자 프로필은 hero 없음 — 이 패턴을 쓰지 않는다
- 배경 영상 hero는 표현 등급 expressive + task contract 근거가 전제다 (references/art-direction.md §1)

## 접근성

- 배경 이미지는 장식이다 — `alt=""` 고정. 의미 있는 이미지는 본문 콘텐츠로 옮긴다
- 텍스트 대비 4.5:1은 스크림 위에서 실측한다 — 스크림 없이 이미지 위 텍스트 금지
- 제목이 섹션의 접근 가능한 이름이 되도록 `aria-labelledby`로 연결한다

## 출처

- 높이·간격은 프로젝트 밀도에 맞는 CSS/Tailwind 직접값 사용
- CSS: `src/styles/5-objects/hero-bleed.css`
- 이미지 트리트먼트·스크림 기준: `references/art-direction.md` §7
