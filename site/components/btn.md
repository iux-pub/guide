---
title: 버튼
order: 1
playground_src: /playground/btn.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/btn.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#btn)에 있다.

## 기본 마크업

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
```

## Variant / Size

| Variant | 클래스 | 용도 |
|---------|--------|------|
| Primary | `.btn--primary` | 메인 CTA (저장, 제출, 확인) |
| Secondary | `.btn--secondary` | 보조 액션 (primary 톤 옅은 채움 + primary border) |
| Tertiary | `.btn--tertiary` | 약한 액션 (투명 + gray border) |
| Text | `.btn--text` | 텍스트 링크형 (배경/border 없음) |

## 접근성 핵심

- `<button type="button">` 태그 사용 필수. `<a>` 태그를 버튼 용도로 쓰지 않는다
- 아이콘만 있는 버튼은 `aria-label` 필수: `<button class="btn" aria-label="메뉴 열기">...</button>`
- 비활성은 `disabled` 속성 (또는 `aria-disabled="true"`)
- 포커스 outline은 `reset.css`에서 전역 관리 (4px primary 외곽선) — 컴포넌트에서 제거 금지
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 자동 비활성 (Phase 6에서 추가)

## 파일

- 마크업: `src/snippets/btn.md`
- CSS: `src/styles/6-components/btn.css`
- 카탈로그: [krds-components.md#btn](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#btn)
