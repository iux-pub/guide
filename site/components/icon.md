---
title: 아이콘
order: 29
---

infoUX 아이콘 세트. 권위 있는 소스는 `src/snippets/icon.md`이며, 규격은 `contracts/icon-contract.json`, 번호 대장은 `contracts/icon-codepoints.json`이 정본이다.

**카탈로그에 없는 아이콘 이름을 쓰지 않는다** (R-27). 없으면 지어내지 말고 UX팀에 요청한다. AI 도구는 infoUX MCP의 `list_icons`·`get_icon`으로 실재하는 이름만 받는다.

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

`aria-hidden`은 어느 쪽이든 붙인다. 폰트 아이콘은 스크린리더가 PUA 코드포인트를 엉뚱하게
읽으므로 아이콘 자체를 숨기고, **뜻은 옆의 텍스트나 버튼의 `aria-label`이 전한다.**

## 크기

| 클래스 | 크기 | 쓰는 곳 |
|---|---|---|
| `.icon-font` | 24px | 기본 |
| `--xsmall` | 16px | 표 안, 작은 배지 |
| `--small` | 20px | 버튼 안, 목록 |
| `--large` | 32px | 카드 헤더 |
| `--xlarge` | 40px | 빈 화면 안내 |
| `--inherit` | 글자 크기 | 본문과 섞일 때 |

크기 클래스와 아이콘 이름이 같은 네임스페이스이므로 **아이콘 이름에 사이즈 어휘를
쓸 수 없다** (`small`·`large` 등은 예약어).

## 색

색을 아이콘에 넣지 않는다. 폰트는 `color`를, SVG는 `fill: currentColor`를 따라간다 —
R-01의 아이콘판이다.

## SVG 태그로 넣을 때

폰트를 못 쓰는 곳(일부 메일 템플릿·외부 CMS)이나 아이콘 하나만 색을 달리해야 할 때 쓴다.

```html
<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>
<svg class="icon" role="img" aria-label="검색"><use href="/assets/icons/sprite.svg#search"></use></svg>
```

낱개 SVG 파일은 스튜디오 상세 화면의 「SVG 파일 받기」로 내려받는다.

## 접근성 핵심

- 아이콘에는 항상 `aria-hidden="true"`
- **뜻은 아이콘 밖에서 전한다** — 옆의 텍스트, 또는 버튼의 `aria-label`
- 클릭 영역은 아이콘 크기가 아니라 44×44px 이상 (R-13)

## 아이콘 추가

아이콘 스튜디오에서 만들고 사람이 승인한 것만 세트에 들어간다. 자동 통과는 없다.

```bash
npm run icons:sheet          # 전체 목록 보기
bash studio/install-service.sh   # 스튜디오 (찾기·만들기·내보내기)
```

## 파일

- 마크업: `src/snippets/icon.md`
- CSS: `src/styles/6-components/icon.css` (스프라이트) · `assets/icons/icons.css` (폰트, 생성물)
- 자산: `assets/icons/` — 스프라이트·폰트·낱개 SVG·라이선스 고지
- 규격: `contracts/icon-contract.json` · 대장: `contracts/icon-codepoints.json`
- 카탈로그: [krds-components.md#icon](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#icon)
