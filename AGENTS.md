# AGENTS.md — INFOMIND UX Guide System

> 본 파일은 **모든 AI 코딩 에이전트**(Cursor, Aider, Codex CLI, Claude Code, Hermes Agent, GitHub Copilot Chat, Continue.dev, OpenCode 등 모델·도구 무관)가 이 저장소에서 작업할 때 따라야 할 컨트랙트다.
>
> Claude Code는 `CLAUDE.md`도 자동 인식하며, 다른 LLM 도구는 본 파일을 1차 진입점으로 읽는다.
>
> 자동 생성 섹션(규칙 목록)은 `npm run build:rules`로 갱신되며 직접 수정하지 않는다.

---

## 1. 이 저장소가 무엇인가

**KRDS(범정부 UI/UX 디자인 시스템)의 품질 원칙 + INFOMIND 실무 표준**의 단일 소스(SoT) 저장소다.
색상/상태 토큰 · CSS 컴포넌트 패턴 · 마크업 스니펫 · AI 컨트랙트(`info-design` 스킬)를 한 곳에서 발행한다.

발행 채널 4개:
- 스타터 키트 → `iux-pub/starter`
- AI 스킬 → `~/.claude/skills/info-design/`
- 문서 사이트 → `_site/`
- LLM 컨텍스트 묶음 → `prompts/*.md`

---

## 2. 컨트랙트 자동 인식 (LLM 도구별)

**본 저장소(`infoUX/` 또는 `infomind-ux-guide`)에서 UI/CSS/HTML 작업을 시작하면 별도 발화 없이 본 룰을 따른다.**

도구별 인식 방식:

| 도구 | 인식 경로 | 비고 |
|------|----------|------|
| **Claude Code** | `CLAUDE.md` (자동) + `.claude/skills/` | 작업별 스킬 자동 선택 |
| **Cursor** | `AGENTS.md` (본 파일) + `.cursorrules` | 본 파일 1차 |
| **Aider** | `CONVENTIONS.md` 또는 `AGENTS.md` | `AGENTS.md` 우선 |
| **OpenAI Codex CLI** | `AGENTS.md` (자동) | 본 파일 |
| **GitHub Copilot Chat** | `.github/instructions/*.instructions.md` | 파일 경로별 자동 적용 |
| **Hermes Agent** | 사용자가 `prompts/` 첨부 또는 시스템 프롬프트 | `prompts/context.md` 권장 |
| **Continue.dev** | `AGENTS.md` (자동) + `.continue/config.json` | 본 파일 |

본 파일을 자동 인식하지 못하는 LLM은 사용자가 `prompts/context.md` 또는 본 파일을 대화에 첨부한다.

---

## 2.1 예방형 작업 라우팅

절차의 단일 원본은 `contracts/agent-workflow.json`이다. Codex와 Claude를 포함한 모든 에이전트는 아래 순서를 동일하게 수행한다.

UI/CSS/HTML은 검사부터 시작하지 않는다. 다음 순서로 올바른 생성 경로를 먼저 확정한다.

1. `contracts/task-contract.md` 형식으로 사이트 유형, 핵심 과업, 페이지 패턴, 재사용 컴포넌트, 위젯, 예외를 선언한다.
2. 현재 작업에 맞는 스킬을 적용한다: `design-page`, `create-component`, `design-form`, `design-widget`, `change-token`, `review-ui`.
3. 수정 파일과 가장 가까운 `AGENTS.md`를 추가로 읽는다.
4. 기존 카탈로그와 승인 패턴을 조합해 구현한다.
5. `npm run check`는 선택과 설계를 대신하지 않는 마지막 안전망으로 실행한다.

Task Contract의 필수 판단이 비어 있으면 UI 구현을 시작하지 않는다. 단순 수정은 작업 응답에 짧게 선언하고, 페이지·기능 단위 작업은 계약 파일을 남긴다.

---

## 3. 절대 금지 (MUST NOT)

다음을 **위반하면 코드를 작성하지 않고 작업을 중단**한다:

- 색상 raw `hex`/`rgb`/`hsl` 직접 작성 (`#fff`, `rgb(0,0,0)`)
- Tailwind 기본 팔레트 raw 컬러 유틸
- 비-BEM 상태 클래스 (`.is-active`, `.has-error`, `.is-open`) — R-17
- 시각적 단어 modifier (`--blue`, `--big`, `--rounded`, `--shadow`) — R-18
- 인터랙티브 위젯(modal/tab/accordion/tooltip/disclosure/carousel/calendar)에서 필수 ARIA 누락 — R-16
- `div/span 클릭 핸들러 패턴` (시맨틱 HTML 의무) — R-10
- 이미지 `alt` 누락 — R-09
- `:focus { outline: none }` (포커스 가시성) — R-11

---

## 4. 절대 준수 (MUST)

