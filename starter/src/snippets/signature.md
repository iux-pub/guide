# 시그니처 요소 (Signature) — 실물 3패턴

"이 사이트만의 것"으로 기억되는 반복 장치 3패턴이다. 등급별 상한(utility 0 · restrained 1 · expressive 3)은 `contracts/art-direction.json` expressionLevels가 정본이고, 선정·배치 원칙은 `references/art-direction.md` §6을 따른다. 아래 CSS는 프로젝트별 스타일 확장 슬롯에 추가한다 — 색은 전부 토큰 경유(R-01), 데코 텍스트·패턴은 스크린리더에서 숨긴다.

## 1. 타이포 모티프

브랜드 키워드를 크게 깔아 섹션 도입의 정체성을 만든다. 장식이므로 `aria-hidden="true"` 필수.

```html
<section class="section section--intro" aria-labelledby="festival-title">
  <div class="container">
    <p class="motif" aria-hidden="true">바다</p>
    <h1 id="festival-title">항구도시 등대 축제</h1>
    <p>10월 셋째 주, 방파제 일대에서 열립니다.</p>
  </div>
</section>
```

```css
/* 타이포 모티프 — 헤딩 폰트 토큰(--font-heading) 사용, 옅은 브랜드색으로 뒤에 깐다 */
.motif {
  @apply absolute [z-index:-1] select-none pointer-events-none m-0;
  font-family: var(--font-heading);
  font-size: 16rem;
  font-weight: 700;
  line-height: 1; /* 단행 장식 — 본문 하한(R-24)과 무관한 display 전용 값 */
  letter-spacing: -0.03em;
  color: var(--color-primary-5);
}
```

- 페이지당 1곳, hero·인트로 구간 한정. 본문 문단 사이에 끼우지 않는다
- 고대비 모드에서 본문을 가리지 않는지 확인한다 — 겹침이 생기면 opacity가 아니라 위치를 조정한다

## 2. 커스텀 구분선

섹션 경계의 기본 `border` 대신 브랜드 형태를 가진 구분선을 쓴다. mask + 배경색 토큰 조합이라 색 변경이 토큰으로 따라온다.

```html
<hr class="divider divider--wave" aria-hidden="true">
```

```css
/* 커스텀 구분선 — SVG는 mask로만 쓰고 색은 토큰이 소유한다 */
.divider {
  @apply border-0 mx-auto my-[4.8rem];
  width: 12rem;
  height: 1.2rem;
  background-color: var(--color-primary-40);
}

.divider--wave {
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 12' preserveAspectRatio='none'%3E%3Cpath d='M0 6 Q15 0 30 6 T60 6 T90 6 T120 6' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 12' preserveAspectRatio='none'%3E%3Cpath d='M0 6 Q15 0 30 6 T60 6 T90 6 T120 6' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E") center / contain no-repeat;
}
```

- 형태는 사이트당 1종으로 고정한다 — 페이지마다 다른 구분선은 시그니처가 아니라 소음이다
- `<hr>`는 의미 구분이 필요한 자리에만. 순수 장식 위치면 `<div class="divider" aria-hidden="true">`

## 3. 배경 패턴 (SVG data-uri)

섹션 배경에 반복 패턴을 옅게 깐다. 외부 이미지 없이 data-uri 하나로 끝나 납품 self-contained 정책과 맞고, mask 방식이라 패턴색도 토큰이 소유한다.

```html
<section class="section section--content section-pattern" aria-labelledby="notice-title">
  <div class="container">
    <h2 id="notice-title">이용 안내</h2>
    <p>대관 신청은 이용일 14일 전까지 접수합니다.</p>
  </div>
</section>
```

```css
/* 배경 패턴 — 도트 그리드. 패턴층은 ::before로 분리해 본문 대비에 영향을 주지 않는다 */
.section-pattern {
  @apply relative;
}

.section-pattern::before {
  @apply content-[''] absolute inset-0 [z-index:-1] pointer-events-none;
  background-color: var(--color-primary);
  opacity: 0.06;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='2' fill='black'/%3E%3C/svg%3E") repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='2' fill='black'/%3E%3C/svg%3E") repeat;
}
```

패턴 형태만 바꾸는 mask용 SVG 변형 2종 — 색·투명도 규칙은 동일하다.

| 형태 | mask용 data-uri |
|------|-----------------|
| 사선 해칭 | `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M-2 14 14 -2M-2 2 2 -2M10 14 14 10' stroke='black' stroke-width='1'/%3E%3C/svg%3E` |
| 물결 반복 | `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='16'%3E%3Cpath d='M0 8 Q10 0 20 8 T40 8' fill='none' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E` |

- 패턴 투명도는 0.04~0.08 감각 — 본문 텍스트 대비 4.5:1을 침해하면 안 된다
- 사이트당 패턴 1종. 시그니처 총량은 표현 등급의 maxCount를 넘지 않는다

## 접근성

- 세 패턴 모두 순수 장식이다 — `aria-hidden="true"` 또는 pseudo-element로만 구현해 보조기기 트리에서 제외한다
- 고대비 모드(hc)에서 패턴·모티프가 본문 가독을 해치지 않는지 확인한다

## 출처

- 등급별 상한: `contracts/art-direction.json` expressionLevels / 선정·배치 원칙: `references/art-direction.md` §6
- 색 토큰: `tokens/build/tokens.css` — raw 색상 금지(R-01), SVG는 mask 전용
