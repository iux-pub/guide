---
layout: layouts/page.njk
title: 홈
---

# INFOMIND UX Guide

KRDS(범정부 UI/UX 디자인 시스템)의 접근성·구조 원칙 + INFOMIND 실무 표준의 단일 소스.

**AI가 디자인 시스템을 강제 준수합니다. 당신은 의도만 결정하면 됩니다.**

---

## AI에게 작업을 맡길 때

작업 시작할 때 이 한 줄만 발화하세요:

> ### "info-design 스킬 기준으로 가자"

그 다음 AI는:
- ✓ 색상 토큰만 사용 (raw hex/rgb/hsl 금지)
- ✓ 기존 컴포넌트 패턴 우선, 필요 시 프로젝트 패턴 또는 공통 컴포넌트로 확장
- ✓ HTML은 `.skip-to-content`, `header#header`, `main#main`, `footer#footer`, `main > section > .container`와 section 접근 이름 유지
- ✓ BEM·접근성·ARIA 자동 준수
- ✓ 위반 발견 시 작업 중단 후 사용자에게 보고

Cursor·Codex·Aider 등 다른 AI 도구는 저장소의 `AGENTS.md`를 자동 인식합니다.

---

## 자주 보는 자료

- [**컴포넌트 카탈로그**](/components/) — KRDS 기반 패턴의 마크업·CSS·접근성
- [**토큰 카탈로그**](/tokens/color/) — 색상·간격·타이포 토큰 전체
- [**접근성 체크리스트**](/accessibility/checklist/) — WCAG 2.1 AA + KWCAG
- [**디자인 규칙**](/conventions/) — 19개 규칙 (R-01 ~ R-19)

---

## 역할별 시작

**디자인/기획 전달**
[디자인 QA](/design-qa/checklist/) → [디자인 전달 체크리스트](/onboarding/handoff/) → [접근성 체크리스트](/accessibility/checklist/)

**퍼블리셔**
[컴포넌트 카탈로그](/components/)에서 마크업을 그대로 복사해서 사용. AI에게 "info-design 기준으로 가자"라고만 하면 룰 자동 준수.

**리뷰어**
[접근성 체크리스트](/accessibility/checklist/)로 시각·키보드 검증. 19개 규칙은 CI가 자동 검출 — 사람은 비즈니스 의도와 사용성만 보면 됩니다.

**신규 팀원**
[시작 가이드](/onboarding/getting-started/)부터.

---

## 사람이 알아야 할 것 — 단 5가지

규칙은 18개지만 AI가 다 외웁니다. 사람이 기억할 건 이게 전부:

1. **AI 발화 한 줄** — `"info-design 스킬 기준으로 가자"`
2. **CI 빨강** — AI에게 메시지 보여주고 `"고쳐줘"`
3. **새 컴포넌트 필요** — 기존 패턴으로 해결할지, 프로젝트 패턴/공통 컴포넌트로 확장할지 UX팀 판단
4. **토큰/색상 변경 필요** — UX팀에 슬랙
5. **PR 리뷰** — R-XX 외우지 말고 **사용성·의도**만 확인. 룰 위반은 CI가 차단

---

## 새 프로젝트 시작 (개발자)

```bash
npx create-infomind-ux my-project
```

자세한 흐름은 [GitHub 저장소](https://github.com/iux-pub/guide) 또는 [시작 가이드](/onboarding/getting-started/) 참조.
