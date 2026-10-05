# 아이콘 스튜디오

아이콘을 한국어로 찾아 세트에 넣고, 카탈로그에 없는 것만 말로 요청해 만드는 화면이다.
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

`start.sh`가 `nohup setsid`로 프로세스를 **새 세션으로 떼어 낸다.** 세션이 끊길 때 오는
SIGHUP은 옛 세션에만 가므로 화면도 일꾼도, 일꾼이 띄우는 claude도 함께 죽지 않는다.
그래서 ssh에서 그냥 불러도 된다 — 권한도 필요 없다.

```bash
ssh <서버> '~/services/icon-studio/stop.sh && ~/services/icon-studio/start.sh'
```

살아남았는지는 **부모(PPID)로 확인한다.** 1이면 세션에서 떨어져 나온 것이다.

```bash
ssh <서버> 'ps -eo pid,ppid,args | grep "[s]tudio/"'
# 32057  1  node studio/server.mjs
# 32077  1  node studio/worker.mjs
```

> **한동안 이 문서는 「ssh로 띄우면 세션이 끊길 때 함께 죽으니 init이 부모여야 한다」고
> 적고 있었다. 틀린 진단이었고, 그 탓에 배포할 때마다 sudo 비밀번호를 사람이 손으로
> 넣어야 했다.** 2026-08-23 실측으로 뒤집었다 — `setsid`로 띄운 프로세스는 ssh를 끊고
> 10초 뒤에도 PPID 1로 멀쩡했다. 프로세스 자체는 계정 권한으로 돌고, root가 필요한 것은
> rc.d 디렉터리에 파일을 쓰는 일뿐이다.

#### 부팅할 때 자동으로 뜨게 (설치 한 번만)

NAS를 재부팅해도 알아서 뜨게 하려면 rc.d에 등록한다. **이때만 root가 필요하고,
평소 껐다 켜는 데는 필요 없다.**

```bash
# 1) 시작·정지 스크립트는 홈에 둔다 (이미 저장소에 있다)
cp -r studio/service ~/services/icon-studio   # start.sh · stop.sh · S99icon-studio.sh

# 2) rc.d에 등록 — 여기서만 root
sudo cp ~/services/icon-studio/S99icon-studio.sh /usr/local/etc/rc.d/
sudo chmod +x /usr/local/etc/rc.d/S99icon-studio.sh
sudo /usr/local/etc/rc.d/S99icon-studio.sh start
```

맥에서는 launchd를 쓴다 — `bash studio/install-service.sh` 한 줄이면 된다.

### 표정 만들기

자체 제작 아이콘은 승인해도 기본 표정 하나뿐이다. 씨앗과 같은 자격을 주려면 나머지를 만든다.

```bash
curl -X POST -H 'content-type: application/json' \
  -d '{"name":"e-ticket","variants":["slim","bold","fill"]}' \
  http://127.0.0.1:4710/api/variants
```

기하로 선을 굵히는(폴리곤 오프셋) 길은 곡선·모서리에서 쉽게 깨진다. **원본 path를 보여 주고
다시 그리게** 한 뒤 실측으로 판정한다.

판정은 씨앗 실측에서 나온다(`icon-metrics-baseline.json`의 `variants`). 세 지표를 함께 본다.

| 지표 | 보는 것 | 범위 |
|---|---|---|
| 면적비 | 그 표정답게 굵기가 바뀌었나 — **주 지표** | slim 0.53~0.77 · bold 1.14~1.64 · fill 1.10~3.16 |
| 획 굵기 | 곁들여 본다 (형태에 따라 흔들린다) | 경고로만 |
| 테두리 어긋남 | **같은 아이콘인가** | slim·bold 최대 1.3 · fill 최대 0.8 |

**방향은 분포와 무관한 불변으로 따로 본다** — 슬림이 기본보다 굵으면 분포를 볼 것도 없다.

범위를 min~max로 잡으면 뜻이 사라진다. 2026-08-23 실측: slim이 0.36~1.05가 되어
「면적 0.95배(거의 그대로)」가 통과했고 bold는 0.94까지 열려 **기본보다 얇은 볼드**도
지나갈 판이었다. 씨앗의 p10~p90은 좁고(slim 0.62~0.67) 그 좁음이 이 표정의 뜻이다.

