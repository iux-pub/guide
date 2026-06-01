---
title: 디자인 AI 프롬프트
order: 2
---

## 대상 AI 도구

Google Stitch, Galileo, Lovable, v0

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# KRDS 원칙 + INFOMIND 디자인 AI 프롬프트

> **목적:** 디자인 AI 도구에서 KRDS(범정부 UI/UX 디자인 시스템)의 접근성·구조 원칙과 INFOMIND UX 실무 표준을 적용하기 위한 프롬프트
> **대상 AI:** Google Stitch, Galileo, Lovable, v0

---

## 핵심 원칙

- **코드 생성 전 사이트 유형을 먼저 판정한다.** 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약을 구분하고, 정부 아이덴티티 요소는 적용 대상이 확인된 경우에만 생성
- **색상은 CSS Custom Property(`var(--token)`) 사용.** 하드코딩 hex/rgb/hsl 금지
- **간격·크기·타이포 스케일은 CSS/Tailwind 직접값 사용.** CMS·관리자 화면은 정보 밀도에 맞게 조정
- **CSS는 표준 nesting + Tailwind v4 `@apply` 사용 가능**
- **모바일 터치 영역 ≥ 44×44px**
- **시맨틱 HTML + WCAG 2.1 AA 준수**
- **HTML 기본 골격은 `header/main/footer`, `main > section > .container`, section 접근 이름 패턴 유지**

---

## 색상 토큰 (INFOUX)

### Primary

| 토큰 | 값 |
|----|----|
| `--color-primary-5` | #ecf2fe |
| `--color-primary-20` | #b1cefb |
| `--color-primary-40` | #4c87f6 |
| `--color-primary-60` | #0b50d0 |
| `--color-primary-80` | #052561 |
| `--color-primary-95` | #020f27 |
| `--color-primary-10` | var(--color-primary-10) |
| `--color-primary-30` | var(--color-primary-30) |
| `--color-primary-50` | var(--color-primary-50) |
| `--color-primary-70` | var(--color-primary-70) |
| `--color-primary-90` | var(--color-primary-90) |

### Secondary

| 토큰 | 값 |
|----|----|
| `--color-secondary-10` | #d6e0eb |
| `--color-secondary-30` | #90b0d5 |
| `--color-secondary-50` | #346fb2 |
| `--color-secondary-70` | #063a74 |
| `--color-secondary-90` | #031f3f |
| `--color-secondary-5` | var(--color-secondary-5) |
| `--color-secondary-20` | var(--color-secondary-20) |
| `--color-secondary-40` | var(--color-secondary-40) |
| `--color-secondary-60` | var(--color-secondary-60) |
| `--color-secondary-80` | var(--color-secondary-80) |
| `--color-secondary-95` | var(--color-secondary-95) |

### Gray

| 토큰 | 값 |
|----|----|
| `--color-gray-0` | #ffffff |
| `--color-gray-10` | #e6e8ea |
| `--color-gray-30` | #b1b8be |
| `--color-gray-50` | #6d7882 |
| `--color-gray-70` | #464c53 |
| `--color-gray-90` | #1e2124 |
| `--color-gray-100` | #000000 |
| `--color-gray-5` | var(--color-gray-5) |
| `--color-gray-20` | var(--color-gray-20) |
| `--color-gray-40` | var(--color-gray-40) |
| `--color-gray-60` | var(--color-gray-60) |
| `--color-gray-80` | var(--color-gray-80) |
| ... | (총 13개, tokens/build/tokens.css 참조) |

### Semantic (success/warning/danger/info)

| 토큰 | 값 |
|----|----|
| `--color-danger-text` | #bd2c0f |
| `--color-warning-surface` | #fff3db |
| `--color-success-text` | #267337 |
| `--color-info-surface` | #e7f4fe |
| `--color-danger-10` | #fcdfd9 |
| `--color-danger-30` | #f48771 |
| `--color-danger-50` | #de3412 |
| `--color-danger-70` | #8a240f |
| `--color-danger-90` | #390d05 |
| `--color-warning-5` | #fff3db |
| `--color-warning-20` | #ffc95c |
| `--color-warning-40` | #c78500 |
| `--color-warning-60` | #8a5c00 |
| `--color-warning-80` | #422c00 |
| `--color-warning-95` | #241800 |
| `--color-success-10` | #d8eedd |
| `--color-success-30` | #7ec88e |
| `--color-success-50` | #228738 |
| `--color-success-70` | #285d33 |
| `--color-success-90` | #122b18 |
| `--color-danger-surface` | var(--color-danger-surface) |
| `--color-warning-text` | var(--color-warning-text) |
| `--color-success-surface` | var(--color-success-surface) |
| `--color-info-text` | var(--color-info-text) |
| `--color-danger-5` | var(--color-danger-5) |
| `--color-danger-20` | var(--color-danger-20) |
| `--color-danger-40` | var(--color-danger-40) |
| `--color-danger-60` | var(--color-danger-60) |
| `--color-danger-80` | var(--color-danger-80) |
| `--color-danger-95` | var(--color-danger-95) |
| ... | (총 41개, tokens/build/tokens.css 참조) |

---

## 시맨틱 토큰

컴포넌트 작성 시 의미 기반 `--color-*` 토큰을 우선 사용한다.

### Text

| 토큰 | 값 |
|----|----|
| `--color-text` | #1e2124 |
| `--color-text-subtle` | #464c53 |
| `--color-text-inverse` | #ffffff |
| `--color-text-bolder` | #e6e8ea |
| `--color-text-disabled` | #58616a |
| `--color-text-bolder` | var(--color-text-bolder) |
| `--color-text-disabled` | var(--color-text-disabled) |

### Background