| 항목 | 규정 |
|------|------|
| 사이트 유형 판정 | 코드 생성 전 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약 중 먼저 판정 |
| 색상 | `var(--color-*)` 시맨틱 토큰 |
| 간격/크기 | CSS/Tailwind 직접값. CMS·관리자 화면은 정보 밀도에 맞게 조정 |
| 폰트 | `var(--font-sans)` |
| 폰트 사이즈 | 프로젝트 타입 계층을 우선. 토큰화하지 않음 |
| CSS 작성 | 표준 CSS nesting 허용, Tailwind v4 `@apply`/`@theme`/`@utility` 허용 |
| 반응형 작성 | 단순 속성 변경은 `@apply tablet:*`/`@apply pc:*` 우선, 복잡한 중첩 선택자는 관련 선택자 내부 `@media` 사용 |
| 터치 영역 | 모바일 인터랙티브 ≥ 44×44px |
| BEM | `.block__element--modifier` (5-objects · 6-components 한정) |
| HTML 기본 구조 | 큰 영역은 `header/main/footer`, `main` 안은 `section > .container` 구조 |
| HTML 컴포넌트화 | 페이지 전체가 아니라 `main` 내부의 section 단위로 분리 |
| Page shell | `<a href="#main" class="skip-to-content">` → `header#header` → `main#main` → `footer#footer` 순서. `main` 직계 자식은 section |
| Section 구조 | 각 `section`은 `.container`를 직접 포함하고 heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름 제공 |
| 조건부 정부/공공 요소 | 공식 배너, 정부 상징, 운영기관 식별자, 공공 푸터 필수 링크는 적용 대상이 확인된 경우에만 생성. 민간·사내·일반 CMS에서는 N/A |
| 컴포넌트 root 태그 | `skill/references/html-semantics.md`는 참고 기준. 기존 패턴 위에 시맨틱/ARIA 보강 |
| 인터랙티브 위젯 ARIA | WAI-ARIA 1.2 APG 패턴 + KRDS 보강 |
| 상태 표현 | BEM modifier (시각) + ARIA 속성 (의미) 동시 |
| 색상 대비 | 일반 텍스트 4.5:1, 큰 텍스트 3:1 (WCAG 2.1 AA) |

---

## 5. 핵심 규칙 (자동 생성 — `rules.json`)

`npm run check`가 자동 검출한다.

<!-- AGENTS_RULES_START -->

> 본 섹션은 `rules.json`에서 자동 생성. `npm run build:rules`로 갱신.

### CSS 규칙
- **R-01** `error` — 색상은 var(--token) 강제 — 간격/크기/타이포 스케일은 권장
- **R-02** `warn` — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수
- **R-03** `error` — SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용
- **R-19** `error` — 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지
- **R-20** `error` — 호환성 위험 CSS 선택자 금지 — 핵심 CSS에서 :has() 사용 금지

### BEM 네이밍
- **R-04** `info` — BEM 사용 (5-objects, 6-components 레이어에만 적용)
- **R-05** `error` — element 2단계 중첩 금지 — 평탄화
- **R-06** `error` — 시각적 modifier 금지 — 의미적 이름 사용
- **R-17** `error` — 상태는 BEM modifier로만 표현 — .is-* / .has-* 비-BEM 상태 클래스 금지
- **R-18** `error` — modifier 이름은 의미적이어야 함 — 시각적 단어 금지

### HTML/마크업 규칙
- **R-07** `warn` — inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용
- **R-08** `warn` — HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동)
- **R-09** `error` — img alt 속성 필수
- **R-10** `error` — 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지
- **R-15** `error` — HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다

### 접근성 규칙
- **R-11** `error` — 포커스 스타일 필수 — :focus { outline: none } 금지
- **R-12** `error` — 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상
- **R-13** `error` — 터치/클릭 영역 최소 44×44px
- **R-14** `error` — 건너뛰기 링크 필수 — .skip-to-content
- **R-16** `error` — 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다
<!-- AGENTS_RULES_END -->

---

## 6. 작업 전 자가 점검

코드 한 줄 작성 전:

1. 사이트 유형을 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약 중 하나로 판정했는가?
2. 공식 배너, 정부 상징, 운영기관 식별자는 적용 대상이 확인된 경우에만 생성하는가?
3. 사용 색상이 `--color-*`인가?
4. 기본 폰트는 `--font-sans`/`--font-mono` 기준을 따르는가?
5. CSS nesting과 `@apply`를 쓰더라도 결과 CSS가 읽기 쉬운가?
6. 기존 컴포넌트/패턴으로 해결 가능한가?
7. `main` 내부 요소는 section 단위이고 각 section 안에 `.container`가 있는가?
8. 각 section은 heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름을 제공하는가?
9. 인터랙티브 요소는 `<button>`/`<a>`/시맨틱 HTML인가?
10. 이미지 `alt`, 폼 `<label>`, focus 처리 충족?
11. 모바일 터치 영역 44px 이상?