프롬프트에는 **어느 선을 어느 쪽으로 옮기는지**를 적는다. 「가늘게 그려라」만으로는 안 통했다 —
아웃라인 아이콘은 바깥 선과 안쪽 선 두 겹이고 굵기는 그 사이 간격인데, 그 구조를 짚어 주지
않으면 모델은 무엇을 움직여야 할지 모른다. 짚어 준 뒤 bookmark의 slim이 재시도 없이
면적비 0.64·획 0.84로 나왔다 — 구글판(0.64·0.85)과 사실상 같다.

시간 제한은 만들기와 표정 모두 900초다(`TIMEOUT_MS`·`VARIANT_TIMEOUT_MS`). 실제로는 훨씬 짧게 끝난다 — 소넷 5.5·medium에서
표정 하나가 볼드·필 5~6초, 슬림 13~16초(재시도 포함)였다(2026-10-05, 아이콘 2종 × 3표정). 제한은 서버가 붐빌 때의 여유다.

### 만든 아이콘이 저장소로 가는 길

**스튜디오는 git 체크아웃 안에 파일을 쓴다** — `assets/icons/svg/`와 `contracts/`의
대장·검색어. 전부 추적 대상이라 배포의 `git reset --hard`가 덮어쓴다. 서버 클론에는
push 권한이 없으므로 **만든 것은 저장소로 갈 길이 없다.** 세 겹으로 막았다.

| 겹 | 하는 일 |
|---|---|
| 배포 | reset 전에 미저장 변경을 보고, 있으면 목록·절차를 찍고 **실패로 끝낸다** |
| 화면 | 찾기 맨 위에 「아직 저장소에 없습니다 — 다음 배포 때 사라집니다」 |
| 패치 | `GET /api/pending.patch` — 자기 clone에 `git apply`로 옮긴다 |

```bash
curl -sO https://footer.kr/guide/_icons/api/pending.patch
git apply pending.patch && npm run icons:build && npm run check
git add -A && git commit && git push
```

패치는 `git add -N` 뒤 `--binary`로 뽑는다 — 안 그러면 추적 안 되는 새 SVG가 통째로
빠진다. **뽑자마자 `git reset`으로 인덱스를 되돌린다**: 흔적이 남으면 파일을 지운 뒤에도
`git status`가 유령 삭제(D)를 보고해 배포가 헛되이 멈춘다(2026-08-24 실측).

### 서버가 직접 올리게 하려면

권한을 주면 만든 자리에서 바로 올릴 수 있다 — 찾기 화면의 「저장소에 올리기」 한 번이면
SVG·표정 파일과 대장 번호·검색어가 함께 간다.

```bash
ssh -t footer-nas 'cd ~/icon-studio && sh scripts/setup-nas-push.sh'
```

**토큰은 화면에 찍히지 않는다.** 무음으로 받아 `~/.git-credentials`(권한 600)에만 쓰고,
확인은 끝 4자리로만 한다. 토큰은 `iux-pub/guide` 하나에 **Contents: Read and write**
하나면 된다 — 이 서버가 하는 일은 아이콘 파일을 커밋하는 것뿐이다.

권한이 실제로 있는지는 **dry-run을 밀어 확인한다.** 자격 파일이 있어도 토큰이 만료됐거나
권한이 모자랄 수 있다. 없으면 화면은 예전처럼 패치를 내준다.

올리는 순서는 fetch → commit → **rebase** → push다. merge면 서버가 만든 병합 커밋이
이력에 남는다. 부딪히면 rebase를 되돌리고 「사람이 정리해야 합니다」로 끝낸다 —
서버가 남의 변경을 짐작해 풀지 않는다.

토큰을 거둘 때는 `rm ~/.git-credentials`.

### 일꾼이 멈췄는지 보기

일꾼은 큐를 볼 때마다 `studio/queue/worker-heartbeat.json`에 시각을 남긴다.
서버는 그 시각만 보고 판정해 `/api/requests` 응답에 `worker`로 싣고, 화면은
만들기 탭 맨 위에 경고를 띄우며 「4개 만들기」를 막는다.

```bash
curl -s http://127.0.0.1:4710/api/requests | grep -o '"worker":{[^}]*}'
# {"alive":true,"lastBeat":"…","ageSec":1,"state":"도는 중"}
```

폴링 주기의 6배(기본 24초)를 넘으면 멈춘 것으로 본다. **왜 이 신호가 필요한가**:
claude 세션 자격이 만료되면 일꾼은 오류 없이 조용히 멈추고, 요청은 「기다리는 중」으로
영원히 남는다. 화면이 말해 주지 않으면 쓰는 사람은 자기가 뭘 잘못 적었나 싶어
계속 기다린다.

