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
# KRDS+INFOMIND 디자인 AI 프롬프트

> **목적:** 디자인 AI 도구에서 KRDS(범정부 UI/UX 디자인 시스템) + INFOMIND UX 표준을 적용하기 위한 프롬프트
> **대상 AI:** Google Stitch, Galileo, Lovable, v0

---

## 핵심 원칙

- **모든 색상·간격·크기는 CSS Custom Property(`var(--token)`) 사용.** 하드코딩 hex/rgb/px 일체 금지
- **62.5% REM 트릭 적용 — `1rem = 10px`** (KRDS 명시 채택)
- **모바일 터치 영역 ≥ 44×44px**
- **시맨틱 HTML + WCAG 2.1 AA 준수**
- **카탈로그(KRDS 28컴포넌트) 외 임의 컴포넌트 신설 금지**

---

## 색상 토큰 (KRDS 정본)

### Primary

| 토큰 | 값 |
|----|----|
| `--krds-light-color-primary-5` | #ecf2fe |
| `--krds-light-color-primary-20` | #b1cefb |
| `--krds-light-color-primary-40` | #4c87f6 |
| `--krds-light-color-primary-60` | #0b50d0 |
| `--krds-light-color-primary-80` | #052561 |
| `--krds-light-color-primary-95` | #020f27 |

### Secondary

| 토큰 | 값 |
|----|----|
| `--krds-light-color-secondary-10` | #d6e0eb |
| `--krds-light-color-secondary-30` | #90b0d5 |
| `--krds-light-color-secondary-50` | #346fb2 |
| `--krds-light-color-secondary-70` | #063a74 |
| `--krds-light-color-secondary-90` | #031f3f |

### Gray

| 토큰 | 값 |
|----|----|
| `--krds-light-color-gray-0` | #ffffff |
| `--krds-light-color-gray-10` | #e6e8ea |
| `--krds-light-color-gray-30` | #b1b8be |
| `--krds-light-color-gray-50` | #6d7882 |
| `--krds-light-color-gray-70` | #464c53 |
| `--krds-light-color-gray-90` | #1e2124 |
| `--krds-light-color-gray-100` | #000000 |

### Semantic (success/warning/danger/info)

| 토큰 | 값 |
|----|----|
| `--krds-light-color-danger-10` | #fcdfd9 |
| `--krds-light-color-danger-30` | #f48771 |
| `--krds-light-color-danger-50` | #de3412 |
| `--krds-light-color-danger-70` | #8a240f |
| `--krds-light-color-danger-90` | #390d05 |
| `--krds-light-color-warning-10` | #ffe0a3 |
| `--krds-light-color-warning-30` | #ffb114 |
| `--krds-light-color-warning-50` | #9e6a00 |
| `--krds-light-color-warning-70` | #614100 |
| `--krds-light-color-warning-90` | #2e1f00 |
| `--krds-light-color-success-5` | #eaf6ec |
| `--krds-light-color-success-20` | #a9dab4 |
| `--krds-light-color-success-40` | #3fa654 |
| `--krds-light-color-success-60` | #267337 |
| `--krds-light-color-success-80` | #1f4727 |
| `--krds-light-color-success-95` | #0e2012 |

---

## 시맨틱 별칭 (INFOMIND)

KRDS 토큰을 가리키는 의미 기반 alias. 컴포넌트 작성 시 이쪽을 우선 권장.

### Text

| 토큰 | 값 |
|----|----|
| `--color-text` | var(--krds-light-color-text-basic) |
| `--color-text-subtle` | var(--krds-light-color-text-subtle) |
| `--color-text-inverse` | var(--krds-light-color-text-basic-inverse) |

### Background

| 토큰 | 값 |
|----|----|
| `--color-bg-subtler` | var(--krds-light-color-background-gray-subtler) |
| `--color-bg-inverse` | var(--krds-light-color-background-inverse) |

### Border

| 토큰 | 값 |
|----|----|
| `--color-border-light` | var(--krds-light-color-border-gray-light) |
| `--color-border-primary` | var(--krds-light-color-border-primary) |

