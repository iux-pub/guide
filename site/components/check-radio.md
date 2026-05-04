---
title: 체크박스 & 라디오
order: 2
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/check-radio.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#check-radio)에 있다.

## 기본 마크업

```html
<label class="check">
  <input type="checkbox" name="agree" value="true">
  <span class="check__box" aria-hidden="true"></span>
  <span class="check__label">개인정보 수집·이용에 동의합니다</span>
</label>
```

## 접근성 핵심

- `<label>`로 input + box + 텍스트를 묶어 클릭 영역 전체 확보
- 라디오 그룹은 `<fieldset><legend>`로 묶기
- 시각 박스(`__box`)는 `aria-hidden="true"` (스크린리더는 native input만 인식)

## 파일

- 마크업: `src/snippets/check-radio.md`
- CSS: `src/styles/6-components/check-radio.css`
- 카탈로그: [krds-components.md#check-radio](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#check-radio)
