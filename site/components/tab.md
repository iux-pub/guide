---
title: 탭
order: 12
playground_src: /playground/tab.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/tab.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#tab)에 있다.

## 기본 마크업

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="섹션">
    <button class="tab__item" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
      개요
    </button>
    <button class="tab__item" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">
      상세
    </button>
    <button class="tab__item" role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">
      후기
    </button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    개요 내용
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    상세 내용
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    후기 내용
  </div>
</div>
```

## 접근성 핵심

- `role="tablist"` + 각 탭에 `role="tab"`, 패널에 `role="tabpanel"`
- 탭 ↔ 패널 연결: `aria-controls` (탭 → 패널 id), `aria-labelledby` (패널 → 탭 id)
- 활성 표시는 `aria-selected="true"` (시각 인디케이터는 CSS가 자동 처리)
- `aria-label` 또는 `aria-labelledby`로 탭 그룹의 목적 명시 권장

## 파일

- 마크업: `src/snippets/tab.md`
- CSS: `src/styles/6-components/tab.css`
- 카탈로그: [krds-components.md#tab](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#tab)