---

## 간격·크기 토큰

### Padding (KRDS 스케일)

| 토큰 | 값 |
|----|----|
| `--krds-padding-1` | var(--krds-number-2) |
| `--krds-padding-3` | var(--krds-number-5) |
| `--krds-padding-5` | var(--krds-number-7) |
| `--krds-padding-7` | var(--krds-number-9) |
| `--krds-padding-9` | var(--krds-number-12) |

### Border Radius

| 토큰 | 값 |
|----|----|
| `--krds-radius-xsmall2` | var(--krds-number-2) |
| `--krds-radius-small1` | var(--krds-number-3) |
| `--krds-radius-small3` | var(--krds-number-3) |
| `--krds-radius-medium2` | var(--krds-number-4) |
| `--krds-radius-medium4` | var(--krds-number-5) |
| `--krds-radius-large2` | var(--krds-number-6) |
| `--krds-radius-xlarge2` | var(--krds-number-7) |

### Font Size

_(토큰 없음 — npm run build:tokens 실행 필요)_

> 전체 토큰 카탈로그(상세 + 시맨틱 매핑) — `skill/references/krds-tokens.md`
> Tailwind v4 @theme 매핑 — `skill/references/tailwind-mapping.md`

---

## 브레이크포인트

| 해상도 | 범위 | 권장 시안 너비 |
|--------|------|--------------|
| 모바일 | 0 ~ 767px | 360px |
| 태블릿 | 768px ~ 1279px | 768px |
| PC | 1280px ~ | 1920px (콘텐츠 max-width: 1200px) |

KRDS 표준 브레이크포인트.

---

## 컴포넌트 카탈로그 (KRDS 28종, 5그룹)

| 그룹 | 컴포넌트 |
|------|---------|
| A — 폼/액션 | `btn` · `check-radio` · `file-upload` · `form` · `select` · `switch` |
| B — 컨테이너/레이아웃 | `accordion` · `card` · `disclosure` · `modal` · `side-panel` · `tab` |
| C — 내비게이션 | `breadcrumb` · `header` · `main-menu` · `pagination` |
| D — 피드백 | `alert` · `badge` · `progress` · `spinner` · `step-indicator` · `tag` · `toast` · `tooltip` |
| E — 콘텐츠/표현 | `calendar` · `carousel` · `list` · `table` |

> 각 컴포넌트의 BEM·접근성·토큰 매핑 — `skill/references/krds-components.md`
> 마크업 스니펫 — `src/snippets/{name}.md`

---

## 접근성 핵심 규칙 (KWCAG/WCAG 2.1 AA)

1. **색상 대비** — 일반 텍스트 4.5:1 이상, 큰 텍스트(24px 이상 또는 18.67px bold) 3:1 이상
2. **터치 영역** — 인터랙티브 요소 최소 44×44px (KRDS 모바일 권장 medium=48px)
3. **포커스 표시** — `:focus-visible` 4px primary 외곽선 + 2px offset (reset.css 전역 관리)
4. **건너뛰기 링크** — body 최상단 `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`
5. **이미지** — `alt` 필수. 장식용은 `alt=""`
6. **폼** — `<label for>` + `id` 연결 필수
7. **모달** — `role="dialog"` + 포커스 트랩 + `aria-labelledby`
8. **시맨틱 HTML** — `<button>`/`<a>` 사용. `<div onclick>` 금지

---

## 절대 금지

- Raw hex/rgb/hsl 색상
- Raw px (KRDS 스케일 외 — `p-[20px]` 같은 임의 값 금지)
- Tailwind raw 컬러 유틸 (`bg-red-500`, `text-gray-700` 등)
- 옛 버튼 variant (`btn--ghost`, `btn--outline`, `btn--link`, `btn--sm`, `btn--lg`)
- `!important` (사유 주석 없을 시)
- 인라인 `style="..."` (CSS 변수 주입 외)
- 카탈로그 외 컴포넌트 임의 생성
- `:focus { outline: none }`
- `<div onclick>`
- 이미지 `alt` 누락, 폼 `<label>` 누락

````
