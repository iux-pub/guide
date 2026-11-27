#!/usr/bin/env node
/**
 * infoUX MCP 서버
 *
 * 팀원이 스킬 파일을 각자 복사하지 않고도 infoUX 기준을 쓰게 하는 배포 경로다.
 * Claude Code / Codex / Cursor 어디서든 `npx @infomind-ux/infoux-mcp` 한 줄로 붙는다.
 *
 * 데이터는 mcp/data/에 번들되어 있다(`npm run build:mcp`로 생성). 저장소를
 * clone하지 않은 PC에서도 답할 수 있어야 하기 때문이다.
 */

const fs = require('node:fs')
const path = require('node:path')

// 아이콘 검색은 아이콘 스튜디오·CLI와 같은 코드다(scripts/lib/icon-search.js의 복사본).
// 사람이 스튜디오에서 찾는 결과와 AI가 여기서 찾는 결과가 달라지지 않게 한다 — check-harness가 지킨다.
const { search: searchIcons } = require('./icon-search.js')
// 블록 조립·순서 점검도 저장소의 미리보기 생성기와 같은 코드다(scripts/lib/block-catalog.js의 복사본).
const { SLOTS: BLOCK_SLOTS, composePage, placeholderLines } = require('./block-catalog.js')

const DATA_DIR = path.resolve(__dirname, '..', 'data')

function readData(...segments) {
  return fs.readFileSync(path.join(DATA_DIR, ...segments), 'utf8')
}

const manifest = JSON.parse(readData('manifest.json'))
const rules = JSON.parse(readData('rules.json'))
const profileSpec = JSON.parse(readData('profiles.json'))
const artDirection = JSON.parse(readData('art-direction.json'))
// 카피 규칙 판정 자료(R-23 자리값·R-43 어휘) — 오래된 번들에는 없을 수 있다
function readOptionalJson(name) {
  try {
    return JSON.parse(readData(name))
  } catch {
    return null
  }
}
const copyLexicon = readOptionalJson('copy-lexicon.json')
const fakeContent = readOptionalJson('fake-content.json')

// 규칙 범위는 번들된 rules.json에서 읽는다. 문구에 숫자를 박아 두면 규칙이 늘 때마다
// 에이전트가 새 규칙을 모른 채 일한다(2026-10에 R-28이 생겼는데 R-27로 안내되던 것처럼).
const RULE_IDS = (rules.rules || []).map((r) => r.id)
const RULE_RANGE = RULE_IDS.length
  ? `${RULE_IDS[0]}~${RULE_IDS[RULE_IDS.length - 1]}(${RULE_IDS.length}개)`
  : 'rules.json 전체'
// get_rules 필터 허용값 — 분류는 rules.json categories에서 읽는다(문구에 박아 두면 분류가 늘 때 낡는다)
const RULE_CATEGORIES = (rules.categories || []).map(c => ({ id: c.id, title: c.title }))
const RULE_SEVERITIES = ['error', 'warn', 'info']
// 심각도 표기는 warn으로 통일했다. 예전 표기 warning으로 물어도 같은 값으로 받는다
const SEVERITY_ALIAS = { warning: 'warn', warnings: 'warn', errors: 'error' }

// ─────────────────────────────────────────────────────
// 서버 지시문 — 에이전트가 도구를 언제 써야 하는지 알려준다
// ─────────────────────────────────────────────────────

const INSTRUCTIONS = `INFOMIND UX팀의 HTML/CSS 퍼블리싱 기준(infoUX)을 제공한다.

이 서버가 붙어 있으면, HTML·CSS·UI 작업 전에 다음을 지킨다.

1. 사이트 유형을 판정한다 — 일반사이트 / 공공서비스 / 공공기관 / CMS·관리자 / 커머스·예약.
   판단이 서지 않으면 get_reference("project-profiles")를 읽는다.
   판정했으면 get_profile(id)로 section 흐름·우선 컴포넌트·밀도를 가져간다.
   프로젝트에 infoux.json이 있으면 그 profile 값이 판정 결과다 — 다시 판정하지 않는다.
   프리셋과 함께 get_art_direction(profile)로 표현 등급·타이포·팔레트·카피 톤 기준을 가져간다.
2. 색상은 반드시 토큰을 쓴다. hex/rgb/hsl 직접 작성 금지. get_tokens로 확인한다.
   토큰명을 지어내지 않는다 — 목록에 없으면 사용자에게 확인한다.
3. 컴포넌트는 카탈로그를 먼저 본다. list_components → get_component 순으로 확인하고
   기존 스니펫을 조합한다. 카탈로그 밖 컴포넌트는 임의 생성하지 않는다.
   페이지·폼·위젯 설계나 컴포넌트 신규 생성처럼 절차가 정해진 작업은 get_workflow를 먼저 읽는다.
4. 아이콘도 카탈로그에서 가져온다. list_icons(query) → get_icon(name) 순으로 확인한다.
   **아이콘 이름을 지어내지 않는다** — 목록에 없는 이름을 쓰면 화면에 아무것도 안 나온다.
   구글 Material Symbols 전량을 한국어·영어로 찾을 수 있고, 결과는 둘로 나뉜다 —
   「세트에 있음」은 바로 쓰고, 「카탈로그에만 있음」은 사용자가 세트에 넣어야(채택) 쓸 수 있다.
   카탈로그에도 없으면 UX팀에 요청한다 (R-27). 세트에 없는 아이콘을 SVG로 직접 넣지 않는다.
   장식용은 aria-hidden, 의미를 담으면 role="img"+aria-label을 붙인다.
5. 규칙 ${RULE_RANGE}을 지킨다. get_rules로 확인한다. BEM, 접근성, 금지 패턴이 여기 있다.
6. 간격·크기·타이포 스케일·반경은 토큰이 아니라 rem 임의값(p-[1.6rem])으로 쓴다 — 루트가 62.5%라 Tailwind 기본 스케일(p-4·text-sm)은 37.5% 작게 렌더된다(R-37). 모션·z-index는 CSS 값이나 Tailwind 임의값(duration-[200ms], z-[1050])으로 쓴다.
7. 원칙이 충돌하면 get_reference("trade-off-rules")의 우선순위를 따른다. 접근성이 1순위다.
   화면을 마무리했으면 get_reference("release-checklist")로 점검한다 — 접근성·과업 흐름·품질은
   100% 통과가 조건이다.
8. 메인·랜딩 페이지(pageType main)는 코드를 쓰기 전에 get_reference("design-intelligence")를 읽는다.
   생성은 자유롭게, 하네스는 바닥만 지킨다. 실제 콘텐츠(contentSources)와 기관 사진(출처·라이선스)을
   확보하고, 기관·1순위 과업·사용자·기준 수준·피할 것을 다섯 줄 브리프로 쓴 뒤, 브리프와 재료만으로
   자유롭게 디자인한다. 블록 카탈로그·형식표·견본·결함 문항을 생성 맥락에 넣지 않는다 — 블록 카탈로그
   (list_blocks·get_block·compose_page)는 서브 페이지와 마크업 참고용이다.
   그 뒤 바닥만 교정한다: npm run check·lint 오류, 접근성·과업 흐름, KRDS 대조, 카피 사실성.
   위반한 지점만 가장 좁게 고치고 디자인을 다시 하지 않는다. 검사 규칙과 디자인이 정면으로 부딪치면
   지우기 전에 exceptions[]에 예외로 올리고 사람에게 넘긴다. 바꾼 것은 get_reference("design-plan")
   서식의 docs/design-plan.md 「교정 기록」에 적는다. 생성 결과는 디자이너가 수정하는 출발점이고,
   운영자·발주자의 사람 판정 「승인」이 없으면 npm run check:release가 실패한다.
9. 페이지는 프로젝트 루트(*.html)나 pages/ 아래에 둔다. 다른 폴더에 두면 infoux.json "pages"에
   글롭을 더한다 — npm run check가 그 범위의 페이지만 page 계약으로 검사한다. 검사를 끄거나
   실패를 숨기는 훅·스크립트(|| true, 2>/dev/null)를 만들지 않는다.

기술 스택은 Tailwind v4 + 표준 CSS nesting + BEM + ITCSS 5계층이다. SCSS는 쓰지 않는다.`

