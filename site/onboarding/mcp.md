---
title: AI 도구 연결 (MCP)
order: 3
---

infoUX 기준을 AI 도구에 연결한다. 등록하면 AI 도구가 작업 중 필요한 토큰·컴포넌트·규칙·작업 절차를 직접 조회하며, 별도의 호출 없이 같은 기준이 적용된다.

## 특징

- **도구 무관** — Claude Code, Codex, Cursor, Claude Desktop 등 MCP를 지원하는 도구는 모두 같은 기준을 받는다.
- **등록 한 줄** — 설정 파일을 복사하거나 관리할 필요가 없다.
- **갱신 반영** — 패키지가 갱신되면 별도 복사 없이 새 기준이 적용된다.

## 등록

### Claude Code

```bash
claude mcp add infoux -- npx -y @infomind-ux/infoux-mcp
```

### Codex

`~/.codex/config.toml`에 추가한다.

```toml
[mcp_servers.infoux]
command = "npx"
args = ["-y", "@infomind-ux/infoux-mcp"]
```

### Cursor · Claude Desktop

설정의 `mcpServers`에 추가한다.

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

## 등록되면 AI가 하는 일

접속 시 서버가 작업 지시문을 함께 전달하며, 아래 순서가 자동으로 적용된다.

1. 사이트 유형 판정 — 일반사이트 / 공공서비스 / 공공기관 / CMS·관리자 / 커머스·예약
2. 색상은 토큰만 사용. raw hex/rgb/hsl 금지, 토큰명 임의 생성 금지
3. 컴포넌트는 카탈로그 우선. 카탈로그 밖 컴포넌트는 임의 생성하지 않음
4. 규칙 R-01~R-27 준수 (BEM · 접근성 · 금지 패턴)
5. 간격·크기·타이포 스케일·반경·모션은 토큰이 아니라 직접값

## 제공 도구

| 도구 | 용도 |
|------|------|
| `get_contract` | 작업 컨트랙트 전문 |
| `list_components` · `get_component` | 컴포넌트 카탈로그와 마크업 스니펫 |
| `list_icons` · `get_icon` | 아이콘 카탈로그 조회 (한국어 키워드 검색 지원) |
| `get_tokens` | 색상·폰트·브레이크포인트 토큰 |
| `get_rules` | 규칙 R-01~R-27 (위반·준수 예시 포함) |
| `get_reference` | 접근성 · 금지 패턴 · Tailwind 매핑 · HTML 시맨틱 · 사이트 유형 프로필 |
| `get_profile` | 사이트 유형 프리셋 — section 흐름 · 우선 컴포넌트 · 밀도 · 표현 등급 |
| `get_art_direction` | 프로필별 표현 등급 · 타이포 페어링 · 팔레트 프리셋 · 한글 조판 |
| `get_workflow` | 작업 절차 — 페이지·폼·위젯 설계, 컴포넌트 생성, 토큰 변경, UI 리뷰, 프로젝트 초기화 |
| `search_docs` | 어느 문서를 봐야 할지 모를 때 전체 검색 |

## 확인

```bash
npx -y @infomind-ux/infoux-mcp
```

`infoUX MCP 준비됨 — 빌드 <sha>, 도구 12종`이 출력되면 정상이다.

AI 도구에서 infoUX 규칙(예: R-12)을 조회해 내용이 반환되면 연결된 것이다.

## MCP 없이 문서만 읽히려면

발주처·협력사처럼 MCP를 연결하기 어려운 환경에는 텍스트 문서를 그대로 전달할 수 있다. 섹션마다 요약과 전문 두 형태를 제공한다.

| 주소 | 내용 |
|------|------|
| `/llms.txt` | 전체 목차 + 섹션별 링크 |
| `/llms-full.txt` | 전체 문서 한 파일 |
| `/<섹션>/llms.txt` | 섹션 목차와 한 줄 요약 |
| `/<섹션>/llms-full.txt` | 섹션 전문 |

예: <https://footer.kr/guide/_site/components/llms-full.txt> 를 AI 도구에 전달하면 컴포넌트 기준 전체가 공유된다.

지속적인 작업에는 MCP 연결을 권장한다. 필요한 부분만 도구로 조회하므로 대화가 짧아지고, 기준이 바뀌어도 자동으로 반영된다.

## 담당자가 판단할 사항

MCP는 규칙 준수를 자동화하며, 설계 판단을 대신하지 않는다.

- 새 컴포넌트가 정말 필요한지 — 기존 패턴으로 해결할지 UX팀 판단
- 토큰·색상 변경 — UX팀에 요청
- PR 리뷰에서 사용성과 비즈니스 의도
