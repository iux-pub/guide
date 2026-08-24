#!/bin/sh
# 스튜디오 서버에 저장소 쓰기 권한을 준다.
#
#   ssh -t footer-nas 'cd ~/icon-studio && sh scripts/setup-nas-push.sh'
#
# 왜 필요한가: 스튜디오는 git 체크아웃 안에 파일을 쓴다(assets/icons/svg·contracts).
# push 권한이 없으면 만든 아이콘이 저장소로 갈 길이 없고, 다음 배포의
# `git reset --hard`에 사라진다. 권한이 있으면 만든 자리에서 바로 올릴 수 있다.
#
# **토큰은 이 창에 찍지 않는다.** 무음으로 받아 파일에만 쓰고, 확인은 끝 4자리로만 한다.
# (2026-08-23에 토큰이 채팅창에 노출돼 재발급한 일이 있다.)

set -u

REPO_URL="https://github.com/iux-pub/guide.git"
CRED="$HOME/.git-credentials"

die() { echo "✗ $*" >&2; exit 1; }
ok()  { echo "✓ $*"; }

# git 찾기 — Synology는 PATH에 없다
for c in /usr/local/bin/git /opt/homebrew/bin/git /usr/bin/git; do
  [ -x "$c" ] && GIT="$c" && break
done
[ -n "${GIT:-}" ] || GIT="$(command -v git)" || die "git을 찾지 못했습니다"

[ -d .git ] || die "저장소 안에서 실행하세요 (cd ~/icon-studio)"

cat <<'GUIDE'

── 토큰 만들기 ─────────────────────────────────────────

  https://github.com/settings/personal-access-tokens/new

  Repository access  →  Only select repositories  →  iux-pub/guide
  Permissions        →  Repository permissions  →  Contents: Read and write
  Expiration         →  **366일 이하** (그 이상이면 조직이 막습니다)

  Contents 하나면 됩니다. 다른 권한은 주지 마세요 — 이 서버는
  아이콘 파일을 커밋하는 일만 합니다.

  ※ 수명을 「No expiration」이나 1년 초과로 두면 토큰은 만들어지지만
     iux-pub 저장소에는 접근이 막힙니다. 90일을 권합니다.

GUIDE

printf '토큰을 붙여 넣으세요 (화면에 보이지 않습니다): '
stty -echo 2>/dev/null
read -r TOKEN
stty echo 2>/dev/null
echo

[ -n "$TOKEN" ] || die "입력이 비었습니다"
case "$TOKEN" in
  github_pat_*|ghp_*) : ;;
  *) die "GitHub 토큰 형식이 아닙니다 (github_pat_… 또는 ghp_…)" ;;
esac

LEN=$(printf '%s' "$TOKEN" | wc -c | tr -d ' ')
TAIL=$(printf '%s' "$TOKEN" | tail -c 4)
echo "받았습니다 — ${LEN}자, 끝 4자리 …${TAIL}"

# ── 저장 ───────────────────────────────────────────────
# 사용자 이름은 아무 값이나 되지만, 토큰 인증임을 알아보게 x-access-token을 쓴다.
umask 077
printf 'https://x-access-token:%s@github.com\n' "$TOKEN" > "$CRED"
chmod 600 "$CRED"
unset TOKEN
ok "저장: $CRED (권한 600)"

"$GIT" config credential.helper store
"$GIT" remote set-url origin "$REPO_URL"
ok "credential.helper store · origin $REPO_URL"

# 커밋에 남을 이름. 사람 계정과 구분되게 서버임을 밝힌다.
"$GIT" config user.name "infoUX Icon Studio"
"$GIT" config user.email "infomindemail8@gmail.com"
ok "커밋 작성자: infoUX Icon Studio"

# ── 확인 ───────────────────────────────────────────────
#
# git의 거절 문구는 이유를 안 알려 준다 — 「Permission to … denied to <계정>」이 전부라
# 권한이 모자란 건지, 저장소를 안 골랐는지, 조직 정책에 막힌 건지 알 수 없다.
# GitHub API는 이유를 그대로 준다(2026-08-24: 「조직이 366일 넘는 토큰을 금지한다」였다).
# 그래서 API로 먼저 묻고, 그 다음 실제로 밀어 본다.
echo
echo "── 권한 확인 (아무것도 올리지 않습니다) ──"

# 토큰은 파일에서 바로 읽어 쓴다. 변수에 담아 화면에 흘리지 않는다.
API=$(sed -E 's#https://[^:]+:([^@]+)@.*#\1#' "$CRED" \
  | { read -r t; curl -s -H "Authorization: Bearer $t" https://api.github.com/repos/iux-pub/guide; })

WHO=$(sed -E 's#https://[^:]+:([^@]+)@.*#\1#' "$CRED" \
  | { read -r t; curl -s -H "Authorization: Bearer $t" https://api.github.com/user; } \
  | sed -n 's/.*"login": *"\([^"]*\)".*/\1/p' | head -1)

[ -n "$WHO" ] && echo "    토큰 주인: $WHO"

case "$API" in
  *'"full_name"'*)
    echo "    저장소 접근: 가능"
    ;;
  *)
    MSG=$(printf '%s' "$API" | sed -n 's/.*"message": *"\([^"]*\)".*/\1/p' | head -1)
    echo
    echo "    GitHub가 알려 준 이유:"
    printf '      %s\n' "${MSG:-알 수 없음}"
    echo
    case "$MSG" in
      *'lifetime'*|*'366'*)
        echo "    → 토큰 수명이 너무 깁니다. 위 링크에서 366일 이하(90일 권장)로 줄이고"
        echo "      이 스크립트를 다시 실행하세요."
        ;;
      *'Not Found'*)
        echo "    → 토큰이 iux-pub/guide를 못 봅니다. Repository access에서"
        echo "      그 저장소를 골랐는지 확인하세요."
        ;;
    esac
    die "설정을 끝내지 못했습니다"
    ;;
esac

if "$GIT" push --dry-run origin HEAD:refs/heads/main 2>&1 | sed 's/^/    /'; then
  ok "push 권한 확인"
else
  die "저장소는 보이는데 쓰기가 안 됩니다 — 토큰의 Contents를 Read and write로 두었는지 확인하세요"
fi

cat <<'DONE'

✓ 준비 끝

  이제 스튜디오에서 만든 아이콘을 그 자리에서 저장소로 올릴 수 있습니다.
  찾기 화면 위쪽의 「저장소에 올리기」를 누르세요.

  토큰을 거둘 때:  rm ~/.git-credentials
DONE
