#!/bin/sh
# 아이콘 스튜디오 — Synology 부팅 스크립트
#
# 놓을 자리: /usr/local/etc/rc.d/S99icon-studio.sh (설치할 때만 root 권한)
#
# **이 파일은 부팅 자동 시작 전용이다.** 평소 껐다 켜는 데는 필요 없다 —
# start.sh/stop.sh를 사용자 권한으로 직접 부르면 되고, 그게 ssh에서도 살아남는다
# (start.sh의 `nohup setsid`. 2026-08-23 실측으로 확인).
#
# 한동안 「ssh에서 띄우면 일꾼이 함께 죽으니 init이 부모여야 한다」고 적어 두었는데
# 틀린 말이었고, 그 탓에 배포마다 sudo 비밀번호를 손으로 넣게 만들었다.
# 재기동은 이제 사람 손이 필요 없다:
#
#   ssh footer-nas '~/services/icon-studio/stop.sh && ~/services/icon-studio/start.sh'
#
# 설치(한 번만, NAS를 재부팅해도 자동으로 뜨게 하려면):
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
