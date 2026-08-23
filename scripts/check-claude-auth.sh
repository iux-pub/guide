#!/bin/bash
# Claude 인증 상태를 '정확하게' 판정한다.
#
# 왜 따로 필요한가 (2026-08-23 실측):
#   같은 기기, 같은 시각인데 확인 경로에 따라 답이 다르다.
#     SSH 비대화 셸  → "Not logged in · Please run /login"  · 종료코드 0  ← 거짓
#     launchd gui/501 → "OAuth session expired..."           · 종료코드 1  ← 참
#   SSH 세션은 로그인 키체인에 접근하지 못해 '자격 없음'처럼 보인다.
#   security 명령도 SSH에서는 User interaction is not allowed 로 판정 자체가 막힌다.
#   따라서 판정은 반드시 launchd(GUI 세션) 경유로 한다.
#
# 사용법:  bash check-claude-auth.sh          # 로컬(launchd 경유)에서 판정
#          ssh <host> 'bash -s' < check-claude-auth.sh   # 원격도 동일하게 정확

set -u

CLAUDE_BIN="${CLAUDE_BIN:-$HOME/.local/bin/claude}"
ENV_FILE="$HOME/.config/icon-studio/auth.env"
UID_NUM="$(id -u)"
LABEL="com.iconstudio.authcheck"
WORK="$(mktemp -d)"
OUT="$WORK/out.txt"
trap 'launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null; rm -rf "$WORK"' EXIT

[ -x "$CLAUDE_BIN" ] || { echo "✗ claude 없음: $CLAUDE_BIN"; exit 2; }

cat > "$WORK/probe.sh" <<EOF
#!/bin/sh
{
  echo "--- claude auth status ---"
  "$CLAUDE_BIN" auth status --text 2>&1
  echo "--- 키체인 잠금 ---"
  security show-keychain-info "\$HOME/Library/Keychains/login.keychain-db" 2>&1
  echo "--- 장기 토큰 파일 ---"
  if [ -f "$ENV_FILE" ]; then
    echo "있음 (\$(stat -f '%Sp' "$ENV_FILE"))"
    set -a; . "$ENV_FILE"; set +a
    echo "--- 토큰으로 호출 ---"
    "$CLAUDE_BIN" --print "OK만 출력하세요." 2>&1 | head -3
  else
    echo "없음"
    echo "--- 세션으로 호출 ---"
    "$CLAUDE_BIN" --print "OK만 출력하세요." 2>&1 | head -3
  fi
  echo "EXIT_MARKER"
} > "$OUT" 2>&1
EOF
chmod +x "$WORK/probe.sh"

cat > "$WORK/probe.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$WORK/probe.sh</string></array>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
EOF

launchctl bootout "gui/$UID_NUM/$LABEL" 2>/dev/null
launchctl bootstrap "gui/$UID_NUM" "$WORK/probe.plist" 2>/dev/null || {
  echo "✗ launchd 등록 실패 — GUI 세션이 없는 환경일 수 있습니다"; exit 2; }

for _ in $(seq 1 30); do
  grep -q EXIT_MARKER "$OUT" 2>/dev/null && break
  sleep 2
done

if ! grep -q EXIT_MARKER "$OUT" 2>/dev/null; then
  echo "✗ 프로브 시간 초과"; cat "$OUT" 2>/dev/null; exit 2
fi

sed '/EXIT_MARKER/d' "$OUT"
echo "────────────────────────────────"

BODY="$(cat "$OUT")"
# 순서 주의: "Expired"인 상태에서도 뒤이어 "Not logged in" 문장이 함께 나온다.
# 만료를 먼저 판정하지 않으면 미로그인으로 잘못 읽는다(2026-08-23 실측).
case "$BODY" in
  *"Expired"*|*"expired"*|*"could not be refreshed"*)
                          echo "판정: 세션 만료 → setup-claude-auth.sh 실행 (장기 토큰 발급 권장)"; exit 1 ;;
  *"Not logged in"*)      echo "판정: 로그인 안 됨 → claude auth login --claudeai"; exit 1 ;;
  *"authenticate"*)       echo "판정: 인증 실패 → setup-claude-auth.sh 실행"; exit 1 ;;
  *OK*)                   echo "판정: 정상 — 워커 실행 가능"; exit 0 ;;
  *)                      echo "판정: 불명 — 위 출력을 직접 확인하세요"; exit 2 ;;
esac
