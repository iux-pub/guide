# 시작 가이드 — INFOMIND UX Guide System

이 문서는 본 저장소를 처음 만나는 **개발자/디자이너/AI 도구 사용자**를 위한 상세 안내다.

빠른 진입은 [README](../README.md)에 있고, 본 문서는 **막힐 때 펼쳐보는** 트러블슈팅 + 워크플로우 + AI 에이전트 셋업 매뉴얼이다.

---

## 목차

1. [상황별 시작](#1-상황별-시작)
2. [환경 요구사항](#2-환경-요구사항)
3. [AI 에이전트 셋업 (Claude / Cursor / Aider / Codex)](#3-ai-에이전트-셋업)
4. [개발 워크플로우](#4-개발-워크플로우)
5. [트러블슈팅](#5-트러블슈팅)
6. [FAQ](#6-faq)

---

## 1. 상황별 시작

### 1-A. 새 프로젝트를 KRDS+INFOMIND로 시작하고 싶다

스타터 키트를 클론해 시작한다. 이 저장소 자체는 건드리지 않는다.

```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project
rm -rf .git && git init

nvm use              # Node 20 자동 선택 (.nvmrc 따라)
npm install          # legacy-peer-deps 자동 적용 (.npmrc 따라)
npm run build        # 토큰 + CSS + 사이트 빌드
npm run dev          # http://localhost:8080
```

브랜드 색상 변경:
1. `tokens/infomind-overrides.json` 편집
2. `npm run build` 재실행

스타터에 동봉된 것:
- ✅ KRDS 28종 컴포넌트 CSS
- ✅ KRDS + INFOMIND 토큰
- ✅ `.claude/skills/info-design/` — Claude/Cursor 자동 인식
- ✅ ITCSS 5-layer 구조

### 1-B. 이 표준 저장소를 손보고 싶다 (UX팀)

```bash
git clone https://github.com/iux-pub/guide.git
cd guide

nvm use
npm install
npm run dev          # 문서 사이트 라이브 미리보기
```

수정 후 발행:

```bash
npm run build              # 전체 재빌드 (토큰 → 규칙 → CSS → 프롬프트 → 스킬 → 사이트)
npm run sync:starter       # iux-pub/starter에 푸시
npm run deploy:skill       # 로컬 ~/.claude/skills/info-design/ 갱신
```

### 1-C. 기여만 하고 싶다 (외부 컨트리뷰터)

[`CONTRIBUTING.md`](../CONTRIBUTING.md)를 따른다. 핵심:
- Issue 생성 → 브랜치 → PR
- commit 메시지는 한국어 명령형 + scope enum 준수
- 자동 생성물(rules.json, tokens 변경 시) 반드시 `npm run build` 후 커밋

---

## 2. 환경 요구사항

| 항목 | 버전 |
|------|------|
| Node.js | **20 LTS** (`.nvmrc` 락) |
| npm | 10+ |
| Git | 2.30+ |
| OS | macOS · Linux · Windows (WSL2 권장) |

확인:

```bash
node --version    # v20.x 이상
npm --version     # 10.x 이상

# nvm 사용 시 (권장)
nvm use           # 자동으로 .nvmrc 따라 전환
```

`nvm`이 없으면 [nvm 설치](https://github.com/nvm-sh/nvm#installing-and-updating) 후 `nvm install 20` → `nvm use`.

---

## 3. AI 에이전트 셋업

본 저장소는 **모든 AI 코딩 에이전트**가 KRDS 컨트랙트를 자동으로 따르도록 설계됐다. 도구별 셋업:

### 3-A. Claude Code

가장 정밀한 통합. 두 가지 인식 경로:

**자동 (CLAUDE.md)**: 저장소 루트의 `CLAUDE.md`를 Claude Code가 자동으로 읽는다. 별도 설정 불필요.

**스킬 (info-design)**: 정확한 컨트랙트 발효를 위해 다음 트리거 발화:

> "info-design 스킬 기준으로 가자"

스킬 설치:
```bash
npm run deploy:skill   # ~/.claude/skills/info-design/ 글로벌 동기화
```

또는 스타터로 만든 프로젝트는 `.claude/skills/info-design/`가 동봉돼 자동 인식.

### 3-B. Cursor

루트의 `AGENTS.md`와 `.cursorrules`를 Cursor가 자동으로 읽는다. 별도 설정 불필요.

(선택) 더 정밀한 룰은 `.cursor/rules/*.mdc`로 분할 가능. 기본은 `.cursorrules` 하나로 충분.

### 3-C. Aider

`AGENTS.md`를 자동 인식. 추가로 룰을 conventions 파일로 명시하려면:

```bash
ln -s AGENTS.md CONVENTIONS.md
# 또는
echo "see AGENTS.md" > CONVENTIONS.md
```

### 3-D. OpenAI Codex CLI

`AGENTS.md`를 자동 인식. 별도 설정 불필요.

### 3-E. Hermes Agent

자동 인식 안 됨. 대화 시작 시 컨텍스트 첨부:

```
@./AGENTS.md         # 컨트랙트 본체
@./prompts/context.md # LLM 컨텍스트 묶음
```

또는 Hermes config의 시스템 프롬프트에 `AGENTS.md` 내용 inline.

### 3-F. GitHub Copilot Chat / Continue.dev / 기타

`AGENTS.md` 또는 `prompts/context.md`를 채팅 컨텍스트에 첨부.

---

## 4. 개발 워크플로우

### 4-A. 토큰 변경 (색상, 간격 등)

`tokens/krds-base.json`은 **KRDS 정본 — 수정 금지**. 외부에서 동기화만.

INFOMIND 추가/오버라이드는 `tokens/infomind-overrides.json`:

```bash
# 1. 편집
vi tokens/infomind-overrides.json

# 2. 빌드
npm run build:tokens   # tokens/build/tokens.css 재생성

# 3. 검증
npm run check          # 통과 확인

# 4. (UX팀) 발행
npm run build
npm run sync:starter
npm run deploy:skill
```

### 4-B. 새 컴포넌트 추가

> KRDS 28종 카탈로그 외 컴포넌트는 **UX팀 결정 필요**. 임의 추가 금지.

UX팀 결정 후:

1. `src/snippets/{name}.md` — `skill/references/snippet-template.md` 복사
2. `src/styles/6-components/{name}.css` 작성 (BEM + KRDS 토큰만)
3. `src/styles/6-components/index.css`에 `@import`
4. `src/playground/{name}.html` 미리보기
5. `site/components/{name}.md` 문서
6. `skill/references/html-semantics.md`에 매핑 추가 (Root/자식/ARIA/키보드)
7. `scripts/check-html-structure.js`의 `COMPONENT_ROOT_MAPPING`에 항목 추가
8. `npm run build:skill && npm run check` 통과 확인

### 4-C. 새 규칙(R-XX) 추가

자세한 흐름은 [`CONTRIBUTING.md` § 7.2](../CONTRIBUTING.md) 참조.

---

## 5. 트러블슈팅

### `npm install`이 peer dependency 에러

**원인**: `--legacy-peer-deps` 플래그 필요 (Eleventy 3.x + 일부 플러그인 충돌)

**해결**: 본 저장소는 `.npmrc`가 자동 적용 → 그냥 `npm install`이면 됨. 만약 클린 npm 환경이면:

```bash
npm install --legacy-peer-deps
```

또는 `.npmrc` 추가:
```
legacy-peer-deps=true
```

### `npm run check` 위반 발견

각 규칙 ID(R-01 ~ R-18)별 설명:
- `skill/references/forbidden-patterns.md` § 1~10
- `skill/references/html-semantics.md` (R-15/R-16 매핑)
- 문서 사이트 → `/conventions/`

### CI에서 "자동 생성물이 최신이 아닙니다"

**원인**: rules.json, tokens, src/snippets 등을 수정한 뒤 `build` 명령을 안 돌리고 커밋

**해결**:
```bash
npm run build
git add -A
git commit -m "chore: 자동 생성물 갱신"
```

### Husky pre-commit이 자꾸 실패

stylelint 또는 check-violations가 stage된 파일에 위반을 발견한 것:

```bash
npm run lint:fix       # 자동 수정 가능한 것 처리
npm run check          # 남은 위반 직접 확인
```

해결 후 다시 stage + commit.

### Node 버전 미스매치

```bash
nvm use                # .nvmrc 따라 자동 전환
# 또는
nvm install 20 && nvm use 20
```

### LLM이 룰을 안 따른다

1. AI 에이전트가 `AGENTS.md` 또는 `CLAUDE.md`를 인식하는지 확인
2. 인식 안 되는 도구(Hermes, Copilot)면 컨텍스트에 수동 첨부
3. 트리거 발화: "info-design 스킬 기준으로 가자"
4. 그래도 안 되면 `prompts/context.md`를 대화에 첨부

### `npm run dev`가 포트 8080 충돌

```bash
# 다른 포트로
npx @11ty/eleventy --serve --port=8081
```

---

## 6. FAQ

**Q. 이 저장소와 `iux-pub/starter`의 관계?**
A. 이 저장소는 **단일 소스**(SoT). `iux-pub/starter`는 발행 결과물. `npm run sync:starter`로 한 방향 동기화.

**Q. KRDS 새 버전 출시 시?**
A. `tokens/krds-base.json`을 외부에서 다시 동기화 → `npm run build` → `npm run sync:starter` + `deploy:skill`. 다운스트림은 starter 갱신을 따라잡아야 함(현재는 수동).

**Q. 다운스트림 프로젝트가 토큰 변경을 자동으로 받을 방법?**
A. 현재는 없음. starter는 1회 클론 모델. 후속에 `npx infomind-ux upgrade` 같은 명령 도입 예정.

**Q. info-design 스킬을 다른 프로젝트에도 쓸 수 있나?**
A. 가능. `npm run deploy:skill`로 글로벌 설치하면 `~/.claude/skills/info-design/`에서 어디서든 발효. 단, 트리거 발화 필수.

**Q. Tailwind v3에서 v4로 마이그레이션?**
A. 본 저장소는 처음부터 Tailwind v4 기반. v3는 지원 안 함. KRDS 토큰은 Tailwind `@theme`로 정의됐다.

**Q. SCSS는 정말 못 쓰나?**
A. R-03으로 금지. Tailwind v4 + CSS Custom Properties로 동등한 기능 가능. 자세히는 `skill/references/forbidden-patterns.md` § 9.

**Q. 본 저장소가 멈출 일이 있나?**
A. UX팀이 관리하는 한 지속. KRDS가 종료되어도 INFOMIND 오버라이드만으로 자체 시스템 운영 가능.

---

## 더 알아보기

- [README](../README.md) — 한눈에 보는 개요
- [CONTRIBUTING.md](../CONTRIBUTING.md) — 컨트리뷰터 가이드
- [AGENTS.md](../AGENTS.md) — 다중 LLM 컨트랙트
- [CLAUDE.md](../CLAUDE.md) — Claude Code 자동 컨텍스트
- [skill/SKILL.md](../skill/SKILL.md) — info-design 스킬 본체
- [KRDS 공식](https://www.krds.go.kr) · [KRDS-uiux GitHub](https://github.com/KRDS-uiux/krds-uiux)
