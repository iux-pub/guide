---
title: 파일 업로드
order: 3
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/file-upload.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#file-upload)에 있다.

## 기본 마크업

```html
<label class="file-upload">
  <input type="file" id="file" accept="image/*">
  <span class="file-upload__trigger">파일 선택</span>
  <span class="file-upload__filename" aria-live="polite">선택된 파일 없음</span>
</label>
```

## 접근성 핵심

- `<label>`로 input과 트리거를 묶어 키보드 포커스 시 트리거 외곽선 노출
- `aria-live="polite"`로 파일명 변경을 스크린리더에 안내
- `accept` 속성으로 허용 파일 타입 명시 (브라우저 필터링 + 사용자 안내)
- 업로드 진행률은 별도 `<progress>` 또는 토스트로 표시

## 파일

- 마크업: `src/snippets/file-upload.md`
- CSS: `src/styles/6-components/file-upload.css`
- 카탈로그: [krds-components.md#file-upload](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#file-upload)
