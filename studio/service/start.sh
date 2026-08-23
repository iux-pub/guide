#!/bin/sh
# 아이콘 스튜디오 시작 — 화면과 일꾼을 띄운다.
#
# 어디서 불러도 된다 — ssh 세션에서 직접 불러도 살아남는다.
#
# 아래 `nohup setsid`가 프로세스를 새 세션으로 떼어 낸다. 세션이 끊길 때 오는
# SIGHUP은 옛 세션에만 가므로 화면도 일꾼도, 일꾼이 띄우는 claude도 함께 죽지 않는다.
# 실측(2026-08-23): ssh를 끊고 10초 뒤에도 둘 다 PPID 1로 살아 있었다.
#
# **한동안 「rc.d에서 root로 불러야 한다」고 적어 두었는데 틀린 말이었다.**
# 그 탓에 배포할 때마다 sudo 비밀번호를 사람이 손으로 넣어야 했다. 프로세스는
# emrdl7로 돌고 root가 필요한 것은 rc.d 디렉터리에 쓰는 일뿐이며, 그 경로는
# 부팅 때 자동으로 뜨게 하는 용도로만 값어치가 있다(S99icon-studio.sh).

REPO="${ICON_STUDIO_REPO:-$HOME/icon-studio}"
PORT="${PORT:-4710}"
LOG="$HOME/services/icon-studio/logs"

# node 찾기 — Synology 패키지, homebrew, PATH 순
for c in "$ICON_STUDIO_NODE" \
  /var/packages/Node.js_v22/target/usr/local/bin/node \
  /var/packages/Node.js_v20/target/usr/local/bin/node \
  /opt/homebrew/bin/node /usr/local/bin/node; do
  if [ -n "$c" ] && [ -x "$c" ]; then NODE="$c"; break; fi
done
[ -n "${NODE:-}" ] || NODE="$(command -v node)"
[ -n "$NODE" ] || { echo "node를 찾지 못했습니다"; exit 1; }

mkdir -p "$LOG"
cd "$REPO" || { echo "저장소가 없습니다: $REPO"; exit 1; }

PATH="$HOME/.local/bin:$PATH"
export PATH

# 이미 돌고 있으면 겹쳐 띄우지 않는다 — 포트를 뺏겨 새 프로세스가 조용히 죽는다
if [ -f "$LOG/server.pid" ] && kill -0 "$(cat "$LOG/server.pid" 2>/dev/null)" 2>/dev/null; then
  echo "화면은 이미 돌고 있습니다 (pid $(cat "$LOG/server.pid"))"
else
  nohup setsid env PORT="$PORT" "$NODE" studio/server.mjs > "$LOG/server.log" 2>&1 < /dev/null &
  sleep 1
  # setsid가 만든 실제 프로세스를 찾아 적는다. $! 는 setsid 자신이라 곧 사라진다
  ps -eo pid,args 2>/dev/null | grep "[s]tudio/server.mjs" | awk '{print $1}' | head -1 > "$LOG/server.pid"
fi

# 일꾼 — claude가 있을 때만. 없으면 찾기·내보내기만 되고 만들기는 대기로 남는다
if [ -x "$HOME/.local/bin/claude" ] || command -v claude > /dev/null 2>&1; then
  if [ -f "$LOG/worker.pid" ] && kill -0 "$(cat "$LOG/worker.pid" 2>/dev/null)" 2>/dev/null; then
    echo "일꾼도 이미 돌고 있습니다"
  else
    nohup setsid "$NODE" studio/worker.mjs > "$LOG/worker.log" 2>&1 < /dev/null &
    sleep 1
    ps -eo pid,args 2>/dev/null | grep "[s]tudio/worker.mjs" | awk '{print $1}' | head -1 > "$LOG/worker.pid"
  fi
else
  echo "claude가 없어 일꾼은 띄우지 않습니다 — 찾기·내보내기만 됩니다"
fi

sleep 2
echo "아이콘 스튜디오 — http://127.0.0.1:$PORT (프록시: /guide/_icons/)"
echo "  로그: $LOG"
