---
layout: layouts/page.njk
title: 홈
---

인포마인드 UX팀의 디자인·퍼블리싱 가이드 시스템 — KRDS(범정부 UI/UX 디자인 시스템) 베이스 + Tailwind v4 + INFOMIND 표준.

## 나는 누구인가?

| 역할 | 먼저 읽을 것 | 그 다음 |
|------|------------|---------|
| **디자이너** | [피그마 네이밍](/figma/component-naming/) → [Variable](/figma/variables/) | [디자인 QA](/design-qa/checklist/) → [핸드오프](/onboarding/handoff/) |
| **퍼블리셔** | [BEM](/conventions/bem/) → [토큰 색상](/tokens/color/) | [컴포넌트](/components/btn/) → [접근성](/accessibility/checklist/) |
| **리뷰어** | [접근성 체크리스트](/accessibility/checklist/) | [AI 리뷰 프롬프트](/prompts/) |
| **신규 팀원** | [시작 가이드](/onboarding/getting-started/) | 위 역할별 경로 따라가기 |

## 새 프로젝트 시작

```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project
rm -rf .git && git init
npm install --legacy-peer-deps
npm run build           # tokens + Tailwind v4 CSS
```

`tokens/infomind-overrides.json`에서 브랜드 색상 정의 후 `npm run build` 재실행.

> 스타터 킷: [github.com/iux-pub/starter](https://github.com/iux-pub/starter)
> Claude Code 사용 시: `"info-design 스킬 기준으로 가자"` 발화로 KRDS 컨트랙트 활성화

## 주요 명령어

| 명령어 | 용도 |
|--------|------|
| `npm run build` | 전체 빌드 (tokens → rules → CSS → prompts → skill → site) |
| `npm run build:tokens` | KRDS+INFOMIND 토큰 → `tokens/build/tokens.css` |
| `npm run build:css` | Tailwind v4 컴파일 → `dist/css/style.css` |
| `npm run check` | 컨트랙트 위반(R-01~R-14) 전체 스캔 |
| `npm run lint:css` | Stylelint (`src/styles/**/*.css`) |
| `npm run test:a11y` | pa11y-ci 접근성 테스트 |
| `npm run serve` | 문서 사이트 개발 서버 (Tailwind 워치 + 11ty) |

## 시스템 구성

- **토큰**: `tokens/krds-base.json` + `tokens/infomind-overrides.json` → `tokens/build/tokens.css` (자동 생성)
- **CSS**: ITCSS 5레이어 + Tailwind v4 + KRDS 28컴포넌트 (`src/styles/`)
- **마크업**: 28컴포넌트 스니펫 (`src/snippets/`)
- **AI 컨트랙트**: info-design 스킬 (`skill/`) — Claude Code용
- **LLM 컨텍스트**: 7개 프롬프트 묶음 (`prompts/`)
- **검증**: `check-violations.js` + Stylelint + pa11y-ci

상세는 [README](https://github.com/iux-pub/guide#readme) 또는 [CLAUDE.md](https://github.com/iux-pub/guide/blob/main/CLAUDE.md) 참조.
