# 모달 (Modal)

## 기본 마크업

```html
<!-- 트리거 버튼 -->
<button type="button" class="btn btn--primary" data-modal-open="modal-example">
  모달 열기
</button>

<!-- 모달 -->
<div class="modal" id="modal-example" role="dialog" aria-modal="true"
     aria-labelledby="modal-example-title" aria-hidden="true">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 class="modal__title" id="modal-example-title">모달 제목</h2>
      <button type="button" class="modal__close" data-modal-close aria-label="닫기">
        &times;
      </button>
    </div>
    <div class="modal__body">
      <p>모달 본문 콘텐츠입니다.</p>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn btn--secondary" data-modal-close>취소</button>
      <button type="button" class="btn btn--primary">확인</button>
    </div>
  </div>
</div>
```

## Variant 목록

| Element | 클래스 | 용도 |
|---------|--------|------|
| 컨테이너 | `.modal` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Overlay | `.modal__overlay` | 반투명 배경 (클릭 시 닫기) |
| Dialog 영역 | `.modal__container` | 실제 대화상자 (모바일: 전체화면, tablet-up: max-width 56rem) |
| Header | `.modal__header` | 제목 + 닫기 버튼 |
| Title | `.modal__title` | 모달 제목 (`aria-labelledby` 타겟) |
| Body | `.modal__body` | 본문 콘텐츠 |
| Footer | `.modal__footer` | 액션 버튼 영역 |
| Close | `.modal__close` | 닫기 버튼 (`aria-label="닫기"`) -- 44x44px 터치 타겟 보장 |
| 활성 상태 | `.modal--active` | JS가 열 때 추가. 열림 애니메이션 트리거 |

## 접근성 주의사항

- `role="dialog"` + `aria-modal="true"` 필수 지정
- `aria-labelledby`로 모달 제목 요소 연결 필수
- `aria-hidden="true"` 기본 상태, JS가 열릴 때 `"false"`로 변경
- **포커스 트랩**: 모달이 열리면 Tab/Shift+Tab이 모달 내부에서만 순환
- **ESC 닫기**: Escape 키로 모달 닫기 지원
- 모달 열릴 때 첫 번째 포커스 가능 요소에 포커스 이동
- 모달 닫힐 때 트리거 버튼으로 포커스 복귀
- `body overflow: hidden` 처리 (배경 스크롤 방지)
- 닫기 버튼에 `aria-label="닫기"` 필수 -- 44x44px 터치 타겟 보장
- 반응형: 모바일: 전체화면 / 태블릿: max-width 56rem, max-height 90vh / PC: max-height 85vh

### 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Escape` | 모달 닫기, 트리거로 포커스 복귀 |
| `Tab` | 다음 포커스 가능 요소 (모달 내부 순환) |
| `Shift+Tab` | 이전 포커스 가능 요소 (모달 내부 순환) |

### 트리거 연결 방식

- 열기: `data-modal-open="모달id"` 속성을 트리거 버튼에 추가
- 닫기: `data-modal-close` 속성을 닫기 버튼에 추가

## 열림 애니메이션

- JS에서 `modal--active` 클래스를 추가하면 `@keyframes modal-open`이 실행됨
- `scale(0.95)` -> `scale(1)` + `opacity 0` -> `1`, 300ms ease
- `prefers-reduced-motion: reduce` 설정 시 `animation: none`

## JS 파일

`src/js/modal.js` -- `<script src="path/to/modal.js"></script>` 필수

## SCSS 파일

`src/scss/6-components/_modal.scss`
