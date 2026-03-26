---
layout: layouts/page.njk
title: 홈
---

인포마인드 UX팀의 디자인/퍼블리싱 가이드 시스템이다.

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
npm install
npm run build:css
```

`src/scss/_project-overrides.scss`에서 Primary 색상 변경 후 시작한다.

> 스타터 킷: [github.com/iux-pub/starter](https://github.com/iux-pub/starter)

## 주요 명령어

| 명령어 | 용도 |
|--------|------|
| `npm run build:css` | SCSS 빌드 |
| `npm run lint:css` | BEM 검사 |
| `npm run test:a11y` | 접근성 테스트 |
