# @infomind-ux/infoux-mcp

INFOMIND UX팀의 퍼블리싱 기준(infoUX)을 MCP로 제공한다. 팀원이 스킬 파일을 각자 복사하지 않아도, 쓰는 에이전트가 무엇이든 같은 기준을 보게 하는 배포 경로다.

2026-07-29 스킬 배포 방식을 폐기하고 MCP로 일원화했다. 스킬은 Claude Code 전용인 데다 각자 `~/.claude/skills/`로 복사해야 해서 도구가 다른 팀원은 받을 수 없었다. MCP는 등록 한 줄로 끝나고 Codex·Cursor에서도 똑같이 붙는다.

## 제공 도구

| 도구 | 용도 |
|---|---|
| `get_contract` | infoUX 작업 컨트랙트 전문. UI 작업 시작 전에 한 번 읽는다 |
| `list_components` | 컴포넌트·패턴 카탈로그 — 스니펫 전량(KRDS 기반 컴포넌트 + infoUX 확장 패턴: 푸터·모바일 메뉴·공지 띠·오류 페이지·히어로 블리드 등). 페이지 골격(`boilerplate`)은 컴포넌트와 따로 보인다. 수는 응답에 나온다 |
| `get_component` | 컴포넌트 마크업 스니펫 + 접근성 요건. 없는 이름이면 오류와 함께 쓸 수 있는 이름을 준다 |
| `list_icons` | 아이콘 찾기. `query` 없이 부르면 세트 목록, 주면 구글 Material Symbols 전량을 한국어·영어로 찾아 「세트에 있음」과 「카탈로그에만 있음」으로 나눠 준다 |
| `get_icon` | 아이콘 마크업·표정·접근성 요건. 구글 이름(`shopping_cart`)으로 물어도 세트의 이름을 알려 준다. 카탈로그에만 있는 아이콘이면 마크업 대신 채택 방법을 준다 |
| `get_tokens` | 색상·폰트·브레이크포인트 토큰 전량(`tokens.css`의 모든 `--color-*`·`--font-*`·`--breakpoint-*` — 라이트·고대비 값). `query`로 필터, `raw`로 tokens.css 원본 |
| `get_rules` | 코딩 규칙 전체 — rules.json (위반·준수 예시 포함). `id` 단건 조회, `category`(`css`·`bem`·`html`·`a11y`), `severity`(`error`·`warn`·`info` — `warning`도 `warn`으로 받는다) 필터. 허용값이 아니면 오류로 알린다 |
| `get_reference` | 레퍼런스 문서. 이름 없이 부르면 목록. 접근성(`accessibility`)·금지 패턴(`forbidden-patterns`)·Tailwind 매핑(`tailwind-mapping`)·HTML 시맨틱(`html-semantics`)·사이트 유형 프로필(`project-profiles`)·한국형 패턴(`korean-web-patterns`)·아트 디렉션(`art-direction`)·디자인 판단 절차(`design-intelligence`)·충돌 우선순위(`trade-off-rules`)·납품 점검(`release-checklist`)과 계약 서식 두 개(`task-contract`·`design-plan`), 렌더 비평 평가자 지시문(`render-critique-evaluator`)·기준 견본 색인(`exemplars`) |
| `get_profile` | 사이트 유형 프리셋 — section 흐름·우선 컴포넌트·밀도·표현 등급 |
| `get_workflow` | 작업 절차 — 페이지·폼·위젯 설계, 컴포넌트 생성, 토큰 변경, UI 리뷰, 프로젝트 초기화 |
| `get_art_direction` | 프로필별 아트 디렉션 — 표현 등급 상세·타이포 페어링·팔레트 프리셋·한글 조판·안티패턴 색인 |
| `list_blocks` | 블록 카탈로그(메인·랜딩의 섹션 단위 실물) 찾기. `slot`(자리)·`form`(design-intelligence §6 형식 기호)·`tag`(검색어)로 거르고, 결과마다 설명·언제 쓰나·언제 쓰지 않나·필요한 콘텐츠·어울리는 이웃을 준다. 끝에 견본 조합(한 페이지를 이루는 블록 순서와 면 흐름 — `scene-showcase`·`split-cover`·`public-enterprise`)을 함께 준다 |
| `get_block` | 블록 하나의 전부 — 메타데이터, 마크업 틀(`{{자리}}`·`@each` 반복), 스타일(CSS), 필요한 컴포넌트·아이콘·스크립트·토큰. 묶음 블록은 묶은 이유를, 쇼케이스 블록은 등록된 블록 예외와 「KRDS 기준 밖 — 운영자 승인 대기」 항목을 보여 준다 |
| `compose_page` | 블록 id 목록(`blocks`)이나 견본 조합 id(`set`)를 공통 틀(건너뛰기 링크·헤더·푸터 스니펫)에 끼운 완성 HTML + 채울 자리 목록 + 순서 점검(첫 화면 블록, 같은 면 색 연속과 이어지게 설계된 면, 이웃 궁합, 같은 archetype 3연속). 블록이 요구하는 틀 변형(투명 머리글·반전 푸터 클래스)을 넣어 주고, `assetBase`로 자산 경로 앞머리를 정한다 |
| `search_docs` | 어느 문서를 봐야 할지 모를 때 전체 검색 — 작업 컨트랙트·레퍼런스·작업 절차·스니펫·규칙·사이트 유형 프리셋·아트 디렉션. 대소문자를 구분하지 않고, 빈 문자열은 오류다 |

