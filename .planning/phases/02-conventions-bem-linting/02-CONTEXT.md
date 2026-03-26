# Phase 2: Conventions — BEM + Linting - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

BEM 네이밍 규칙을 엄격하게 정의하고, Stylelint으로 경고(warning) 수준으로 자동 검사하며, 모든 규칙을 프로젝트 CLAUDE.md에 AI 지시문 형태로 작성하여 AI가 즉시 규칙대로 코드를 생성할 수 있는 상태를 만든다.

</domain>

<decisions>
## Implementation Decisions

### BEM 엄격도
- **D-01:** 엄격한 BEM 표기법 완전 준수 — Block__Element--Modifier 패턴 필수
- **D-02:** 예시: `.card__header`, `.btn--primary`, `.form__input--error`
- **D-03:** 기존 프로젝트의 느슨한 하이픈 패턴(`.card-header`, `.btn-primary`)은 잘못된 패턴으로 do/don't 가이드에 명시

### Stylelint 적용 수준
- **D-04:** BEM 위반 시 경고(warning) 수준으로 표시 — 빌드는 성공하되 경고 로그 출력
- **D-05:** 경고 메시지에 올바른 BEM 패턴을 권장 방향으로 함께 안내
- **D-06:** `npm run lint:fix`로 자동 수정 가능한 항목은 자동 처리 지원
- **D-07:** 팀이 익숙해지면 추후 에러 수준으로 전환 가능 (현재는 경고)

### AI 지시문 포맷
- **D-08:** 프로젝트 CLAUDE.md에 모든 규칙을 직접 작성 — 별도 스킬 파일 없이 CLAUDE.md 하나로 통합
- **D-09:** CLAUDE.md에 BEM 네이밍, 토큰 사용법, SCSS 구조, 접근성 기본 규칙 등 Phase 1~2 전체 규칙 포함
- **D-10:** AI가 CLAUDE.md만 읽으면 즉시 규칙대로 코드를 생성할 수 있는 수준의 구체적 지시문

### Claude's Discretion
- Stylelint 플러그인 선택 (stylelint-selector-bem-pattern 등)
- `.stylelintrc` 구체적 설정값
- BEM do/don't 예제의 구체적 케이스 선정
- CLAUDE.md 섹션 구조 및 내용 구성
- SCSS 중첩에서 BEM 작성 패턴 예제 구성

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 산출물 (BEM 패턴 이미 적용된 코드)
- `src/scss/5-objects/_container.scss` — `.container` BEM 패턴
- `src/scss/5-objects/_grid.scss` — `.grid`, `.grid__col-*` BEM 패턴
- `src/scss/7-utilities/_sr-only.scss` — `.sr-only` 유틸리티 패턴

### 기존 프로젝트 (잘못된 패턴 참고)
- `/Users/johyeonchang/Documents/Work/code/gitCode/webstyleguide/` — 기존 하이픈 패턴 (`.btn-primary`, `.card-header`)
- `/Users/johyeonchang/Documents/Work/code/gitCode/inCMSv3/source/css/` — 기존 느슨한 네이밍 (`.input-box.error`)

### 프로젝트 문서
- `.planning/phases/01-foundation-design-tokens-scss-architecture/01-CONTEXT.md` — Phase 1 결정사항 (토큰 네이밍, ITCSS 구조)
- `.planning/PROJECT.md` — 프로젝트 컨텍스트, AI 활용성 요구사항
- `./CLAUDE.md` — 현재 프로젝트 CLAUDE.md (Phase 2에서 업데이트 대상)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 1에서 이미 `.grid__col-*` 패턴으로 엄격한 BEM 적용됨 — 이 패턴을 기준으로 가이드 작성 가능
- `src/scss/style.scss` — ITCSS import 구조 확립, @use 문법 사용

### Established Patterns
- CSS Custom Properties 토큰: `--color-*`, `--spacing-*`, `--font-size-*` 등 (Phase 1 D-10)
- ITCSS 7레이어 구조 (Phase 1 SCSS-01)
- 62.5% REM 트릭 (1.6rem = 16px)
- `@mixin respond-to(mobile/tablet/tablet-up/pc)` 반응형 믹스인

### Integration Points
- Phase 3 (Components)에서 이 BEM 규칙으로 모든 컴포넌트 네이밍
- Phase 5 (Documentation Site)에서 CLAUDE.md의 규칙을 문서 사이트에도 반영

</code_context>

<specifics>
## Specific Ideas

- 기존 프로젝트들의 실제 잘못된 패턴을 do/don't 예제로 활용 — 추상적인 예제가 아닌 팀이 실제로 썼던 코드 기반
- 경고에 올바른 패턴을 안내하는 방식 — 단순히 "잘못됨"이 아니라 "이렇게 고치세요" 방향 제시
- CLAUDE.md가 AI 프롬프트로 즉시 활용 가능해야 함 — 새 프로젝트 시작 시 CLAUDE.md만 복사하면 AI가 규칙대로 코드 생성

</specifics>

<deferred>
## Deferred Ideas

- Stylelint 에러 수준 전환 — 팀 적응 후 별도 결정
- Prettier 통합 — 현재 범위 외
- ESLint 연동 — JS/프레임워크 규칙은 별도

</deferred>

---

*Phase: 02-conventions-bem-linting*
*Context gathered: 2026-03-25*
