#!/bin/sh
# 스튜디오 서버에 저장소 쓰기 권한을 준다 — 배포 키(SSH) 방식.
#
#   ssh -t footer-nas 'cd ~/icon-studio && sh scripts/setup-nas-push.sh'
#
# 왜 필요한가: 스튜디오는 git 체크아웃 안에 파일을 쓴다(assets/icons/svg·contracts).
# push 권한이 없으면 만든 아이콘이 저장소로 갈 길이 없고, 다음 배포의
# `git reset --hard`에 사라진다.
#
# **왜 토큰(PAT)이 아니라 배포 키인가** (2026-08-24에 토큰으로 시도했다가 옮겼다):
#
#   ① 만료가 없다. fine-grained PAT은 iux-pub 조직이 366일을 넘기지 못하게 막고,
#      넘기면 「Permission denied」만 뜨고 이유는 안 알려 준다. 짧게 잡아도
#      만료될 때마다 사람이 다시 발급해야 한다.
#   ② 비밀이 사람 손을 안 거친다. 개인키는 이 서버에서 만들어져 여기만 있고,
#      바깥으로 나가는 것은 **공개키**뿐이다 — 채팅·화면에 찍혀도 무해하다.
#      (2026-08-23에 토큰이 채팅창에 노출돼 재발급한 일이 있다.)
#   ③ 범위가 좁다. 저장소 하나에만 붙는다. 계정 전체가 아니다.
#
# 거둘 때는 GitHub의 저장소 → Settings → Deploy keys에서 지운다.

set -u

REPO_SSH="git@github.com:iux-pub/guide.git"
KEY="$HOME/.ssh/icon-studio-deploy"

die() { echo "✗ $*" >&2; exit 1; }
ok()  { echo "✓ $*"; }

for c in /usr/local/bin/git /opt/homebrew/bin/git /usr/bin/git; do
  [ -x "$c" ] && GIT="$c" && break
done
[ -n "${GIT:-}" ] || GIT="$(command -v git)" || die "git을 찾지 못했습니다"

[ -d .git ] || die "저장소 안에서 실행하세요 (cd ~/icon-studio)"

# ── 1. 키 ──────────────────────────────────────────────
# 암호를 걸지 않는다. 사람이 없는 서버가 자동으로 쓰는 키라, 암호를 걸면
# 어차피 그 암호를 어딘가 평문으로 두게 된다. 대신 파일 권한과 범위로 지킨다.
if [ -f "$KEY" ]; then
  ok "키가 이미 있습니다: $KEY"
else
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  ssh-keygen -t ed25519 -N '' -C "infoux-icon-studio@$(hostname)" -f "$KEY" > /dev/null \
    || die "키를 만들지 못했습니다"
  chmod 600 "$KEY"
  ok "키를 만들었습니다: $KEY (개인키는 이 서버 밖으로 나가지 않습니다)"
fi

# 커밋에 남을 이름. 사람 계정과 구분되게 서버임을 밝힌다.
"$GIT" config user.name "infoUX Icon Studio"
"$GIT" config user.email "infomindemail8@gmail.com"
ok "커밋 작성자: infoUX Icon Studio"

# ── 2. 공개키 ──────────────────────────────────────────
#
# 원격을 SSH로 바꾸는 것은 **인증이 되는 것을 확인한 뒤**다(아래 4단계).
# 먼저 바꿔 두면 키를 등록하기 전까지 fetch조차 안 돼 배포가 통째로 멈춘다.
echo
echo "── 아래 공개키를 GitHub에 등록하세요 (비밀이 아닙니다) ──"
echo
cat "$KEY.pub" | sed 's/^/    /'
echo
cat <<'GUIDE'
    https://github.com/iux-pub/guide/settings/keys/new

    Title             →  infoUX Icon Studio (NAS)
    Allow write access →  체크  ← 이걸 빼면 읽기만 됩니다

GUIDE

# ── 3. 확인 ────────────────────────────────────────────
printf '등록을 마쳤으면 Enter를 누르세요 (건너뛰려면 Ctrl+C): '
read -r _ || true
echo
echo "── 권한 확인 (아무것도 올리지 않습니다) ──"

AUTH=$(ssh -i "$KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new \
        -o ConnectTimeout=10 -T git@github.com 2>&1)
case "$AUTH" in
  *"successfully authenticated"*)
    printf '    %s\n' "$AUTH" | head -1
    ;;
  *)
    printf '    %s\n' "$AUTH" | head -2
    echo
    echo "    → 「Deploy keys are disabled」로 등록이 안 됐다면 조직 설정에서 켭니다:"
    echo "      https://github.com/organizations/iux-pub/settings/member_privileges"
    echo "      아래쪽 Deploy keys → Enabled"
    die "GitHub가 이 키를 모릅니다"
    ;;
esac

# ── 4. 원격 전환 ───────────────────────────────────────
# 인증이 되는 것을 본 뒤에 바꾼다.
"$GIT" config core.sshCommand "ssh -i $KEY -o IdentitiesOnly=yes"
"$GIT" remote set-url origin "$REPO_SSH"
ok "origin $REPO_SSH · 이 저장소만 이 키를 씁니다"

"$GIT" fetch -q origin || die "저장소를 읽지 못했습니다"
if "$GIT" push --dry-run origin HEAD:refs/heads/main 2>&1 | sed 's/^/    /'; then
  ok "push 권한 확인"
else
  die "읽기는 되는데 쓰기가 안 됩니다 — 배포 키의 「Allow write access」를 켜세요"
fi

cat <<'DONE'

✓ 준비 끝 — 만료 없음

  이제 스튜디오에서 만든 아이콘을 그 자리에서 저장소로 올릴 수 있습니다.
  찾기 화면 위쪽의 「저장소에 올리기」를 누르세요.

  거둘 때: GitHub → 저장소 Settings → Deploy keys에서 지웁니다.
DONE
