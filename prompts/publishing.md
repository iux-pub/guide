# 퍼블리싱 규칙 프롬프트 — KRDS+Tailwind v4

대상: Cursor, Copilot, Windsurf, Claude Code

이 규칙을 따라 HTML/CSS 코드를 생성하라.

## CSS 방법론: BEM + Tailwind v4 + ITCSS 5레이어

모든 컴포넌트 클래스명은 Block__Element--Modifier 패턴을 따른다 (5-objects, 6-components 레이어 한정).

```
.block-name { }
.block-name__element { }
.block-name--modifier { }
.block-name__element--modifier { }
```

금지: `.btn-primary`(→ `.btn--primary`), `.card-header`(→ `.card__header`), element 2단계 중첩(`.card__header__title` → `.card__title`).

**SCSS 사용 금지.** Tailwind v4 + 표준 CSS만 허용 (R-03).

## CSS 구조: ITCSS 5레이어

```
src/styles/
  style.css                # @import "tailwindcss" + 토큰 + 레이어
  3-generic/               # 리셋 (62.5% 트릭 포함)
  4-elements/              # HTML 태그 베이스
  5-objects/               # 레이아웃 (BEM)
  6-components/            # KRDS UI 컴포넌트 28종 (BEM)
  7-utilities/             # 유틸리티
```

옛 1-settings(토큰)는 `tokens/`로 분리, 2-tools(SCSS 믹스인)는 Tailwind utilities로 대체됐다.

## 토큰 사용

하드코딩 금지. CSS Custom Properties 사용:

- **KRDS 정본** (권장 prefix `--krds-*`):
  - 색상: `var(--krds-light-color-primary-50)`, `--krds-light-color-secondary-50`, `--krds-light-color-gray-{0..100}` 등
  - 패딩/간격: `var(--krds-padding-{1..8})` (KRDS 스케일)
  - 반경: `var(--krds-radius-{small1~3, medium1~4, large1~3})`
  - 사이즈: `var(--krds-size-height-{1..9})`
  - 폰트: `var(--krds-font-size-{1..15})`

- **INFOMIND 시맨틱 별칭**:
  - 색상: `var(--color-text)`, `--color-text-secondary`, `--color-text-disabled`, `--color-bg`, `--color-bg-secondary`, `--color-border`, `--color-primary` (KRDS 토큰을 가리킴)
  - 의미 기반 작성 시 권장

토큰 출처: `tokens/krds-base.json` + `tokens/infomind-overrides.json` → `tokens/build/tokens.css`.

## 반응형: 모바일 퍼스트

- 모바일: 0~767px (기본)
- 태블릿: 768~1279px
- PC: 1280px+

CSS `@media` 또는 Tailwind v4 변종 직접 사용 (SCSS 믹스인 폐기).

```css
.card {
  padding: var(--krds-padding-3); /* 모바일 기본 */
}

@media (min-width: 768px) {
  .card { padding: var(--krds-padding-5); }
}

@media (min-width: 1280px) {
  .card { padding: var(--krds-padding-7); }
}
```

62.5% REM 트릭 — 1rem = 10px (KRDS 명시 채택).

## 컴포넌트 (KRDS 28종)

카탈로그 외 임의 신설 금지. 신설 필요 시 UX팀 결정 → `skill/references/krds-components.md` 등재 후 사용.

- A (폼/액션): btn, check-radio, file-upload, form, select, switch
- B (컨테이너): accordion, card, disclosure, modal, side-panel, tab
- C (내비): breadcrumb, header, main-menu, pagination
- D (피드백): alert, badge, progress, spinner, step-indicator, tag, toast, tooltip
- E (콘텐츠): calendar, carousel, list, table

각 컴포넌트의 마크업은 `src/snippets/{name}.md` 참조.

### 버튼 KRDS 정의

- Variant 4종: `--primary` `--secondary` `--tertiary` `--text`
- Size 5종: `--xsmall`(32) `--small`(40) medium(48, 클래스 없음=기본) `--large`(56) `--xlarge`(64)
- 옛 variant 금지: `--ghost`, `--outline`, `--link`, `--sm`, `--lg`, `--hero`
- 모바일 컨텍스트는 medium(48) 이상 권장 (xsmall/small은 44px 미만이라 모바일 부적합)

## 접근성: KWCAG/WCAG 2.1 AA

- `<img>`: alt 필수 (장식용은 `alt=""`)
- 인터랙티브 요소: `aria-label` 또는 텍스트 레이블 필수
- 색상 대비: 4.5:1 (큰 텍스트 24px/18.67px bold 3:1)
- 키보드 네비게이션 지원
- skip-to-content 링크: `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`
- 포커스: `:focus-visible` 4px primary 외곽선 (reset.css 전역 — 컴포넌트에서 제거 금지)
- `!important` 금지 (사유 주석 시 허용), 인라인 스타일 금지 (CSS 변수 주입 `style="--var: val"`은 허용)
- `prefers-reduced-motion` 대응
- 터치 영역: 최소 44×44px (모바일 medium=48px 권장), 인접 요소 간격 8px 이상

## 레이아웃 크기 기준

| 영역 | 모바일 | 태블릿 | PC |
|------|--------|--------|-----|
| 헤더 높이 | 최소 56px | 최소 64px | 최소 100px |
| GNB 메뉴 폰트 | 14px | 16px | **18px 이상** |
| 컨테이너 max-width | 100% | 100% | 1200px |
| 컨테이너 패딩 | `var(--krds-padding-5)` | `var(--krds-padding-7)` | `var(--krds-padding-8)` |

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 세미콜론: CSS 사용, JS/HTML 미사용
- 주석: 한국어
