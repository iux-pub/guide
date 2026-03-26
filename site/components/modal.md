---
title: 모달
order: 5
playground_src: /playground/modal.html
preview_height: 400
---

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

## 구성 요소

| Element | 클래스 | 용도 |
|---------|--------|------|
| 컨테이너 | `.modal` | `role="dialog"`, `aria-modal="true"` |
| Overlay | `.modal__overlay` | 반투명 배경 (클릭 시 닫기) |
| Dialog | `.modal__container` | 실제 대화상자 |
| Header | `.modal__header` | 제목 + 닫기 버튼 |
| Title | `.modal__title` | 모달 제목 |
| Body | `.modal__body` | 본문 콘텐츠 |
| Footer | `.modal__footer` | 액션 버튼 영역 |
| Close | `.modal__close` | 닫기 버튼 |

## 트리거 연결 방식

- 열기: `data-modal-open="모달id"` 속성을 트리거 버튼에 추가
- 닫기: `data-modal-close` 속성을 닫기 버튼에 추가

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Escape` | 모달 닫기, 트리거로 포커스 복귀 |
| `Tab` | 다음 포커스 가능 요소 (모달 내부 순환) |
| `Shift+Tab` | 이전 포커스 가능 요소 (모달 내부 순환) |

## 접근성 주의사항

- `role="dialog"` + `aria-modal="true"` 필수
- `aria-labelledby`로 모달 제목 연결 필수
- 포커스 트랩: Tab/Shift+Tab이 모달 내부에서만 순환
- 모달 열릴 때 첫 번째 포커스 가능 요소에 포커스 이동
- 모달 닫힐 때 트리거 버튼으로 포커스 복귀
- 닫기 버튼에 `aria-label="닫기"` 필수

## JS / SCSS 파일

- JS: `src/js/modal.js`
- SCSS: `src/scss/6-components/_modal.scss`
