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
STUDIO_SVC="\$HOME/services/icon-studio"
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

# ── 6. 스튜디오 재기동 ───────────────────────────────────
# 저장소만 갱신하면 도는 것은 옛 코드다. 프로세스를 바꿔 끼워야 새 화면이 나온다.
#
# sudo가 필요하지 않다. start.sh의 `nohup setsid`가 프로세스를 새 세션으로 떼어 내므로
# ssh가 끊겨도 화면·일꾼·일꾼이 띄우는 claude가 함께 죽지 않는다(2026-08-23 실측).
# 한동안 rc.d를 root로 불러야 하는 줄 알고 배포마다 사람에게 비밀번호를 물었다.
say "스튜디오 재기동"
ssh "$HOST" "$STUDIO_SVC/stop.sh > /dev/null 2>&1 || true
  sleep 1
  $STUDIO_SVC/start.sh 2>&1 | tail -2"

sleep 3
say "스튜디오 확인"
studio_ok=$(curl -s --max-time 20 "https://footer.kr/guide/_icons/api/catalog" \
  | node -e "let d=\"\";process.stdin.on(\"data\",c=>d+=c).on(\"end\",()=>{
      try { const r = JSON.parse(d)
        const s = r.icons.find(i => i.name === \"star\") || {}
        console.log([
          \"아이콘 \" + r.icons.length + \"종\",
          \"표정 \" + ((r.variants || []).map(v => v.id).join(\"·\") || \"없음\"),
          \"검색어 \" + ((s.keywords || []).length ? \"있음\" : \"없음\")
        ].join(\" · \"))
      } catch { console.log(\"응답을 읽지 못했습니다\") }
    })" || echo "확인 실패")
printf '  %s\n' "$studio_ok"

ssh "$HOST" "ps -eo pid,ppid,args | grep -E '[s]tudio/(server|worker)\.mjs' | awk '{printf \"  pid %s (부모 %s) %s\\n\", \$1, \$2, \$NF}'"

cat <<'DONE'

✓ 배포 완료 — 문서 사이트와 스튜디오 모두

  부모가 1이면 세션에서 떨어져 나온 것이라 ssh를 끊어도 계속 돕니다.
DONE
