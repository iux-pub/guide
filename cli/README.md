# create-infomind-ux

INFOMIND UX 스타터 키트로 새 프로젝트를 생성한다. KRDS(범정부 UI/UX 디자인 시스템)의 접근성·구조 원칙 + INFOMIND 실무 표준이 적용된 상태로 즉시 시작.

## 사용

```bash
npx create-infomind-ux my-project
cd my-project
npm run dev          # http://localhost:8080
```

## 옵션

```bash
npx create-infomind-ux <project-name> [옵션]

--skip-install       의존성 설치 건너뛰기
--no-git             git init 건너뛰기
--template <name>    스타터 템플릿 (기본: starter)
--help, -h           도움말
--version, -v        버전
```

## 자동 동봉되는 것

- ✅ KRDS 기반 컴포넌트 CSS (BEM + ITCSS 5-layer)
- ✅ INFOUX 색상/기본 폰트 토큰
- ✅ Tailwind v4 + CSS nesting + `@apply`
- ✅ Eleventy 문서 사이트
- ✅ `.claude/skills/info-design/` — Claude Code 자동 인식
- ✅ `AGENTS.md` + `.cursorrules` — Cursor/Aider/Codex 자동 인식
- ✅ pa11y-ci + axe-core 접근성 검증
- ✅ Stylelint + check-violations.js (R-01~R-20 룰)

## 다음 단계

1. 브랜드 색상 정의: `tokens/foundation.json` 편집 → `npm run build`
2. AI 코딩 에이전트 사용 시: "info-design 스킬 기준으로 가자" 발화
3. 자세한 가이드: `README.md`, `CLAUDE.md`, `.claude/skills/info-design/SKILL.md`

## 출처

본 CLI는 `iux-pub/starter` 저장소를 GitHub tarball로 다운로드하고 초기화한다.

표준 정의 저장소: https://github.com/iux-pub/guide
스타터 키트 저장소: https://github.com/iux-pub/starter

## 라이선스

ISC — Internal use only (INFOMIND UX Team)
