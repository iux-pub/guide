# INFOMIND UX Guide System

KRDS(범정부 UI/UX 디자인 시스템) 베이스 + INFOMIND UX팀 표준을 합친 디자인·퍼블리싱 가이드 저장소.
토큰·컴포넌트·스니펫·LLM 컨트랙트(스킬)를 단일 소스에서 발행해 신규 프로젝트가 즉시 적용 가능한 표준을 제공한다.

## 주요 산출물

| 산출물 | 설명 |
|--------|------|
| **디자인 토큰** | `tokens/krds-base.json` + `infomind-overrides.json` → `tokens/build/tokens.css` (Tailwind v4 `@theme` 형태) |
| **CSS 컴포넌트 28종** | KRDS 5그룹 카탈로그 — 폼/액션 · 컨테이너 · 내비 · 피드백 · 콘텐츠 (BEM, ITCSS 5-layer) |
| **마크업 스니펫 28종** | `src/snippets/*.md` — 각 컴포넌트의 KRDS 정합 마크업·접근성 패턴·토큰 출처 |
| **info-design 스킬** | `skill/` — Claude Code용 컨트랙트. KRDS 토큰·컴포넌트만 사용하도록 강제하며 임의 생성 거부 |
| **LLM 프롬프트 묶음** | `prompts/` — context/tokens/components/design-rules/publishing 컨텍스트 파일 |
| **문서 사이트** | Eleventy 기반 — 토큰/규칙/컴포넌트/접근성 가이드 열람·검색 (Pagefind) |
| **스타터 킷** | `starter/` — clone 후 바로 시작 가능한 KRDS+Tailwind v4 보일러플레이트 |
| **접근성 검증** | KWCAG/WCAG 2.1 AA + pa11y-ci + axe-core 자동 테스트 |

## 발행 채널

이 저장소는 단일 소스(SoT)로서 다음 4개 채널을 통해 표준을 배포한다.

| 채널 | 명령 | 도착지 |
|------|------|-------|
| 스타터 키트 | `npm run sync:starter` | `iux-pub/starter` 저장소 |
| Claude Code 스킬 | `npm run deploy:skill` | `~/.claude/skills/info-design/` |
| 문서 사이트 | `npm run build` | `_site/` (Eleventy + Pagefind) |
| LLM 컨텍스트 | `npm run build:prompts` | `prompts/*.md` (대화에 첨부 사용) |

## 시작하기

```bash
# 의존성 설치
npm install --legacy-peer-deps

# 토큰 + CSS 빌드
npm run build:tokens
npm run build:css

# 문서 사이트 개발 서버 (Tailwind 워치 + 11ty 서브)
npm run serve
```

http://localhost:8080 에서 문서 사이트를 열람할 수 있다.

## 신규 프로젝트 시작 (스타터 킷)

```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project
rm -rf .git && git init
npm install --legacy-peer-deps
npm run build
```

`tokens/infomind-overrides.json`에서 프로젝트 브랜드 색상을 정의하고 `npm run build`로 재빌드한다.

> 스타터 킷 저장소: https://github.com/iux-pub/starter
> 스타터 사용 가이드는 `starter/README.md` 참조.

## 프로젝트 구조

```
tokens/                         디자인 토큰 단일 소스
  krds-base.json                KRDS 정본 (수정 금지)
  infomind-overrides.json       UX팀 결정 — KRDS 공백 채움 + infomind-* 추가
  build/tokens.css              빌드 산출물 (자동 생성)

src/styles/                     CSS 소스 (ITCSS 5레이어, Tailwind v4)
  style.css                     메인 진입점
  3-generic/                    리셋 (62.5% 트릭)
  4-elements/                   HTML 태그 베이스
  5-objects/                    레이아웃 (BEM)
  6-components/                 KRDS UI 컴포넌트 28종 (BEM)
  7-utilities/                  유틸리티

src/snippets/                   컴포넌트 마크업 스니펫 28종 (LLM 참조용)
src/playground/                 컴포넌트 미리보기 HTML

skill/                          info-design 스킬 본체
  SKILL.md                      컨트랙트
  references/                   krds-tokens, krds-components, tailwind-mapping,
                                accessibility, forbidden-patterns, guide-import

prompts/                        LLM 컨텍스트 묶음
site/                           Eleventy 문서 사이트 소스
starter/                        스타터 킷 (sync:starter로 iux-pub/starter에 배포)
references/                     krds-source.md (KRDS 원본 정리)
docs/                           BEM/ITCSS/접근성 추가 가이드
scripts/                        빌드·검사 스크립트 (build-tokens, build-rules,
                                build-prompts, build-skill, check-violations,
                                sync-starter)
```

