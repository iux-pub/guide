# Phase 1: Foundation — Design Tokens + SCSS Architecture - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

디자인 토큰 체계(색상, 타이포, 간격, 그리드 등)를 CSS Custom Properties로 정의하고, ITCSS 기반 SCSS 폴더 구조를 확립하여 모든 후속 Phase의 스타일링 기반을 만든다. 토큰 플레이그라운드 페이지를 포함한다.

</domain>

<decisions>
## Implementation Decisions

### 색상 체계
- **D-01:** Primary 색상은 프로젝트마다 변경되므로 기본값만 정의하고 `:root` 오버라이드로 프로젝트별 커스텀. 중립 팔레트 방식.
- **D-02:** 시맨틱 색상(success, danger, warning, info)은 KRDS 공공 디자인시스템 기준 채택
- **D-03:** 그레이 스케일은 Claude 재량으로 기존 프로젝트 값들(#222, #333, #666, #999, #ccc, #efefef, #f8f8f8)을 참고하여 정리

### 브레이크포인트
- **D-04:** 3단계로 간소화 — 모바일(0~767px), 태블릿(768px~1279px), PC(1280px~)
- **D-05:** 콘텐츠 max-width는 1200px (KRDS 표준형과 동일)
- **D-06:** 양쪽 마진 포함 시 1280px 뷰포트에서 콘텐츠 1200px + 좌우 40px
- **D-07:** KRDS 표준형 그리드 참고 — PC/태블릿 12컬럼, 모바일 4컬럼, 거터 PC 24px / 모바일 16px

### 믹스인 범위
- **D-08:** 기존 믹스인 현대화 정리 — vendor prefix(-webkit-, -moz-) 제거, 불필요한 것 삭제, 필요한 것만 개선 유지
- **D-09:** 반응형 믹스인 새로 추가 — `@mixin respond-to(mobile/tablet/pc)` 형태의 미디어 쿼리 헬퍼

### 토큰 파이프라인
- **D-10:** 토큰은 CSS Custom Properties(`var(--token)`)로 통일. 브레이크포인트만 SCSS 변수 예외 (CSS 미디어 쿼리 제약)
- **D-11:** Style Dictionary 등 별도 도구 없이 SCSS 파일에서 직접 `:root` 블록으로 토큰 정의 (심플하게)
- **D-12:** 토큰 네이밍을 Tailwind 컨벤션과 충돌하지 않게 설계 — 향후 Tailwind 도입 시 config에서 `var()` 참조로 매핑 가능하도록
- **D-13:** 프로젝트별 커스텀은 `:root` 오버라이드 파일 하나로 처리

### Claude's Discretion
- 그레이 스케일 구체적 값과 단계 수
- 타이포그래피 스케일 구체적 사이즈 (기존 webstyleguide 참고하되 조정 가능)
- 간격(Spacing) 토큰 스케일 구체적 값
- 기타 토큰(border-radius, box-shadow, transition, z-index) 구체적 값
- 기존 믹스인 중 제거할 것과 유지할 것의 최종 판단
- ITCSS 레이어별 파일 구성 세부사항
- 토큰 플레이그라운드 페이지 디자인/구조

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### KRDS 공공 디자인시스템
- https://www.krds.go.kr/html/site/style/style_05.html — KRDS 레이아웃/브레이크포인트 표준 (4단계: small 360, medium 768, large 1024, xlarge 1280, 콘텐츠 max-width 1200px)

### 기존 프로젝트 참고
- `/Users/johyeonchang/Documents/Work/code/gitCode/webstyleguide/` — 가장 체계적인 기존 스타일가이드 (CSS Custom Properties, 컴포넌트, 접근성)
- `/Users/johyeonchang/Documents/Work/code/gitCode/inCMSv3/source/css/` — 기존 SCSS 구조 참고 (_color, _font, _mixin, _default, _grid, _normalize, _rem)
- `/Users/johyeonchang/Documents/Work/code/gitCode/samdasoo/source/css/` — inCMSv3와 동일 구조, 추가 참고

### 프로젝트 문서
- `.planning/PROJECT.md` — 프로젝트 컨텍스트, 기존 프로젝트 분석 결과
- `.planning/research/STACK.md` — ITCSS, Style Dictionary 등 스택 리서치
- `.planning/research/ARCHITECTURE.md` — SCSS 아키텍처 패턴 리서치
- `.planning/research/FEATURES.md` — 기능 범위 및 우선순위

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **webstyleguide CSS Custom Properties 패턴**: `--primary-color`, `--gray-900`~`--gray-100`, `--spacing-xs`~`--spacing-3xl` 이미 정의되어 있음 → 토큰 네이밍 참고
- **inCMSv3 믹스인 세트**: flex, full, fsize, ellipse, ani, border-radius, drop-shadow, box-sizing, pmz, placeholder, backcover → 현대화 후 포팅
- **inCMSv3 SCSS 파일 구조**: _normalize → _rem → _font → _color → _mixin → _default → style.scss → ITCSS 전환 시 매핑 기반

### Established Patterns
- **Import 순서**: normalize → rem → font → color → mixin → default (전 프로젝트 동일)
- **REM 함수**: sass-rem 패키지, 16px 기준 (전 프로젝트 동일)
- **폰트**: Pretendard GOV 주력 + Malgun Gothic, apple sd gothic neo 폴백
- **컨테이너**: `.container` 클래스 + max-width + 양쪽 패딩 패턴

### Integration Points
- Phase 2 (BEM Conventions)에서 이 구조 위에 네이밍 규칙 적용
- Phase 3 (Components)에서 토큰을 참조하여 컴포넌트 스타일링

</code_context>

<specifics>
## Specific Ideas

- Tailwind 도입 가능성을 염두에 둔 토큰 설계 — 회사 내 Tailwind 도입 논의 중. 토큰 네이밍이 Tailwind config 매핑과 호환되도록 설계. 나중에 `theme: { colors: { primary: 'var(--color-primary)' } }` 형태로 전환 가능해야 함
- KRDS 표준형 레이아웃을 기본 참조로 삼되, 4단계가 아닌 3단계(모바일/태블릿/PC)로 간소화
- 기존 프로젝트의 `$color-main` 패턴을 `--color-primary` CSS Custom Property로 전환

</specifics>

<deferred>
## Deferred Ideas

- Tailwind CSS 도입/전환 — 현재는 SCSS 기반, 향후 별도 결정
- Style Dictionary 도입 — 현재는 SCSS 직접 관리, 토큰이 복잡해지면 재검토
- Figma Variables ↔ 코드 토큰 자동 동기화 — v2 범위

</deferred>

---

*Phase: 01-foundation-design-tokens-scss-architecture*
*Context gathered: 2026-03-25*
