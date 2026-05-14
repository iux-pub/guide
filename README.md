# INFOMIND UX Guide System

> KRDS(범정부 UI/UX 디자인 시스템)의 품질 원칙 + INFOMIND 실무 표준의 **단일 소스**.
> 색상 토큰 · 컴포넌트 패턴 · 마크업 스니펫 · AI 컨트랙트(스킬)를 한 저장소에서 발행한다.

---

## 🧭 당신은 누구신가요?

| 역할 | 이동 |
|------|------|
| 🆕 **새 프로젝트를 시작하는 개발자** | [→ 스타터 키트로 시작](#-신규-프로젝트-시작-개발자) |
| 🛠 **이 표준 저장소를 손보는 UX팀** | [→ 5분 시작](#-5분-시작-ux팀--표준-관리자) |
| 🤝 **컨트리뷰션하려는 사람** | `CONTRIBUTING.md` |
| 🤖 **Claude/AI에게 디자인 작업 시키는 사람** | [→ 스킬 트리거](#-claude--ai와-함께-쓰기) |

---

## 🆕 신규 프로젝트 시작 (개발자)

```bash
npx create-infomind-ux my-project
cd my-project
npm run dev          # 개발 서버 (http://localhost:8080)
```

자동으로:
- ✅ starter 키트 다운로드 + 압축 해제
- ✅ `package.json` 이름 갱신
- ✅ `git init` + 초기 커밋
- ✅ `npm install` 실행

수동 clone 방식도 가능:
```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project && rm -rf .git && git init && npm install && npm run build
```

자동 동봉되는 것:
- ✅ INFOUX 색상/기본 폰트 토큰
- ✅ KRDS 기반 컴포넌트 CSS
- ✅ `.claude/skills/info-design/` — Claude Code 자동 인식
- ✅ `AGENTS.md` + `.cursorrules` — Cursor/Aider/Codex 자동 인식

브랜드 색상 또는 기본 폰트 변경: `tokens/foundation.json` 편집 → `npm run build`.

> 스타터 저장소: https://github.com/iux-pub/starter
> CLI 저장소: [`cli/`](cli/README.md) (`create-infomind-ux` npm 패키지)

---

## 🛠 5분 시작 (UX팀 — 표준 관리자)

```bash
nvm use              # .nvmrc 따라 Node 20
git clone https://github.com/iux-pub/guide.git
cd guide
npm install
npm run dev          # http://localhost:8080
```

표준을 수정한 뒤 발행:

```bash
npm run build              # 전체 재빌드
npm run sync:starter       # iux-pub/starter 푸시 (다운스트림 배포)
npm run deploy:skill       # 로컬 ~/.claude/skills/info-design/ 갱신
```

---

## 🤖 AI 코딩 에이전트와 함께 쓰기 (다중 LLM 호환)

본 저장소는 **모든 AI 코딩 에이전트**가 INFOMIND UX Core Rules를 따르도록 설계됐다. KRDS는 원칙과 접근성 기준으로 적용하고, 수치 체계는 프로젝트 맥락에 맞게 조정한다.

### 작업 시작 시 — 한 줄 발화

> **"info-design 스킬 기준으로 가자"** (또는 "infomind 디자인 기준으로", "ux 가이드대로")

이후 AI는:
- ✅ 코드 생성 전 민간/사내/CMS/공공기관/정부 상징 사용 서비스인지 먼저 판정
- ✅ 공식 배너, 정부 상징, 운영기관 식별자는 적용 대상이 확인된 경우에만 생성
- ✅ 색상은 토큰만 사용 (raw hex/rgb/hsl 금지)
- ✅ 간격/크기/타이포는 KRDS를 참고하되 프로젝트 밀도에 맞게 조정
- ✅ 기존 컴포넌트 패턴 우선 사용, 필요한 컴포넌트는 UX팀 판단으로 확장
- ✅ R-01~R-19 규칙 자동 준수
- ✅ 위반 발견 시 작업 중단 + 사용자에게 보고

정부 아이덴티티 요소는 모든 프로젝트의 기본값이 아니다. 민간 사이트, 사내 시스템, 일반 CMS에서는 공식 배너·정부 상징·운영기관 식별자를 생성하지 않고 KRDS 접근성/구조/사용성 원칙만 적용한다.

### 도구별 인식 방식

| 도구 | 자동 인식 | 비고 |
|------|-----------|------|
| **Claude Code** | `CLAUDE.md` + `.claude/skills/info-design/` | 트리거 발화로 스킬 활성 |
| **Cursor** | `AGENTS.md` + `.cursorrules` | 자동 |
| **Aider** | `AGENTS.md` | 자동 |
| **OpenAI Codex CLI** | `AGENTS.md` | 자동 |
| **Continue.dev** | `AGENTS.md` | 자동 |
| **GitHub Copilot Chat** | 사용자가 `prompts/context.md` 첨부 | 수동 첨부 |
| **Hermes Agent** | 사용자가 시스템 프롬프트로 `AGENTS.md` 또는 `prompts/` 주입 | 수동 |

자동 인식 못 하는 LLM은 `prompts/context.md` 또는 `AGENTS.md`를 대화에 첨부.

### Claude Code 스킬 (가장 정밀)

스킬은 두 경로로 인식된다:
- 사용자 글로벌: `~/.claude/skills/info-design/` (수동 `deploy:skill`)
- 프로젝트 동봉: 스타터에 자동 포함 (별도 설치 불필요)

---

## 📦 발행 채널 (4개)

이 저장소는 단일 소스(SoT). 빌드 산출물이 4채널로 배포된다.

| 채널 | 명령 | 도착지 |
|------|------|-------|
| 스타터 키트 | `npm run sync:starter` | `iux-pub/starter` 저장소 |
| AI 스킬 | `npm run deploy:skill` | `~/.claude/skills/info-design/` |
| 문서 사이트 | `npm run build` | `_site/` (Eleventy + Pagefind) |
| LLM 컨텍스트 | `npm run build:prompts` | `prompts/*.md` (대화 첨부용) |

---

## 🛠 일상 명령어 (5개)

| 명령 | 용도 |
|------|------|
| `npm run dev` | 개발 서버 (Tailwind 워치 + Eleventy 서브) |
| `npm run build` | 전체 빌드 (토큰 → 규칙 → CSS → 프롬프트 → 스킬 → 사이트) |
| `npm run check` | 컨트랙트 위반(R-01~R-19) 자동 검출 |
| `npm run lint` | Stylelint + ESLint |
| `npm run test` | 전체 CI 시뮬레이션 (check + lint + build + a11y) |

세부 빌드 단계(`build:tokens`, `build:rules`, `build:prompts`, `build:skill` 등)는 `package.json` 참조. 평소엔 `npm run build` 하나면 충분.

---

## 📁 프로젝트 구조

```
tokens/                   디자인 토큰 단일 소스
  foundation.json         색상 + 기본 폰트 단일 소스
  build/tokens.css        자동 생성 — 직접 수정 금지

src/styles/               CSS 소스 (ITCSS 5레이어 + Tailwind v4)
  6-components/           KRDS 기반 UI 컴포넌트 (BEM)
src/snippets/             마크업 스니펫 (LLM 참조)
src/playground/           컴포넌트 미리보기 HTML

skill/                    info-design 스킬 (Claude 컨트랙트)
  SKILL.md                컨트랙트 본체
  references/             html-semantics · krds-tokens · krds-components ·
                          accessibility · forbidden-patterns · snippet-template

site/                     문서 사이트 (Eleventy 소스)
prompts/                  LLM 컨텍스트 묶음 (대화 첨부용)
starter/                  스타터 키트 (sync:starter로 배포)
scripts/                  빌드/검사 스크립트
references/               KRDS 원본 자료
rules.json                R-01~R-19 단일 소스
CLAUDE.md                 LLM이 항상 따르는 룰
```

---

## 🎨 기술 스택

- **CSS Framework**: Tailwind v4
- **방법론**: ITCSS 5-layer + BEM (5-objects · 6-components 한정)
- **CSS 작성**: 표준 CSS nesting + Tailwind v4 문법(`@apply`, `@theme`, `@utility`) 허용
- **토큰**: 색상/상태 + 기본 폰트 토큰은 강제, 간격/크기/타이포 스케일은 직접값
- **HTML 골격**: 큰 영역은 `header/main/footer`, `main` 안은 `section > .container` 구조. 컴포넌트화는 section 단위
- **문서 사이트**: Eleventy 3.x + Nunjucks + Pagefind
- **린팅**: Stylelint + 자체 검사기 (`check-violations.js` + `check-html-structure.js`)
- **접근성**: pa11y-ci + axe-core (KWCAG/WCAG 2.1 AA)
- **Node**: 20 LTS (`.nvmrc` 락)

---

## 📜 코딩 규칙 (요약)

`rules.json`이 단일 소스. `npm run check`가 자동 검출. 전체 19개 규칙은 [`/conventions/`](http://localhost:8080/conventions/) 또는 `CLAUDE.md` 참조.

| 규칙 | 영역 | 내용 |
|------|------|------|
| R-01 | css | 색상은 `var(--token)` 강제, 간격/크기/타이포 스케일은 권장 |
| R-05 / R-08 | bem | element 2단계 중첩 금지 (`.card__body__title` ❌) |
| R-06 / R-18 | bem | modifier는 의미적 — `--blue`/`--big` 등 시각 단어 금지 |
| R-09 / R-10 | html | `<img alt>` 필수 · `div/span 클릭 핸들러 패턴` 금지 |
| R-11 ~ R-13 | a11y | 포커스 스타일 · 색상 대비 4.5:1 · 터치 영역 44×44px |
| R-14 | a11y | `.skip-to-content` 필수 |
| R-15 | html | HTML 기본 구조는 기존 인포마인드 사이트 패턴 우선 |
| R-16 | a11y | 인터랙티브 위젯 필수 ARIA 누락 금지 |
| R-17 | bem | 상태는 BEM modifier만 — `.is-*`/`.has-*` 금지 |

---

## 🔄 갱신 흐름

```
KRDS 새 버전 또는 UX팀 기준 변경
   ↓
tokens/foundation.json 갱신
   ↓
npm run build  ← 토큰·규칙·CSS·프롬프트·스킬·사이트 전체 재빌드
   ↓
npm run sync:starter   → iux-pub/starter 푸시
npm run deploy:skill   → 로컬 ~/.claude/skills/info-design/ 갱신
```

---

## 📚 더 알아보기

| 자료 | 위치 |
|------|------|
| **상세 시작 가이드** (트러블슈팅 · FAQ · AI 에이전트 셋업) | [`docs/getting-started.md`](docs/getting-started.md) |
| **컨트리뷰터 가이드** | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| **다중 LLM 컨트랙트** (Cursor · Aider · Codex · Hermes 등) | [`AGENTS.md`](AGENTS.md) |
| **Claude Code 자동 컨텍스트** | [`CLAUDE.md`](CLAUDE.md) |
| 신규 컴포넌트 작성 가이드 | `skill/references/snippet-template.md` |
| HTML 구조 매핑 (28종 × Root/ARIA/키보드) | `skill/references/html-semantics.md` |
| 토큰 카탈로그 | `skill/references/krds-tokens.md` |
| 컴포넌트 카탈로그 | `skill/references/krds-components.md` |
| Tailwind v4 매핑 | `skill/references/tailwind-mapping.md` |
| 접근성 컨트랙트 | `skill/references/accessibility.md` |
| 금지 패턴 | `skill/references/forbidden-patterns.md` |
| KRDS 원본 정리 | `references/krds-source.md` |
| KRDS 공식 | https://www.krds.go.kr |

---

## 라이선스

Internal use only — INFOMIND UX Team