되살리는 법은 위의 「서버에서 죽지 않게 띄우기」와 같다.

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

찾는 범위가 둘이다 — **세트**(우리가 채택한 것, 바로 쓴다)와 **카탈로그**(구글 Material Symbols 전량,
찾고 미리 볼 뿐 번호가 없다). 카탈로그에서 아이콘을 누르면 네 표정 미리보기와 함께 채택 시트가 열린다.
자세한 구조는 아래 「카탈로그와 채택」.

세트에서는 검색과 분류로 추리고, 아이콘을 누르면 24·20·16px 미리보기와 붙여 넣을 코드가 나온다.
초록 점이 붙은 것이 우리가 만든 아이콘이고 나머지는 구글에서 가져온 것이다.

### 만들기

요청문을 적는 동안 **카탈로그에서 비슷한 것을 먼저 보여 준다**(`renderSuggest` — 단어마다 따로 찾고, 적게 걸리는
말 = 구체적인 말을 앞에 세운다). 만드는 데는 몇 분이 걸리고 결과는 구글 아이콘만 못한 경우가 많다.

한 문장으로 적고 「4개 만들기」를 누른다. 요청은 큐에 쌓이고 일꾼이 순서대로 처리하므로
**창을 닫고 다른 일을 해도 된다.** 보통 1분 안팎 걸린다 — 후보 4개 기준으로 단순한 모양은 30초 안팎, 복잡하면 1분 반까지
(2026-10-05 실서버: 귤 2개 15초, 한라산 4개 79초).

후보는 24·20·16px로 나란히 나온다. 작은 크기를 함께 보는 이유는 실제 화면에서
대부분 20px 이하로 쓰이기 때문이다 — 24px에서만 보면 뭉개짐을 놓친다.

각 후보 아래 판정이 붙는다.

| 표시 | 뜻 |
|---|---|
| 초록 | 다른 아이콘들과 굵기·여백이 맞는다 |
| 주황 | 쓸 수는 있지만 조금 튄다. 눈으로 확인한다 |
| 빨강 | 규격에 안 맞는다. 고를 수 없다 |

이름을 정하고 「이걸로 정하기」를 누르면 세트에 들어간다. **자동으로 들어가는 것은 없다.**

#### 정해진 모양은 만들지 않는다

회사 심볼, 발주처 CI처럼 **모양이 이미 정해진 것**은 만들기로 할 수 없다. 모델은 그 심볼을 모르므로
그럴듯한 다른 것을 그리고, 그림을 참조로 주어도 좌표를 손으로 옮기는 방식으로는 원본이 나오지 않았다.

참조 그림으로 옮겨 그리는 기능은 **2026-10-05에 걷어냈다.** 참조를 붙인 요청 8건(2026-08-24 기록) 가운데
5건이 실패하고 2건은 끝나지 않았으며, 후보를 낸 1건도 1개뿐이었다. 정해진 모양은 이 도구로 만들지 않는다 —
디자이너가 만든 원본 SVG를 쓰거나 UX팀에 요청한다 (R-27).
(`scripts/__tests__/worker-pool.test.js`가 이 길이 되살아나지 않도록 지킨다.)

### 내보내기

프로젝트가 실제로 쓰는 아이콘만 골라 zip 하나로 내려받는다. 풀어서 프로젝트의 `assets/icons/`에 넣으면 끝이다.
외부에서 불러오는 것이 없어 폐쇄망에서도 뜬다.

**프로젝트마다 쓰는 것만 담긴다.** 스프라이트·CSS·낱개 SVG는 고른 아이콘만 들어간다. 폰트는 세트 전체를
싣는다(스튜디오 서버는 의존성 없이 돌도록 만들었고 폰트를 만드는 `svgicons2svgfont` 등은 개발 의존성이라, 서버에서 폰트를 쪼개지 않는다). 아이콘 하나에 0.1KB 안팎이라
세트가 수백 종이 되어도 수십 KB다.

폰트는 마지막 `npm run icons:build` 때 만들어진다. 그 뒤에 세트에 들인 아이콘은 스프라이트·SVG로는 쓰이지만
폰트에는 글자가 없다. 묶음에 그런 아이콘이 섞이면 응답 헤더 `x-icon-unbuilt`와 `README.txt` 맨 위,
화면의 안내가 그 이름을 알려 준다.

