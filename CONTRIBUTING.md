# Contributing — INFOMIND UX Guide System

이 저장소는 KRDS(범정부 UI/UX 디자인 시스템) 베이스 + INFOMIND 표준의 **단일 소스(SoT)**다.
컨트리뷰션은 토큰·컴포넌트·규칙·문서 어느 영역이든 환영하지만, 자동 발행 파이프라인에 영향을 주기 때문에 아래 흐름을 지켜 달라.

---

## 1. 빠른 시작

```bash
# Node 20 LTS 사용 (.nvmrc 자동 선택)
nvm use

git clone https://github.com/iux-pub/guide.git
cd guide

# .npmrc 가 legacy-peer-deps 자동 적용 — 별도 플래그 불필요
npm install

# 전체 빌드 (토큰 → 규칙 → CSS → 프롬프트 → 스킬 → 사이트)
npm run build

# 개발 서버 (Tailwind 워치 + 11ty 서브)
npm run dev
```

http://localhost:8080 에서 문서 사이트 확인.

---

## 2. 작업 전 결정 — 어느 레이어를 건드리나?

| 변경 대상 | 파일 | 영향 범위 |
|----------|------|----------|
| 디자인 토큰 (색상/기본 폰트) | `tokens/foundation.json` | CSS · 스킬 · 사이트 · 스타터 |
| CSS 컴포넌트 | `src/styles/6-components/{name}.css` | 사이트 · 스타터 |
| 마크업 스니펫 | `src/snippets/{name}.md` | 스킬 자동 생성 · 사이트 |
| 코딩 규칙 | `rules.json` | CLAUDE.md · site/conventions/ |
| 스킬 컨트랙트 | `skill/SKILL.md` · `skill/references/*.md` (수동 작성분만) | `~/.claude/skills/info-design/` · 스타터 동봉 |
| 빌드 스크립트 | `scripts/*.js` | 발행 파이프라인 |

> 자동 생성물(`skill/references/krds-tokens.md`, `krds-components.md`, `prompts/design-*.md`, `site/conventions/*.md`, `tokens/build/*`)을 **직접 수정하지 말 것.** 원본 소스를 고치고 build로 재생성한다.

---

## 3. 표준 흐름

```
1. 이슈 생성 (선택, 권장)
   ↓
2. 브랜치 생성: feat/<scope>-<설명>  또는  fix/<scope>-<설명>
   ↓
3. 원본 소스 수정 (tokens/, rules.json, src/, skill/ 등)
   ↓
4. 자동 생성물 재빌드 ── 가장 자주 빠뜨리는 단계
     npm run build:tokens   # 토큰 바꿨으면
     npm run build:rules    # rules.json 바꿨으면
     npm run build:prompts  # prompts 바꿨으면
     npm run build:skill    # src/snippets 또는 tokens 바꿨으면
     # 또는 한 번에:  npm run build
   ↓
5. 검사 통과 확인
     npm run check     # R-01~R-20 자동 검출
     npm run lint      # stylelint + eslint
     npm run test      # 전체 CI 시뮬레이션
   ↓
6. 커밋 — 한국어 명령형, 형식 strict
     예: feat(rules): R-19 추가 — 폼 자동완성 속성 강제
   ↓
7. PR 생성 → CI 통과 → 머지
```

`husky` + `lint-staged`가 커밋 단계에서 stylelint + check-violations + check-html-structure를 자동 실행한다.

---

## 4. 커밋 메시지 규약

형식: `<type>(<scope>): <한국어 명령형 설명>`

마침표로 끝내지 않는다. 100자 이내. 본문은 빈 줄 후 자유 서술.

### type (`.commitlintrc.json` enforced)

`feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`

### scope (`.commitlintrc.json` enforced)

| scope | 영역 |
|-------|------|
| `tokens` | 디자인 토큰 (foundation, build-tokens.js) |
| `components` | CSS 컴포넌트 (`src/styles/6-components/`) |
| `snippets` | 마크업 스니펫 (`src/snippets/`) |
| `skill` | info-design 스킬 (`skill/`) |
| `prompts` | LLM 컨텍스트 (`prompts/`, `scripts/build-prompts.js`) |
| `rules` | 코딩 규칙 (`rules.json`) |
| `conventions` | 규칙 문서 (`site/conventions/`) |
| `starter` | 스타터 키트 (`starter/`) |
| `accessibility` | 접근성 컨트랙트 (`skill/references/accessibility.md`) |
| `playground` | 컴포넌트 플레이그라운드 (`src/playground/`) |
| `guides` | 가이드 문서 |
| `design` | 디자인 결정 |
| `governance` | 거버넌스 문서 |
| `onboarding` | 신규 진입 흐름 |
| `testing` | 테스트 인프라 |
| `harness` | 빌드 하네스 (eleventy.config, stylelint config 등) |
| `ci` | CI 워크플로우 |
| `css` | 베이스 CSS (3-generic, 4-elements 등) |
| `a11y` | 접근성 일반 |
| `11ty` | Eleventy 설정 |
| `deps` / `deps-dev` | 의존성 |

