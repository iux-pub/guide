# 탭 (Tab)

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

## Variant 목록

| Element | 클래스 | 용도 |
|---------|--------|------|
| 컨테이너 | `.tab` | 탭 전체 래퍼 |
| List | `.tab__list` | `role="tablist"`, 탭 버튼 목록 (모바일: 가로 스크롤) |
| Button | `.tab__button` | `role="tab"`, 개별 탭 버튼 |
| Panel | `.tab__panel` | `role="tabpanel"`, 탭 콘텐츠 영역 |

### 활성/비활성 상태

- 활성 탭: `aria-selected="true"`, `tabindex="0"` -- 하단 인디케이터 + primary 색상
- 비활성 탭: `aria-selected="false"`, `tabindex="-1"`
- 비활성 패널: `hidden` 속성 추가

## 접근성 주의사항

- `role="tablist"` + `role="tab"` + `role="tabpanel"` WAI-ARIA 패턴 필수
- `aria-selected="true"` / `"false"`: 현재 활성 탭 표시
- `aria-controls`: 탭 버튼이 제어하는 패널 id 연결
- `aria-labelledby`: 패널이 참조하는 탭 버튼 id 연결
- 비활성 탭은 `tabindex="-1"` (키보드 탭 순서에서 제외, 화살표로만 접근)
- 비활성 패널은 `hidden` 속성으로 숨김
- `tablist`에 `aria-label` 속성으로 탭 그룹 설명 제공

### 키보드 상호작용 (자동 활성화 패턴)

| 키 | 동작 |
|----|------|
| `ArrowRight` | 다음 탭으로 이동 + 활성화 (마지막에서 첫 번째로 순환) |
| `ArrowLeft` | 이전 탭으로 이동 + 활성화 (첫 번째에서 마지막으로 순환) |
| `Home` | 첫 번째 탭으로 이동 + 활성화 |
| `End` | 마지막 탭으로 이동 + 활성화 |

## JS 파일

`src/js/tab.js` -- `<script src="path/to/tab.js"></script>` 필수

## SCSS 파일

`src/scss/6-components/_tab.scss`
