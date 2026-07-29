---
title: AI 도구 연결 (MCP)
order: 3
---

infoUX 기준을 AI 도구에 연결한다. **한 번 등록하면 이후 발화가 필요 없다** — AI가 작업 중 필요할 때마다 토큰·컴포넌트·규칙·절차를 직접 조회한다.

## 왜 바뀌었나

이전에는 `info-design` 스킬 파일을 각자 `~/.claude/skills/`에 복사하고, 작업할 때마다 "info-design 기준으로 가자"라고 발화해야 했다. 두 가지 문제가 있었다.

- **Claude Code 전용이었다.** Codex나 Cursor를 쓰는 팀원은 같은 기준을 받을 방법이 없었다.
- **복사본이 낡았다.** 기준이 바뀌어도 각자 다시 복사하기 전까지 옛 기준으로 작업했다.

MCP는 등록 한 줄로 끝나고, 도구가 무엇이든 같은 기준이 가며, 갱신이 자동으로 반영된다.

## 등록

### Claude Code

```bash
claude mcp add infoux -- npx -y @infomind/infoux-mcp
```

### Codex

`~/.codex/config.toml`에 추가한다.

```toml
[mcp_servers.infoux]
command = "npx"
args = ["-y", "@infomind/infoux-mcp"]
```

### Cursor · Claude Desktop

설정의 `mcpServers`에 추가한다.

```json
{
  "mcpServers": {
    "infoux": {
      "command": "npx",
      "args": ["-y", "@infomind/infoux-mcp"]
    }
  }
}
```

## 등록되면 AI가 하는 일

접속 시 서버가 지시문을 함께 넘긴다. 따로 시키지 않아도 아래 순서가 걸린다.

1. 사이트 유형 판정 — 일반사이트 / 공공서비스 / 공공기관 / CMS·관리자 / 커머스·예약
2. 색상은 토큰만 사용. raw hex/rgb/hsl 금지, 토큰명 임의 생성 금지
3. 컴포넌트는 카탈로그 우선. 카탈로그 밖 컴포넌트는 임의 생성하지 않음
4. 규칙 R-01~R-22 준수 (BEM · 접근성 · 금지 패턴)
5. 간격·크기·타이포 스케일·반경·모션은 토큰이 아니라 직접값

## 제공 도구

| 도구 | 용도 |
|------|------|
| `get_contract` | 작업 컨트랙트 전문 |
| `list_components` · `get_component` | 컴포넌트 카탈로그와 마크업 스니펫 |
| `get_tokens` | 색상·폰트·브레이크포인트 토큰 |
| `get_rules` | 규칙 R-01~R-22 (위반·준수 예시 포함) |
| `get_reference` | 접근성 · 금지 패턴 · Tailwind 매핑 · HTML 시맨틱 · 사이트 유형 프로필 |
| `get_workflow` | 작업 절차 — 페이지·폼·위젯 설계, 컴포넌트 생성, 토큰 변경, UI 리뷰, 프로젝트 초기화 |
| `search_docs` | 어느 문서를 봐야 할지 모를 때 전체 검색 |

## 확인

```bash
npx -y @infomind/infoux-mcp
```

`infoUX MCP 준비됨 — 빌드 <sha>, 도구 8종`이 뜨면 정상이다.

AI에게 "infoUX 규칙 R-12가 뭐야"라고 물어 답이 나오면 연결된 것이다.

## 사람이 여전히 판단할 것

MCP는 규칙 준수를 자동화할 뿐 설계 판단을 대신하지 않는다.

- 새 컴포넌트가 정말 필요한지 — 기존 패턴으로 해결할지 UX팀 판단
- 토큰·색상 변경 — UX팀에 요청
- PR 리뷰에서 사용성과 비즈니스 의도
