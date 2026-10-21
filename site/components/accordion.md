---
title: 아코디언
order: 7
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/accordion.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [references/krds-components.md](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#accordion)에 있다.

## 기본 마크업

```html
<div class="accordion">
  <details class="accordion__item">
    <summary class="accordion__summary">민원 처리 기간은 얼마나 걸리나요?</summary>
    <div class="accordion__panel">
      <p>민원 종류마다 다릅니다. 신청 화면의 처리 기간 항목에서 확인할 수 있습니다.</p>
    </div>
  </details>
  <details class="accordion__item">
    <summary class="accordion__summary">신청한 뒤에 내용을 고칠 수 있나요?</summary>
    <div class="accordion__panel">
      <p>처리 상태가 접수 대기일 때만 고칠 수 있습니다. 나의 민원에서 해당 신청을 열어 고칩니다.</p>
    </div>
  </details>
  <details class="accordion__item" open>
    <summary class="accordion__summary">첨부 파일은 몇 개까지 올릴 수 있나요?</summary>
    <div class="accordion__panel">
      <p>파일은 5개까지, 하나에 10MB까지 올릴 수 있습니다.</p>
    </div>
  </details>
</div>
```

세 번째 항목처럼 `open` 속성을 주면 처음부터 펼친 상태로 보인다. 질문은 실제 문의에서 가져온다 — "자주 묻는 질문 1"·"답변 1 내용" 같은 자리 문구는 납품 페이지에서 R-23 오류다.

## 접근성 핵심

- native `<details>`/`<summary>` 사용 시 키보드/스크린리더 자동 지원
- `<summary>`는 자동으로 button role + aria-expanded 처리됨 — 별도 ARIA 불필요
- 최소 터치 영역 보장: `--touch-target-min` (44px)

## 파일

- 마크업: `src/snippets/accordion.md`
- CSS: `src/styles/6-components/accordion.css`
- 카탈로그: [krds-components.md#accordion](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#accordion)
