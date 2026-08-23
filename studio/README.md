# 아이콘 스튜디오

없는 아이콘을 말로 요청해 만들고, 눈으로 골라 세트에 넣는 화면이다.
디자이너는 브라우저만 열면 되고 터미널·git·npm을 보지 않는다.

## 켜는 법

저장소를 받아 **한 번만** 준비하면 됩니다.

```bash
git clone https://github.com/iux-pub/guide.git
cd guide
npm install
```

Claude에 한 번 로그인합니다. 「만들기」에 필요하고, 각자 자기 구독으로 돕니다.

```bash
bash scripts/setup-claude-auth.sh
```

이제 켤 때는 이 한 줄입니다. 화면과 일꾼이 함께 뜨고 브라우저가 열립니다.

```bash
npm run studio
```

멈출 때는 `Ctrl+C`. 다른 포트를 쓰려면 `PORT=4800 npm run studio`.

> **찾기·내보내기는 로그인 없이도 됩니다.** 로그인은 「만들기」에서만 씁니다.

### 서버에서 죽지 않게 띄우기

ssh로 `nohup`이나 `setsid`를 써서 띄우면 **세션이 끊길 때 함께 죽는다.** 일꾼은 claude를
자식으로 띄우기 때문에 특히 그렇다(2026-08-23 실측: 서버는 버티는데 일꾼은 매번 죽었다).

부팅 스크립트로 등록해 init이 띄우게 한다. Synology 기준:

```bash
# 1) 시작·정지 스크립트는 홈에 둔다 (이미 저장소에 있다)
cp -r studio/../services/icon-studio ~/services/   # start.sh · stop.sh

# 2) rc.d에 등록 — root 권한이 필요하다
sudo tee /usr/local/etc/rc.d/S99icon-studio.sh > /dev/null <<'RC'
#!/bin/sh
case "$1" in
  start)   su -s /bin/sh <계정> -c "$HOME/services/icon-studio/start.sh" ;;
  stop)    su -s /bin/sh <계정> -c "$HOME/services/icon-studio/stop.sh" ;;
  restart) su -s /bin/sh <계정> -c "$HOME/services/icon-studio/stop.sh; $HOME/services/icon-studio/start.sh" ;;
esac
RC
sudo chmod +x /usr/local/etc/rc.d/S99icon-studio.sh
sudo /usr/local/etc/rc.d/S99icon-studio.sh start
```

맥에서는 launchd를 쓴다 — `bash studio/install-service.sh` 한 줄이면 된다.

### 팀이 함께 쓰는 서버에 올릴 때

가이드 문서 사이트와 **같은 주소 체계**로 붙인다 — `https://footer.kr/guide/_icons/`.
스튜디오만 포트를 따로 쓰면 팀원이 두 가지를 외워야 한다.

```bash
# 1) 스튜디오를 127.0.0.1:4710으로 띄운다
PORT=4710 npm run studio:server

# 2) nginx가 /guide/_icons/ 를 그리로 넘긴다
sudo cp studio/nginx-icon-studio.conf /etc/nginx/conf.d/www.icon-studio.conf
sudo nginx -t && sudo synosystemctl restart nginx
```

설정 파일에 놓을 자리와 이유가 적혀 있다. Synology에서는 `conf.d/www.*.conf`가
443 블록에 include된다 — `alias.*.conf`는 DSM 관리 페이지(5000) 쪽이라 쓰면 안 된다.

### 상시로 켜 두고 싶다면

자기 맥에서 늘 떠 있게 하려면 launchd에 등록합니다. 터미널을 켜 둘 필요가 없어집니다.

```bash
bash studio/install-service.sh          # 등록
bash studio/install-service.sh --status # 상태
bash studio/install-service.sh --stop   # 해제
```

**GUI 세션으로 띄우는 것이 중요합니다.** Claude 자격이 macOS 로그인 키체인에 있어
ssh로 띄운 일꾼은 인증에서 막힙니다.

## 화면 셋

### 찾기

검색과 분류로 추리고, 아이콘을 누르면 24·20·16px 미리보기와 붙여 넣을 코드가 나온다.
초록 점이 붙은 것이 우리가 만든 아이콘이고 나머지는 구글에서 가져온 것이다.

### 만들기

한 문장으로 적고 「4개 만들기」를 누른다. 요청은 큐에 쌓이고 일꾼이 순서대로 처리하므로
**창을 닫고 다른 일을 해도 된다.** 보통 1~2분 걸린다.

후보는 24·20·16px로 나란히 나온다. 작은 크기를 함께 보는 이유는 실제 화면에서
대부분 20px 이하로 쓰이기 때문이다 — 24px에서만 보면 뭉개짐을 놓친다.

각 후보 아래 판정이 붙는다.

| 표시 | 뜻 |
|---|---|
| 초록 | 다른 아이콘들과 굵기·여백이 맞는다 |
| 주황 | 쓸 수는 있지만 조금 튄다. 눈으로 확인한다 |
| 빨강 | 규격에 안 맞는다. 고를 수 없다 |

