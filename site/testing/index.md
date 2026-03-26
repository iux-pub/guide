---
title: 테스트 가이드
order: 1
---

크로스 브라우저 호환, 모바일/터치 대응, CSS 회귀 방지를 위한 팀 테스트 표준이다. 퍼블리싱 결과물의 품질을 일관되게 유지하기 위해 프로젝트 완료 전 반드시 아래 가이드에 따라 검증한다.

## 가이드 목록

| 가이드 | 설명 |
|--------|------|
| [크로스 브라우저 테스트](/testing/browser-testing/) | 타겟 브라우저 목록, 뷰포트별 확인 사항, 브라우저별 차이점 대응 |
| [모바일/터치 테스트](/testing/mobile-testing/) | hover 대체 규칙, 터치 타겟 크기, 제스처 주의사항 |
| [CSS 회귀 테스트](/testing/css-regression/) | Stylelint 린트 + 파일 크기 비교 + 시각적 점검 3단계 검증 |

## 대상

- HTML/CSS 퍼블리셔
- QA 담당자
- 프론트엔드 개발자

## 관련 가이드

- [접근성 체크리스트](/accessibility/checklist/) -- KWCAG/WCAG AA 준수 검증
- [CSS 성능 가이드라인](/guides/css-performance/) -- 선택자 깊이, 미사용 CSS 감지
- [퍼블리싱 심화 가이드](/guides/) -- 시맨틱 마크업, 이미지 최적화, 애니메이션