// ─────────────────────────────────────────────────────
// 도구
// ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_contract',
    description:
      'infoUX 작업 컨트랙트 전문을 반환한다. UI 작업을 시작하기 전에 한 번 읽는다. ' +
      '작업 순서, 판단 기준, 금지사항이 들어 있다.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'list_components',
    description:
      '사용 가능한 컴포넌트 카탈로그를 반환한다. 새 컴포넌트를 만들기 전에 반드시 확인한다 — ' +
      '카탈로그에 있으면 그것을 쓴다.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_component',
    description:
      '컴포넌트 하나의 마크업 스니펫과 접근성 요건을 반환한다. BEM 블록명은 CSS 파일명과 같다.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '컴포넌트 이름 (예: btn, accordion, table)' }
      },
      required: ['name']
    }
  },
  {
    name: 'list_icons',
    description:
      '아이콘을 찾는다. 아이콘이 필요하면 **반드시 먼저 확인한다** — 목록에 없는 이름을 지어내면 ' +
      '화면에 아무것도 안 나온다. query 없이 부르면 세트 목록, query를 주면 구글 Material Symbols 전량을 ' +
      '한국어·영어로 찾아 「세트에 있음」(바로 쓴다)과 「카탈로그에만 있음」(채택해야 쓴다)으로 나눠 준다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '찾는 말 (예: 장바구니, 영수증, arrow, calendar). 띄어 쓰면 모두 걸려야 한다' }
      }
    }
  },
  {
    name: 'get_icon',
    description:
      '아이콘 하나의 마크업과 접근성 요건을 반환한다. 장식용인지 의미를 담는지에 따라 ' +
      'aria 처리가 달라지므로 그대로 복사해 쓴다. 카탈로그에만 있는 아이콘이면 마크업 대신 채택 방법을 알려 준다.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '아이콘 이름 (예: search, chevron-right, calendar). 구글 이름(shopping_cart)도 받는다' }
      },
      required: ['name']
    }
  },
  {
    name: 'get_tokens',
    description:
      '색상·폰트·브레이크포인트 토큰 카탈로그를 반환한다. 색상 값이 필요할 때 반드시 여기서 확인한다. ' +
      'query를 주면 해당 문자열이 든 줄만 걸러 낸다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '필터 문자열 (예: primary, danger, border)' },
        raw: { type: 'boolean', description: 'true면 생성된 tokens.css 원본을 반환한다' }
      }
    }
  },
  {
    name: 'get_rules',
    description:
      `infoUX 코딩 규칙 ${RULE_RANGE}을 반환한다. CSS·BEM·HTML·접근성 규칙과 위반 예시가 들어 있다.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '규칙 ID 단건 조회 (예: R-12)' },
        category: { type: 'string', description: `분류로 필터 — ${RULE_CATEGORIES.map(c => `${c.id}(${c.title})`).join(', ')}` },
        severity: { type: 'string', description: 'error / warn / info (warning도 warn으로 받는다)' }
      }
    }
  },
  {
    name: 'get_reference',
    description:
      '레퍼런스 문서를 반환한다. name 없이 부르면 목록을 준다. ' +
      '접근성 기준, 금지 패턴, Tailwind 매핑, HTML 시맨틱, 사이트 유형 프로필, 디자인 판단 절차(design-intelligence), ' +
      '계약 서식(task-contract·design-plan), 선택 도구인 평가자 지시문(render-critique-evaluator)·기준 견본 색인(exemplars) 등이 있다.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '문서 이름 (예: accessibility, forbidden-patterns)' }
      }
    }
  },
  {
    name: 'get_profile',
    description:
      '사이트 유형 프리셋을 반환한다. name 없이 부르면 5종 목록을 준다. ' +
      'section 흐름, 우선 컴포넌트, 밀도 기준, 정부 아이덴티티 조건이 들어 있다. ' +
      '사이트 유형을 판정한 직후에 읽어 구조를 잡는다.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '유형 id (general-site, public-service, public-institution, cms-admin, commerce-reservation)' }
      }
    }
  },
  {
    name: 'get_workflow',
    description:
      '작업 절차를 반환한다. name 없이 부르면 목록을 준다. 페이지·폼·위젯 설계, 컴포넌트 신규 생성, ' +
      '토큰 변경, UI 리뷰, 프로젝트 초기화 절차가 있다. 해당 작업을 시작하기 전에 읽는다.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '절차 이름 (예: design-page, change-token, create-component)' }
      }
    }
  },
  {
    name: 'get_art_direction',
    description:
      '프로필별 아트 디렉션 — 표현 등급 상세, 타이포 페어링 후보, 팔레트 프리셋 후보, 한글 조판 공통값, ' +
      '안티패턴 색인. 인자 없이 호출하면 전체 색인. 밀도·section 흐름은 get_profile 소유라 반복하지 않는다.',
    inputSchema: {
      type: 'object',
      properties: {
        profile: { type: 'string', description: '사이트 유형 id (general-site, public-service, public-institution, cms-admin, commerce-reservation). 생략 시 등급 정의와 전체 후보 색인' },
        expression: { type: 'string', description: '표현 등급 덮어쓰기 (utility, restrained, expressive). 생략 시 프로필 기본값. Task Contract의 expression과 같은 값' }
      }
    }
  },
  {
    name: 'list_blocks',
    description:
      '블록 카탈로그(메인·랜딩의 섹션 단위 실물)를 찾는다. 섹션을 손으로 짓기 전에 먼저 부른다. ' +
      '자리(slot)·형식(form)·검색어(tag)로 거르고, 결과마다 한 줄 설명·언제 쓰나·언제 쓰지 않나·필요한 콘텐츠·어울리는 이웃을 준다. ' +
      '목록 끝에 견본 조합(한 페이지를 이루는 블록 순서와 면 흐름 — 조합 id를 compose_page의 set에 넘기면 그대로 조립된다)을 함께 준다. ' +
      '다음 단계: 고른 블록을 get_block(id)로 받아 「언제 쓰지 않나」와 필요한 콘텐츠를 확인한 뒤 compose_page로 조립한다.',
    inputSchema: {
      type: 'object',
      properties: {
        slot: { type: 'string', description: `자리 — ${BLOCK_SLOTS.map(s => `${s.id}(${s.label})`).join(', ')}` },
        form: { type: 'string', description: '블록 형식 기호 (예: H1, Q1, N2, B1 — 옛 형식표 docs/archive/design-intelligence-2026-11.md §6)' },
        tag: { type: 'string', description: '검색어 — 이름·설명·태그에서 찾는다 (예: 사진, 마감, 로고)' }
      }
    }
  },
  {
    name: 'get_block',
    description:
      '블록 하나의 전부를 반환한다 — 메타데이터(언제 쓰나·쓰지 않나, 필요한 콘텐츠와 문구 길이·사진 비율·항목 수, 변형 축, 이웃, 면 색·토큰, 접근성 주의), ' +
      '마크업 틀, 스타일(CSS). 마크업의 클래스는 이 CSS에 있는 것만 쓴다 — 새 modifier를 지어내지 않는다(R-29). ' +
      '다음 단계: 페이지에 놓을 블록 id를 순서대로 compose_page에 넘긴다. 블록 하나만 기존 페이지에 끼울 때는 이 응답의 마크업을 main 안 section으로 넣는다.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '블록 id (예: cover, task-index, bulletin). list_blocks가 알려 준다' }
      },
      required: ['id']
    }
  },
  {
    name: 'compose_page',
    description:
      '블록 id 목록(blocks)이나 견본 조합 id(set — list_blocks가 알려 준다. 예: scene-showcase)를 받아 공통 틀(건너뛰기 링크·헤더·main·푸터)에 끼운 완성 HTML을 만든다. ' +
      '함께 돌려주는 것: ① 순서 점검(첫 화면 블록 유무·위치, 같은 면 색 연속과 이어지게 설계된 면, 이웃 궁합, 같은 archetype 3연속) ' +
      '② 실제 내용으로 채워야 할 자리 목록({{…}} — 문구 길이·사진 비율·항목 수 포함) ③ 필요한 스크립트. ' +
      '틀과 블록의 구조·클래스는 고치지 않고 {{…}} 자리만 발주처 자료(contentSources)로 채운다 — 예시 문구를 지어내 채우지 않는다(R-23). ' +
      '다음 단계: 순서 점검의 오류를 고쳐 다시 조립 → 자리 채우기 → npm run check → 사람 판정.',
    inputSchema: {
      type: 'object',
      properties: {
        blocks: { type: 'array', items: { type: 'string' }, description: '놓을 순서대로 적은 블록 id 목록 (예: ["cover", "task-index", "bulletin"]). set을 주면 생략한다' },
        set: { type: 'string', description: '견본 조합 id — 그 조합의 블록 순서로 조립한다 (예: scene-showcase, split-cover, public-enterprise). blocks와 함께 주지 않는다' },
        assetBase: { type: 'string', description: '자산 경로 앞머리. 기본값은 빈 문자열(프로젝트 루트의 페이지 — assets/…·dist/…). pages/ 아래 페이지면 "../"' },
        title: { type: 'string', description: '<title>에 넣을 문구. 생략하면 {{page_title}} 자리로 남는다' }
      }
    }
  },
  {
    name: 'search_docs',
    description:
      'infoUX 문서 전체(작업 컨트랙트·레퍼런스·작업 절차·스니펫·규칙·사이트 유형 프리셋·아트 디렉션)에서 문자열을 찾는다. ' +
      '어느 문서를 봐야 할지 모를 때 먼저 쓴다. 대소문자는 구분하지 않는다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '찾을 문자열 (빈 문자열은 받지 않는다)' }
      },
      required: ['query']
    }
  }
]

// ─────────────────────────────────────────────────────
// 도구 구현
// ─────────────────────────────────────────────────────

function text(body) {
  return { content: [{ type: 'text', text: body }] }
}

// 잘못된 입력·없는 이름은 isError로 돌려준다 — 정상 응답처럼 보이면 에이전트가 「없다」는 답을 본문으로 읽고 지나간다
function fail(body) {
  return { ...text(body), isError: true }
}

function notFound(what, available) {
  return fail(`${what}을(를) 찾을 수 없다.\n\n사용 가능: ${available.join(', ')}`)
}

function listComponents() {
  const isComponent = item => (item.kind || 'component') === 'component'
  const components = manifest.snippets.filter(isComponent)
  const others = manifest.snippets.filter(item => !isComponent(item))
  const lines = ['# infoUX 컴포넌트 카탈로그', '']
  lines.push(`컴포넌트·패턴 ${components.length}종. get_component(name)으로 마크업을 가져온다.`, '')
  for (const item of components) {
    lines.push(`- **${item.id}** — ${item.summary || '(설명 없음)'}`)
  }
  if (others.length > 0) {
    // 페이지 골격은 화면에 놓는 부품이 아니라 문서의 뼈대다 — 같은 목록에 섞으면 컴포넌트로 센다
    lines.push('', '## 페이지 골격 (컴포넌트 아님)', '')
    for (const item of others) {
      lines.push(`- **${item.id}** — ${item.summary || '(설명 없음)'} get_component("${item.id}")로 받는다.`)
    }
  }
  lines.push('', '카탈로그에 없는 컴포넌트는 임의로 만들지 않는다. UX팀 판단이 필요하다.')
  return text(lines.join('\n'))
}

function getComponent(name) {
  const entry = manifest.snippets.find(item => item.id === name)
  if (!entry) return notFound(`컴포넌트 "${name}"`, manifest.snippets.map(i => i.id))
  return text(readData('snippets', entry.file))
}

function loadIconLedger() {
  try {
    return JSON.parse(readData('icons.json'))
  } catch {
    return null
  }
}

// 카탈로그 색인(구글 Material Symbols 전량). 없으면 null — 세트 목록만으로 예전처럼 답한다.
let iconLibrary
function loadIconLibrary() {
  if (iconLibrary !== undefined) return iconLibrary
  try {
    iconLibrary = JSON.parse(readData('icon-library.json'))
  } catch {
    iconLibrary = null
  }
  return iconLibrary
}

/** 구글 이름 → 세트에서 쓰는 우리 이름. 이름이 달라져도(keyboard_arrow_up → chevron-up) 이어 준다. */
function adoptedByMaterial(ledger) {
  const map = new Map()
  for (const [name, meta] of Object.entries(ledger.icons)) if (meta.material) map.set(meta.material, name)
  return map
}

/** 세트·카탈로그를 한꺼번에 찾아 「바로 쓴다」와 「채택해야 쓴다」로 나눠 보여 준다. */
function searchAllIcons(query, ledger, library) {
  const taken = adoptedByMaterial(ledger)
  const hits = searchIcons(library, query, { limit: Number.MAX_SAFE_INTEGER })

  const inSet = []
  const onlyCatalog = []
  const seen = new Set()
  for (const { icon } of hits) {
    const ours = taken.get(icon.m)
    if (ours) {
      inSet.push({ name: ours, ko: icon.ko, material: icon.m })
      seen.add(ours)
    } else {
      onlyCatalog.push(icon)
    }
  }

  // 세트에는 있는데 카탈로그 색인에 없는 것(자체 제작·씨앗 밖)은 이름과 검색어로 따로 찾는다
  const needle = String(query).toLowerCase()
  for (const [name, meta] of Object.entries(ledger.icons)) {
    if (seen.has(name) || meta.material) continue
    const words = (meta.keywords || []).map(k => String(k).toLowerCase())
    if (name.includes(needle) || words.some(k => k.includes(needle))) inSet.push({ name, ko: (meta.keywords || [])[0] || '' })
  }

  const lines = ['# infoUX 아이콘 검색', '']
  lines.push(`"${query}" — 세트 ${inSet.length}종 · 카탈로그에만 ${onlyCatalog.length}종 (카탈로그 ${library.icons.length.toLocaleString('en-US')}종 가운데)`, '')

  if (inSet.length > 0) {
    lines.push('## 세트에 있음 — 바로 쓴다', '')
    for (const i of inSet.slice(0, 30)) lines.push(`- \`${i.name}\`${i.ko ? ` — ${i.ko}` : ''}`)
    if (inSet.length > 30) lines.push(`- …외 ${inSet.length - 30}종 (검색어를 좁힌다)`)
    lines.push('', 'get_icon(name)으로 마크업을 가져온다.', '')
  }

  if (onlyCatalog.length > 0) {
    lines.push('## 카탈로그에만 있음 — 채택해야 쓴다', '')
    for (const i of onlyCatalog.slice(0, 20)) {
      const name = i.n || (i.s ? `이름 제안 ${i.s}` : '이름을 정해야 함')
      lines.push(`- \`${i.m}\`${i.ko ? ` — ${i.ko}` : ''} (${i.n ? `채택하면 ${name}` : name})`)
    }
    if (onlyCatalog.length > 20) lines.push(`- …외 ${onlyCatalog.length - 20}종 (검색어를 좁힌다)`)
    lines.push(
      '',
      '이 아이콘들은 아직 세트에 없어 코드포인트·스프라이트가 없다. **지금 마크업에 쓰면 화면에 아무것도 안 나온다.**',
      'get_icon(구글 이름)이 채택 방법을 알려 준다. 사용자에게 채택을 요청하고, SVG를 직접 붙이지 않는다 (R-27).',
      ''
    )
  }

  if (inSet.length === 0 && onlyCatalog.length === 0) {
    lines.push(
      '세트에도 카탈로그에도 없다. **이름을 지어내지 않는다.**',
      '다른 말로 한 번 더 찾아 본다(동의어·영어 이름·더 짧은 단어). 그래도 없으면 UX팀에 제작을 요청한다 (R-27).'
    )
  }
  return text(lines.join('\n'))
}

