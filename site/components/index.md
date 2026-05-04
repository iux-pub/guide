---
title: 컴포넌트
order: 0
layout: layouts/page.njk
section: components
---

INFOMIND UX 가이드 시스템이 발행하는 KRDS 28컴포넌트 목록입니다. 모든 컴포넌트는 BEM 네이밍 규칙을 따르고 KRDS 토큰을 사용하며 KWCAG/WCAG 2.1 AA를 준수합니다. **카탈로그 외 임의 신설은 금지**입니다.

## 그룹 A — 폼/액션

| 컴포넌트 | 설명 | CSS |
|----------|------|-----|
| [버튼](/components/btn/) | KRDS 4 variant(primary/secondary/tertiary/text) × 5 size | `btn.css` |
| [체크박스·라디오](/components/check-radio/) | KRDS Form check — 박스 24×24, 컨테이너 ≥44px | `check-radio.css` |
| [파일 업로드](/components/file-upload/) | accept 속성 + aria-live 진행 안내 | `file-upload.css` |
| [폼 필드](/components/form/) | 라벨·필드·메시지·에러 상태 | `form.css` |
| [셀렉트](/components/select/) | 네이티브 select 스타일 | `select.css` |
| [스위치](/components/switch/) | role="switch" + aria-checked | `switch.css` |

## 그룹 B — 컨테이너/레이아웃

| 컴포넌트 | 설명 | CSS |
|----------|------|-----|
| [아코디언](/components/accordion/) | `<details>/<summary>` 기반 | `accordion.css` |
| [카드](/components/card/) | header/body/footer | `card.css` |
| [디스클로저](/components/disclosure/) | 단일 펼침 | `disclosure.css` |
| [모달](/components/modal/) | role="dialog" + 포커스 트랩 + ESC 닫기 | `modal.css` |
| [사이드 패널](/components/side-panel/) | 슬라이드인 패널 | `side-panel.css` |
| [탭](/components/tab/) | WAI-ARIA 탭 패턴 | `tab.css` |

## 그룹 C — 내비게이션

| 컴포넌트 | 설명 | CSS |
|----------|------|-----|
| [브레드크럼](/components/breadcrumb/) | 페이지 경로, 모바일 축약 | `breadcrumb.css` |
| [헤더](/components/header/) | 사이트 헤더, GNB 컨테이너 | `header.css` |
| [메인 메뉴](/components/main-menu/) | GNB 메뉴 컴포넌트 | `main-menu.css` |
| [페이지네이션](/components/pagination/) | 페이지 이동, 모바일 숨김 | `pagination.css` |

## 그룹 D — 피드백

| 컴포넌트 | 설명 | CSS |
|----------|------|-----|
| [알림](/components/alert/) | success/warning/danger/info | `alert.css` |
| [배지](/components/badge/) | 상태 표시 작은 라벨 | `badge.css` |
| [진행](/components/progress/) | 진행률 표시 | `progress.css` |
| [스피너](/components/spinner/) | 비동기 로딩 표시 | `spinner.css` |
| [단계 표시](/components/step-indicator/) | 다단계 진행 안내 | `step-indicator.css` |
| [태그](/components/tag/) | 카테고리·필터 태그 | `tag.css` |
| [토스트](/components/toast/) | 일시적 알림 | `toast.css` |
| [툴팁](/components/tooltip/) | 보조 설명 | `tooltip.css` |

## 그룹 E — 콘텐츠/표현

| 컴포넌트 | 설명 | CSS |
|----------|------|-----|
| [캘린더](/components/calendar/) | 날짜 선택·표시 | `calendar.css` |
| [캐러셀](/components/carousel/) | 슬라이드 콘텐츠 | `carousel.css` |
| [목록](/components/list/) | 글머리·번호·설명 목록 | `list.css` |
| [테이블](/components/table/) | 기본·반응형 | `table.css` |

## 템플릿 / 패턴

| 페이지 | 설명 |
|--------|------|
| [보일러플레이트](/components/boilerplate/) | HTML 페이지 기본 구조 템플릿 |
| [조합 패턴](/components/combo-patterns/) | 모달+폼, 카드 그리드+페이지네이션 등 실무 조합 |

## 사용 방법

1. 각 컴포넌트 페이지에서 마크업을 확인한다
2. 권위 있는 소스인 `src/snippets/{name}.md`에서 전체 마크업·variant·접근성 노트를 복사한다
3. CSS는 `src/styles/6-components/{name}.css`에 정의되어 있다 — 빌드 결과 `dist/css/style.css`로 발행
4. 새 컴포넌트 신설은 UX팀 결정 → `skill/references/krds-components.md` 등재 후 사용

## 카탈로그 (전체 28종 BEM·접근성·토큰 매핑)

[skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md) — 가장 권위 있는 단일 소스
