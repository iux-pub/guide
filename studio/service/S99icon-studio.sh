#!/bin/sh
# 아이콘 스튜디오 — Synology 부팅 스크립트
#
# 놓을 자리: /usr/local/etc/rc.d/S99icon-studio.sh (root 권한 필요)
#
# 왜 init이 띄워야 하나: ssh에서 nohup·setsid로 띄우면 세션이 끊길 때 일꾼이
# 함께 죽는다. claude를 자식으로 띄우기 때문이다. init이 부모면 그 일이 없다.
#
# 설치:
#   sudo cp ~/services/icon-studio/S99icon-studio.sh /usr/local/etc/rc.d/
#   sudo chmod +x /usr/local/etc/rc.d/S99icon-studio.sh
#   sudo /usr/local/etc/rc.d/S99icon-studio.sh start

USER_NAME="emrdl7"
USER_HOME="/var/services/homes/$USER_NAME"
SVC="$USER_HOME/services/icon-studio"

run_as_user() {
  su -s /bin/sh "$USER_NAME" -c "$1"
}

case "$1" in
  start)
    run_as_user "$SVC/start.sh"
    ;;
  stop)
    run_as_user "$SVC/stop.sh"
    ;;
  restart)
    run_as_user "$SVC/stop.sh"
    sleep 2
    run_as_user "$SVC/start.sh"
    ;;
  status)
    run_as_user "ps -eo pid,args | grep -E '[s]tudio/(server|worker)\.mjs' || echo '안 돌고 있습니다'"
    ;;
  *)
    echo "사용법: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
