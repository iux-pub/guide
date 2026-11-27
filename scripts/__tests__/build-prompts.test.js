// build-prompts.js — 디자인 규칙 묶음(prompts/design-rules.md)이 제목만 있는 빈 절을 만들지 않는지 본다
const test = require('node:test')
const assert = require('node:assert/strict')

const {
  getComponentList,
  cleanMarkdown,
  extractSection,
  resolveDesignDoc,
  summarizeDesignDoc,
  buildDesignRules,
  buildDesignAudit
} = require('../build-prompts')

/** 제목 바로 다음 내용 줄이 없거나 또 다른 제목·구분선·「상세」 안내뿐인 절을 찾는다. */
function emptyHeadings(markdown) {
  const lines = markdown.split('\n')
  const empty = []
  let inFence = false
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { inFence = !inFence; continue }
    const own = lines[i].match(/^(#{2,6})\s/)
    if (inFence || !own) continue
    let j = i + 1
    while (j < lines.length && lines[j].trim() === '') j++
    const next = lines[j]
    // 더 깊은 제목이 바로 이어지는 것은 하위 절이 있는 것이라 빈 절이 아니다
    const nextHeading = next === undefined ? null : next.match(/^(#{1,6})\s/)
    const sameOrUpper = nextHeading && nextHeading[1].length <= own[1].length
    if (next === undefined || sameOrUpper || /^---\s*$/.test(next) || /^> 상세:/.test(next)) {
      empty.push(lines[i])
    }
  }
  return empty
}

test('design-rules: 제목만 있는 빈 절이 없다', () => {
  assert.deepEqual(emptyHeadings(buildDesignRules()), [])
})

test('design-audit: 제목만 있는 빈 절이 없다', () => {
  assert.deepEqual(emptyHeadings(buildDesignAudit()), [])
})

test('design-rules: 디자인 디렉션의 절차·전형 조립·결함 문항·평가자 분리와 아트 디렉션 요약이 들어간다', () => {
  const out = buildDesignRules()
  assert.match(out, /^## 디자인 디렉션$/m)
  assert.match(out, /^### 1\. 절차$/m)
  assert.match(out, /^### 7-1\. 전형 조립/m)
  assert.match(out, /^### 8-3\. 결함 찾기$/m)
  assert.match(out, /^### 8-5\. 평가자 분리$/m)
  // 옛 자기 채점 표현이 남지 않는다
  assert.doesNotMatch(out, /20점 중 16점/)
  assert.match(out, /^## 아트 디렉션$/m)
  assert.match(out, /^### 1\. 표현 등급$/m)
  // 같은 문서를 두 번 싣지 않는다
  assert.equal(out.match(/^## 디자인 디렉션$/gm).length, 1)
})

test('design-rules: include 래퍼 문서는 references 원문에서 요약을 뽑는다', () => {
  const doc = resolveDesignDoc({
    file: 'korean-web-patterns.md',
    title: '한국형 웹 패턴',
    content: '---\ntitle: 한국형 웹 패턴\norder: 9\n---\n\n{{ "references/korean-web-patterns.md" | sourceBodyAsSection | safe }}\n'
  })
  assert.equal(doc.source, 'references/korean-web-patterns.md')
  assert.ok(doc.body.length > 1000)
  assert.notEqual(summarizeDesignDoc(doc).trim(), '')
})

test('summarizeDesignDoc: 뽑을 내용이 없으면 빈 문자열을 돌려준다', () => {
  assert.equal(summarizeDesignDoc({ source: 'site/design/none.md', body: '설명 한 줄뿐인 문서.' }), '')
})

test('summarizeDesignDoc: 지정 절이 없는 문서는 규칙 줄과 Do / Don\'t 표를 뽑는다', () => {
  const body = [
    '설명.',
    '',
    '## 원칙',
    '',
    '- 장식 그라데이션은 금지',
    '- 그냥 메모',
    '',
    '## Do / Don\'t',
    '',
    '| Do | Don\'t |',
    '|----|-------|',
    '| 단색 면 | 글래스 |',
    '',
    '## 다음 절',
    '',
    '본문'
  ].join('\n')
  const out = summarizeDesignDoc({ source: 'site/design/aesthetics.md', body })
  assert.match(out, /- 장식 그라데이션은 금지/)
  assert.doesNotMatch(out, /그냥 메모/)
  assert.match(out, /^### Do \/ Don't$/m)
  assert.match(out, /\| 단색 면 \| 글래스 \|/)
  assert.doesNotMatch(out, /다음 절/)
})

test('extractSection: 같은 단계의 다음 제목 앞에서 끊고 코드 펜스 안의 #은 제목으로 보지 않는다', () => {
  const md = '## 가\n\n본문\n\n```\n## 코드 안\n```\n\n### 하위\n\n내용\n\n## 나\n\n다른 절'
  const section = extractSection(md, /^## 가/)
  assert.equal(section.heading, '가')
  assert.match(section.body, /## 코드 안/)
  assert.match(section.body, /^#### 하위$/m)
  assert.doesNotMatch(section.body, /다른 절/)
  assert.equal(extractSection(md, /^## 없음/), null)
})

test('cleanMarkdown: 관련 문서 절을 통째로 지우고 코드 안의 꺾쇠는 남긴다', () => {
  const md = '---\ntitle: 가\n---\n\n본문 `<time datetime="2026-10-25">` <span>글</span>\n\n## 관련 문서\n\n- [토큰](/tokens/) -- 설명\n- 둘째 줄\n'
  const out = cleanMarkdown(md)
  assert.match(out, /<time datetime="2026-10-25">/)
  assert.doesNotMatch(out, /<span>/)
  assert.doesNotMatch(out, /관련 문서/)
  assert.doesNotMatch(out, /둘째 줄/)
})

test('getComponentList: 스니펫 폴더의 AGENTS.md·boilerplate.md는 컴포넌트가 아니다', () => {
  const list = getComponentList()
  assert.ok(!list.includes('AGENTS'))
  assert.ok(!list.includes('boilerplate'))
  assert.ok(list.includes('btn'))
})