### 아이콘: 세트와 카탈로그

**세트**는 우리가 채택한 아이콘(번호가 붙어 바로 쓴다), **카탈로그**는 구글 Material Symbols 전량(3,900여 종, 한국어 이름·검색어 포함)이다.
카탈로그에만 있는 아이콘은 코드포인트·스프라이트가 없어 **채택하기 전에는 쓸 수 없다** — 그래서 `get_icon`은 마크업을 주지 않고
채택 방법(스튜디오 「세트에 넣기」 또는 `npm run icons:adopt`)을 알려 준다. 에이전트가 없는 이름으로 마크업을 쓰면
화면에 아무것도 안 나오고, SVG를 직접 붙이면 R-27 위반이다.

검색 코드(`bin/icon-search.js`)는 아이콘 스튜디오와 같은 파일의 복사본이다 — 사람이 찾는 결과와 AI가 찾는 결과가 같다.
카탈로그 색인(`data/icon-library.json`)은 영문 태그를 포함해 약 2MB(압축 후 약 0.6MB)다. 태그를 빼면 영어 동의어
(`purchase`·`padlock`·`envelope`)로는 찾을 수 없어 에이전트가 「없다」고 답하게 되므로 싣는다.

없는 이름·잘못된 필터값·빈 검색어는 MCP 오류 응답(`isError`)으로 돌아온다 — 에이전트가 「없다」는 답을 본문으로 읽고 지나가지 않게 한다.

서버는 접속 시 **지시문**도 함께 넘긴다 — 사이트 유형 판정, 토큰 강제, 카탈로그 우선, 규칙 준수 순서가 에이전트에 자동으로 걸린다.

## 설치

### Claude Code

```bash
claude mcp add infoux -- npx -y @infomind-ux/infoux-mcp
```

저장소를 clone해서 쓰는 경우(사내 배포 전):

```bash
claude mcp add infoux -- node /절대경로/infoUX/mcp/bin/server.js
```

### Codex

`~/.codex/config.toml`

```toml
[mcp_servers.infoux]
command = "npx"
args = ["-y", "@infomind-ux/infoux-mcp"]
```

### Cursor / Claude Desktop

`mcpServers` 설정에 추가한다.

```json
{
  "mcpServers": {
    "infoux": {
      "command": "npx",
      "args": ["-y", "@infomind-ux/infoux-mcp"]
    }
  }
}
```

## 확인

```bash
npx -y @infomind-ux/infoux-mcp
```

`infoUX MCP 준비됨 — 기준 <가이드 버전>, 도구 <n>종`이 stderr로 나오면 정상이다. stdout은 프로토콜 채널이라 로그를 싣지 않는다.

## 데이터 갱신

`mcp/data/`는 가이드 원본에서 생성한 번들이다. **직접 수정하지 않는다.**

```bash
npm run build:mcp
```

원본이 바뀌면(`rules.json`, `contracts/`, `references/`, `src/snippets/`, `tokens/`) 재생성 후 커밋한다. `npm run build`와 `npm test`에 이미 포함돼 있다. 번들에는 커밋 sha를 싣지 않고 가이드 `package.json`의 version만 싣는다 — 같은 원본이면 같은 번들이 나온다(CI가 `mcp/data/` drift를 본다).

## 테스트

도구 구현은 SDK 없이 불러 쓸 수 있다(`require('mcp/bin/server.js').callTool(name, args)`). 실제 서버를 띄우는 테스트까지 돌리려면 `npm ci --prefix mcp`로 이 패키지의 의존성을 설치한다(CI는 설치한다).

## 범위

문서·토큰·규칙만 노출한다. 가이드 저장소 자체(스타터, CLI, 빌드 스크립트)는 포함하지 않는다. 납품 범위 결정과 충돌하지 않는다 — 발주처에 넘어가는 것은 생성된 사이트이지 이 서버가 아니다.
