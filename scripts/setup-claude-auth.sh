#!/bin/bash
# 아이콘 스튜디오 워커용 Claude 장기 토큰 발급·저장
#
# 왜 장기 토큰인가:
#   OAuth 세션은 만료되면 자동 갱신이 안 되는 경우가 있고(2026-08-23 맥미니 실측:
#   accessToken expiresAt=0, refreshToken 없음), 그러면 headless 워커가 조용히 멈춘다.
#   setup-token으로 받은 장기 토큰은 키체인 접근·세션 만료와 무관하게 환경변수로 주입된다.
#
# 실행 위치: 맥미니에서 직접 (또는 화면 공유로 GUI 세션에서)
#   브라우저 인증이 필요하므로 SSH 비대화 셸에서는 완주하지 못할 수 있다.
#
# ⚠ 발급된 토큰은 비밀번호와 같다.
#   채팅·메신저·이슈·문서에 붙여넣지 말 것. 실수로 노출했으면 즉시
#   `claude auth logout` 후 재발급한다. 이 스크립트는 토큰을 화면에
#   전부 표시하지 않고 길이와 끝 4자리만 확인용으로 보여준다.
#
# 사용법:
#   bash setup-claude-auth.sh          # 발급 + 저장 + 검증
#   bash setup-claude-auth.sh --check  # 검증만

set -u

CLAUDE_BIN="${CLAUDE_BIN:-$HOME/.local/bin/claude}"
CONF_DIR="$HOME/.config/icon-studio"
ENV_FILE="$CONF_DIR/auth.env"

die() { echo "✗ $*" >&2; exit 1; }
ok()  { echo "✓ $*"; }

[ -x "$CLAUDE_BIN" ] || die "claude 실행 파일 없음: $CLAUDE_BIN (CLAUDE_BIN 환경변수로 지정 가능)"

# ── 검증 ────────────────────────────────────────────────
check_auth() {
  echo "── 인증 상태 ──"
  local out
  out="$("$CLAUDE_BIN" auth status --json 2>&1)"
  echo "$out"
  echo
  # 토큰 파일이 있으면 그걸로도 확인
  if [ -f "$ENV_FILE" ]; then
    ok "토큰 파일 있음: $ENV_FILE ($(stat -f '%Sp' "$ENV_FILE"))"
    echo "── 토큰으로 실제 호출 ──"
    if ( set -a; . "$ENV_FILE"; set +a; \
         "$CLAUDE_BIN" --print "OK만 출력하세요." 2>&1 | head -3 ); then
      :
    fi
  else
    echo "토큰 파일 없음: $ENV_FILE"
  fi
}

if [ "${1:-}" = "--check" ]; then
  check_auth
  exit 0
fi

# ── 1. 로그인 상태 확인 ──────────────────────────────────
echo "[1/4] 현재 인증 상태 확인"
"$CLAUDE_BIN" auth status --text 2>&1 | sed 's/^/    /'
echo

# ── 2. 필요하면 로그인 ───────────────────────────────────
echo "[2/4] 구독 계정 로그인"
echo "    브라우저가 열립니다. 로그인 후 이 창으로 돌아오세요."
echo "    (이미 로그인돼 있으면 건너뛰어도 됩니다 — Ctrl+C 후 --check 로 확인)"
read -r -p "    로그인을 진행할까요? [y/N] " ans
if [ "$ans" = "y" ] || [ "$ans" = "Y" ]; then
  "$CLAUDE_BIN" auth login --claudeai || die "로그인 실패"
  ok "로그인 완료"
else
  echo "    건너뜀"
fi
echo

# ── 3. 장기 토큰 발급 ────────────────────────────────────
echo "[3/4] 장기 토큰 발급 (claude setup-token)"
echo "    발급된 토큰은 화면에 그대로 표시될 수 있습니다. 어깨너머 주의."
read -r -p "    계속할까요? [y/N] " ans2
[ "$ans2" = "y" ] || [ "$ans2" = "Y" ] || die "취소됨"