## 주요 명령어

| 명령 | 용도 |
|------|------|
| `npm run build` | 전체 빌드 (tokens → rules → CSS → prompts → skill → site) |
| `npm run build:tokens` | `krds-base.json` + `infomind-overrides.json` → `tokens/build/tokens.css` |
| `npm run build:css` | Tailwind v4 컴파일 → `dist/css/style.css` |
| `npm run build:docs-css` | 문서 사이트 CSS 빌드 |
| `npm run build:rules` | `rules.json` → `site/conventions/` + `CLAUDE.md` 자동 주입 |
| `npm run build:prompts` | `prompts/*.md` 재생성 |
| `npm run build:skill` | `skill/` 빌드 |
| `npm run watch:css` | Tailwind 워치 모드 |
| `npm run serve` | 문서 사이트 개발 서버 (CSS 워치 + 11ty 서브) |
| `npm run lint:css` | Stylelint (`src/styles/**/*.css`) |
| `npm run lint:css:fix` | Stylelint 자동 수정 |
| `npm run check` | 컨트랙트 위반(R-01 ~ R-14) 검출 |
| `npm run test` | 전체 CI (check → tokens → lint → build → a11y) |
| `npm run test:a11y` | pa11y-ci 접근성 검증 |
| `npm run deploy:skill` | 로컬 `~/.claude/skills/info-design/` 동기화 |
| `npm run sync:starter` | `iux-pub/starter` 저장소 동기화 |

## Claude Code 사용 시 — info-design 스킬 트리거

UI/CSS/HTML 작업을 시작할 때 한 줄 발화로 KRDS 컨트랙트를 활성화한다.

> **"info-design 스킬 기준으로 가자"**

이후 LLM은 KRDS 토큰·INFOMIND 컴포넌트만 사용하며, 카탈로그 외 임의 생성을 거부한다. 위반 발견 시 즉시 작업을 중단하고 사용자에게 보고한다.

스킬 본체는 `skill/`에 있으며 `npm run deploy:skill`로 `~/.claude/skills/info-design/`에 배포된다.
스타터 키트의 경우 동일 스킬이 `starter/.claude/skills/info-design/`에 동봉되어 자동 인식된다.

## 기술 스택

- **CSS Framework**: Tailwind v4 (`^4.0.0`)
- **CSS 방법론**: ITCSS 5-layer + BEM (5-objects · 6-components 한정)
- **1rem 트릭**: 62.5% (1rem = 10px) — KRDS 명시 채택
- **토큰**: KRDS-uiux 정본 + INFOMIND 오버라이드 (자체 `build-tokens.js`)
- **문서 사이트**: Eleventy 3.x + Nunjucks + Pagefind
- **린팅**: Stylelint + 자체 `check-violations.js`
- **접근성 테스트**: pa11y-ci + axe-core (KWCAG/WCAG 2.1 AA)

## 코딩 규칙 (요약 — 상세는 `CLAUDE.md`)

| 규칙 | 수준 | 내용 |
|------|------|------|
| R-01 | error | 모든 색상/간격/크기는 `var(--token)` — 하드코딩 금지 |
| R-05 | error | BEM element 2단계 중첩 금지 — 평탄화 |
| R-09 | error | `<img alt>` 필수 |
| R-10 | error | 인터랙티브 요소는 시맨틱 HTML — `<div onclick>` 금지 |
| R-11 | error | 포커스 스타일 필수 — `:focus { outline: none }` 금지 |
| R-13 | error | 터치/클릭 영역 최소 44×44px |

전체 14개 규칙은 `npm run check`(`scripts/check-violations.js`)와 Stylelint가 자동 검출한다.

## 갱신 흐름

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

## 더 알아보기

- KRDS 공식: https://www.krds.go.kr
- KRDS 원본 정리: `references/krds-source.md`
- 컴포넌트 카탈로그: `skill/references/krds-components.md` (28종 BEM·접근성·토큰 매핑)
- 토큰 카탈로그: `skill/references/krds-tokens.md`
- Tailwind v4 매핑: `skill/references/tailwind-mapping.md`
- 금지 패턴: `skill/references/forbidden-patterns.md`
- 작업 컨트랙트 전문: `CLAUDE.md`

## 라이선스

Internal use only — INFOMIND UX Team
