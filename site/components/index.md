---
title: 컴포넌트
order: 0
layout: layouts/page.njk
section: components
---

INFOMIND UX 가이드 시스템에서 제공하는 컴포넌트 목록입니다. 각 컴포넌트는 BEM 네이밍 규칙을 따르며, 웹 접근성(KWCAG/WCAG 2.1 AA)을 준수합니다.

## UI 컴포넌트

| 컴포넌트 | 설명 | SCSS 파일 |
|----------|------|-----------|
| [버튼](/components/btn/) | Primary, Secondary, Outline 등 다양한 Variant | `_btn.scss` |
| [폼](/components/form/) | Input, Select, Checkbox, Radio 등 폼 요소 | `_form.scss` |
| [카드](/components/card/) | 기본, 이미지형, 가로형, Featured 카드 | `_card.scss` |
| [테이블](/components/table/) | 기본, Striped, Bordered, 반응형 테이블 | `_table.scss` |
| [모달](/components/modal/) | 대화상자, 포커스 트랩, ESC 닫기 | `_modal.scss` |
| [탭](/components/tab/) | WAI-ARIA 탭 패턴, 키보드 네비게이션 | `_tab.scss` |
| [페이지네이션](/components/pagination/) | 페이지 이동, 모바일 숨김 | `_pagination.scss` |
| [브레드크럼](/components/breadcrumb/) | 현재 위치 경로, 모바일 축약 | `_breadcrumb.scss` |

## 템플릿

| 템플릿 | 설명 |
|--------|------|
| [보일러플레이트](/components/boilerplate/) | HTML 페이지 기본 구조 템플릿 |

## 사용 방법

1. 각 컴포넌트 페이지에서 **미리보기**를 확인합니다
2. **코드 예제**의 복사 버튼을 클릭하여 HTML 마크업을 복사합니다
3. 프로젝트에 붙여넣고 콘텐츠를 수정합니다
4. SCSS 파일은 `src/scss/6-components/` 디렉토리에 위치합니다