function listIcons({ query } = {}) {
  const ledger = loadIconLedger()
  if (!ledger) return text('아이콘 카탈로그가 이 번들에 없다. npm run build:mcp로 다시 만든다.')

  const library = loadIconLibrary()
  if (query && String(query).trim() && library) return searchAllIcons(String(query).trim(), ledger, library)

  const all = Object.entries(ledger.icons).map(([name, meta]) => ({ name, ...meta }))
  const needle = query ? String(query).toLowerCase() : null
  // 한국어로도 찾는다 — 「달력」·「즐겨찾기」·「찾아오는길」. 이름이 영어라
  // 이 다리가 없으면 AI가 「없다」고 판단해 이름을 지어낸다 (R-27)
  const rows = needle
    ? all.filter(i =>
        i.name.includes(needle) ||
        (i.category || '').includes(needle) ||
        (i.label || '').includes(needle) ||
        (i.keywords || []).some(k => String(k).toLowerCase().includes(needle))
      )
    : all

  if (rows.length === 0) {
    return text(
      `"${query}"에 해당하는 아이콘이 없다. **이름을 지어내지 말고** list_icons()로 전체 목록을 확인한다.\n` +
      '필요한 아이콘이 카탈로그에 없으면 UX팀에 요청한다 (R-27).'
    )
  }

  const byCat = new Map()
  for (const r of rows) {
    const c = r.category || '기타'
    if (!byCat.has(c)) byCat.set(c, [])
    byCat.get(c).push(r.name)
  }

  const withFill = all.filter((i) => (i.variants || []).includes('fill')).length
  const lines = ['# infoUX 아이콘 카탈로그', '']
  lines.push(query ? `"${query}" 검색 — ${rows.length}종` : `세트 ${rows.length}종.`, '')
  if (needle) {
    // 이름에 없는 말로 걸린 것은 왜 걸렸는지 밝힌다 — 엉뚱한 결과처럼 보이지 않게
    const via = rows
      .filter(i => !i.name.includes(needle))
      .map(i => `${i.name}(${(i.keywords || []).find(k => String(k).toLowerCase().includes(needle))})`)
    if (via.length > 0) lines.push(`검색어로 걸린 것 — ${via.join(', ')}`, '')
  }
  for (const [cat, names] of byCat) {
    lines.push(`- **${cat}** — ${names.join(', ')}`)
  }
  lines.push(
    '',
    `표정은 슬림 · 레귤러(기본) · 볼드 · 필 네 가지다. 슬림·볼드는 전부 있고, 필은 ${withFill}종에만 있다 — ` +
      '채울 면이 없는 형태(돋보기·화살표 등)에는 만들지 않는다. **어느 아이콘에 무엇이 있는지는 get_icon이 알려 준다.**',
    '',
    'get_icon(name)으로 마크업을 가져온다.',
    library
      ? `세트에 없는 아이콘은 list_icons(query)로 카탈로그 ${library.icons.length.toLocaleString('en-US')}종에서 찾는다 — 채택하면 쓸 수 있다.`
      : '',
    '**목록에 없는 이름을 쓰지 않는다** — 화면에 아무것도 안 나온다. 필요하면 UX팀에 요청한다 (R-27).'
  )
  return text(lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n'))
}

/**
 * 이 아이콘이 가진 표정만 알려 준다.
 *
 * 전부 나열하면 AI가 없는 표정을 골라 쓴다 — 화면에는 빈 네모가 나온다.
 * 대장(icon-codepoints.json)의 variants가 정본이다.
 */
function iconVariantSection(name, meta) {
  const has = Array.isArray(meta.variants) ? meta.variants : []
  const label = { slim: '슬림(가늘게)', bold: '볼드(강조)', fill: '필(선택·활성)' }

  if (has.length === 0) {
    return [
      '## 표정',
      '',
      `이 아이콘은 기본(레귤러) 하나뿐이다. \`icon-font--slim\` 같은 표정 클래스를 붙이면 빈 네모가 나온다.`,
      ''
    ]
  }

  return [
    '## 표정',
    '',
    `이 아이콘이 가진 표정 — 레귤러(기본) · ${has.map((v) => label[v] || v).join(' · ')}`,
    '',
    '```html',
    ...has.map((v) => `<span class="icon-font icon-font--${v} icon-font--${name}" aria-hidden="true"></span>`),
    ...has.map((v) => `<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite-${v}.svg#${name}"></use></svg>`),
    '```',
    '',
    '폰트는 클래스가, SVG는 스프라이트 파일이 표정을 정한다 — SVG에 `icon--bold` 같은',
    '클래스를 붙이지 않는다(아무 일도 하지 않는다). **여기 없는 표정은 쓰지 않는다.**',
    '한 화면에서 표정을 섞지 않는다 — 굵기가 뒤섞이면 중요도가 다른 것처럼 읽힌다.',
    ''
  ]
}

/**
 * 카탈로그에만 있는 아이콘 — 마크업을 주지 않고 채택 방법을 알려 준다.
 *
 * 마크업을 만들어 주면 AI는 그대로 쓴다. 그런데 이 이름의 클래스·스프라이트·코드포인트가
 * 프로젝트에 없어 화면에 아무것도 안 나온다. SVG를 직접 붙이는 것도 R-27 위반이다.
 */
function catalogOnlyIcon(row, library) {
  const label = library.categories?.find(c => c.id === row.c)?.label
  const ours = row.n || row.s
  const lines = [
    `# ${row.m} — 카탈로그에만 있음`,
    '',
    `${row.ko ? `한국어 이름 ${row.ko} · ` : ''}${label ? `분류 ${label} · ` : ''}구글 Material Symbols. **이 세트에는 아직 없다** (코드포인트·스프라이트 없음).`,
    ...(row.k && row.k.length > 0 ? ['', `이 아이콘을 부르는 말 — ${row.k.join(' · ')}`] : []),
    '',
    '## 쓰려면 채택해야 한다',
    ''
  ]
  if (row.n) {
    lines.push(`채택하면 \`${row.n}\`(으)로 쓴다.`)
  } else {
    lines.push(`이름 규칙에 맞지 않아 이름을 정해야 한다 — ${row.x}.${row.s ? ` 제안: \`${row.s}\`.` : ''}`)
  }
  lines.push(
    '',
    '1. 아이콘 스튜디오 → 찾기 → 카탈로그 전체 → 이 아이콘을 눌러 「세트에 넣기」',
    `2. 저장소가 있으면: \`npm run icons:adopt -- ${row.m}${row.n ? '' : ` --as ${ours || '<이름>'}`} --build\``,
    `3. 채택해 저장소에 반영된 뒤에 get_icon("${ours || '<채택한 이름>'}")이 마크업을 준다.`,
    '',
    '**채택하기 전에는 이 이름으로 마크업을 쓰지 않는다** — 화면에 아무것도 안 나온다.',
    'SVG를 직접 붙여 넣는 것도 안 된다 (R-27). 사용자에게 채택을 요청한다.'
  )
  return text(lines.join('\n'))
}

function getIcon(name) {
  const ledger = loadIconLedger()
  if (!ledger) return text('아이콘 카탈로그가 이 번들에 없다. npm run build:mcp로 다시 만든다.')

  const meta = ledger.icons[name]
  if (!meta) {
    const library = loadIconLibrary()
    // 구글 이름(shopping_cart)이나 하이픈으로 바꾼 꼴(shopping-cart)로 물어도 알아듣는다
    const key = String(name || '').trim().toLowerCase()
    const row = library?.icons.find(i => i.m === key || i.m === key.replace(/-/g, '_'))
    if (row) {
      const ours = adoptedByMaterial(ledger).get(row.m)
      if (ours) {
        const inner = getIcon(ours).content[0].text
        return text(`"${name}"은(는) 구글 이름이다. 이 세트에서 쓰는 이름 — \`${ours}\`\n\n${inner}`)
      }
      return catalogOnlyIcon(row, library)
    }

    // 가까운 후보 — 카탈로그까지 훑는다. 세트에 있는 것과 채택해야 하는 것을 구분해 보인다
    if (library) {
      const taken = adoptedByMaterial(ledger)
      const label = (icon) => (taken.has(icon.m) ? `${taken.get(icon.m)}(세트)` : `${icon.m}(카탈로그에만)`)
      const words = key.split(/[-_\s]+/).filter(Boolean)
      // 마디를 모두 만족하는 것을 먼저, 없으면 마디 하나씩 — 철자가 틀린 이름이나 지어낸 이름도 단서를 준다
      let near = searchIcons(library, words.join(' '), { limit: 8 }).map(({ icon }) => label(icon))
      for (let w = 0; near.length === 0 && w < words.length; w += 1) {
        near = searchIcons(library, words[w], { limit: 8 }).map(({ icon }) => label(icon))
      }
      if (near.length > 0) return notFound(`아이콘 "${name}"`, near)
    }
    const near = Object.keys(ledger.icons).filter(n => n.includes(String(name).split('-')[0])).slice(0, 8)
    return notFound(`아이콘 "${name}"`, near.length > 0 ? near : Object.keys(ledger.icons).slice(0, 12))
  }

  const lines = [
    `# ${name}`,
    '',
    `분류 ${meta.category} · 출처 ${meta.source} · 코드포인트 ${meta.codepoint}`,
    ...(Array.isArray(meta.keywords) && meta.keywords.length > 0
      ? ['', `이 아이콘을 부르는 말 — ${meta.keywords.join(' · ')}`]
      : []),
    '',
    '## 붙여 넣을 코드 (기본 — 폰트)',
    '',
    '```html',
    `<span class="icon-font icon-font--${name}" aria-hidden="true"></span>`,
    '```',
    '',
    '아이콘에는 항상 aria-hidden을 붙인다. 뜻은 옆의 텍스트나 버튼의 aria-label이 전한다 —',
    '폰트 아이콘은 스크린리더가 PUA 코드포인트를 엉뚱하게 읽는다.',
    '',
    '```html',
    `<button class="btn"><span class="icon-font icon-font--${name}" aria-hidden="true"></span>검색</button>`,
    `<button class="btn btn--text" aria-label="설명"><span class="icon-font icon-font--${name}" aria-hidden="true"></span></button>`,
    '```',
    '',
    '## SVG 태그로 넣을 때',
    '',
    '폰트를 못 쓰는 곳이나 아이콘 하나만 색을 달리해야 할 때만 쓴다.',
    '',
    '```html',
    `<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#${name}"></use></svg>`,
    '```',
    '',
    ...iconVariantSection(name, meta),
    '## 크기',
    '',
    '`.icon-font`(24) · `--xsmall`(16) · `--small`(20) · `--large`(32) · `--inherit`(글자 크기)',
    'SVG 방식은 `.icon` + 같은 어휘를 쓴다.',
    '',
    '## 지킬 것',
    '',
    '- 색을 아이콘에 넣지 않는다 — `fill: currentColor`가 부모 `color`를 따라간다 (R-01)',
    '- 아이콘만 있는 버튼은 버튼에도 `aria-label`을 준다',
    '- 클릭 영역은 아이콘 크기가 아니라 44×44px 이상 (R-13)',
    '- 폰트로 쓸 때는 `.icon-font .icon-font--' + name + '` + `aria-hidden` + 텍스트 라벨 (여벌 경로)'
  ]
  return text(lines.join('\n'))
}

function getTokens({ query, raw } = {}) {
  if (raw) return text(readData('tokens.css'))

  const body = readData('references', 'krds-tokens.md')
  if (query === undefined || query === null || String(query).trim() === '') return text(body)

  const needle = String(query).trim().toLowerCase()
  const matched = body.split('\n').filter(line => line.toLowerCase().includes(needle))
  if (matched.length === 0) {
    return fail(`"${query}"에 해당하는 토큰이 없다. 토큰명을 지어내지 말고 get_tokens()로 전체 목록을 확인한다.`)
  }
  return text([`# 토큰 검색 — "${query}" (${matched.length}건)`, '', ...matched].join('\n'))
}

/** 심각도 표기를 한 값으로 — warn·warning·WARN을 같은 값으로 받는다. 번들 규칙의 옛 표기(warning)도 같이 맞춘다 */
function normalizeSeverity(value) {
  const key = String(value ?? '').trim().toLowerCase()
  return SEVERITY_ALIAS[key] || key
}

function getRules({ id, category, severity } = {}) {
  let found = rules.rules

  if (id) {
    const wanted = String(id).trim().toUpperCase()
    found = found.filter(rule => rule.id.toUpperCase() === wanted)
    if (found.length === 0) return notFound(`규칙 "${id}"`, rules.rules.map(r => r.id))
  }
  if (category) {
    const wanted = String(category).trim().toLowerCase()
    if (!RULE_CATEGORIES.some(c => c.id === wanted)) {
      return notFound(`규칙 분류 "${category}"`, RULE_CATEGORIES.map(c => `${c.id}(${c.title})`))
    }
    found = found.filter(rule => rule.category === wanted)
  }
  if (severity) {
    const wanted = normalizeSeverity(severity)
    if (!RULE_SEVERITIES.includes(wanted)) return notFound(`심각도 "${severity}"`, RULE_SEVERITIES)
    found = found.filter(rule => normalizeSeverity(rule.severity) === wanted)
  }

  const lines = [`# infoUX 규칙 (${found.length}건)`, '']
  for (const rule of found) {
    lines.push(`## ${rule.id} — ${rule.summary}`)
    lines.push(`- 심각도: ${normalizeSeverity(rule.severity)} / 분류: ${rule.category}`)
    if (rule.enforcement?.length) lines.push(`- 검사: ${rule.enforcement.join(', ')}`)
    if (rule.rationale) lines.push(`- 이유: ${rule.rationale}`)
    if (rule.bad) lines.push('', '위반:', '```', examplesText(rule.bad), '```')
    if (rule.good) lines.push('', '준수:', '```', examplesText(rule.good), '```')
    // 단건 조회면 판정 자료까지 — 에이전트가 어떤 문구·자리값이 걸리는지 미리 안다
    if (id && rule.id === 'R-23' && fakeContent) lines.push('', ...fakeContentLines())
    if (id && rule.id === 'R-43' && copyLexicon) lines.push('', ...copyLexiconLines())
    lines.push('')
  }
  if (rules.meta?.blockExceptions) lines.push(`> 블록 예외 — ${rules.meta.blockExceptions}`, '')
  if (!id && found.some(r => r.id === 'R-23' || r.id === 'R-43')) {
    lines.push('> R-23 자리값 목록·R-43 번역투 어휘는 get_rules(id)로 단건 조회하면 함께 나온다(contracts/fake-content.json·copy-lexicon.json).')
  }
  return text(lines.join('\n'))
}

// rules.json의 bad·good은 { code, note } 배열이다(예전에는 문자열이었다)
function examplesText(list) {
  return (Array.isArray(list) ? list : [list])
    .map(item => (typeof item === 'string' ? item : `${item.code}${item.note ? `\n  ↳ ${item.note}` : ''}`))
    .join('\n')
}

function fakeContentLines() {
  return [
    '### 판정 자료 — contracts/fake-content.json',
    `- 핫링크 호스트: ${fakeContent.hotlinkHosts.join(', ')}`,
    `- 연번 명사('명사 + 번호' 형제 2개 이상): ${fakeContent.serialNouns.join(', ')}`,
    `- 자리값 title·h1: ${fakeContent.placeholderTitles.join(', ')}`,
    `- 자리값 h2~h6: ${fakeContent.placeholderHeadings.join(', ')} (+ '모달 제목'처럼 화면 부품 이름 + 제목)`,
    `- 기관명 자리값: ${fakeContent.brandPlaceholders.join(', ')}`,
    `- 틀 표시: <meta name="${fakeContent.templateMarker}"> — ${fakeContent.templateMarkerNote || ''}`
  ]
}

function copyLexiconLines() {
  return [
    '### 판정 어휘 — contracts/copy-lexicon.json',
    ...copyLexicon.translationese.map(t => `- \`${t.pattern}\` — ${t.why}`),
    `- 재촉형 버튼 어미: \`${copyLexicon.buttonImperativeEndings}\`${copyLexicon.buttonImperativeNote ? ` — ${copyLexicon.buttonImperativeNote}` : ''}`,
    `- 느낌표: \`${copyLexicon.exclamation}\`${copyLexicon.exclamationNote ? ` — ${copyLexicon.exclamationNote}` : ''}`,
    `- 공통 허용 문구: ${(copyLexicon.allow || []).join(', ') || '없음'} — 프로젝트 고유 문구는 infoux.json copyAllow`
  ]
}

function getProfile(name) {
  const profiles = profileSpec.profiles

  if (!name) {
    const lines = ['# infoUX 사이트 유형', '', '판정 후 get_profile(id)로 프리셋을 가져간다.', '']
    for (const p of profiles) {
      lines.push(`- **${p.id}** (${p.label}) — ${p.appliesTo}`)
    }
    lines.push('', '판정이 서지 않으면 get_reference("project-profiles")의 판정 절차를 읽는다.')
    return text(lines.join('\n'))
  }

  const profile = profiles.find(p => p.id === name)
  if (!profile) return notFound(`사이트 유형 "${name}"`, profiles.map(p => p.id))

  const density = profileSpec.density[profile.density]
  const expression = profileSpec.expressionLevels[profile.expression]
  const identity = profile.governmentIdentity === 'excluded'
    ? '제외 — 정부 상징·공식 배너·운영기관 식별자를 생성하지 않는다.'
    : '조건부 — 과업지시서나 기관 정책이 확인된 경우에만 생성한다.'

  const lines = [
    `# ${profile.label} (${profile.id})`,
    '',
    `적용 대상: ${profile.appliesTo}`,
    `기본 생성: ${profile.focus}`,
    `표현 등급: ${expression.label} — 상세는 get_art_direction`,
    '',
    '## 기본 section 흐름',
    '',
    profile.sectionFlow.map(s => `section--${s}`).join(' → ')
  ]
  if (profile.sectionFlowAlt) {
    lines.push('', '대안 흐름:', profile.sectionFlowAlt.map(s => `section--${s}`).join(' → '))
  }
  lines.push(
    '',
    '## 우선 컴포넌트',
    '',
    profile.priorityComponents.map(c => `- ${c}`).join('\n'),
    '',
    `## 밀도 — ${density.label}`,
    '',
    `- section 패딩: PC ${density.sectionPaddingPc} / 모바일 ${density.sectionPaddingMobile}`,
    `- 폼 행 간격: ${density.formRowGap}`,
    `- 표 셀 패딩: ${density.tableCellPadding}`,
    `- ${density.note}`,
    '',
    '## 정부 아이덴티티',
    '',
    identity,
    '',
    '## 주의',
    '',
    profile.note,
    '',
    '간격은 토큰이 아니라 직접값이다. 위 수치는 출발점이며 프로젝트 맥락에서 조정한다.'
  )
  return text(lines.join('\n'))
}

function getWorkflow(name) {
  if (!name) {
    const lines = ['# infoUX 작업 절차', '', '작업을 시작하기 전에 해당 절차를 읽는다.', '']
    for (const item of manifest.workflows) {
      lines.push(`- **${item.id}** — ${item.summary || '(설명 없음)'}`)
    }
    return text(lines.join('\n'))
  }
  const entry = manifest.workflows.find(item => item.id === name)
  if (!entry) return notFound(`절차 "${name}"`, manifest.workflows.map(i => i.id))
  return text(readData('workflows', entry.file))
}

function getReference(name) {
  if (!name) {
    const lines = ['# infoUX 레퍼런스 문서', '']
    for (const item of manifest.references) {
      lines.push(`- **${item.id}** — ${item.summary || '(설명 없음)'}`)
    }
    return text(lines.join('\n'))
  }
  const entry = manifest.references.find(item => item.id === name)
  if (!entry) return notFound(`문서 "${name}"`, manifest.references.map(i => i.id))
  return text(readData('references', entry.file))
}

/** 프리셋 파일에서 라이트 모드 50단계 대표색을 읽는다 — hex 정본은 프리셋이라 값을 복사해 두지 않는다. */
function presetRepresentative(id) {
  const preset = JSON.parse(readData('presets', `${id}.json`))
  const pick = group => preset.primitive.color.light[group]['50'].value
  return {
    primary: pick('primary'),
    secondary: pick('secondary'),
    point: pick('point'),
    pointException: preset.$meta?.preset?.pointException
  }
}

function hangulLines() {
  const h = artDirection.hangul
  return [
    `- word-break: ${h.wordBreak} / 본문 line-height ${h.bodyLineHeight.min}~${h.bodyLineHeight.max}(기본 ${h.bodyLineHeight.default}) / 제목 ${h.headingLineHeight.min}~${h.headingLineHeight.max}`,
    `- 큰 제목(${h.headingLetterSpacing.appliesFromRem}rem+) letter-spacing ${h.headingLetterSpacing.min}~${h.headingLetterSpacing.max} / weight: 본문 ${h.weights.bodyBase} 기본, 제목 ${h.weights.headingMax}은 h1~h2 한정, 화면당 ${h.weights.maxPerScreen}종 이하`
  ]
}

function antiPatternLines() {
  return [
    '- 기계 검출: 가짜 콘텐츠(R-23) · 한글 조판 하한(R-24) · 섹션 리듬(R-25) · 폰트 한글 fallback(R-26)',
    '- 산문 안티패턴 10건·납품 전 리뷰 체크리스트: get_reference("art-direction")',
    '- 메인·랜딩의 자유 생성·바닥 교정·사람 판정 절차: get_reference("design-intelligence")',
    '- 선택 도구(사람이 원할 때만): 평가자 지시문 get_reference("render-critique-evaluator") / 기준 견본 get_reference("exemplars")'
  ]
}

function typographyLines(entry) {
  const lines = [
    `### ${entry.id} — ${entry.label}`,
    `- 제목: ${entry.heading.stack} ${entry.heading.weights.join('/')}, ls ${entry.heading.letterSpacing}, lh ${entry.heading.lineHeight} / 본문: ${entry.body.weights.join('/')}, lh ${entry.body.lineHeight}`,
    `- 라이선스: ${[...new Set(entry.fonts.map(f => f.license.type))].join(', ')} / 셀프호스팅 woff2: assets/fonts/${entry.id}/${entry.fonts.some(f => f.sha256 === '입수 대기') ? ' (입수 대기)' : ''}`,
    '- 적용: brand.json font.family.heading(차등 시) → npm run build:tokens'
  ]
  for (const caution of entry.cautions) {
    lines.push(`- [${caution.severity}] ${caution.text}`)
  }
  return lines
}

function paletteLines(palette) {
  const rep = presetRepresentative(palette.id)
  const lines = [
    `### ${palette.id} — ${palette.label}`,
    `- 대표색: primary 50 ${rep.primary} / secondary 50 ${rep.secondary} / point 50 ${rep.point}`,
    `- 적용: cp tokens/presets/${palette.id}.json tokens/brand.json → npm run build:tokens → npm run check:contrast`
  ]
  if (rep.pointException === 'krds-heritage') {
    lines.push('- [예외] point 크림슨은 krds-heritage 승계 — 위험 액션 버튼 사용 금지, danger 알림 인접 40px 내 배치 금지.')
  }
  return lines
}

function getArtDirection({ profile, expression } = {}) {
  const levels = profileSpec.expressionLevels

  if (expression && !levels[expression]) {
    return notFound(`표현 등급 "${expression}"`, Object.keys(levels))
  }

  if (!profile) {
    const lines = ['# 아트 디렉션 — 전체 색인', '', '프로필을 주면 후보를 걸러 상세로 답한다 — get_art_direction(profile).', '']
    lines.push('## 표현 등급', '')
    for (const [id, level] of Object.entries(levels)) {
      lines.push(`- **${id}** (${level.label}) — ${level.definition}`)
    }
    lines.push('', '프로필 기본값: ' + profileSpec.profiles.map(p => `${p.id}=${p.expression}`).join(', '))
    lines.push('', '## 한글 조판 공통값', '', ...hangulLines())
    lines.push('', '## 타이포 카탈로그', '')
    for (const entry of artDirection.typography) {
      lines.push(`- **${entry.id}** — ${entry.label} (${entry.mood.join('·')}) · 등급 ${entry.expression.join(', ')} · 프로필 ${entry.profiles.join(', ')}`)
    }
    lines.push('', '## 팔레트 프리셋', '')
    for (const palette of artDirection.palettes) {
      const rep = presetRepresentative(palette.id)
      lines.push(`- **${palette.id}** — ${palette.label} · primary 50 ${rep.primary} · 등급 ${palette.expression.join(', ')} · 프로필 ${palette.profiles.join(', ')}`)
    }
    lines.push('', '## 안티패턴 색인', '', ...antiPatternLines())
    return text(lines.join('\n'))
  }

  const p = profileSpec.profiles.find(item => item.id === profile)
  if (!p) return notFound(`사이트 유형 "${profile}"`, profileSpec.profiles.map(item => item.id))

  const effective = expression || p.expression
  const level = levels[effective]
  const map = artDirection.profiles[profile]
  const overridden = effective !== p.expression

  const lines = [`# 아트 디렉션 — ${p.label}`, '']
  lines.push(`## 표현 등급: ${effective} (${level.label})${overridden ? ` — 기본 ${p.expression}에서 덮어씀` : ''}`)
  if (overridden) {
    lines.push('- 덮어쓰기는 Task Contract의 expression 필드와 근거 기록이 전제다. publicIdentity가 required면 상향은 무효(상한 restrained).')
  }
  const signature = level.signature.maxCount === 0
    ? '없음'
    : `최대 ${level.signature.maxCount} — ${level.signature.types.join(', ')}`
  lines.push(`- 모션 예산: ${level.motion.effects.join(', ')} · ${level.motion.durationMs[0]}~${level.motion.durationMs[1]}ms. prefers-reduced-motion 가드 필수(R-22). ${level.motion.note}`)
  lines.push(`- 시그니처 요소: ${signature} / hero: ${level.hero.join('·')} / 제목 폰트: ${level.displayFont} / 레이아웃: ${level.layout}`)
  lines.push(`- ${level.note}`)
  lines.push('- 표현은 trade-off 서열 최하위다 — 접근성·과업 완수와 충돌하면 양보한다. 등급은 상한이지 목표가 아니다.')
  lines.push('- 결제·인증·폼 페이지의 task contract는 utility로 강등해 작성한다.')

  if (map) {
    lines.push('', '## 리듬·카피 톤', '', `- 섹션 리듬: ${map.rhythm}`, `- 카피 톤: ${map.copyTone}`)
  }
  if (copyLexicon) {
    lines.push('- 카피 톤 기계 검출(R-43): 번역투·2인칭 어휘, \'-(으)세요·-십시오\'로 끝나는 버튼, 느낌표(공공서비스 제목·버튼·도입부는 오류). 어휘 전체는 get_rules("R-43").')
  }

  lines.push('', '## 한글 조판 공통값', '', ...hangulLines())

  const typography = artDirection.typography.filter(
    entry => entry.profiles.includes(profile) && entry.expression.includes(effective)
  )
  lines.push('', `## 타이포 후보 (${typography.length})`, '')
  for (const entry of typography) {
    lines.push(...typographyLines(entry), '')
  }

  const palettes = artDirection.palettes.filter(
    palette => palette.profiles.includes(profile) && palette.expression.includes(effective)
  )
  lines.push(`## 팔레트 프리셋 후보 (${palettes.length})`, '')
  for (const palette of palettes) {
    lines.push(...paletteLines(palette))
  }
  lines.push('- 전 프리셋은 대비 검사 전량 통과 상태로 입고된다 — 위반 프리셋은 존재하지 않는다.')

  lines.push('', '## 안티패턴 색인', '', ...antiPatternLines())
  lines.push(
    '',
    '## 이 도구가 다루지 않는 것',
    '',
    `- section 흐름·우선 컴포넌트·밀도 → get_profile("${profile}")`,
    '- 상태 셋 명세 → ui-states / 모션 수치 → interaction-timing·R-22 / 카피 문장 공식 → microcopy'
  )
  return text(lines.join('\n'))
}

// ─── 블록 카탈로그 ─────────────────────────────────────

// 오래된 번들에는 블록이 없다 — 빈 목록으로 답한다
const blockIndex = () => manifest.blocks || []
const blockSetIndex = () => manifest.blockSets || []
const TONE_LABEL = { plain: '바탕 면', tinted: '옅은 색 면', inverse: '짙은 면', scene: '장면·사진 면', overlap: '앞 블록 위에 걸침' }
/** 블록의 면을 한마디로 — 위아래가 다르면 「위 → 아래」로 적는다 */
function surfaceLabel(block) {
  const { tone, top, bottom } = block.surface
  const a = top || tone
  const b = bottom || tone
  return a === b ? TONE_LABEL[tone] : `${TONE_LABEL[a]} → ${TONE_LABEL[b]}`
}
/** 견본 조합 목록 줄 */
function blockSetLines() {
  const sets = blockSetIndex()
  if (sets.length === 0) return []
  const lines = ['## 견본 조합', '', '한 페이지를 이루는 블록 순서의 견본이다. compose_page({ set: "id" })가 그대로 조립한다. 블록을 바꿔 끼우면 순서 점검이 면 흐름을 다시 본다.', '']
  for (const set of sets) {
    lines.push(
      `### ${set.id} — ${set.name}`,
      '',
      `- ${set.summary}`,
      `- 블록 순서: ${set.blocks.join(' → ')}`,
      `- 면 흐름: ${set.flow}`,
      `- 언제 쓰나: ${set.useWhen}`,
      ''
    )
  }
  return lines
}
const slotLabel = id => BLOCK_SLOTS.find(s => s.id === id)?.label || id

function readBlock(id) {
  const entry = blockIndex().find(item => item.id === id)
  return entry ? JSON.parse(readData('blocks', entry.file)) : null
}

/** 필요한 콘텐츠를 한 줄로 — 목록에서 「이 블록을 쓰려면 무엇이 있어야 하나」를 바로 본다 */
function contentSummary(block) {
  return block.content.map(def => {
    if (def.kind === 'list') return `${def.label} ${def.min}~${def.max}개`
    if (def.kind === 'image') return `${def.label}(${def.ratio})`
    return def.label
  }).join(' · ')
}

function listBlocks({ slot, form, tag } = {}) {
  const all = blockIndex()
  if (all.length === 0) return text('블록 카탈로그가 이 번들에 없다. npm run build:mcp로 다시 만든다.')

  if (slot !== undefined && !BLOCK_SLOTS.some(s => s.id === slot)) {
    return notFound(`자리 "${slot}"`, BLOCK_SLOTS.map(s => `${s.id}(${s.label})`))
  }
  const wantedForm = form === undefined ? null : String(form).trim().toUpperCase()
  if (wantedForm !== null && !/^[HQNB][1-9]$/.test(wantedForm)) {
    return fail(`형식 "${form}"은(는) 블록 형식 기호가 아니다. H1~H6(메인 비주얼)·Q1~Q4(자주 찾는 서비스)·N1~N4(공지·소식)·B1~B4(사업 소개) 가운데 하나를 쓴다.`)
  }
  const needle = tag === undefined ? null : String(tag).trim().toLowerCase()

  const found = all.filter(item =>
    (slot === undefined || item.slot === slot) &&
    (wantedForm === null || item.forms.includes(wantedForm)) &&
    (!needle || [item.id, item.name, item.summary, ...item.tags].some(s => s.toLowerCase().includes(needle)))
  )

  const filters = [slot && `자리 ${slot}`, wantedForm && `형식 ${wantedForm}`, needle && `검색어 "${tag}"`].filter(Boolean).join(' · ')
  const lines = ['# infoUX 블록 카탈로그', '']
  lines.push(`${filters ? `${filters} — ` : ''}${found.length}종 (전체 ${all.length}종)`, '')

  if (found.length === 0) {
    lines.push(
      '조건에 맞는 블록이 없다. 조건을 줄여 다시 찾는다 — list_blocks()는 전체를 준다.',
      '맞는 블록이 없으면 프로젝트 블록으로 만든다(get_reference("class-naming") 결정 순서). 카탈로그에 있는 블록의 클래스를 바꿔 지어내지 않는다(R-29).'
    )
    return text(lines.join('\n'))
  }

  for (const item of found) {
    const block = readBlock(item.id)
    const n = block.neighbors
    lines.push(
      `## ${block.id} — ${block.name}`,
      '',
      `- 자리: ${block.slot}(${slotLabel(block.slot)}) · 형식: ${block.forms.join('·') || '기호 없음'} (${block.reference}) · 면: ${surfaceLabel(block)}`,
      `- ${block.summary}`,
      `- 언제 쓰나: ${block.useWhen.join(' / ')}`,
      `- 언제 쓰지 않나: ${block.avoidWhen.join(' / ')}`,
      `- 필요한 콘텐츠: ${contentSummary(block)}`,
      `- 어울리는 이웃: 앞 ${n.before.join('·') || '없음'} / 뒤 ${n.after.join('·') || '없음'}${n.requiresBeforeSlot ? ` — 바로 앞이 ${n.requiresBeforeSlot} 자리 블록이어야 한다` : ''}`,
      ...(block.bundle ? [`- 묶음: ${block.bundle.parts.join(' + ')}를 한 블록으로 준다`] : []),
      ...(block.krdsPending?.length ? [`- **KRDS 기준 밖 — 운영자 승인 대기** ${block.krdsPending.length}건(표제 크기·행간 등). get_block이 항목을 보여 준다`] : []),
      ''
    )
  }
  // 견본 조합은 걸러 낸 블록이 들어 있는 것만 보인다(거르지 않았으면 전부)
  const shownIds = new Set(found.map(item => item.id))
  const setLines = blockSetLines()
  if (setLines.length && blockSetIndex().some(set => set.blocks.some(id => shownIds.has(id)))) lines.push(...setLines)
  lines.push(
    '## 다음 단계',
    '',
    '1. 「언제 쓰지 않나」에 걸리는 블록은 뺀다. 필요한 콘텐츠(사진·실데이터)를 구할 수 없는 블록도 뺀다.',
    '2. get_block(id)로 마크업 틀·스타일·문구 길이·사진 비율을 받는다.',
    '3. compose_page({ blocks: [id, …] })로 공통 틀에 조립하고 순서 점검을 받는다.',
    '4. 자리를 채운 뒤 npm run check를 돌린다.',
    '',
    '블록은 자리마다 하나의 형식을 실물로 준 것이다 — 서브 페이지와 마크업 참고용이다. 메인·랜딩 디자인을 블록 조립으로 정하지 않는다(design-intelligence §1-3).'
  )
  return text(lines.join('\n'))
}

function getBlock(id) {
  const block = readBlock(id)
  if (!block) return notFound(`블록 "${id}"`, blockIndex().map(item => item.id))

  const n = block.neighbors
  const req = block.requires
  const lines = [
    `# ${block.id} — ${block.name}`,
    '',
    block.summary,
    '',
    `- 자리: ${block.slot}(${slotLabel(block.slot)})`,
    `- 형식: ${block.forms.join('·') || '기호 없음'} — ${block.reference}`,
    `- section archetype: section--${block.section.archetype}`,
    `- 면: ${surfaceLabel(block)} — ${block.surface.note}`,
    ...(block.bundle ? ['', '## 묶음', '', `${block.bundle.parts.join(' + ')}를 한 블록으로 준다. ${block.bundle.reason}`] : []),
    ...(block.krdsPending?.length ? ['', '## KRDS 기준 밖 — 운영자 승인 대기', '', '아래 항목은 KRDS 기준과 직접 부딪힌다. 운영자가 승인하기 전에는 발주처에 이 사실을 알리고 쓴다.', '', ...block.krdsPending.map(p => `- ${p}`)] : []),
    '',
    '## 언제 쓰나',
    '',
    ...block.useWhen.map(s => `- ${s}`),
    '',
    '## 언제 쓰지 않나',
    '',
    ...block.avoidWhen.map(s => `- ${s}`),
    '',
    '## 필요한 콘텐츠 (채울 자리)',
    '',
    ...placeholderLines(block),
    '',
    '값은 발주처 자료(Task Contract contentSources)에서만 가져온다. 길이·비율·항목 수가 맞지 않으면 문구를 늘이거나 지어내지 말고 다른 블록을 고른다(R-23).',
    '',
    '## 변형 축',
    '',
    ...(block.variants.length
      ? block.variants.map(v => `- **${v.axis}**${v.options?.length ? ` (${v.options.join(' / ')})` : ''} — ${v.how}`)
      : ['- 없음']),
    '',
    '여기 없는 변형이 필요하면 클래스를 지어내지 않고 프로젝트 블록을 따로 만든다(R-18·R-29).',
    '',
    '## 어울리는 이웃',
    '',
    `- 앞: ${n.before.join(', ') || '없음'}`,
    `- 뒤: ${n.after.join(', ') || '없음'}`,
    ...(n.avoid.length ? [`- 붙여 놓지 않는다: ${n.avoid.join(', ')}`] : []),
    ...(n.requiresBeforeSlot ? [`- 바로 앞이 ${n.requiresBeforeSlot}(${slotLabel(n.requiresBeforeSlot)}) 자리 블록이어야 한다.`] : []),
    ...(n.expectsAfter?.length ? [`- 바로 뒤에 ${n.expectsAfter.join('·')}가 오는 것을 전제로 여백을 잡았다 — 아니면 변형 축대로 고친다.`] : []),
    '',
    '## 접근성 주의',
    '',
    ...block.accessibility.map(s => `- ${s}`),
    '',
    ...(block.exceptions?.length ? [
      '## 블록 예외',
      '',
      '이 블록의 스타일·마크업에 한해 검사기가 통과시키는 규칙 위반이다(contracts/block-exceptions.json). 「파일 + 규칙 + 선택자 + 값」이 모두 맞을 때만 통과하고, 값을 바꾸거나 다른 선택자에 같은 표현을 쓰면 그대로 잡힌다. 프로젝트에서 예외를 넓히지 않는다.',
      '',
      ...block.exceptions.map(e => e.markup
        ? `- ${e.rule} · 마크업 \`${e.markup}\` — ${e.reason}`
        : `- ${e.rule} · \`${e.selector}\` (\`${e.match}\`)${e.krds === 'pending' ? ' · KRDS 기준 밖, 운영자 승인 대기' : ''} — ${e.reason}`),
      ''
    ] : []),
    ...(block.shell ? [
      '## 공통 틀 변형',
      '',
      ...(block.shell.headerClass ? [`- header에 \`${block.shell.headerClass}\` 클래스를 더한다 — compose_page가 넣어 준다.`] : []),
      ...(block.shell.footerClass ? [`- footer에 \`${block.shell.footerClass}\` 클래스를 더한다 — compose_page가 넣어 준다.`] : []),
      ''
    ] : []),
    '## 필요한 것',
    '',
    `- 컴포넌트: ${req.components.join(', ') || '없음'}${req.components.length ? ' — get_component(name)' : ''}`,
    `- 아이콘: ${req.icons.join(', ') || '없음'}${req.icons.length ? ' — 세트에 있다. 스프라이트 경로를 프로젝트에 맞춘다' : ''}`,
    `- 스크립트: ${req.scripts.map(s => `src/js/${s}`).join(', ') || '없음'}`,
    `- 토큰: ${block.tokens.join(', ')}`,
    '',
    '## 마크업 틀',
    '',
    '`{{key}}`는 채울 자리다. `<!-- @each 목록 as 항목 -->` … `<!-- @end -->` 사이는 항목 수만큼 되풀이한다. ' +
      '`{{항목.@n}}`은 항목 번호(1부터), `{{항목.@count}}`·`{{목록.@count}}`는 항목 수, `{{항목.@first:A|B}}`는 첫 항목이면 A, 아니면 B다. compose_page가 이 표기를 풀어 준다.',
    '',
    '```html',
    block.markup.trimEnd(),
    '```',
    '',
    '## 스타일',
    '',
    `infoUX 스타일(src/styles/6-components/)에 들어 있다 — 스타터를 쓰는 프로젝트는 dist/css/style.css에 이미 있다. ` +
      `프로젝트 스타일에 없으면(오래된 스타터) 아래 파일을 그대로 더하고 6-components/index.css에 @import를 등록한다. 값은 토큰과 rem만 쓴다.`,
    '',
    '```css',
    block.css,
    '```',
    '',
    '## 다음 단계',
    '',
    `compose_page({ blocks: [..., "${block.id}", ...] })로 조립한다. 순서 점검이 면 색 연속과 이웃 궁합을 알려 준다.`
  ]
  return text(lines.join('\n'))
}

function composeBlocks({ blocks: given, set, assetBase, title } = {}) {
  let ids = given
  let picker = null
  if (set !== undefined) {
    if (given !== undefined) return fail('compose_page에는 blocks와 set 가운데 하나만 준다. 조합을 고쳐 쓰려면 그 조합의 블록 순서를 blocks로 적는다.')
    picker = blockSetIndex().find(item => item.id === (typeof set === 'string' ? set.trim() : set))
    if (!picker) return notFound(`견본 조합 "${set}"`, blockSetIndex().map(item => item.id))
    ids = picker.blocks
  }
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => typeof id === 'string' && id.trim())) {
    return fail('compose_page에는 blocks(블록 id 배열)나 set(견본 조합 id)이 필요하다. 예: compose_page({ blocks: ["cover", "task-index", "bulletin"] }), compose_page({ set: "scene-showcase" })')
  }
  if (assetBase !== undefined && (typeof assetBase !== 'string' || /["<>\s]/.test(assetBase))) {
    return fail('assetBase는 경로 앞머리 문자열이다. 예: "", "../", "/"')
  }
  const wanted = ids.map(id => id.trim())
  const unknown = wanted.filter(id => !blockIndex().some(item => item.id === id))
  if (unknown.length) return notFound(`블록 ${unknown.map(id => `"${id}"`).join(', ')}`, blockIndex().map(item => item.id))

  const picked = wanted.map(readBlock)
  const shell = {
    boilerplate: readData('snippets', 'boilerplate.md'),
    header: readData('snippets', 'header.md'),
    footer: readData('snippets', 'footer.md')
  }
  const safeTitle = typeof title === 'string' && title.trim() ? title.trim().replace(/[<>]/g, '') : undefined
  const result = composePage(picked, shell, { mode: 'slots', assetBase: assetBase ?? '', title: safeTitle })

  const mark = { error: '오류', warn: '경고', info: '참고' }
  const count = level => result.findings.filter(f => f.level === level).length
  const lines = [`# 조립 결과 — ${wanted.join(' → ')}`, '']
  if (picker) lines.push(`견본 조합 **${picker.id}** — ${picker.name}`, '', `- ${picker.summary}`, `- 면 흐름: ${picker.flow}`, `- 언제 쓰나: ${picker.useWhen}`, '')

  lines.push(`## 순서 점검 (오류 ${count('error')} · 경고 ${count('warn')})`, '')
  for (const f of result.findings) lines.push(`- [${mark[f.level]}] ${f.message}`)
  if (count('error') > 0) lines.push('', '**오류가 있다 — 아래 HTML을 쓰지 말고 블록 순서를 고쳐 다시 조립한다.**')
  lines.push(
    '',
    '면 흐름: ' + picked.map(b => `${b.id}(${surfaceLabel(b)})`).join(' → '),
    '이 점검은 순서만 본다. 색 대비·제목 구조·링크·카피는 npm run check가, 화면의 완성도는 사람이 판정한다.'
  )

  lines.push('', '## 채울 자리', '', '### 공통 틀', '')
  if (!safeTitle) lines.push('- `{{page_title}}` 페이지 제목 — 「기관명」 또는 「페이지 이름 | 기관명」. 자리값 제목을 남기지 않는다(R-23).')
  lines.push(
    '- 헤더: 로고 파일과 기관명, 메인 메뉴 항목과 주소, 통합검색 action. 스니펫의 예시 값(기관명·소개·서비스·공지)을 실제 값으로 바꾼다. 상세 get_component("header")',
    '- 헤더의 전체메뉴 버튼은 id="mobile-menu" 패널을 가리킨다 — get_component("mobile-menu")의 패널을 body 끝에 더한다.',
    '- 푸터: 주소·대표전화·운영시간, 푸터 메뉴, 정책 링크 주소, 저작권 표기. ○○·000-0000은 형식 예시다 — 납품 페이지에 남으면 R-23 오류다. 상세 get_component("footer")',
    '- 공식 배너·운영기관 식별자는 publicIdentity가 required일 때만 더한다(R-46).'
  )
  for (const b of picked.filter(b => b.shell?.headerClass)) lines.push(`- header에 \`${b.shell.headerClass}\`를 더해 두었다(${b.id}) — 흰색 로고 파일을 쓴다. get_block("${b.id}")의 변형 축 「머리글」을 본다.`)
  for (const b of picked.filter(b => b.shell?.footerClass)) lines.push(`- footer에 \`${b.shell.footerClass}\`를 더해 두었다(${b.id}) — 바닥 전환 그림이 이 푸터 색으로 칠해져 있다.`)
  for (const group of result.placeholders) {
    lines.push('', `### ${group.block} — ${group.name}`, '', ...group.lines)
  }
  lines.push(
    '',
    '자리 이름 앞의 말은 블록 id다(`{{cover.title}}`). 목록 자리는 기본 개수만큼 펼쳐 번호를 붙였다(`{{task-index.tasks.1.label}}`). 항목 수를 바꾸려면 범위 안에서 줄을 통째로 더하거나 뺀다.',
    '탭처럼 id가 짝지어진 항목은 번호(aria-controls·id·aria-labelledby)를 함께 맞춘다.'
  )

  const pending = picked.filter(b => b.krdsPending?.length)
  if (pending.length) {
    lines.push('', '## KRDS 기준 밖 — 운영자 승인 대기', '', '이 조합에는 KRDS 기준과 직접 부딪히는 항목이 있다. 운영자가 승인하기 전에는 발주처에 이 사실을 알리고 쓴다.', '')
    for (const b of pending) for (const p of b.krdsPending) lines.push(`- ${b.id}: ${p}`)
  }
  const excepted = picked.flatMap(b => (b.exceptions || []).map(e => ({ ...e, block: b.id })))
  if (excepted.length) {
    lines.push('', '## 블록 예외', '', `등록된 예외 ${excepted.length}건이 검사에서 통과한다(contracts/block-exceptions.json — npm run check 출력에 적용 건수가 나온다). 블록 CSS의 값을 고치거나 같은 표현을 다른 곳에 쓰면 그대로 잡힌다.`, '')
    for (const e of excepted) lines.push(`- ${e.block} · ${e.rule} · ${e.markup ? `마크업 ${e.markup}` : e.selector}`)
  }

  lines.push('', '## 필요한 것', '')
  lines.push(`- 스크립트: ${result.scripts.length ? result.scripts.map(s => `src/js/${s}`).join(', ') + ' — 틀 끝에 넣어 두었다' : '없음'}`)
  lines.push('- 스타일: 블록 CSS는 infoUX 스타일에 들어 있다. 프로젝트 스타일에 없으면 get_block(id)의 스타일을 더한다.')
  lines.push(`- 컴포넌트: ${[...new Set(picked.flatMap(b => b.requires.components))].join(', ') || '없음'}`)

  lines.push('', '## 완성 HTML', '', '```html', result.html.trimEnd(), '```')

  lines.push(
    '',
    '## 다음 단계',
    '',
    '1. `{{…}}` 자리를 발주처 자료로 채운다. 구조·클래스·제목 단계는 고치지 않는다. 채울 자료가 없는 자리가 있으면 사용자에게 묻는다.',
    '2. 변형이 필요하면 get_block(id)의 변형 축 안에서만 고친다.',
    '3. 블록의 사진 자리는 프로젝트 자산으로 채우고, 능선처럼 견본에서 온 모양은 대상의 선으로 바꾼다(get_block의 변형 축).',
    '4. npm run check로 규칙 검사를 통과시킨다.',
    '5. 메인·랜딩이면 블록 조립은 참고일 뿐이다 — 자유 생성한 디자인에 바닥 교정만 하고 사람 판정을 받는다(get_reference("design-intelligence") §1).'
  )
  return text(lines.join('\n'))
}

function searchDocs(query) {
  // 빈 문자열은 모든 줄에 걸린다 — 문서 전체가 「검색 결과」로 돌아오지 않게 먼저 막는다
  const needle = typeof query === 'string' ? query.trim().toLowerCase() : ''
  if (!needle) return fail('search_docs에는 찾을 문자열(query)이 필요하다. 예: search_docs("포커스"), search_docs("border-left")')

  const hits = []
  const scanBody = (kind, id, getter, body) => {
    const matched = body.split('\n')
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line.toLowerCase().includes(needle))
    if (matched.length > 0) hits.push({ kind, id, getter, count: matched.length, samples: matched.slice(0, 3) })
  }
  const scan = (kind, dir, items, getter) => {
    for (const item of items) scanBody(kind, item.id, `${getter}("${item.id}")`, readData(dir, item.file))
  }

  // 작업 컨트랙트·사이트 유형 프리셋·아트 디렉션도 본다 — 예전에는 이 셋이 검색에서 빠져 「결과 없음」으로 답했다
  scanBody('contract', 'contract', 'get_contract()', readData('contract.md'))
  scan('reference', 'references', manifest.references, 'get_reference')
  scan('workflow', 'workflows', manifest.workflows, 'get_workflow')
  scan('component', 'snippets', manifest.snippets, 'get_component')
  // 블록은 메타데이터와 마크업 틀만 훑는다 — 스타일까지 훑으면 토큰 이름마다 모든 블록이 걸린다
  for (const item of blockIndex()) {
    const { css: _css, tokens: _tokens, ...meta } = readBlock(item.id)
    scanBody('block', item.id, `get_block("${item.id}")`, JSON.stringify(meta, null, 2).replace(/\\n/g, '\n'))
  }
  scanBody('profile', 'profiles', 'get_profile()', JSON.stringify(profileSpec, null, 2))
  scanBody('art-direction', 'art-direction', 'get_art_direction()', JSON.stringify(artDirection, null, 2))

  const ruleHits = rules.rules.filter(rule =>
    JSON.stringify(rule).toLowerCase().includes(needle)
  )

  if (hits.length === 0 && ruleHits.length === 0) {
    return text(`"${query.trim()}" 검색 결과 없음. 다른 말(동의어·영문 클래스 이름·규칙 번호)로 다시 찾는다.`)
  }

  const lines = [`# 검색 — "${query.trim()}"`, '']
  if (ruleHits.length) {
    lines.push(`## 규칙 ${ruleHits.length}건`, '')
    for (const rule of ruleHits) lines.push(`- ${rule.id} — ${rule.summary} (get_rules로 상세 조회)`)
    lines.push('')
  }
  for (const hit of hits) {
    lines.push(`## ${hit.id} (${hit.kind}, ${hit.count}건) — ${hit.getter}`)
    for (const sample of hit.samples) lines.push(`  ${sample.index + 1}: ${sample.line.length > 200 ? `${sample.line.slice(0, 197)}...` : sample.line}`)
    lines.push('')
  }
  return text(lines.join('\n'))
}