## 카탈로그와 채택

**카탈로그와 세트는 다르다.**

| | 카탈로그 | 세트 |
|---|---|---|
| 무엇 | 구글 Material Symbols Outlined 전량(3,900여 종) | 우리가 채택한 아이콘 |
| 번호(코드포인트) | 없다 | 대장에 올라 **영구히** 붙는다 |
| 어디에 | `studio/library/library.json` 색인 + `studio/public/library/sprite.svg` 미리보기 | `contracts/icon-codepoints.json` + `assets/icons/svg/` |
| 크기에 미치는 영향 | 스튜디오·MCP만 커진다 | 스프라이트·폰트·CSS·스타터가 커진다 |

전량을 세트로 두면 쓰지도 않는 아이콘만큼 스프라이트·폰트·스타터가 커진다. 그래서 전량은 **찾고 미리 보는 용도**로만 두고,
필요한 것만 채택한다.

### 만드는 법

```bash
npm run icons:library            # 색인·스프라이트를 다시 만든다 (.cache/에 받아 둔 원본이 있으면 몇 초)
npm run icons:library -- --refresh   # 구글 메타데이터와 SVG를 새로 받는다
```

| 입력 | 정본 |
|---|---|
| `studio/library/ko.json` | 한국어 이름과 검색어 — 사람이 검수하는 정본. 아이콘마다 `{ko, k[]}` |
| `contracts/icon-keywords.json` | 세트에 있는 아이콘의 수작업 검색어. 있으면 앞에 둔다 |
| 구글 메타데이터 | 영문 태그·분류·인기도 (`fonts.google.com/metadata/icons`) |

`library.json`·`sprite.svg`는 **생성물**이다. 직접 고치지 않는다. 구글 목록에서 빠졌지만 세트에 이미 있는 옛 이름
(`place`)은 한 줄로 따로 싣는다 — 안 그러면 `map-pin`이 「세트에 있음」으로 안 뜨고 같은 그림이 번호 둘로 갈려 들어올 수 있다.

### 채택

채택은 **`scripts/lib/icon-adopt.js` 한 곳**에서만 한다. 스튜디오 화면(`POST /api/adopt`)과 CLI가 같은 코드를 쓴다.
쓰는 곳이 둘이면 번호를 먼저 받는 쪽과 늦게 받는 쪽이 갈려 대장이 어긋난다.

```bash
npm run icons:adopt -- --search 장바구니            # 찾기만 한다. 아무것도 쓰지 않는다
npm run icons:adopt -- shopping_cart                # 채택 (우리 이름 shopping-cart)
npm run icons:adopt -- open_in_new --as external-link   # 이름을 직접 정한다
npm run icons:adopt -- receipt_long account_tree --build  # 여럿을 채택하고 빌드·검사까지
```

하는 일 — 이름 규칙 검사 → 네 표정 원본을 받아 24 좌표로 변환 → 파일·대장·씨앗 지도·검색어를 쓴다.
**먼저 다 받고 마지막에 쓴다.** 받다가 실패했을 때 파일만 반쯤 남는 일을 막는다(`icon-library.test.js`가 지킨다).
하지 않는 일 — 스프라이트·폰트·CSS 빌드. 그건 저장소에서 `npm run icons:build`로 한다.

**미리 본 것과 들어온 것은 같다.** 미리보기(`GET /api/library/preview`)와 채택이 같은 `fetchExpressions`·`normalize`를 쓴다.
기본과 같은 그림인 표정(돋보기의 필 등)은 변형 목록에서 뺀다.

### 검색

`scripts/lib/icon-search.js`가 서버·CLI·MCP의 검색을 모두 맡는다(의존성 없음). 한국어 이름 > 한국어 검색어 > 영문 이름 > 영문 태그 순으로
높은 점수를 주고, 띄어 쓴 말은 모두 걸려야 한다. **등급을 먼저 가르고 같은 등급 안에서는 인기도로 가린다** —
점수만 보면 「돋보기」가 이름이 같은 낯선 아이콘(`magnify_docked`)을 검색(`search`)보다 앞세웠다.

MCP는 저장소의 `scripts/`를 볼 수 없어 이 파일을 `mcp/bin/icon-search.js`로 복사해 싣는다(`npm run build:mcp`).
둘이 어긋나면 AI가 찾는 결과와 사람이 스튜디오에서 찾는 결과가 달라지므로 `check-harness`가 지킨다.

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
