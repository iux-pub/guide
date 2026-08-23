#!/bin/bash
# 아이콘 스튜디오 상시 가동 — launchd 등록
#
# 왜 launchd인가:
#   터미널에서 띄우면 창을 닫는 순간 멈춘다. 디자이너가 쓸 때마다 누군가
#   터미널을 켜 줘야 하면 도구가 아니라 일거리다.
#   그리고 Claude 자격은 macOS 로그인 키체인에 있어 **GUI 세션(launchd) 경유가
#   아니면 못 읽는다** — ssh로 띄운 워커는 인증에서 막힌다.
#
# 무엇이 돌게 되나:
#   com.infoux.icon-studio         화면 서버 (127.0.0.1:4700)
#   com.infoux.icon-studio.worker  그리는 일꾼
#
# 사용법:
#   bash studio/install-service.sh          # 등록하고 시작
#   bash studio/install-service.sh --stop   # 멈추고 등록 해제
#   bash studio/install-service.sh --status # 상태 보기

set -u

REPO="$(cd "$(dirname "$0")/.." && pwd)"
UID_NUM="$(id -u)"
AGENTS="$HOME/Library/LaunchAgents"
SERVER_LABEL="com.infoux.icon-studio"
WORKER_LABEL="com.infoux.icon-studio.worker"
LOG_DIR="$HOME/.local/state/icon-studio"
PORT="${PORT:-4700}"

find_node() {
  for c in "${NODE_BIN:-}" \
    "$(command -v node 2>/dev/null)" \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    "$HOME/Library/Application Support/WorkboardNextRuntime/toolchains/node-v24.15.0-darwin-arm64/bin/node"; do
    [ -n "$c" ] && [ -x "$c" ] && { echo "$c"; return; }
  done
  echo ""
}

status() {
  echo "── 상태 ──"
  for L in "$SERVER_LABEL" "$WORKER_LABEL"; do
    if launchctl print "gui/$UID_NUM/$L" >/dev/null 2>&1; then
      PID=$(launchctl print "gui/$UID_NUM/$L" 2>/dev/null | awk '/^\tpid = /{print $3}')
      echo "  $L — 등록됨${PID:+ (pid $PID)}"
    else
      echo "  $L — 없음"
    fi
  done
  echo
  echo "  화면:  http://127.0.0.1:$PORT"
  echo "  로그:  $LOG_DIR"
  if [ -f "$HOME/.config/icon-studio/auth.env" ]; then
    echo "  인증:  장기 토큰 있음"
  else
    echo "  인증:  없음 — bash scripts/setup-claude-auth.sh 를 먼저 실행하세요"
  fi
}

stop_all() {
  for L in "$WORKER_LABEL" "$SERVER_LABEL"; do
    launchctl bootout "gui/$UID_NUM/$L" 2>/dev/null && echo "  $L 내림"
  done
  echo "멈췄습니다. plist는 $AGENTS 에 남아 있습니다."
}

case "${1:-}" in
  --status) status; exit 0 ;;
  --stop) stop_all; exit 0 ;;
esac

NODE="$(find_node)"
[ -n "$NODE" ] || { echo "✗ node를 찾지 못했습니다. NODE_BIN=/경로/node 로 지정하세요"; exit 1; }

echo "저장소: $REPO"
echo "node:   $NODE"
mkdir -p "$AGENTS" "$LOG_DIR"

write_plist() {
  local label="$1" script="$2"
  cat > "$AGENTS/$label.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$REPO/studio/$script</string>
  </array>
  <key>WorkingDirectory</key><string>$REPO</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key><string>$PORT</string>
    <key>PATH</key><string>$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOG_DIR/${label}.out.log</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/${label}.err.log</string>
</dict>
</plist>
PLIST
  launchctl bootout "gui/$UID_NUM/$label" 2>/dev/null
  launchctl bootstrap "gui/$UID_NUM" "$AGENTS/$label.plist" 2>/dev/null \
    && echo "  $label 올림" \
    || { echo "  ✗ $label 등록 실패"; return 1; }
}

write_plist "$SERVER_LABEL" "server.mjs"
write_plist "$WORKER_LABEL" "worker.mjs"

sleep 2
echo
status
echo
echo "────────────────────────────────────────"
echo "브라우저에서 http://127.0.0.1:$PORT 를 엽니다."
echo "다른 기기에서 쓰려면 Tailnet 같은 상위 계층이 이 포트를 넘겨줘야 합니다"
echo "(서버는 127.0.0.1에만 붙습니다 — 그대로 외부에 열지 않습니다)."
echo "────────────────────────────────────────"
