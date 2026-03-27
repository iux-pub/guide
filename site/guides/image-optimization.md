---
title: 이미지 처리 규칙
order: 3
---

이미지는 페이지 성능과 접근성에 큰 영향을 미친다. 포맷 선택부터 최적화, 네이밍까지 팀 표준을 정리한다.

## 이미지 포맷 선택 기준

| 포맷 | 용도 | 장점 | 단점 |
|------|------|------|------|
| **WebP** | 사진, 복잡한 이미지 | JPEG 대비 25-35% 작은 용량, 투명도 지원 | IE 미지원 (fallback 필요) |
| **JPEG** | 사진 (WebP fallback) | 범용 호환성 | WebP보다 큰 용량 |
| **PNG** | 투명 배경, 단순 그래픽 | 무손실, 투명도 | 사진에는 용량 과다 |
| **SVG** | 아이콘, 로고, 단순 일러스트 | 벡터(해상도 무관), CSS 제어 가능 | 복잡한 이미지에 부적합 |
| **AVIF** | 차세대 사진 포맷 | WebP보다 더 작은 용량 | 브라우저 지원 제한적, 인코딩 느림 |

### 포맷 결정 플로우

1. **아이콘/로고인가?** -> SVG
2. **투명 배경이 필요한 단순 그래픽인가?** -> PNG (또는 SVG)
3. **사진/복잡한 이미지인가?** -> WebP (JPEG fallback)

### WebP + fallback 패턴

```html
<!-- picture 태그로 WebP 우선 제공 -->
<picture>
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="서비스 메인 이미지" loading="lazy" width="1200" height="600">
</picture>
```

## Lazy Loading

뷰포트 아래(스크롤해야 보이는) 이미지에 `loading="lazy"`를 적용한다.

### 규칙

1. **첫 화면(above the fold) 이미지**에는 lazy loading을 적용하지 않는다
2. **스크롤 아래 이미지**에는 반드시 `loading="lazy"`를 적용한다
3. **width/height 속성**을 반드시 지정한다 (CLS 방지)

```html
<!-- DO: 첫 화면 이미지 - lazy loading 없음 -->
<img src="/images/hero.webp" alt="메인 배너" width="1200" height="400">

<!-- DO: 스크롤 아래 이미지 - lazy loading 적용 -->
<img src="/images/feature.webp" alt="기능 소개" loading="lazy" width="600" height="400">

<!-- DON'T: width/height 누락 (레이아웃 시프트 발생) -->
<img src="/images/feature.webp" alt="기능 소개" loading="lazy">
```

### Decoding 속성

```html
<!-- 비동기 디코딩 (메인 스레드 차단 방지) -->
<img src="/images/photo.webp" alt="사진" loading="lazy" decoding="async" width="400" height="300">
```

## SVG 최적화

### 인라인 vs 파일 기준

| 방식 | 조건 | 장점 |
|------|------|------|
| **인라인 SVG** | 아이콘, CSS 제어 필요, 4KB 이하 | 색상/크기 CSS 변경 가능, 추가 요청 없음 |
| **파일 참조** | 로고, 복잡한 SVG, 4KB 초과 | 캐싱 가능, HTML 크기 감소 |

### 인라인 SVG 접근성

```html
<!-- DO: 의미 있는 아이콘 -->
<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24">
  <path d="..."/>
</svg>
<span class="sr-only">검색</span>

<!-- DO: 독립 이미지로서의 SVG -->
<svg role="img" aria-label="인포마인드 로고" viewBox="0 0 200 50">
  <title>인포마인드 로고</title>
  <path d="..."/>
</svg>

<!-- DO: 장식용 아이콘 (의미 없음) -->
<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16">
  <path d="..."/>
</svg>
```

### SVG 최적화 체크리스트

- [ ] 불필요한 메타데이터 제거 (편집기 주석, 기본 네임스페이스 등)
- [ ] viewBox 속성 존재 확인
- [ ] 불필요한 그룹(`<g>`) 제거
- [ ] 소수점 자릿수 줄이기 (소수점 2자리 이하)
- [ ] SVGO 도구 사용 권장: `npx svgo input.svg -o output.svg`

## 파일 네이밍 컨벤션

### 규칙

1. **소문자 영문**만 사용한다
2. **하이픈(`-`)으로 단어를 구분**한다 (언더스코어, 공백 금지)
3. **의미를 담은 이름**을 사용한다 (일련번호 금지)
4. **접두사**로 용도를 구분한다

### 접두사 체계

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `icon-` | 아이콘 | `icon-search.svg`, `icon-close.svg` |
| `logo-` | 로고 | `logo-infomind.svg`, `logo-partner.png` |
| `bg-` | 배경 이미지 | `bg-hero.webp`, `bg-pattern.svg` |
| `img-` | 콘텐츠 이미지 | `img-team-photo.webp`, `img-product.jpg` |
| `thumb-` | 썸네일 | `thumb-article-01.webp` |

### Do / Don't

```
# DO
icon-arrow-right.svg
img-service-overview.webp
bg-hero-main.webp
logo-infomind-white.svg

# DON'T
ArrowRight.svg          (대문자 금지)
image1.jpg              (의미 없는 번호)
KakaoTalk_Photo.jpg     (원본 파일명 그대로 사용 금지)
bg hero.webp            (공백 금지)
icon_search.svg         (언더스코어 금지)
```

## 반응형 이미지

### srcset + sizes

```html
<!-- 뷰포트에 따라 적절한 크기 제공 -->
<img
  srcset="
    /images/img-banner-400w.webp 400w,
    /images/img-banner-800w.webp 800w,
    /images/img-banner-1200w.webp 1200w
  "
  sizes="
    (max-width: 767px) 100vw,
    (max-width: 1279px) 80vw,
    1200px
  "
  src="/images/img-banner-1200w.webp"
  alt="배너 이미지"
  loading="lazy"
  width="1200"
  height="400"
>
```

## alt 속성 작성 가이드

| 상황 | alt 작성 | 예시 |
|------|---------|------|
| 콘텐츠 이미지 | 이미지 내용을 구체적으로 설명 | `alt="팀원 5명이 회의실에서 논의하는 모습"` |
| 기능적 이미지 (링크/버튼) | 기능/목적지를 설명 | `alt="홈으로 이동"` |
| 장식 이미지 | 빈 alt | `alt=""` |
| 차트/그래프 | 데이터 요약 | `alt="2025년 매출 추이: 1분기 10억, 2분기 15억..."` |
| 텍스트 이미지 | 이미지 속 텍스트 그대로 | `alt="50% 할인 이벤트"` |

```html
<!-- DON'T -->
<img src="photo.jpg" alt="사진">
<img src="logo.svg" alt="로고 이미지">
<img src="banner.webp">  <!-- alt 누락 -->

<!-- DO -->
<img src="photo.jpg" alt="인포마인드 UX팀 워크샵 현장">
<img src="logo.svg" alt="인포마인드">
<img src="divider.svg" alt="">  <!-- 장식 이미지 -->
```

## 이미지 성능 규칙

| 규칙 | 설명 |
|------|------|
| `width`/`height` 명시 | CLS(Cumulative Layout Shift) 방지. 모든 `<img>`에 필수 |
| `loading="lazy"` | 뷰포트 밖 이미지에 적용 (스크롤 시 로드) |
| `fetchpriority="high"` | 뷰포트 내 첫 이미지(히어로, LCP)에 적용 |
| CDN preconnect | `<link rel="preconnect" href="https://cdn.example.com">` |
| 폰트 preload | `<link rel="preload" as="font" href="..." crossorigin>` + `font-display: swap`
