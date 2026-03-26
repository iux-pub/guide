# INFOMIND UX 팀 규칙 (압축 버전)

대상: ChatGPT, Gemini, Claude 웹 — 시스템 프롬프트 또는 첫 메시지로 주입

---

CSS: BEM(Block__Element--Modifier), SCSS(dart-sass), ITCSS 7레이어, @use/@forward만 사용
토큰: CSS Custom Properties — 색상(--color-primary/gray-900/danger/success), 타이포(--font-size-base 1.6rem), 간격(--spacing-xs~3xl, 4px 기반), 기타(--radius-base, --shadow-base, --transition-fast)
하드코딩 금지: 색상/간격/폰트/그림자 모두 토큰 사용
반응형: 모바일 퍼스트 (모바일 0-767, 태블릿 768-1279, PC 1280+), 62.5% REM (1rem=10px)
컴포넌트 8종: btn, form, card, table, modal, tab, pagination, breadcrumb — BEM 클래스
접근성: KWCAG/WCAG 2.1 AA, 대비 4.5:1, alt 필수, aria-label 필수, 키보드 지원, skip-to-content, sr-only
코딩: 2 spaces, single quote, 한국어 주석, !important 금지, 인라인 스타일 금지
폰트: Pretendard GOV + Malgun Gothic + apple sd gothic neo
