---
title: 시작 가이드
order: 2
---

신규 팀원이 가이드 시스템을 설치하고 활용하기까지의 과정을 6단계로 안내한다. 각 단계마다 심화 문서 링크를 제공하므로 필요한 부분을 깊이 있게 학습할 수 있다.

## 새 프로젝트 시작

스타터 킷을 clone하여 바로 시작한다. KRDS+Tailwind v4 + 28컴포넌트 CSS + info-design 스킬이 동봉된 최소 구성이다.

```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project

# 새 프로젝트로 origin 변경
rm -rf .git && git init
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git

npm install --legacy-peer-deps
npm run build           # 토큰 + Tailwind v4 CSS 한 번에
```

빌드 성공 시 `dist/css/style.css`가 생성된다. `index.html`을 브라우저에서 열어 확인한다.

커스터마이징은 `tokens/infomind-overrides.json`에서 브랜드 색상을 정의하고 `npm run build`로 재빌드한다.

> **가이드 문서 열람:** [https://github.com/iux-pub/guide](https://github.com/iux-pub/guide) 저장소의 문서 사이트 참조

> **Claude Code 사용 시:** 작업 시작 전 `"info-design 스킬 기준으로 가자"` 발화로 KRDS 컨트랙트 활성화

---

## Step 1: 설치 (가이드 시스템 전체)

가이드 시스템 전체를 로컬에서 실행하려면 guide 저장소를 사용한다.

```bash
git clone https://github.com/iux-pub/guide.git
cd guide
npm install --legacy-peer-deps
npm run build           # 전체 (tokens → rules → CSS → prompts → skill → site)
npm run serve           # 문서 사이트 개발 서버 (http://localhost:8080)
```

빌드가 성공하면 `dist/css/style.css`와 `_site/`가 생성된다. 에러가 발생하면 Node.js 버전(18 이상)과 npm 버전을 확인한다.

## Step 2: CSS 구조 이해 (ITCSS 5레이어)

이 프로젝트는 **ITCSS(Inverted Triangle CSS) 5레이어** 구조 + Tailwind v4 + KRDS 토큰을 사용한다. 토큰은 별도 디렉토리(`tokens/`)로 분리되어 있다.

```
tokens/
  krds-base.json              # KRDS 정본 (수정 금지)
  infomind-overrides.json     # UX팀 결정
  build/tokens.css            # 자동 생성 (@theme + CSS Custom Properties)

src/styles/
  style.css                   # 메인 진입점 (@import "tailwindcss" + 토큰 + 레이어)
  3-generic/                  # 리셋 (62.5% 트릭)
  4-elements/                 # HTML 태그 베이스
  5-objects/                  # 레이아웃 (BEM 필수)
  6-components/               # KRDS UI 컴포넌트 28종 (BEM 필수)
  7-utilities/                # 유틸리티
```

- 옛 1-settings(토큰)는 `tokens/`로 분리, 2-tools(SCSS 믹스인)는 Tailwind utilities로 대체됐다
- 새 컴포넌트는 `6-components/`에 `.css` 파일을 생성하고 `index.css`에 `@import`를 추가한다
- **SCSS 사용 금지(R-03).** 표준 CSS만 사용

심화: [CSS 구조 가이드](/conventions/css-structure/)

## Step 3: 디자인 토큰 사용

모든 스타일 값은 CSS Custom Properties(토큰)를 사용한다. 하드코딩 색상, 크기, 간격을 금지한다(R-01).

```css
/* 잘못된 예 (하드코딩 금지) */
.card {
  color: #222;
  padding: 16px;
}

/* 올바른 예 — KRDS 정본 */
.card {
  color: var(--krds-light-color-gray-90);
  padding: var(--krds-padding-6);
}

/* 올바른 예 — INFOMIND 시맨틱 별칭 */
.card {
  color: var(--color-text);
  padding: var(--spacing-4);
}
```

토큰은 `tokens/build/tokens.css` (자동 생성)에서 발행되며, 소스는 `tokens/krds-base.json` + `tokens/infomind-overrides.json`이다.

| 카테고리 | 권장 prefix | 예시 |
|----------|-----------|------|
| 색상 (KRDS 정본) | `--krds-light-color-*` | `var(--krds-light-color-primary-50)`, `var(--krds-light-color-gray-70)` |
| 색상 (시맨틱 별칭) | `--color-*` | `var(--color-text)`, `var(--color-bg-secondary)` |
| 패딩·간격 | `--krds-padding-*` | `var(--krds-padding-5)`, `var(--krds-gap-2)` |
| 반경 | `--krds-radius-*` | `var(--krds-radius-medium2)` |
| 폰트 사이즈 | `--krds-font-size-*` 또는 `--text-*` | `var(--krds-font-size-7)`, `var(--text-body-medium)` |
| 사이즈 (높이) | `--krds-size-height-*` | `var(--krds-size-height-7)` (=48px=KRDS medium) |

심화: [토큰 개요](/tokens/)

## Step 4: 컴포넌트 활용 (KRDS 28종)

기존 컴포넌트를 활용할 때는 스니펫을 복사하여 사용한다. **카탈로그 외 임의 신설은 금지** — UX팀에 신설 제안 → 카탈로그 등재 후 사용.

1. `src/snippets/{name}.md`에서 필요한 컴포넌트의 마크다운 파일을 연다
2. HTML 마크업 예제를 복사한다
3. KRDS 정의 variant/size를 필요에 따라 적용한다
4. `src/playground/{name}.html`에서 미리보기를 확인한다

| 그룹 | 컴포넌트 |
|------|---------|
| A — 폼/액션 | btn, check-radio, file-upload, form, select, switch |
| B — 컨테이너 | accordion, card, disclosure, modal, side-panel, tab |
| C — 내비 | breadcrumb, header, main-menu, pagination |
| D — 피드백 | alert, badge, progress, spinner, step-indicator, tag, toast, tooltip |
| E — 콘텐츠 | calendar, carousel, list, table |

심화: [컴포넌트 개요](/components/) · [KRDS 카탈로그](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md)

### 버튼 KRDS 정의

- Variant 4종: `--primary` `--secondary` `--tertiary` `--text`
- Size 5종: `--xsmall`(32) `--small`(40) medium(48, 기본) `--large`(56) `--xlarge`(64)
- 옛 variant 폐기: `--ghost`, `--outline`, `--link`, `--sm`, `--lg`

## Step 5: BEM 네이밍

5-objects · 6-components 레이어의 모든 CSS 클래스명은 BEM(Block__Element--Modifier) 패턴을 따른다.

```css
/* BEM 패턴 */
.block {}                    /* Block */
.block--modifier {}          /* Block + Modifier */
.block__element {}           /* Block + Element */
.block__element--modifier {} /* Block + Element + Modifier */

/* 예시 */
.card {}
.card--featured {}
.card__title {}
.card__action--primary {}
```

**금지 패턴:**
- `.btn-primary` → `.btn--primary` (modifier에는 `--` 사용)
- `.card-header` → `.card__header` (element에는 `__` 사용)
- `.card__header__title` → `.card__title` (2단계 element 중첩 금지, 평탄화)
- 시각적 modifier (`.btn--blue`, `.btn--gray` 등) → 의미적 이름

코드 작성 후 검증을 실행한다.

```bash
npm run check       # 컨트랙트 위반(R-01~R-14) 전체 스캔
npm run lint:css    # Stylelint
```

심화: [BEM 네이밍](/conventions/bem/) · [CSS 규칙](/conventions/css-rules/)

## Step 6: 접근성 체크

KWCAG/WCAG 2.1 AA 기준을 준수한다. 코드 작성 후 접근성 검사를 실행한다.

```bash
npm run test:a11y
```

**필수 체크 항목 (R-09~R-14):**
- 이미지에 `alt` 속성 제공 (장식용은 `alt=""`)
- 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블 제공
- 시맨틱 HTML 사용 — `<button>`/`<a>` (R-10, `<div onclick>` 금지)
- 키보드 네비게이션 지원 (탭 순서, 포커스 표시)
- `:focus-visible` 4px primary 외곽선 (reset.css 전역 — 컴포넌트에서 제거 금지)
- 색상 대비 4.5:1 이상 (큰 텍스트 24px/18.67px bold 3:1)
- 본문 건너뛰기 링크 — `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`
- 터치 영역 최소 44×44px (모바일 medium=48px 권장)

심화: [접근성 개요](/accessibility/)

## 다음 단계

- [피그마→코드 핸드오프](/onboarding/handoff/) — 디자이너-퍼블리셔 간 전달 규칙 (KRDS Variable ↔ CSS Custom Property 매핑)
- [컨벤션 개요](/conventions/) — CSS 규칙·BEM·ITCSS 구조 상세
- [컴포넌트 개요](/components/) — KRDS 28종 카탈로그
