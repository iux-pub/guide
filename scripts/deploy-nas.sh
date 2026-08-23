#!/usr/bin/env bash
# NAS 배포 — 문서 사이트와 아이콘 스튜디오를 한 번에 올린다.
#
#   bash scripts/deploy-nas.sh
#
# 왜 스크립트인가: 손으로 하다 같은 사고를 두 번 냈다(2026-08-23).
# `/volume1/web/guide/index.html`은 `_site/`로 보내는 리다이렉트인데 **저장소에 없다**.
# 그래서 `git stash -u`도, 인덱스에 올린 뒤의 `git reset --hard`도 이 파일을 지운다.
# 지워지면 Web Station이 디렉터리 목록을 막아 **가이드 전체가 403**이 된다.
# 여기서는 매번 다시 써서 그 일이 일어나지 않게 한다.
#
# 왜 NAS에서 빌드하지 않나: NAS 빌드 실패가 곧 실서비스 중단이다.
# 검증 끝난 로컬 `_site`를 올려 `mv`로 바꿔 끼운다 — 교체 순간에만 끊긴다.

set -euo pipefail

HOST="${NAS_HOST:-footer-nas}"
WEB="/volume1/web/guide"
STUDIO="\$HOME/icon-studio"
# NAS의 git은 PATH에 없다. Synology 패키지 자리를 직접 가리킨다.
NAS_PATH="/usr/local/bin:/usr/bin:/bin"

say() { printf '\n\033[36m▸\033[0m %s\n' "$1"; }

# ── 0. 배포 전 상태 ──────────────────────────────────────
say "배포 전 확인"
for u in https://footer.kr/guide/ https://footer.kr/guide/_icons/; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$u" || echo 000)
  printf '  %-40s %s\n' "$u" "$code"
done

# ── 1. 로컬 검증 ────────────────────────────────────────
say "로컬 검사"
npm run check
node --test scripts/__tests__/icons.test.js scripts/__tests__/zip.test.js > /dev/null

say "사이트 빌드"
npm run build > /dev/null

# ── 2. NAS 저장소 갱신 ──────────────────────────────────
say "NAS 저장소 갱신"
ssh "$HOST" "export PATH=$NAS_PATH
  set -e
  for d in '$WEB' \"$STUDIO\"; do
    cd \"\$d\"
    git fetch -q origin
    git reset -q --hard origin/main
    printf '  %-28s %s\n' \"\$d\" \"\$(git log --oneline -1)\"
  done"

# ── 3. 리다이렉트 복구 ──────────────────────────────────
# 저장소에 없는 파일이라 2단계가 매번 지운다. 여기서 다시 쓴다.
say "루트 index.html 복구"
ssh "$HOST" "cat > '$WEB/index.html' << 'HTML'
<html lang=\"ko\">
<head>
  <meta charset=\"utf-8\">
  <meta http-equiv=\"refresh\" content=\"0; url=./_site/\">
  <title>Guide</title>
  <link rel=\"canonical\" href=\"./_site/\">
</head>
<body>
  <p><a href=\"./_site/\">infoUX 가이드로 이동</a></p>
</body>
</html>
HTML
  ls -la '$WEB/index.html'"

# ── 4. 사이트 교체 ──────────────────────────────────────
# 먼저 옆에 다 올리고 마지막에 이름만 바꾼다. 올리는 동안 옛 사이트가 계속 뜬다.
say "사이트 전송"
rsync -a --delete -e ssh _site/ "$HOST:$WEB/_site.new/"

say "무중단 교체"
ssh "$HOST" "set -e
  cd '$WEB'
  rm -rf _site.old
  [ -d _site ] && mv _site _site.old
  mv _site.new _site
  echo '  교체 완료'"

# ── 5. 확인 ────────────────────────────────────────────
say "배포 후 확인"
fail=0
for u in \
  https://footer.kr/guide/ \
  https://footer.kr/guide/_site/ \
  https://footer.kr/guide/_site/icons/ \
  https://footer.kr/guide/_site/components/icon/ \
  https://footer.kr/guide/_icons/
do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -L "$u" || echo 000)
  printf '  %-52s %s\n' "$u" "$code"
  [ "$code" = "200" ] || fail=1
done

if [ "$fail" -ne 0 ]; then
  printf '\n\033[31m✗ 200이 아닌 주소가 있습니다.\033[0m 되돌리려면 NAS에서:\n'
  printf '    cd %s && rm -rf _site && mv _site.old _site\n' "$WEB"
  exit 1
fi

cat <<'DONE'

✓ 문서 사이트 배포 완료

  스튜디오 프로세스는 남았습니다 — 저장소만 갱신됐고 도는 것은 옛 코드입니다.
  ssh 세션에서 띄우면 세션이 끊길 때 일꾼(claude)이 함께 죽으므로 init이 부모여야
  합니다. sudo 비밀번호가 필요하니 사람이 직접 실행합니다:

    ssh -t footer-nas 'sudo /usr/local/etc/rc.d/S99icon-studio.sh restart'
DONE
