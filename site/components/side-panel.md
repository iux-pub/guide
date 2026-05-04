---
title: 사이드 패널
order: 11
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/side-panel.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#side-panel)에 있다.

## 기본 마크업

```html
<aside class="side-panel" role="dialog" aria-labelledby="panel-title" aria-hidden="true">
  <header class="side-panel__header">
    <h2 id="panel-title" class="side-panel__title">상세 정보</h2>
    <button type="button" class="side-panel__close" aria-label="닫기">×</button>
  </header>
  <div class="side-panel__body">
    <p>패널 본문 내용</p>
  </div>
  <footer class="side-panel__footer">
    <button type="button" class="btn btn--tertiary">닫기</button>
    <button type="button" class="btn btn--primary">저장</button>
  </footer>
</aside>
```

## 접근성 핵심

- `role="dialog"` + `aria-labelledby`
- 닫기 버튼 `aria-label="닫기"` 필수
- ESC 키 닫기 권장
- 포커스 트랩은 선택 (모달과 달리 본문 인터랙션 허용)
- `aria-hidden` 토글로 스크린리더 노출 제어

## 파일

- 마크업: `src/snippets/side-panel.md`
- CSS: `src/styles/6-components/side-panel.css`
- 카탈로그: [krds-components.md#side-panel](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#side-panel)
