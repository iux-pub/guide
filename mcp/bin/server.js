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

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const {
  CallToolRequestSchema,
  ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js')

const DATA_DIR = path.resolve(__dirname, '..', 'data')

function readData(...segments) {
  return fs.readFileSync(path.join(DATA_DIR, ...segments), 'utf8')
}

const manifest = JSON.parse(readData('manifest.json'))
const rules = JSON.parse(readData('rules.json'))
const profileSpec = JSON.parse(readData('profiles.json'))
const artDirection = JSON.parse(readData('art-direction.json'))

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
4. 아이콘도 카탈로그에서 가져온다. list_icons → get_icon 순으로 확인한다.
   **아이콘 이름을 지어내지 않는다** — 목록에 없는 이름을 쓰면 화면에 아무것도 안 나온다.
   필요한 아이콘이 없으면 UX팀에 요청한다 (R-27). 장식용은 aria-hidden, 의미를 담으면
   role="img"+aria-label을 붙인다.
5. 규칙 R-01~R-27을 지킨다. get_rules로 확인한다. BEM, 접근성, 금지 패턴이 여기 있다.
6. 간격·크기·타이포 스케일·반경·모션은 토큰이 아니라 CSS/Tailwind 직접값으로 쓴다.
7. 원칙이 충돌하면 get_reference("trade-off-rules")의 우선순위를 따른다. 접근성이 1순위다.
   화면을 마무리했으면 get_reference("release-checklist")로 점검한다 — 접근성·과업 흐름·품질은
   100% 통과가 조건이다.

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
      '쓸 수 있는 아이콘 목록을 반환한다. 아이콘이 필요하면 **반드시 먼저 확인한다** — ' +
      '목록에 없는 이름을 지어내면 화면에 아무것도 안 나온다. query로 걸러 낼 수 있다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '이름·분류 필터 (예: arrow, 폼, calendar)' }
      }
    }
  },
  {
    name: 'get_icon',
    description:
      '아이콘 하나의 마크업과 접근성 요건을 반환한다. 장식용인지 의미를 담는지에 따라 ' +
      'aria 처리가 달라지므로 그대로 복사해 쓴다.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '아이콘 이름 (예: search, chevron-right, calendar)' }
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
      'infoUX 코딩 규칙 R-01~R-22를 반환한다. CSS·BEM·HTML·접근성 규칙과 위반 예시가 들어 있다.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '규칙 ID 단건 조회 (예: R-12)' },
        category: { type: 'string', description: '분류로 필터' },
        severity: { type: 'string', description: 'error / warn / info' }
      }
    }
  },
  {
    name: 'get_reference',
    description:
      '레퍼런스 문서를 반환한다. name 없이 부르면 목록을 준다. ' +
      '접근성 기준, 금지 패턴, Tailwind 매핑, HTML 시맨틱, 사이트 유형 프로필 등이 있다.',
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
    name: 'search_docs',
    description:
      'infoUX 문서 전체(레퍼런스·스니펫·규칙)에서 문자열을 찾는다. 어느 문서를 봐야 할지 모를 때 먼저 쓴다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '찾을 문자열' }
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

function notFound(what, available) {
  return text(`${what}을(를) 찾을 수 없다.\n\n사용 가능: ${available.join(', ')}`)
}

function listComponents() {
  const lines = ['# infoUX 컴포넌트 카탈로그', '']
  lines.push(`총 ${manifest.snippets.length}종. get_component(name)으로 마크업을 가져온다.`, '')
  for (const item of manifest.snippets) {
    lines.push(`- **${item.id}** — ${item.summary || '(설명 없음)'}`)
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

function listIcons({ query } = {}) {
  const ledger = loadIconLedger()
  if (!ledger) return text('아이콘 카탈로그가 이 번들에 없다. npm run build:mcp로 다시 만든다.')

  const all = Object.entries(ledger.icons).map(([name, meta]) => ({ name, ...meta }))
  const needle = query ? String(query).toLowerCase() : null
  const rows = needle
    ? all.filter(i => i.name.includes(needle) || (i.category || '').includes(needle) || (i.label || '').includes(needle))
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

  const lines = ['# infoUX 아이콘 카탈로그', '']
  lines.push(query ? `"${query}" 검색 — ${rows.length}종` : `총 ${rows.length}종.`, '')
  for (const [cat, names] of byCat) {
    lines.push(`- **${cat}** — ${names.join(', ')}`)
  }
  lines.push(
    '',
    'get_icon(name)으로 마크업을 가져온다.',
    '**목록에 없는 이름을 쓰지 않는다** — 화면에 아무것도 안 나온다. 필요하면 UX팀에 요청한다 (R-27).'
  )
  return text(lines.join('\n'))
}

function getIcon(name) {
  const ledger = loadIconLedger()
  if (!ledger) return text('아이콘 카탈로그가 이 번들에 없다. npm run build:mcp로 다시 만든다.')

  const meta = ledger.icons[name]
  if (!meta) {
    const near = Object.keys(ledger.icons).filter(n => n.includes(String(name).split('-')[0])).slice(0, 8)
    return notFound(`아이콘 "${name}"`, near.length > 0 ? near : Object.keys(ledger.icons).slice(0, 12))
  }

  const lines = [
    `# ${name}`,
    '',
    `분류 ${meta.category} · 출처 ${meta.source} · 코드포인트 ${meta.codepoint}`,
    '',
    '## 장식용 — 옆에 텍스트가 있어 아이콘이 의미를 더하지 않을 때',
    '',
    '```html',
    `<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#${name}"></use></svg>`,
    '```',
    '',
    '## 의미를 담을 때 — 아이콘만으로 기능을 나타낸다',
    '',
    '```html',
    `<svg class="icon" role="img" aria-label="설명"><use href="/assets/icons/sprite.svg#${name}"></use></svg>`,
    '```',
    '',
    '## 크기',
    '',
    '`.icon`(24) · `.icon--xsmall`(16) · `.icon--small`(20) · `.icon--large`(32) · `.icon--inherit`(1em)',
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
  if (!query) return text(body)

  const needle = query.toLowerCase()
  const matched = body.split('\n').filter(line => line.toLowerCase().includes(needle))
  if (matched.length === 0) {
    return text(`"${query}"에 해당하는 토큰이 없다. 토큰명을 지어내지 말고 get_tokens()로 전체 목록을 확인한다.`)
  }
  return text([`# 토큰 검색 — "${query}" (${matched.length}건)`, '', ...matched].join('\n'))
}

function getRules({ id, category, severity } = {}) {
  let found = rules.rules

  if (id) {
    const wanted = id.toUpperCase()
    found = found.filter(rule => rule.id.toUpperCase() === wanted)
    if (found.length === 0) return notFound(`규칙 "${id}"`, rules.rules.map(r => r.id))
  }
  if (category) found = found.filter(rule => rule.category === category)
  if (severity) found = found.filter(rule => rule.severity === severity)

  const lines = [`# infoUX 규칙 (${found.length}건)`, '']
  for (const rule of found) {
    lines.push(`## ${rule.id} — ${rule.summary}`)
    lines.push(`- 심각도: ${rule.severity} / 분류: ${rule.category}`)
    if (rule.enforcement?.length) lines.push(`- 검사: ${rule.enforcement.join(', ')}`)
    if (rule.rationale) lines.push(`- 이유: ${rule.rationale}`)
    if (rule.bad) lines.push('', '위반:', '```', String(rule.bad), '```')
    if (rule.good) lines.push('', '준수:', '```', String(rule.good), '```')
    lines.push('')
  }
  return text(lines.join('\n'))
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
    '- 산문 안티패턴 10건·납품 전 리뷰 체크리스트: get_reference("art-direction")'
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

function searchDocs(query) {
  const needle = query.toLowerCase()
  const hits = []

  const scan = (kind, dir, items) => {
    for (const item of items) {
      const body = readData(dir, item.file)
      const lines = body.split('\n')
      const matched = lines
        .map((line, index) => ({ line: line.trim(), index }))
        .filter(({ line }) => line.toLowerCase().includes(needle))
      if (matched.length === 0) continue
      hits.push({ kind, id: item.id, count: matched.length, samples: matched.slice(0, 3) })
    }
  }

  scan('reference', 'references', manifest.references)
  scan('workflow', 'workflows', manifest.workflows)
  scan('component', 'snippets', manifest.snippets)

  const ruleHits = rules.rules.filter(rule =>
    JSON.stringify(rule).toLowerCase().includes(needle)
  )

  if (hits.length === 0 && ruleHits.length === 0) {
    return text(`"${query}" 검색 결과 없음.`)
  }

  const lines = [`# 검색 — "${query}"`, '']
  if (ruleHits.length) {
    lines.push(`## 규칙 ${ruleHits.length}건`, '')
    for (const rule of ruleHits) lines.push(`- ${rule.id} — ${rule.summary} (get_rules로 상세 조회)`)
    lines.push('')
  }
  for (const hit of hits) {
    const getter =
      hit.kind === 'reference' ? 'get_reference' : hit.kind === 'workflow' ? 'get_workflow' : 'get_component'
    lines.push(`## ${hit.id} (${hit.kind}, ${hit.count}건) — ${getter}("${hit.id}")`)
    for (const sample of hit.samples) lines.push(`  ${sample.index + 1}: ${sample.line}`)
    lines.push('')
  }
  return text(lines.join('\n'))
}

// ─────────────────────────────────────────────────────
// 서버 기동
// ─────────────────────────────────────────────────────

const server = new Server(
  { name: 'infoux', version: require('../package.json').version },
  { capabilities: { tools: {} }, instructions: INSTRUCTIONS }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args = {} } = request.params

  try {
    switch (name) {
      case 'get_contract':
        return text(readData('contract.md'))
      case 'list_components':
        return listComponents()
      case 'get_component':
        return getComponent(args.name)
      case 'list_icons':
        return listIcons(args)
      case 'get_icon':
        return getIcon(args.name)
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
      case 'search_docs':
        return searchDocs(args.query)
      default:
        return { ...text(`알 수 없는 도구: ${name}`), isError: true }
    }
  } catch (error) {
    return { ...text(`도구 실행 실패 (${name}): ${error.message}`), isError: true }
  }
})

async function main() {
  await server.connect(new StdioServerTransport())
  // stdout은 프로토콜 채널이다. 로그는 stderr로만 낸다.
  console.error(`infoUX MCP 준비됨 — 빌드 ${manifest.version}, 도구 ${TOOLS.length}종`)
}

main().catch(error => {
  console.error(`infoUX MCP 기동 실패: ${error.message}`)
  process.exit(1)
})
