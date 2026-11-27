// MCP 블록 도구 — list_blocks(찾기) · get_block(가져오기) · compose_page(조립 + 순서 점검).
// 서버는 번들(mcp/data)만 읽는다. 번들이 정본과 같은지는 blocks.test.js가 본다.

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { callTool, TOOLS, INSTRUCTIONS } = require('../../mcp/bin/server.js')

const body = result => result.content[0].text
const blockIds = result => [...body(result).matchAll(/^## ([a-z][a-z0-9-]*) — /gm)].map(m => m[1])
const ALL = ['bulletin', 'cover', 'field-accordion', 'field-list', 'field-shore', 'link-lines', 'link-rows', 'logo-row', 'news-deck', 'notice-board', 'open-panel', 'partner-row', 'photo-gate', 'scene', 'service-gate', 'task-index']

test('도구 세 개가 등록돼 있고 설명문이 다음 단계를 말한다', () => {
  const tool = name => TOOLS.find(t => t.name === name)
  for (const name of ['list_blocks', 'get_block', 'compose_page']) assert.ok(tool(name), `${name} 도구가 없다`)

  assert.match(tool('list_blocks').description, /다음 단계: .*get_block.*compose_page/)
  assert.match(tool('get_block').description, /다음 단계: .*compose_page/)
  assert.match(tool('compose_page').description, /다음 단계: .*npm run check.*사람 판정/)
  assert.deepEqual(tool('get_block').inputSchema.required, ['id'])
  assert.ok(tool('compose_page').inputSchema.properties.set, 'compose_page는 견본 조합 id(set)도 받는다')
  // 자리 허용값은 설명에 나온다 — 에이전트가 값을 지어내지 않게
  assert.match(tool('list_blocks').inputSchema.properties.slot.description, /first-screen\(첫 화면\)/)
})

test('서버 지시문의 메인·랜딩 절차는 자유 생성 뒤 바닥 교정이고, 블록 카탈로그는 참고용이다', () => {
  const item8 = INSTRUCTIONS.slice(INSTRUCTIONS.indexOf('8. 메인·랜딩'), INSTRUCTIONS.indexOf('\n9. '))
  assert.match(item8, /자유롭게 디자인/)
  assert.match(item8, /블록 카탈로그[\s\S]*참고용/)
  assert.match(item8, /바닥만 교정[\s\S]*npm run check/)
  assert.match(item8, /사람 판정 「승인」/)
  assert.doesNotMatch(item8, /블록 카탈로그를 먼저 본다|별도 평가자/)
})

test('list_blocks — 인자 없이 전체, 결과마다 설명·언제 쓰나·쓰지 않나·필요 콘텐츠를 준다', () => {
  const result = callTool('list_blocks', {})
  assert.notEqual(result.isError, true)
  assert.deepEqual(blockIds(result).sort(), ALL)

  const text = body(result)
  for (const id of ALL) {
    const part = text.slice(text.indexOf(`## ${id} — `))
    const section = part.slice(0, part.indexOf('\n## ', 3))
    for (const label of ['- 자리: ', '- 언제 쓰나: ', '- 언제 쓰지 않나: ', '- 필요한 콘텐츠: ', '- 어울리는 이웃: ']) {
      assert.ok(section.includes(label), `${id}에 "${label}" 줄이 없다`)
    }
  }
  assert.match(text, /## 다음 단계[\s\S]*get_block\(id\)[\s\S]*compose_page/)
  assert.match(text, /바로가기 항목 3~9개/)
})

test('list_blocks — 자리·형식·검색어로 거른다', () => {
  assert.deepEqual(blockIds(callTool('list_blocks', { slot: 'first-screen' })), ['cover', 'photo-gate', 'scene', 'service-gate'])
  assert.deepEqual(blockIds(callTool('list_blocks', { slot: 'news' })), ['bulletin', 'news-deck', 'notice-board'])
  assert.deepEqual(blockIds(callTool('list_blocks', { form: 'q1' })), ['task-index'])
  assert.deepEqual(blockIds(callTool('list_blocks', { form: 'h5' })), ['scene'])
  assert.deepEqual(blockIds(callTool('list_blocks', { form: 'h7' })), ['photo-gate'])
  assert.deepEqual(blockIds(callTool('list_blocks', { form: 'N1' })), ['bulletin', 'news-deck'])
  assert.deepEqual(blockIds(callTool('list_blocks', { tag: '로고' })), ['logo-row', 'partner-row'])
  assert.deepEqual(blockIds(callTool('list_blocks', { tag: '짙은 면' })).sort(), ['cover', 'field-shore', 'link-rows', 'news-deck'])
  assert.deepEqual(blockIds(callTool('list_blocks', { slot: 'link-group', tag: '줄 목록' })), ['link-rows'])

  // 조건에 맞는 것이 없으면 오류가 아니라 다음 행동을 알려 준다
  const none = callTool('list_blocks', { form: 'H2' })
  assert.notEqual(none.isError, true)
  assert.deepEqual(blockIds(none), [])
  assert.match(body(none), /조건에 맞는 블록이 없다[\s\S]*프로젝트 블록/)
})

test('list_blocks — 허용값이 아닌 자리·형식은 isError로 알린다', () => {
  const badSlot = callTool('list_blocks', { slot: 'hero' })
  assert.equal(badSlot.isError, true)
  assert.match(body(badSlot), /first-screen\(첫 화면\)/)

  const badForm = callTool('list_blocks', { form: 'X1' })
  assert.equal(badForm.isError, true)
  assert.match(body(badForm), /H1~H6/)
})

test('get_block — 메타데이터·마크업 틀·스타일을 모두 준다', () => {
  const result = callTool('get_block', { id: 'bulletin' })
  assert.notEqual(result.isError, true)
  const text = body(result)

  for (const heading of ['## 언제 쓰나', '## 언제 쓰지 않나', '## 필요한 콘텐츠', '## 변형 축', '## 어울리는 이웃', '## 접근성 주의', '## 필요한 것', '## 마크업 틀', '## 스타일', '## 다음 단계']) {
    assert.ok(text.includes(heading), `${heading} 절이 없다`)
  }
  // 마크업 틀 — 자리와 반복 표기가 그대로 있다
  assert.match(text, /```html\n<section class="section section--notice" aria-labelledby="bulletin-title">/)
  assert.match(text, /<!-- @each boards as board -->/)
  assert.match(text, /\{\{post\.title\}\}/)
  // 스타일 — 블록이 쓰는 파일이 모두 들어 있다
  for (const file of ['bulletin.css', 'deadline.css', 'post-list.css', 'more-link.css']) {
    assert.ok(text.includes(`/* src/styles/6-components/${file} */`), `${file}이 스타일에 없다`)
  }
  assert.match(text, /\.deadline__count \{/)
  // 필요한 것
  assert.match(text, /- 컴포넌트: tab, icon/)
  assert.match(text, /- 스크립트: src\/js\/tab\.js/)
  assert.match(text, /- 토큰: .*--color-point-50/)
  // 항목 수 범위와 형식
  assert.match(text, /게시판\(탭\) \(2~4개/)
  assert.match(text, /형식: N2·N1/)
})

test('get_block — 걸침 전제와 사진 비율을 알려 준다', () => {
  assert.match(body(callTool('get_block', { id: 'task-index' })), /바로 앞이 first-screen\(첫 화면\) 자리 블록이어야 한다/)
  const cover = body(callTool('get_block', { id: 'cover' }))
  assert.match(cover, /`\{\{photo_src\}\}` 첫 화면 사진 \(image\) — 비율 /)
  assert.match(cover, /--cover-overlap: 0rem/)
})

test('get_block — 없는 id·빠진 id는 isError로 쓸 수 있는 id를 준다', () => {
  for (const args of [{ id: 'hero-split' }, {}, { id: 42 }, { id: '  ' }]) {
    const result = callTool('get_block', args)
    assert.equal(result.isError, true, JSON.stringify(args))
  }
  assert.match(body(callTool('get_block', { id: 'hero-split' })), /cover, field-accordion, field-list/)
})

test('compose_page — 완성 HTML, 채울 자리 목록, 순서 점검을 함께 준다', () => {
  const result = callTool('compose_page', { blocks: ['cover', 'task-index', 'bulletin', 'field-list', 'link-rows', 'partner-row'] })
  assert.notEqual(result.isError, true)
  const text = body(result)

  assert.match(text, /^# 조립 결과 — cover → task-index → bulletin → field-list → link-rows → partner-row/)
  assert.match(text, /## 순서 점검 \(오류 0 · 경고 0\)/)
  assert.match(text, /면 흐름: cover\(짙은 면\) → task-index\(앞 블록 위에 걸침\) → bulletin\(바탕 면\) → field-list\(옅은 색 면\) → link-rows\(짙은 면\) → partner-row\(바탕 면\)/)

  assert.match(text, /## 채울 자리\n\n### 공통 틀/)
  for (const id of ['cover', 'task-index', 'bulletin', 'field-list', 'link-rows', 'partner-row']) assert.ok(text.includes(`### ${id} — `), `${id}의 채울 자리가 없다`)
  assert.match(text, /`\{\{cover\.title\}\}` 표제 \(text\) — 한글 8~14자/)
  assert.match(text, /`\{\{field-list\.photo_src\}\}` 대표 사진 \(image\) — 비율 /)
  assert.match(text, /`\{\{partner-row\.partners\.N\.…\}\}` 기관 \(3~7개, 틀에는 5개\)/)

  const html = text.slice(text.indexOf('```html\n') + 8, text.lastIndexOf('\n```'))
  assert.match(html, /^<!DOCTYPE html>/)
  assert.match(html, /class="skip-to-content"/)
  assert.match(html, /<header id="header" class="site-header">[\s\S]*role="search"/, '헤더 스니펫(통합검색 포함)이 끼워졌다')
  assert.match(html, /<footer id="footer" class="site-footer">[\s\S]*site-footer__link--important[^>]*>개인정보 처리방침/)
  assert.equal((html.match(/<section\b/g) || []).length, 6)
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.match(html, /\{\{link-rows\.groups\.3\.links\.3\.href\}\}/)
  assert.match(html, /<script src="src\/js\/tab\.js"><\/script>/)
  assert.match(html, /href="dist\/css\/style\.css"/)

  assert.match(text, /## 다음 단계[\s\S]*npm run check[\s\S]*사람 판정/)
})

test('compose_page — 순서 문제를 오류·경고로 돌려준다', () => {
  // 첫 화면 블록 없음 + 걸치는 판의 앞이 첫 화면이 아님
  const noCover = body(callTool('compose_page', { blocks: ['task-index', 'bulletin'] }))
  assert.match(noCover, /\[경고\] 첫 화면 블록\(slot first-screen\)이 없다/)
  assert.match(noCover, /\[오류\] task-index는 앞 블록 위에 걸쳐 올라간다/)
  assert.match(noCover, /오류가 있다 — 아래 HTML을 쓰지 말고/)

  // 같은 면 색 연속
  const sameTone = body(callTool('compose_page', { blocks: ['cover', 'task-index', 'link-rows'] }))
  assert.match(sameTone, /\[경고\] cover → link-rows: 짙은 면이 이어진다/)

  // 이웃 전제 — cover 뒤에 걸치는 판이 없다
  const bare = body(callTool('compose_page', { blocks: ['cover', 'bulletin'] }))
  assert.match(bare, /\[경고\] cover는 바로 뒤에 task-index가 오는 것을 전제로 여백을 잡았다/)

  // 첫 화면 블록이 맨 앞이 아니다
  assert.match(body(callTool('compose_page', { blocks: ['bulletin', 'cover', 'task-index'] })), /\[오류\] 첫 화면 블록 cover가 맨 앞이 아니다/)
})

test('compose_page — title·assetBase를 받는다', () => {
  const text = body(callTool('compose_page', { blocks: ['partner-row'], title: '항구도시 문화재단', assetBase: '../' }))
  assert.match(text, /<title>항구도시 문화재단<\/title>/)
  assert.doesNotMatch(text, /\{\{page_title\}\}/)
  assert.match(text, /href="\.\.\/dist\/css\/style\.css"/)
  assert.match(text, /- 스크립트: 없음/)
})

test('compose_page — 잘못된 입력은 isError다', () => {
  for (const args of [
    {},
    { blocks: [] },
    { blocks: 'cover' },
    { blocks: ['cover', 7] },
    { blocks: ['cover', 'no-such-block'] },
    { blocks: ['cover'], assetBase: '"><script>' }
  ]) {
    const result = callTool('compose_page', args)
    assert.equal(result.isError, true, JSON.stringify(args))
  }
  assert.match(body(callTool('compose_page', { blocks: ['cover', 'no-such-block'] })), /"no-such-block"[\s\S]*사용 가능: bulletin, cover/)
})

test('list_blocks — 견본 조합을 이름·블록 순서·면 흐름과 함께 준다', () => {
  const text = body(callTool('list_blocks', {}))
  assert.match(text, /## 견본 조합/)
  assert.match(text, /### scene-showcase — 장면형 첫 화면으로 시작하는 쇼케이스\n\n- [^\n]+\n- 블록 순서: scene → news-deck → field-shore → link-lines → logo-row\n- 면 흐름: 장면\(사진 \+ 스크림\) → 각진 능선 → 짙은 면/)
  assert.match(text, /### split-cover — [^\n]+\n\n- [^\n]+\n- 블록 순서: cover → task-index → bulletin → field-list → link-rows → partner-row/)
  // 쇼케이스 블록에는 묶음과 KRDS 표시가 붙는다
  const scene = text.slice(text.indexOf('## scene — '), text.indexOf('\n## ', text.indexOf('## scene — ') + 3))
  assert.match(scene, /- 묶음: scene \+ scene-header \+ float-panel \+ quick-row \+ ridge/)
  assert.match(scene, /KRDS 기준 밖 — 운영자 승인 대기/)
  assert.match(scene, /면: 장면·사진 면 → 짙은 면/)
  // 걸러 낸 블록과 상관없는 조합만 남으면 조합 절을 싣지 않는다
  assert.doesNotMatch(body(callTool('list_blocks', { form: 'H2' })), /## 견본 조합/)
})

test('get_block — 묶음 이유, 블록 예외, KRDS 기준 밖 항목, 틀 변형, 캔버스 약속을 보여 준다', () => {
  const text = body(callTool('get_block', { id: 'scene' }))
  for (const heading of ['## 묶음', '## KRDS 기준 밖 — 운영자 승인 대기', '## 블록 예외', '## 공통 틀 변형']) assert.ok(text.includes(heading), heading)
  assert.match(text, /- R-35 · `\.scene-header \.site-header__search` \(`rounded-\[99rem\]`\) — /)
  assert.match(text, /- R-24 · `\.scene__title` \(`line-height: 1\.12`\) · KRDS 기준 밖, 운영자 승인 대기/)
  assert.match(text, /- R-27 · 마크업 `svg\.ridge`/)
  assert.match(text, /표제 크기 clamp\(4\.4rem, 7\.6vw, 12rem\)/)
  assert.match(text, /header에 `scene-header` 클래스를 더한다/)
  // 캔버스 장면은 자리와 약속만 준다 — 그리는 코드와 외부 CDN은 없다
  assert.match(text, /data-scene="ready"/)
  assert.match(text, /<canvas class="scene__canvas" aria-hidden="true"><\/canvas>/)
  assert.doesNotMatch(text, /cdn\.jsdelivr|unpkg\.com|three\.module/)
  // 능선은 그대로 쓰지 않는다
  assert.match(text, /이 모양을 그대로 쓰지 않는다/)
  assert.match(text, /viewBox는 0 0 1440 100/)
  // 견본은 통과 판정을 받지 못했다
  assert.doesNotMatch(text, /운영자 승인 (?:쇼케이스|견본)/)
})

test('compose_page — 견본 조합 id로 조립한다', () => {
  const result = callTool('compose_page', { set: 'scene-showcase' })
  assert.notEqual(result.isError, true)
  const text = body(result)
  assert.match(text, /^# 조립 결과 — scene → news-deck → field-shore → link-lines → logo-row/)
  assert.match(text, /견본 조합 \*\*scene-showcase\*\* — 장면형 첫 화면으로 시작하는 쇼케이스/)
  assert.match(text, /## 순서 점검 \(오류 0 · 경고 0\)/)
  assert.match(text, /\[참고\] scene → news-deck: 짙은 면으로 이어지게 설계된 짝이다/)
  assert.match(text, /면 흐름: scene\(장면·사진 면 → 짙은 면\) → news-deck\(짙은 면\) → field-shore\(짙은 면 → 옅은 색 면\) → link-lines\(옅은 색 면\) → logo-row\(옅은 색 면\)/)
  assert.match(text, /## KRDS 기준 밖 — 운영자 승인 대기/)
  assert.match(text, /## 블록 예외\n\n등록된 예외 12건/)

  const html = text.slice(text.indexOf('```html\n') + 8, text.lastIndexOf('\n```'))
  assert.match(html, /<header id="header" class="site-header scene-header">/)
  assert.match(html, /<footer id="footer" class="site-footer site-footer--inverse">/)
  assert.equal((html.match(/<section\b/g) || []).length, 5)
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.equal((html.match(/<svg class="ridge"/g) || []).length, 2)
  assert.equal((html.match(/<svg class="oreum"/g) || []).length, 1)
  assert.match(html, /sprite\.svg#\{\{scene\.tasks\.6\.icon\}\}/)
  assert.match(html, /<span data-carousel-total>3<\/span>/)
  assert.match(html, /aria-label="2 \/ 3"/)
  for (const name of ['carousel.js', 'scene-header.js', 'tab.js', 'reveal.js']) assert.ok(html.includes(`<script src="src/js/${name}"></script>`), name)
  assert.doesNotMatch(html, /due-track__axis|due-track__scale/)

  // 조합을 고쳐 쓰면 이어 붙는 면을 다시 본다
  const swapped = body(callTool('compose_page', { blocks: ['scene', 'bulletin', 'field-shore', 'partner-row'] }))
  assert.match(swapped, /\[경고\] scene의 바닥 전환은 아래가 짙은 면일 때의 색이다/)
  assert.match(swapped, /\[경고\] field-shore는 위가 짙은 면인 것을 전제로 이어 붙인다/)

  // 없는 조합, blocks와 함께 준 조합은 오류다
  const unknown = callTool('compose_page', { set: 'no-such-set' })
  assert.equal(unknown.isError, true)
  assert.match(body(unknown), /사용 가능: scene-showcase, split-cover/)
  assert.equal(callTool('compose_page', { set: 'split-cover', blocks: ['cover'] }).isError, true)
})

test('get_rules가 블록 예외 정책을 알린다', () => {
  assert.match(body(callTool('get_rules', { id: 'R-35' })), /> 블록 예외 — .*contracts\/block-exceptions\.json/)
})

test('search_docs가 블록 메타데이터도 찾는다', () => {
  const text = body(callTool('search_docs', { query: '남은 날수' }))
  assert.match(text, /## bulletin \(block, \d+건\) — get_block\("bulletin"\)/)
})