// ─────────────────────────────────────────────────────
// 도구 호출 — 서버 핸들러와 단위 테스트가 같은 함수를 쓴다
// ─────────────────────────────────────────────────────

/** 이름을 받는 도구에 문자열이 아닌 값이 오면(누락·숫자·객체) 조용히 undefined로 찾지 않는다 */
function requireName(tool, value, example) {
  if (typeof value === 'string' && value.trim()) return null
  return fail(`${tool}에는 name이 필요하다. 예: ${tool}("${example}")`)
}

function requireId(tool, value, example) {
  if (typeof value === 'string' && value.trim()) return null
  return fail(`${tool}에는 id가 필요하다. 예: ${tool}("${example}")`)
}

function callTool(name, args = {}) {
  try {
    switch (name) {
      case 'get_contract':
        return text(readData('contract.md'))
      case 'list_components':
        return listComponents()
      case 'get_component':
        return requireName('get_component', args.name, 'btn') || getComponent(args.name.trim())
      case 'list_icons':
        return listIcons(args)
      case 'get_icon':
        return requireName('get_icon', args.name, 'search') || getIcon(args.name.trim())
      case 'get_tokens':
        return getTokens(args)
      case 'get_rules':
        return getRules(args)
      case 'get_reference':
        return getReference(args.name)
      case 'get_workflow':
        return getWorkflow(args.name)
      case 'get_profile':
        return getProfile(args.name)
      case 'get_art_direction':
        return getArtDirection(args)
      case 'list_blocks':
        return listBlocks(args)
      case 'get_block':
        return requireId('get_block', args.id, 'cover') || getBlock(args.id.trim())
      case 'compose_page':
        return composeBlocks(args)
      case 'search_docs':
        return searchDocs(args.query)
      default:
        return fail(`알 수 없는 도구: ${name}`)
    }
  } catch (error) {
    return fail(`도구 실행 실패 (${name}): ${error.message}`)
  }
}

// ─────────────────────────────────────────────────────
// 서버 기동
// ─────────────────────────────────────────────────────

async function main() {
  const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
  const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js')

  const server = new Server(
    { name: 'infoux', version: require('../package.json').version },
    { capabilities: { tools: {} }, instructions: INSTRUCTIONS }
  )
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params
    return callTool(name, args || {})
  })

  await server.connect(new StdioServerTransport())
  // stdout은 프로토콜 채널이다. 로그는 stderr로만 낸다.
  console.error(`infoUX MCP 준비됨 — 기준 ${manifest.version}, 도구 ${TOOLS.length}종`)
}

module.exports = { TOOLS, INSTRUCTIONS, callTool, normalizeSeverity }

// 단위 테스트가 require로 불러 쓸 수 있게 직접 실행할 때만 서버를 띄운다
if (require.main === module) {
  main().catch(error => {
    console.error(`infoUX MCP 기동 실패: ${error.message}`)
    process.exit(1)
  })
}
