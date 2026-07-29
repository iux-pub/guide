# 개발팀 레포에 infoUX 기준 붙이기

이 문서는 **UX팀이 개발팀·협력사 환경에 infoUX 기준을 배포하는 방법**과 **개발자가 활성화하는 방법**을 다룬다.

2026-07-29 스킬 배포 방식을 폐기했다. 스킬은 Claude Code 전용인 데다 각자 `~/.claude/skills/`로 복사해야 해서, 도구가 다른 팀원은 받을 수 없고 복사본은 금세 낡았다. **지금은 MCP 하나로 배포한다.**

---

## 1. 개발자 — 등록

한 번만 하면 된다. 이후 발화는 필요 없다.

### Claude Code

```bash
claude mcp add infoux -- npx -y @infomind/infoux-mcp
```

### Codex

`~/.codex/config.toml`

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

### 프로젝트 단위로 붙이기

저장소를 clone한 팀원 전체에게 걸리게 하려면 프로젝트 루트에 `.mcp.json`을 둔다.

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

---

## 2. 확인

```bash
npx -y @infomind/infoux-mcp
```

`infoUX MCP 준비됨 — 빌드 <sha>, 도구 8종`이 stderr로 뜨면 정상이다.

AI에게 "infoUX 규칙 R-12가 뭐야" 또는 "버튼 컴포넌트 마크업 줘"라고 물어 답이 나오면 연결된 것이다.

---

## 3. UX팀 — 기준 갱신

원본(`rules.json`, `references/`, `src/snippets/`, `tokens/`)을 고친 뒤:

```bash
npm run build          # build:references → build:mcp 포함
npm test               # 검사·린트·단위·접근성
```

`mcp/data/`는 생성물이므로 직접 수정하지 않는다. 커밋하면 팀원은 재설치 없이 다음 실행부터 최신 기준을 받는다(`npx -y`가 최신 버전을 가져온다).

---

## 4. 사람이 여전히 판단할 것

MCP는 규칙 준수를 자동화할 뿐 설계 판단을 대신하지 않는다.

- 새 컴포넌트가 정말 필요한지 — 기존 패턴으로 해결 가능한지 UX팀 판단
- 토큰·색상 변경 — UX팀 요청
- PR 리뷰에서 사용성과 비즈니스 의도
- 개발팀 소유 코드의 스타일 이슈는 UX팀에 요청하는 것이 기본값이다
