# INFOMIND UX 팀 규칙 — KRDS+Tailwind v4 (압축 버전)

대상: ChatGPT, Gemini, Claude 웹 — 시스템 프롬프트 또는 첫 메시지로 주입

---

CSS: BEM(Block__Element--Modifier) + Tailwind v4 + ITCSS 5레이어(3-generic/4-elements/5-objects/6-components/7-utilities). **SCSS 사용 금지.**

토큰: `var(--krds-*)` (KRDS 정본 — primary/secondary/gray 5~95 스텝, padding/radius/size-height/font-size 등) 또는 `var(--color-*)`/`var(--spacing-*)` (INFOMIND 시맨틱 별칭). 하드코딩 hex/rgb/px 일체 금지. 토큰 출처는 `tokens/krds-base.json` + `infomind-overrides.json` → `tokens/build/tokens.css`.

반응형: 모바일 퍼스트 (모바일 0–767, 태블릿 768–1279, PC 1280+). 62.5% REM (1rem=10px). CSS `@media` 또는 Tailwind v4 variant 직접 사용 (SCSS 믹스인 폐지).

컴포넌트 28종 (KRDS 5그룹): A 폼/액션 (btn·check-radio·file-upload·form·select·switch) · B 컨테이너 (accordion·card·disclosure·modal·side-panel·tab) · C 내비 (breadcrumb·header·main-menu·pagination) · D 피드백 (alert·badge·progress·spinner·step-indicator·tag·toast·tooltip) · E 콘텐츠 (calendar·carousel·list·table). **카탈로그 외 임의 신설 금지.**

버튼 KRDS variant(4종): `--primary` `--secondary` `--tertiary` `--text`. KRDS size(5종): `--xsmall`(32) `--small`(40) medium(48, 기본) `--large`(56) `--xlarge`(64). 모바일은 medium 이상 권장.

접근성 (KWCAG/WCAG 2.1 AA): 대비 4.5:1 (큰 텍스트 3:1), 터치 ≥44×44px (모바일 medium=48px 권장), `:focus-visible` (reset.css 전역 4px primary 외곽선 — 컴포넌트에서 제거 금지), skip-to-content 필수, `<img alt>` 필수, `<label for>+id` 필수, `<div onclick>` 금지.

절대 금지: SCSS 파일/`@use`/`@forward`/SCSS 변수, raw hex/rgb/px(KRDS 스케일 외), Tailwind raw 컬러(`bg-red-500` 등) 및 비활성 스케일(`text-base`/`rounded-lg`/`shadow-md`/`z-10`/`sm:`), 옛 버튼 variant(`--ghost`/`--outline`/`--link`/`--sm`/`--lg`), `!important` (사유 주석 없을 시), 인라인 `style="..."` (CSS 변수 주입 외), BEM element 2단계 중첩(`.card__body__title`).

코딩: 2 spaces, single quote, 한국어 주석. 세미콜론 — CSS 사용, JS/HTML 미사용.

폰트: KRDS 표준 — Pretendard GOV → SUIT-V → Apple SD Gothic Neo → Malgun Gothic → sans-serif.
