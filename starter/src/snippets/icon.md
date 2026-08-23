# 아이콘 (Icon) — infoUX

카탈로그에 등재된 아이콘만 쓴다. 목록은 `npm run icons:sheet`로 보거나
AI 도구에서는 MCP `list_icons`로 받는다. 없는 아이콘은 지어내지 말고 UX팀에 요청한다 (R-27).

## 기본 마크업

```html
<!-- 장식용 — 옆에 텍스트가 있어 아이콘이 의미를 더하지 않을 때 -->
<button class="btn">
  <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>
  검색
</button>

<!-- 의미를 담을 때 — 아이콘만으로 기능을 나타낸다 -->
<button class="btn btn--text" aria-label="닫기">
  <svg class="icon" role="img" aria-label="닫기"><use href="/assets/icons/sprite.svg#close"></use></svg>
</button>
```

## 크기

KRDS 사이즈 어휘를 따른다. 시각적 이름(`--big`)은 쓰지 않는다 (R-06·R-18).

- `.icon` (기본 24px) · `.icon--xsmall` 16 · `.icon--small` 20 · `.icon--medium` 24 · `.icon--large` 32 · `.icon--xlarge` 40
- `.icon--inherit` — 글자 크기(1em)를 따라간다. 버튼·링크 안에서 텍스트와 함께 쓸 때 편하다

## 색

색을 아이콘에 넣지 않는다. `fill: currentColor`라 부모의 `color`를 따라간다 (R-01의 아이콘판).

```html
<span style="--tone: var(--color-danger)" class="delete-action">
  <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#delete"></use></svg>
  삭제
</span>
```

## 폰트 변형 (여벌)

SVG를 못 받는 환경(일부 CMS 에디터·앱 웹뷰)에서만 쓴다. 기본 경로는 스프라이트다.

```html
<button class="btn">
  <span class="icon-font icon-font--search" aria-hidden="true"></span>
  검색
</button>
```

폰트는 로드에 실패하면 자리가 두부(□)로 남고, 사용자가 폰트를 강제 치환하면 사라지며,
스크린리더가 PUA 코드포인트를 엉뚱하게 읽는다. **반드시 `aria-hidden`과 텍스트 라벨을 함께 둔다.**

## 접근성

- 장식용: `aria-hidden="true"` — 스크린리더가 건너뛴다
- 의미있음: `role="img"` + `aria-label="…"` — 없으면 무슨 버튼인지 알 수 없다
- 아이콘만 있는 버튼은 버튼 자체에도 `aria-label`을 준다
- 클릭 영역은 아이콘 크기가 아니라 44×44px 이상 (R-13). 아이콘이 작아도 padding으로 확보한다

## 출처

- CSS: `assets/icons/icons.css` (생성물 — 직접 고치지 않는다)
- 원본: `assets/icons/svg/` · 대장: `contracts/icon-codepoints.json`
- 규격: `contracts/icon-contract.json` · 다시 만들기: `npm run icons:build`