위 11개 중 하나라도 No면 **작성 중단 → 사용자에게 어느 항목이 막히는지 보고** + 옵션 제시.

---

## 7. 참조 파일 (우선순위 순)

| 작업 맥락 | 파일 |
|----------|------|
| 코드 생성 전 사이트 유형 판정 | `skill/references/project-profiles.md` |
| 컴포넌트 마크업 작성 (시각/스타일) | `skill/references/krds-components.md` |
| 컴포넌트 마크업 작성 (root/ARIA/키보드) | `skill/references/html-semantics.md` |
| 토큰 결정 (색상·기본 폰트·브레이크포인트) | `skill/references/krds-tokens.md` |
| Tailwind 유틸리티 사용 | `skill/references/tailwind-mapping.md` |
| 접근성 검증 | `skill/references/accessibility.md` |
| 금지 패턴 검토 | `skill/references/forbidden-patterns.md` |
| 새 컴포넌트 스니펫 작성 | `skill/references/snippet-template.md` |
| LLM 컨텍스트 첨부용 | `prompts/context.md`, `prompts/components.md`, `prompts/design-rules.md` |
| 컨트랙트 본체 | `skill/SKILL.md` |
| 컨트리뷰션 가이드 | `CONTRIBUTING.md` |

---

## 8. 작업 후 검증

```bash
npm run check     # R-01~R-20 자동 검출
npm run lint      # Stylelint + ESLint
npm run build     # 전체 빌드 (자동 생성물 갱신)
npm run test      # 전체 CI 시뮬레이션 (check + lint + build + a11y)
```

외부 개발팀 프로젝트처럼 infoUX 하네스가 아직 이식되지 않은 경우에도 검증을 생략하지 않는다.

1. 먼저 해당 프로젝트의 `package.json`, CI 설정, README에서 기존 `check`/`lint`/`build`/`test`/`a11y` 명령을 찾아 실행한다.
2. infoUX 전용 `npm run check` 또는 `scripts/check-*`가 없으면, 에이전트가 변경 파일을 직접 점검한다.
3. 직접 점검 최소 항목:
   - raw `hex`/`rgb`/`hsl`, Tailwind raw 컬러 유틸, SCSS 문법, `!important`
   - 핵심 CSS의 `:has()` 의존, `:focus { outline: none }`
   - BEM 2단계 element, 비-BEM 상태 클래스, 시각적 modifier
   - `div/span` 클릭 핸들러, 이미지 `alt`, 폼 `label`, 필수 ARIA, skip link/page shell
   - 모바일 360px 기준 터치 영역 44px 이상, 텍스트 겹침, 가로 overflow
4. 자동 검증을 대체한 항목과 실행하지 못한 항목을 최종 보고에 명시한다.

규칙 위반 발견 시:
1. 즉시 작업 중단
2. 사용자에게 위반 항목·근거 보고
3. 옵션 제시 (토큰 교체, 사용자 확인 필요 등)

---

## 9. 신규 컴포넌트가 필요해 보일 때

기존 컴포넌트 카탈로그를 먼저 확인하되, 프로젝트에 필요한 컴포넌트는 UX팀 판단으로 확장할 수 있다. 카탈로그 확인: `skill/references/krds-components.md`.

신규 필요 시:
1. 기존 컴포넌트 조합으로 해결 가능한지 확인
2. 새 컴포넌트가 더 적절하면 사용자에게 근거 보고
3. 옵션 제시:
   - (a) 일회성 프로젝트 패턴으로 구현
   - (b) 공통 컴포넌트 후보로 등록

공통화 가치가 있으면 코드 주석이나 문서에 `/* TODO: UX팀 정식 컴포넌트화 검토 */`를 남긴다.

---

## 10. 분쟁 시 우선순위

규정 충돌 시 다음 순서:

1. **접근성 (WCAG/KWCAG AA)** — 양보 불가
2. **프로젝트 목적과 사용성** — CMS/관리자 화면은 업무 밀도와 반복 효율 우선
3. **INFOUX 파운데이션** — `tokens/foundation.json`의 색상·기본 폰트·브레이크포인트 기준
4. **KRDS 정본** — 접근성·컴포넌트 원칙·색상 참고 기준
5. **프로젝트 스타일** — 프로젝트별 CSS 확장
6. **사용자 명시 지시** — 단, 접근성을 깨면 사용자에게 확인

---

## 11. 출처 / 빌드 정보

- KRDS 공식: https://www.krds.go.kr
- KRDS-uiux GitHub: https://github.com/KRDS-uiux/krds-uiux
- 본 저장소: https://github.com/iux-pub/guide
- 자동 생성된 규칙 섹션(§5)은 `rules.json`이 단일 소스
- 본 파일 갱신: `npm run build:rules`
