---
title: 알림
order: 17
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/alert.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#alert)에 있다.

## 기본 마크업

```html
<div class="alert alert--info" role="alert">
  <div class="alert__icon" aria-hidden="true">ℹ</div>
  <div class="alert__body">
    <p class="alert__title">신청 기간 안내</p>
    <p class="alert__message">2026년 5월 1일부터 31일까지 신청 가능합니다.</p>
  </div>
  <button type="button" class="alert__close" aria-label="닫기">×</button>
</div>
```

## Variant / Size

| Variant | 클래스 | 용도 |
|---------|--------|------|
| Info | `.alert--info` | 일반 정보 |
| Success | `.alert--success` | 성공 알림 |
| Warning | `.alert--warning` | 주의 |
| Danger / Critical | `.alert--danger` 또는 `.alert--critical` | 오류·긴급 |

## 접근성 핵심

- 일반 알림: `role="alert"` (즉시 안내) 또는 `role="status"` (정중한 안내)
- 긴급(Critical)은 `role="alert"` + `aria-live="assertive"`
- 일반 정보성은 `role="status"` + `aria-live="polite"` 권장
- 아이콘은 장식용 — `aria-hidden="true"` (텍스트가 의미 전달)
- 닫기 버튼 `aria-label="닫기"` 필수

## 파일

- 마크업: `src/snippets/alert.md`
- CSS: `src/styles/6-components/alert.css`
- 카탈로그: [krds-components.md#alert](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#alert)
