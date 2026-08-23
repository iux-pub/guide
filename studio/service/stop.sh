#!/bin/sh
# 아이콘 스튜디오 정지.
#
# pid 파일이 낡았을 수 있으므로 이름으로도 한 번 더 훑는다 —
# pkill -f 가 못 잡는 경우가 있어 pid로 직접 죽인다(2026-08-23 실측).

LOG="$HOME/services/icon-studio/logs"

for n in worker server; do
  if [ -f "$LOG/$n.pid" ]; then
    kill "$(cat "$LOG/$n.pid" 2>/dev/null)" 2>/dev/null
    rm -f "$LOG/$n.pid"
  fi
done

sleep 1
for p in $(ps -eo pid,args 2>/dev/null | grep -E "[s]tudio/(server|worker)\.mjs" | awk '{print $1}'); do
  kill "$p" 2>/dev/null
done

sleep 1
LEFT=$(ps -eo args 2>/dev/null | grep -cE "[s]tudio/(server|worker)\.mjs")
if [ "$LEFT" -gt 0 ]; then
  echo "아직 $LEFT개가 남아 있습니다 — kill -9로 정리합니다"
  for p in $(ps -eo pid,args 2>/dev/null | grep -E "[s]tudio/(server|worker)\.mjs" | awk '{print $1}'); do
    kill -9 "$p" 2>/dev/null
  done
fi

echo "아이콘 스튜디오 멈춤"
