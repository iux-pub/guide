---
title: 탭
order: 6
playground_src: /playground/tab.html
preview_height: 500
---

## 기본 마크업

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="콘텐츠 탭">
    <button type="button" class="tab__button" role="tab"
            id="tab-1" aria-controls="panel-1" aria-selected="true" tabindex="0">
      탭 1
    </button>
    <button type="button" class="tab__button" role="tab"
            id="tab-2" aria-controls="panel-2" aria-selected="false" tabindex="-1">
      탭 2
    </button>
    <button type="button" class="tab__button" role="tab"
            id="tab-3" aria-controls="panel-3" aria-selected="false" tabindex="-1">
      탭 3
    </button>
  </div>

  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <p>탭 1 콘텐츠입니다.</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <p>탭 2 콘텐츠입니다.</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    <p>탭 3 콘텐츠입니다.</p>
  </div>
</div>
```

## 구성 요소

| Element | 클래스 | 용도 |
|---------|--------|------|
| 컨테이너 | `.tab` | 탭 전체 래퍼 |
| List | `.tab__list` | `role="tablist"`, 모바일 가로 스크롤 |
| Button | `.tab__button` | `role="tab"`, 개별 탭 버튼 |
| Panel | `.tab__panel` | `role="tabpanel"`, 콘텐츠 영역 |

## 활성/비활성 상태

- 활성 탭: `aria-selected="true"`, `tabindex="0"`
- 비활성 탭: `aria-selected="false"`, `tabindex="-1"`
- 비활성 패널: `hidden` 속성 추가

## 키보드 상호작용 (자동 활성화 패턴)

| 키 | 동작 |
|----|------|
| `ArrowRight` | 다음 탭으로 이동 + 활성화 |
| `ArrowLeft` | 이전 탭으로 이동 + 활성화 |
| `Home` | 첫 번째 탭으로 이동 + 활성화 |
| `End` | 마지막 탭으로 이동 + 활성화 |

## 접근성 주의사항

- `role="tablist"` + `role="tab"` + `role="tabpanel"` WAI-ARIA 패턴 필수
- `aria-controls`: 탭 버튼이 제어하는 패널 id 연결
- `aria-labelledby`: 패널이 참조하는 탭 버튼 id 연결
- 비활성 탭은 `tabindex="-1"` (화살표로만 접근)
- `tablist`에 `aria-label` 속성으로 탭 그룹 설명 제공

## JS / SCSS 파일

- JS: `src/js/tab.js`
- SCSS: `src/scss/6-components/_tab.scss`

## 관련 문서

- [피그마 컴포넌트 네이밍](/figma/component-naming/) -- 피그마에서의 탭 네이밍 규칙과 BEM 매핑
- [접근성: 탭](/accessibility/tab/) -- 탭 접근성 가이드