mkdir -p "$CONF_DIR" && chmod 700 "$CONF_DIR"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# setup-token은 대화형이므로 사용자가 직접 완주해야 한다.
# 출력에서 토큰을 뽑아 파일에 쓴다.
"$CLAUDE_BIN" setup-token 2>&1 | tee "$TMP"

# 토큰 형식은 배포마다 다르다(sk-ant- 접두어가 없을 수도, '#'가 섞일 수도 있다).
# 따라서 접두어를 전제하지 않고 "길고 공백 없는 한 덩어리"를 마지막 줄부터 찾는다.
extract_token() {
  grep -oE '[A-Za-z0-9_#/+.=-]{40,}' "$1" \
    | grep -vE '^https?:|^-+$' \
    | tail -1
}
TOKEN="$(extract_token "$TMP")"

if [ -n "$TOKEN" ]; then
  ok "출력에서 토큰을 찾았습니다 (${#TOKEN}자)"
else
  echo
  echo "    자동 추출 실패. 토큰을 넣는 방법 두 가지 중 편한 쪽을 쓰세요."
  echo
  echo "    [1] 토큰을 복사(⌘C)한 뒤 그냥 Enter  ← 클립보드에서 읽습니다"
  echo "    [2] 직접 붙여넣기(⌘V) 후 Enter"
  echo
  echo "    ※ 붙여넣어도 글자가 보입니다. 어깨너머와 화면 공유 주의."
  read -r -p "    토큰(비우면 클립보드 사용): " TOKEN

  if [ -z "$TOKEN" ] && command -v pbpaste >/dev/null 2>&1; then
    TOKEN="$(pbpaste | tr -d '[:space:]')"
    [ -n "$TOKEN" ] && ok "클립보드에서 읽었습니다 (${#TOKEN}자)"
  fi
  # 붙여넣은 값이 화면에 남지 않도록 지운다
  printf '\033[1A\033[2K'
fi

TOKEN="$(printf '%s' "$TOKEN" | tr -d '[:space:]')"
[ -n "$TOKEN" ] || die "토큰이 비어 있습니다"
[ "${#TOKEN}" -ge 20 ] || die "토큰이 너무 짧습니다 (${#TOKEN}자) — 일부만 붙여넣어졌을 수 있습니다"
echo "    확인: ${#TOKEN}자, 끝 4자리 …${TOKEN: -4}"

umask 077
printf 'CLAUDE_CODE_OAUTH_TOKEN=%s\n' "$TOKEN" > "$ENV_FILE"
chmod 600 "$ENV_FILE"
unset TOKEN
ok "저장 완료: $ENV_FILE (권한 600)"
echo

# ── 4. 실제 호출로 검증 ──────────────────────────────────
echo "[4/4] 발급된 토큰으로 실제 호출 검증"
RESULT="$( set -a; . "$ENV_FILE"; set +a; \
           "$CLAUDE_BIN" --print "OK만 출력하세요." 2>&1 | head -3 )"
echo "    응답: $RESULT"

case "$RESULT" in
  *"Not logged in"*|*"authenticate"*|*"expired"*)
    die "검증 실패 — 토큰이 유효하지 않습니다" ;;
  "")
    die "검증 실패 — 응답이 비었습니다" ;;
  *)
    ok "검증 통과. 워커에서 사용할 수 있습니다." ;;
esac

cat <<EOF

────────────────────────────────────────────────
워커(launchd)에서 쓰는 법 — plist가 아니라 래퍼에서 읽는다.
plist에 토큰을 직접 넣으면 파일 권한이 644라 노출된다.

  #!/bin/sh
  set -a; . "$ENV_FILE"; set +a
  exec "$CLAUDE_BIN" --print "\$(cat "\$1")"

상태 재확인:  bash $(basename "$0") --check
토큰 폐기:    rm -f $ENV_FILE && $CLAUDE_BIN auth logout
────────────────────────────────────────────────
EOF
