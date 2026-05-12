# INFOMIND UX Guide System

> KRDS(범정부 UI/UX 디자인 시스템) + INFOMIND 표준의 **단일 소스**.
> 디자인 토큰 · 컴포넌트 · 마크업 스니펫 · AI 컨트랙트(스킬)를 한 저장소에서 발행한다.

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
git clone https://github.com/iux-pub/starter.git my-project
cd my-project
rm -rf .git && git init

nvm use              # Node 20 LTS 자동 선택
npm install          # legacy-peer-deps 자동 적용
npm run build        # 토큰 + CSS + 사이트 빌드
npm run dev          # 개발 서버 (http://localhost:8080)
```

자동 동봉되는 것:
- ✅ `tokens/` — KRDS + INFOMIND 토큰 (그대로 사용)
- ✅ `src/styles/` — KRDS 28종 컴포넌트 CSS
- ✅ `.claude/skills/info-design/` — Claude/Cursor 자동 인식

브랜드 색상 변경은 `tokens/infomind-overrides.json` 편집 → `npm run build`.

> 스타터 키트 저장소: https://github.com/iux-pub/starter

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

## 🤖 Claude / AI와 함께 쓰기

UI/CSS/HTML 작업 시작 시 한 줄 발화로 KRDS 컨트랙트 발효:

> **"info-design 스킬 기준으로 가자"**

이후 AI는:
- ✅ KRDS 토큰만 사용 (raw hex/px 금지)
- ✅ 28종 컴포넌트 카탈로그 외 임의 생성 거부
- ✅ R-01~R-18 규칙 자동 준수
- ✅ 위반 발견 시 작업 중단 + 사용자에게 보고

스킬은 **두 경로**로 인식된다:
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
| `npm run check` | 컨트랙트 위반(R-01~R-18) 자동 검출 |
| `npm run lint` | Stylelint + ESLint |
| `npm run test` | 전체 CI 시뮬레이션 (check + lint + build + a11y) |

세부 빌드 단계(`build:tokens`, `build:rules`, `build:prompts`, `build:skill` 등)는 `package.json` 참조. 평소엔 `npm run build` 하나면 충분.

---

## 📁 프로젝트 구조

```
tokens/                   디자인 토큰 단일 소스
  krds-base.json          KRDS 정본 (수정 금지)
  infomind-overrides.json UX팀 결정 + infomind-* 추가
  build/tokens.css        자동 생성 — 직접 수정 금지

src/styles/               CSS 소스 (ITCSS 5레이어 + Tailwind v4)
  6-components/           KRDS UI 컴포넌트 28종 (BEM)
src/snippets/             마크업 스니펫 28종 (LLM 참조)
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
rules.json                R-01~R-18 단일 소스
CLAUDE.md                 LLM이 항상 따르는 룰
```

---

## 🎨 기술 스택

- **CSS Framework**: Tailwind v4
- **방법론**: ITCSS 5-layer + BEM (5-objects · 6-components 한정)
- **1rem 트릭**: 62.5% (1rem = 10px) — KRDS 채택
- **토큰**: KRDS-uiux 정본 + INFOMIND 오버라이드
- **문서 사이트**: Eleventy 3.x + Nunjucks + Pagefind
- **린팅**: Stylelint + 자체 검사기 (`check-violations.js` + `check-html-structure.js`)
- **접근성**: pa11y-ci + axe-core (KWCAG/WCAG 2.1 AA)
- **Node**: 20 LTS (`.nvmrc` 락)

---

## 📜 코딩 규칙 (요약)

`rules.json`이 단일 소스. `npm run check`가 자동 검출. 전체 18개 규칙은 [`/conventions/`](http://localhost:8080/conventions/) 또는 `CLAUDE.md` 참조.

| 규칙 | 영역 | 내용 |
|------|------|------|
| R-01 | css | 색상/간격/크기는 `var(--token)` — 하드코딩 금지 |
| R-05 / R-08 | bem | element 2단계 중첩 금지 (`.card__body__title` ❌) |
| R-06 / R-18 | bem | modifier는 의미적 — `--blue`/`--big` 등 시각 단어 금지 |
| R-09 / R-10 | html | `<img alt>` 필수 · `<div onclick>` 금지 |
| R-11 ~ R-13 | a11y | 포커스 스타일 · 색상 대비 4.5:1 · 터치 영역 44×44px |
| R-14 | a11y | `.skip-to-content` 필수 |
| R-15 | html | 컴포넌트 root 태그가 `html-semantics.md` 매핑과 일치 |
| R-16 | a11y | 인터랙티브 위젯 필수 ARIA 누락 금지 |
| R-17 | bem | 상태는 BEM modifier만 — `.is-*`/`.has-*` 금지 |

---

## 🔄 갱신 흐름

```
KRDS 새 버전 출시
   ↓
tokens/krds-base.json 갱신 (UX팀)
   ↓
INFOMIND 결정 변경 시 tokens/infomind-overrides.json 편집
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
| 신규 컴포넌트 작성 가이드 | `skill/references/snippet-template.md` |
| HTML 구조 매핑 (28종 × Root/ARIA/키보드) | `skill/references/html-semantics.md` |
| 토큰 카탈로그 | `skill/references/krds-tokens.md` |
| 컴포넌트 카탈로그 | `skill/references/krds-components.md` |
| Tailwind v4 매핑 | `skill/references/tailwind-mapping.md` |
| 접근성 컨트랙트 | `skill/references/accessibility.md` |
| 금지 패턴 | `skill/references/forbidden-patterns.md` |
| 컨트리뷰터 가이드 | `CONTRIBUTING.md` |
| LLM 작업 컨트랙트 | `CLAUDE.md` |
| KRDS 원본 정리 | `references/krds-source.md` |
| KRDS 공식 | https://www.krds.go.kr |

---

## 라이선스

Internal use only — INFOMIND UX Team
