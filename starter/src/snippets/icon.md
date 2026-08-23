# 아이콘 (Icon) — infoUX

카탈로그에 등재된 아이콘만 쓴다. 목록은 `npm run icons:sheet`로 보거나
AI 도구에서는 MCP `list_icons`로 받는다. 없는 아이콘은 지어내지 말고 UX팀에 요청한다 (R-27).

## 기본 마크업

```html
<!-- 장식용 — 옆에 텍스트가 있어 아이콘이 의미를 더하지 않을 때 -->
<button class="btn">
  <span class="icon-font icon-font--search" aria-hidden="true"></span>
  검색
</button>

<!-- 의미를 담을 때 — 아이콘만으로 기능을 나타낸다 -->
<button class="btn btn--text" aria-label="닫기">
  <span class="icon-font icon-font--close" aria-hidden="true"></span>
</button>
```

`aria-hidden`은 장식·의미 어느 쪽이든 붙인다. 폰트 아이콘은 스크린리더가 PUA 코드포인트를
엉뚱하게 읽으므로 아이콘 자체를 숨기고, **뜻은 옆의 텍스트나 버튼의 `aria-label`이 전한다.**

### SVG 태그로 넣을 때

폰트를 못 쓰는 곳(일부 메일 템플릿·외부 CMS)이나 아이콘 하나만 색을 달리해야 할 때 쓴다.

```html
<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>
<svg class="icon" role="img" aria-label="검색"><use href="/assets/icons/sprite.svg#search"></use></svg>
```

낱개 SVG 파일이 필요하면 스튜디오 상세 화면에서 「SVG 파일 받기」로 내려받는다.

## 크기

폰트는 `font-size`를 따라간다. 기본 24px이고, 클래스로 바꾼다.

- `.icon-font` (기본 24px) · `--xsmall` 16 · `--small` 20 · `--large` 32 · `--xlarge` 40
- 본문과 섞일 때는 크기를 지정하지 않는다 — 글자 크기를 그대로 따른다

SVG 방식은 `.icon` + 같은 어휘(`.icon--small` 등)를 쓴다. 시각적 이름(`--big`)은
쓰지 않는다 (R-06·R-18).

## 색

색을 아이콘에 넣지 않는다. `fill: currentColor`라 부모의 `color`를 따라간다 (R-01의 아이콘판).

```html
<span style="--tone: var(--color-danger)" class="delete-action">
  <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#delete"></use></svg>
  삭제
</span>
```

## 접근성

- 아이콘에는 항상 `aria-hidden="true"`를 붙인다. 폰트는 스크린리더가 오독하고, SVG도
  장식일 때가 대부분이다
- **뜻은 아이콘 밖에서 전한다** — 옆의 텍스트, 또는 버튼의 `aria-label`
- 아이콘만 있는 버튼은 버튼에 `aria-label`이 없으면 무슨 버튼인지 알 수 없다
- 클릭 영역은 아이콘 크기가 아니라 44×44px 이상 (R-13)
- SVG를 의미 전달에 직접 쓸 때만 `role="img"` + `aria-label`을 쓴다

## 출처

- CSS: `assets/icons/icons.css` (생성물 — 직접 고치지 않는다)
- 원본: `assets/icons/svg/` · 대장: `contracts/icon-codepoints.json`
- 규격: `contracts/icon-contract.json` · 다시 만들기: `npm run icons:build`
