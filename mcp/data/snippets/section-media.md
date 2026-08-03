# 섹션 미디어 (Section Media) — 이미지-텍스트 교차 패턴

동일 archetype 연속(R-25)을 끊는 변주 패턴이다. 태블릿 이상에서 이미지와 본문이 2컬럼으로 나란히 서고, `--reverse`로 좌우를 교차해 zigzag 리듬을 만든다.

## 기본 마크업

```html
<section class="section section--content" aria-labelledby="walk-title">
  <div class="container">
    <div class="section-media">
      <div class="section-media__media">
        <img class="section-media__img" src="/images/course-haean.jpg" alt="해안 산책로를 걷는 방문객">
      </div>
      <div class="section-media__body">
        <p class="section-media__eyebrow">추천 코스</p>
        <h2 class="section-media__title" id="walk-title">해안 산책로 3.2km</h2>
        <p class="section-media__desc">방파제에서 등대까지 이어지는 완만한 코스입니다. 휠체어·유아차 통행이 가능하며, 중간 쉼터 2곳에 그늘막이 있습니다.</p>
        <div class="section-media__actions">
          <a class="btn btn--primary" href="/course/haean">코스 안내</a>
          <a class="btn btn--tertiary" href="/course/haean/map">지도 내려받기</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Variant

- `.section-media` — 기본 (모바일 세로 스택 → 태블릿 이상 미디어|본문)
- `.section-media--reverse` — 미디어를 오른쪽에 배치. DOM 순서는 그대로라 읽기 순서가 보존된다

```html
<div class="section-media section-media--reverse">
  <div class="section-media__media">
    <img class="section-media__img" src="/images/course-oreum.jpg" alt="오름 정상에서 내려다본 풍경">
  </div>
  <div class="section-media__body">
    <h2 class="section-media__title">오름 전망 코스</h2>
    <p class="section-media__desc">정상까지 40분. 일몰 1시간 전 출발을 권장합니다.</p>
  </div>
</div>
```

## 사용 조건

- 연속 배치는 1왕복(기본 → `--reverse`)까지만 — 전 섹션 교차는 그 자체로 단조롭다 (references/art-direction.md §5)
- 이미지 비율은 4:3 기본. 같은 페이지 안에서 비율을 섞지 않는다
- 첫 콘텐츠 섹션은 1순위 과업이 차지한다 — 이 패턴은 소개·안내 구간에 쓴다

## 접근성

- 이미지 `alt`는 장면을 설명한다. 장식이면 `alt=""`
- 제목(`__title`)이 섹션의 접근 가능한 이름이 되도록 `aria-labelledby`로 연결한다
- `--reverse`는 시각 순서만 바꾼다 — 키보드·스크린리더 순서는 DOM 순서(미디어 → 본문) 그대로다

## 출처

- 간격·타이포는 프로젝트 밀도에 맞는 CSS/Tailwind 직접값 사용
- CSS: `src/styles/5-objects/section-media.css`
- 리듬 원칙: `references/art-direction.md` §5
