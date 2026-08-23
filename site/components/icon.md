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

| 클래스 | 크기 | 쓰는 곳 |
|---|---|---|
| `.icon` | 24px | 기본 |
| `.icon--xsmall` | 16px | 표 안, 작은 배지 |
| `.icon--small` | 20px | 버튼 안, 목록 |
| `.icon--large` | 32px | 카드 헤더 |
| `.icon--xlarge` | 40px | 빈 화면 안내 |
| `.icon--inherit` | 글자 크기 | 본문과 섞일 때 |

## 색

색을 아이콘에 넣지 않는다. `fill: currentColor`라 부모의 `color`를 따라간다 — R-01의 아이콘판이다.

## 폰트 변형 (여벌)

일부 CMS 에디터나 앱 웹뷰처럼 SVG를 못 받는 환경에서만 쓴다. 기본 경로는 스프라이트다.

```html
<span class="icon-font icon-font--search" aria-hidden="true"></span>
```

폰트는 로드에 실패하면 자리가 두부(□)로 남고, 사용자가 폰트를 강제 치환하면 사라지며, 스크린리더가 PUA 코드포인트를 엉뚱하게 읽는다. **반드시 `aria-hidden`과 텍스트 라벨을 함께 둔다.**

## 접근성 핵심

- 장식용: `aria-hidden="true"` — 스크린리더가 건너뛴다
- 의미있음: `role="img"` + `aria-label` — 없으면 무슨 버튼인지 알 수 없다
- 아이콘만 있는 버튼은 버튼 자체에도 `aria-label`을 준다
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