### 예시

```
feat(rules): R-19 추가 — 폼 자동완성 속성 강제
fix(tokens): 옛 토큰명 --color-bg-secondary 4건 정정
docs(skill): html-semantics.md 카드 매핑에 anchor 케이스 추가
build(harness): drift 검사 CI 단계 추가
chore(deps): Eleventy 3.1.5 → 3.2.0 업그레이드
```

---

## 5. 자주 빠뜨리는 실수

| 증상 | 원인 | 해결 |
|------|------|------|
| CI 실패 — "자동 생성물이 최신이 아닙니다" | rules.json 또는 tokens 수정 후 `build:*` 안 돌림 | `npm run build` 후 다시 커밋 |
| husky pre-commit 실패 — `R-XX` | stylelint 또는 check-violations 위반 | 출력 메시지의 규칙 ID 확인, `skill/references/forbidden-patterns.md` 참조 |
| HTML 구조 경고 — R-15 | 기존 인포마인드 HTML 기본 골격과 다르거나 시맨틱 보강 필요 | `header/main/footer`, `main > section > .container` 구조와 ARIA 보강 확인 |
| HTML 구조 위반 — R-18 | `--blue`, `--big` 같은 시각 단어 modifier 사용 | KRDS 의미 어휘로 (`--primary`, `--large` 등) |
| 스킬이 적용되지 않음 | 도구가 루트/경로별 계약을 인식하지 못함 | `AGENTS.md`, `.agents/skills`, `.github/instructions` 인식 여부 확인 |
| starter 변경이 다운스트림에 안 감 | `npm run sync:starter` 안 돌림 | 표준 변경 후 `sync:starter` 실행 |

---

## 6. 이슈 등록

이슈 템플릿이 영역별로 준비돼있다:

- 버그 리포트 → `.github/ISSUE_TEMPLATE/bug-report.md`
- 컴포넌트 제안 → `.github/ISSUE_TEMPLATE/component-proposal.md`
- 토큰 변경 → `.github/ISSUE_TEMPLATE/token-change.md`

---

## 7. 영역별 컨트리뷰션 가이드

### 7.1 새 컴포넌트 추가

> 기존 컴포넌트 카탈로그(`skill/references/krds-components.md`)를 먼저 확인한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 UX팀 결정으로 확장한다.

UX팀 결정 완료 후:

1. `src/snippets/{name}.md` — `skill/references/snippet-template.md` 복사해 채움
2. `src/styles/6-components/{name}.css` 작성 (BEM + 색상 토큰, 필요 시 CSS nesting + `@apply`)
3. `src/styles/6-components/index.css`에 `@import`
4. `src/playground/{name}.html` 미리보기 추가
5. `site/components/{name}.md` 문서
6. `skill/references/html-semantics.md`에 매핑 추가 (Root/자식/ARIA/키보드)
7. `scripts/check-html-structure.js`의 `COMPONENT_ROOT_MAPPING`에 항목 추가
8. `npm run build:skill` 실행
9. `npm run check` 통과 확인

### 7.2 새 규칙(R-XX) 추가

1. `rules.json`에 schema 따라 추가 — `id`, `category`, `summary`, `severity`, `enforcement`, `rationale`, `bad`, `good`, `refs`
2. enforcement에 어떤 스크립트가 검출하는지 명시 — 신규 검출 로직 필요하면 `scripts/check-*.js`에 추가
3. `skill/SKILL.md`와 `skill/references/forbidden-patterns.md`에 사례 추가
4. `npm run build:rules` 실행 → CLAUDE.md/site/conventions/ 자동 갱신
5. 새 규칙이 기존 코드에 위반을 만들면 PR을 같이 정리

### 7.3 토큰 변경

공개 토큰은 `tokens/foundation.json` 하나만 관리한다. 범위는 색상(`--color-*`)과 기본 폰트(`--font-*`)로 제한한다.

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰으로 추가하지 않는다. 컴포넌트 CSS에서 Tailwind v4 `@apply` 또는 명확한 CSS 직접값으로 작성한다.

---

## 8. 발행

UX팀 표준 관리자만 해당:

```bash
npm run deploy:skill   # 로컬 ~/.claude/skills/info-design/ 동기화
npm run sync:starter   # iux-pub/starter 저장소로 푸시
```

---

## 9. 도움

- Slack: #infomind-ux (내부)
- 문서 사이트: `npm run dev` 후 http://localhost:8080
- 자세한 작업 컨트랙트: `CLAUDE.md` (이 저장소에서 LLM이 따르는 룰)