이름을 정하고 「이걸로 정하기」를 누르면 세트에 들어간다. **자동으로 들어가는 것은 없다.**

#### 정해진 모양은 참조를 붙인다

회사 심볼, 발주처 CI처럼 **모양이 이미 정해진 것**은 말로만 요청하면 안 된다.
모델은 그 심볼을 모르므로 그럴듯한 다른 것을 그린다.

「참조할 그림 붙이기」를 펼쳐 파일을 고른다. **SVG·PNG·JPG·WebP 아무거나 된다** —
로고를 PNG로만 갖고 있어도 그대로 넣으면 된다. SVG 코드를 직접 붙여 넣어도 되고,
붙자마자 48·24·16px 미리보기가 떠서 제대로 들어갔는지 눈으로 확인할 수 있다.

그림 파일은 크기 4MB, SVG는 200KB까지 받는다.

참조가 있으면 모델은 **거기 없는 요소를 지어내지 않고**, 알아볼 수 있는 특징을 남기면서
우리 규격(획 굵기·라이브 영역)에 맞게 단순화한다. 그림의 색·그러데이션·질감은 옮기지
않는다 — 아이콘은 단색 아웃라인이라 형태의 뼈대만 가져온다.

### 내보내기

프로젝트가 실제로 쓰는 아이콘만 골라 스프라이트를 내려받는다.
그 파일을 프로젝트의 `assets/icons/`에 넣으면 끝이다. 외부에서 불러오는 것이 없어
폐쇄망에서도 뜬다.

## 후보를 볼 때

**작은 크기만 보고 판단하지 않는다.** 화면은 48 · 24 · 20 · 16px을 함께 보여 준다.
16px에서는 테두리와 내부 요소가 뭉쳐 「꽉 찬 덩어리」처럼 보이는데, 48px로 보면
멀쩡한 아웃라인인 경우가 많다. 실제로 그렇게 잘못 읽어 정상 아이콘을 여러 번
불량으로 판정한 적이 있다.

- **48px** — 형태가 그 뜻으로 읽히는가
- **16px** — 뭉개져서 못 알아보지 않는가

두 크기가 다 통과해야 쓸 만한 아이콘이다.

판정 색이 뜻하는 것:

| 표시 | 뜻 |
|---|---|
| 초록 | 씨앗과 굵기·여백이 맞는다 |
| 주황 | 쓸 수는 있지만 조금 튄다. 눈으로 확인한다 |
| 빨강 | 규격 위반이라 고를 수 없다 (선을 면으로 안 바꿈·색 박힘·덩어리) |

**자동 통과는 없다.** 규격을 지켜도 「이 그림이 그 뜻인가」는 사람이 정한다.

## 이름 짓기

`kebab-case`, 의미로만 짓는다. `arrow-blue`처럼 색·크기를 넣지 않는다 (R-06·R-18).
디자인이 바뀌면 이름까지 바꿔야 하기 때문이다.

## 인증

일꾼은 Claude를 부른다. 회사 자산이므로 **개인 LLM(agy·codex)을 쓰지 않고**
실패해도 다른 모델로 넘어가지 않는다 (Decision Log 2026-08-23).
그린 모델이 바뀌면 그림체가 바뀌는데 로그만 봐서는 알 수 없다.

세션 자격은 만료되면 자동 갱신이 안 되는 상태로 빠져 일꾼이 조용히 멈춘다.
**장기 토큰**을 발급해 두면 그 문제가 없다.

```bash
bash scripts/setup-claude-auth.sh    # 발급·저장·검증
bash scripts/check-claude-auth.sh    # 상태 확인
```

토큰은 `~/.config/icon-studio/auth.env`(권한 600)에 저장되고 일꾼이 읽는다.

> 인증 상태를 SSH에서 판단하지 않는다. 키체인에 닿지 못해 「로그인 안 됨」으로
> 잘못 나온다. `check-claude-auth.sh`가 launchd 경유로 정확히 판정한다.

## 만든 것이 어디로 가나

```
승인 → assets/icons/svg/<이름>.svg      원본
     → contracts/icon-codepoints.json   대장 (번호·출처·해시·그린 모델)
     → npm run icons:build              스프라이트·폰트·CSS 재생성
     → npm run sync:starter             starter로 전달
```

대장의 번호는 **한 번 주면 영구히 고정한다.** 아이콘을 폐기해도 회수하지 않는다 —
번호가 밀리면 이미 납품한 사이트의 아이콘이 전부 다른 그림으로 바뀐다.

## 큐

`studio/queue/`는 git에 올리지 않는다. 요청·결과는 그 기기의 작업 기록일 뿐이다.

| 폴더 | 내용 |
|---|---|
| `requests/` | 디자이너가 넣은 요청 |
| `results/` | 일꾼이 만든 후보 (`working` → `ready`/`failed`) |
| `archive/` | 승인·폐기로 끝난 것 |
