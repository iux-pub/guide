# @infomind-ux/infoux-mcp

INFOMIND UX팀의 퍼블리싱 기준(infoUX)을 MCP로 제공한다. 팀원이 스킬 파일을 각자 복사하지 않아도, 쓰는 에이전트가 무엇이든 같은 기준을 보게 하는 배포 경로다.

2026-07-29 스킬 배포 방식을 폐기하고 MCP로 일원화했다. 스킬은 Claude Code 전용인 데다 각자 `~/.claude/skills/`로 복사해야 해서 도구가 다른 팀원은 받을 수 없었다. MCP는 등록 한 줄로 끝나고 Codex·Cursor에서도 똑같이 붙는다.

## 제공 도구

| 도구 | 용도 |
|---|---|
| `get_contract` | infoUX 작업 컨트랙트 전문. UI 작업 시작 전에 한 번 읽는다 |
| `list_components` | 컴포넌트 카탈로그 29종 |
| `get_component` | 컴포넌트 마크업 스니펫 + 접근성 요건 |
| `get_tokens` | 색상·폰트·브레이크포인트 토큰. `query`로 필터, `raw`로 tokens.css 원본 |
| `get_rules` | 코딩 규칙 R-01~R-22 (위반·준수 예시 포함) |
| `get_reference` | 접근성·금지패턴·Tailwind 매핑·HTML 시맨틱·사이트 유형 프로필 |
| `get_workflow` | 작업 절차 — 페이지·폼·위젯 설계, 컴포넌트 생성, 토큰 변경, UI 리뷰, 프로젝트 초기화 |
| `search_docs` | 어느 문서를 봐야 할지 모를 때 전체 검색 |

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

`infoUX MCP 준비됨 — 빌드 <sha>, 도구 8종`이 stderr로 나오면 정상이다. stdout은 프로토콜 채널이라 로그를 싣지 않는다.

## 데이터 갱신

`mcp/data/`는 가이드 원본에서 생성한 번들이다. **직접 수정하지 않는다.**

```bash
npm run build:mcp
```

원본이 바뀌면(`rules.json`, `skill/`, `src/snippets/`, `tokens/`) 재생성 후 커밋한다. `npm run build`와 `npm test`에 이미 포함돼 있다.

## 범위

문서·토큰·규칙만 노출한다. 가이드 저장소 자체(스타터, CLI, 빌드 스크립트)는 포함하지 않는다. 납품 범위 결정과 충돌하지 않는다 — 발주처에 넘어가는 것은 생성된 사이트이지 이 서버가 아니다.