| 토큰 | 값 |
|----|----|
| `--color-bg-subtler` | #f4f5f6 |
| `--color-bg-inverse` | #1e2124 |
| `--color-bg` | #000000 |
| `--color-bg-subtle` | #1e2124 |
| `--color-bg-dim` | #000000bf |
| `--color-bg` | var(--color-bg) |
| `--color-bg-subtle` | var(--color-bg-subtle) |
| `--color-bg-dim` | var(--color-bg-dim) |

### Border

| 토큰 | 값 |
|----|----|
| `--color-border` | #b1b8be |
| `--color-border-dark` | #58616a |
| `--color-border-primary-light` | #d8e5fd |
| `--color-border-success-light` | #d8eedd |
| `--color-border-danger-light` | #fcdfd9 |
| `--color-border` | #464c53 |
| `--color-border-dark` | #8a949e |
| `--color-border-disabled` | #464c53 |
| `--color-border-light` | var(--color-border-light) |
| `--color-border-primary` | var(--color-border-primary) |
| `--color-border-information-light` | var(--color-border-information-light) |
| `--color-border-warning-light` | var(--color-border-warning-light) |
| `--color-border-disabled` | var(--color-border-disabled) |

---

## 기본 폰트 토큰

| 토큰 | 값 |
|----|----|
| `--font-sans` | 'Pretendard GOV', 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif |
| `--font-sans` | 'Pretendard GOV', 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif |

## 직접값 사용 범위

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다. Tailwind v4 `@apply`와 명확한 CSS 직접값으로 작성한다.

> 전체 토큰 카탈로그(상세 + 시맨틱 매핑) — `skill/references/krds-tokens.md`
> Tailwind v4 @theme 매핑 — `skill/references/tailwind-mapping.md`

---

## 브레이크포인트

| 해상도 | 범위 | 권장 시안 너비 |
|--------|------|--------------|
| 모바일 | 360px 기준 | 360px |
| 태블릿 | 768px 이상 | 768px |
| PC | 1280px 이상 | 1280px (콘텐츠 max-width: 1200px) |

INFOUX 표준 브레이크포인트. Tailwind v4 variant는 `mobile:` / `tablet:` / `pc:`만 사용한다. 단순 반응형 속성 변경은 CSS 파일 내부에서도 `@apply tablet:*`, `@apply pc:*`를 우선한다.

---

## 컴포넌트 카탈로그 (KRDS 기반)

| 그룹 | 컴포넌트 |
|------|---------|
| A — 폼/액션 | `btn` · `check-radio` · `file-upload` · `form` · `select` · `switch` |
| B — 컨테이너/레이아웃 | `accordion` · `card` · `disclosure` · `modal` · `side-panel` · `tab` |
| C — 내비게이션 | `breadcrumb` · `header` · `main-menu` · `pagination` |
| D — 피드백 | `alert` · `badge` · `progress` · `spinner` · `step-indicator` · `tag` · `toast` · `tooltip` |
| E — 콘텐츠/표현 | `calendar` · `carousel` · `list` · `table` |

> 각 컴포넌트의 BEM·접근성·토큰 매핑 — `skill/references/krds-components.md`
> 마크업 스니펫 — `src/snippets/{name}.md`

## HTML 기본 골격

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

HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부의 section 단위로 분리한다. 각 section은 `.container`를 직접 포함하고, heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름을 가진다.

## 사이트 유형 판정

코드 생성 전에 사이트를 일반사이트, 공공서비스, 공공기관, CMS·관리자, 커머스·예약 중 하나로 판정한다.

- 일반사이트/CMS·관리자/커머스·예약: 공식 배너, 정부 상징, 운영기관 식별자 생성 금지. 체크리스트에서는 N/A
- 공공서비스: KRDS 서비스 패턴을 적극 적용하되 공식 배너/정부 상징은 과업 또는 기관 정책 확인 시만 생성
- 공공기관: 기관 CI/BI와 정보공개/공지/홍보 구조를 우선하고, 정부 상징은 확인 시만 생성
- 유형이 불명확하면 정부 아이덴티티 요소를 제외하고 공통 접근성/구조 규칙만 적용

상세 기준: `skill/references/project-profiles.md`

---

## 접근성 핵심 규칙 (KWCAG/WCAG 2.1 AA)

1. **색상 대비** — 일반 텍스트 4.5:1 이상, 큰 텍스트(24px 이상 또는 18.67px bold) 3:1 이상
2. **터치 영역** — 인터랙티브 요소 최소 44×44px (KRDS 모바일 권장 medium=48px)
3. **포커스 표시** — `:focus-visible` 4px primary 외곽선 + 2px offset (reset.css 전역 관리)
4. **건너뛰기 링크** — body 최상단 `<a href="#main" class="skip-to-content">본문 바로가기</a>`
5. **이미지** — `alt` 필수. 장식용은 `alt=""`
6. **폼** — `<label for>` + `id` 연결 필수
7. **모달** — `role="dialog"` + 포커스 트랩 + `aria-labelledby`
8. **시맨틱 HTML** — `<button>`/`<a>` 사용. `div`/ `span`에 직접 클릭 핸들러를 붙이는 패턴 금지

---

## 절대 금지

- Raw hex/rgb/hsl 색상
- Tailwind 기본 팔레트 raw 컬러 유틸
- 옛 버튼 variant 이름
- `!important` (사유 주석 없을 시)
- 인라인 `style="..."` (CSS 변수 주입 외)
- 기존 인포마인드 HTML 골격을 무시한 임의 구조
- `:focus { outline: none }`
- `div`/ `span` 클릭 핸들러 패턴
- 이미지 `alt` 누락, 폼 `<label>` 누락

````
