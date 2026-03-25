# 버튼 (Button)

## 기본 마크업

```html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
```

## Variant 목록

| Variant | 클래스 | 용도 |
|---------|--------|------|
| Primary | `.btn--primary` | 주요 동작 (제출, 저장) |
| Secondary | `.btn--secondary` | 보조 동작 |
| Outline | `.btn--outline` | 테두리만, 덜 강조 |
| Text | `.btn--text` | 배경/테두리 없음 |
| Ghost | `.btn--ghost` | 투명, 호버 시 배경 표시 |
| Link | `.btn--link` | 링크 스타일 (밑줄) |
| Small | `.btn--sm` | 높이 32px (min-height: 4.4rem으로 터치 영역 44px 보장), `--font-size-sm` |
| Large | `.btn--lg` | 높이 48px, `--font-size-md` |
| Disabled | `:disabled` 속성 | `opacity: 0.5`, `cursor: not-allowed` |

### Variant 조합 예시

```html
<!-- 기본 크기 -->
<button type="button" class="btn btn--primary">저장</button>
<button type="button" class="btn btn--secondary">취소</button>
<button type="button" class="btn btn--outline">더보기</button>
<button type="button" class="btn btn--text">텍스트 버튼</button>
<button type="button" class="btn btn--ghost">고스트</button>
<button type="button" class="btn btn--link">링크 버튼</button>

<!-- 크기 조합 -->
<button type="button" class="btn btn--primary btn--sm">작은 버튼</button>
<button type="button" class="btn btn--primary btn--lg">큰 버튼</button>

<!-- 비활성 -->
<button type="button" class="btn btn--primary" disabled>비활성 버튼</button>
```

## 접근성 주의사항

- `<button>` 태그 사용 필수. `<a>` 태그를 버튼 용도로 사용하지 않는다
- 아이콘만 있는 버튼은 반드시 `aria-label` 속성을 추가한다: `<button type="button" class="btn btn--ghost" aria-label="메뉴 열기">...</button>`
- 비활성 버튼은 `disabled` 속성을 사용한다 (`aria-disabled` 아님)
- 최소 터치 영역 44px x 44px 보장 (`.btn--sm`도 `min-height: 4.4rem` 적용)
- `focus-visible` 스타일 제공: `outline: 2px solid var(--color-primary); outline-offset: 2px`
- 링크 역할이 필요한 경우에만 `<a class="btn btn--link" href="...">` 사용

## SCSS 파일

`src/scss/6-components/_btn.scss`
