---
title: 모달
order: 10
playground_src: /playground/modal.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/modal.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#modal)에 있다.

## 기본 마크업

```html
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal__overlay"></div>
  <div class="modal__content modal__content--medium">
    <header class="modal__header">
      <h2 id="modal-title" class="modal__title">제목</h2>
      <button type="button" class="modal__close" aria-label="닫기">×</button>
    </header>
    <div class="modal__body">
      <p>모달 본문 내용</p>
    </div>
    <footer class="modal__footer">
      <button type="button" class="btn btn--tertiary">취소</button>
      <button type="button" class="btn btn--primary">확인</button>
    </footer>
  </div>
</div>
```

## 접근성 핵심

- `role="dialog"` + `aria-modal="true"` 필수
- `aria-labelledby="제목id"`로 모달 제목 연결 (또는 `aria-label`)
- 본문 설명이 길면 `aria-describedby`도 추가
- 닫기 버튼은 `aria-label="닫기"` 필수
- 첫 포커스는 모달 내부 첫 인터랙티브 요소 (또는 닫기 버튼)
- ESC 키로 닫기 가능
- 백드롭은 `--color-bg-dim`

## 파일

- 마크업: `src/snippets/modal.md`
- CSS: `src/styles/6-components/modal.css`
- 카탈로그: [krds-components.md#modal](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#modal)
