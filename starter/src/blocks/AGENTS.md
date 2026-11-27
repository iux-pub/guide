# Block Catalog Scope

메인·랜딩의 섹션 단위 실물이다. MCP `list_blocks` → `get_block` → `compose_page`가 이 폴더를 읽어 낸다.

1. 블록 하나는 폴더 하나다: `src/blocks/<id>/block.json`(메타데이터) + `markup.html`(마크업 틀). id는 대표 BEM 블록 이름과 같게 짓는다.
2. 스타일은 여기 두지 않는다. `src/styles/6-components/<BEM 블록>.css`에 쓰고 `6-components/index.css` 그룹 F에 등록한 뒤 `block.json`의 `styles`에 경로를 적는다. 색은 토큰, 크기는 rem만 쓴다(원시 색 값·px 금지).
3. 메타데이터 형식의 정본은 `scripts/lib/block-catalog.js`의 `validateBlock`이다. 자리(`slot`) 목록도 그 파일의 `SLOTS`에 있다 — 새 자리가 필요하면 거기에 더한다.
4. `useWhen`·`avoidWhen`은 고르는 사람이 읽는 판단 기준이다. 「언제 쓰지 않나」에는 대신 쓸 형식을 함께 적는다.
5. `content`는 채울 자리 목록이다. 자리마다 `spec`에 문구 길이, 사진 비율과 성격, 항목 수 범위를 적고, 미리보기에 쓸 예시 값(`example`·`examples`)을 넣는다. 예시는 가상의 기관(항구도시 문화재단)으로 쓴다 — 실제 기관 이름·문구를 넣지 않는다.
6. 마크업 틀 표기: `{{key}}` 한 값 자리, `<!-- @each list as item -->` … `<!-- @end -->` 반복, `{{item.field}}`, `{{item.@n}}` 항목 번호, `{{item.@first:A|B}}` 첫 항목 분기. 틀은 `<section class="section section--<archetype> …">` 하나로 시작하고 접근 가능한 이름을 가진다.
7. 서로의 치수·색에 기대어 떼면 깨지는 부품은 한 블록으로 묶고 `bundle`에 부품 목록과 묶은 이유를 적는다. 위아래 블록과 한 면으로 이어지게 설계했으면 `surface`의 `top`·`bottom`·`joinsAbove`·`joinsBelow`에 적는다 — 순서 점검이 이 값을 읽는다. 섹션 바탕은 바탕 면(`plain`)이 기본이다. 내용을 판·사진 판에 담는 바탕 면 블록은 `framed: true`를 적는다 — 「판 없는 바탕 면 3연속」 점검에서 빠진다. 옅은 색 면(`tinted`) 섹션을 바탕 면 사이에 두 번 넣으면 순서 점검이 흰색 ↔ 연회색 교대(`striped-surface`)로 잡는다(design-intelligence §5-2). 공통 틀을 바꿔야 하면 `shell`(`headerClass`·`footerClass`)에 적는다.
8. 블록 예외: 규칙을 넘어야 하는 곳은 `exceptions`에 `{ rule, file, selector, match, reason }`(마크업의 인라인 svg는 `{ rule: "R-27", markup: "svg.<클래스>", reason }`)으로 한 건씩 적는다. `match`는 위반 줄에 그대로 있는 값 문자열이다 — 값이 바뀌면 예외가 풀린다. 예외를 더하기 전에 단색·토큰·짧은 모션으로 바꿔 없앨 수 있는지 먼저 본다. KRDS 기준과 직접 부딪히면 `krds: "pending"`과 `krdsPending` 문장을 함께 적는다(운영자 승인 대기). 검사기는 `contracts/block-exceptions.json`만 읽는다 — 이 파일은 `npm run build:blocks`가 만들고 손으로 고치지 않는다.
9. 견본 조합은 `src/blocks/sets.json`에 적는다. 순서 점검에서 오류·경고가 나는 조합은 등록되지 않는다.
10. 대상에서 온 모양(능선·실루엣)이 든 블록은 「언제 쓰지 않나」에 「이 모양을 그대로 쓰지 않는다」를 적고 변형 축에 모양을 만드는 방법을 적는다.
11. 고친 뒤에는 `npm run build:blocks`(미리보기 `src/playground/block-<id>.html`·`blocks-<조합 id>.html`과 `contracts/block-exceptions.json`), `npm run build:mcp`(번들), `npm run sync:starter`를 돌린다. `scripts/__tests__/blocks.test.js`·`block-exceptions.test.js`가 형식·CSS 실재·생성물 정합을 본다.
