// 카피 규칙 — 화면 글자의 AI 슬롭을 기계로 막는다 (안티슬롭 명세, 새 번호)
//   R-23 가짜·자리 콘텐츠 — 채움 문구, 스톡·아바타 핫링크, 일반명사+연번 레이블, 자리값 제목,
//        지어낸 연락처·자리 표기, 출처 없는 수치 밴드, 가짜 후기
//   R-43 카피 톤 — 번역투·2인칭 마케팅 문구, '~하세요'로 끝나는 재촉형 버튼, 공공 화면의 느낌표
//
// 범위(scope)에 따라 심각도가 다르다:
//   deliverable  납품 페이지(루트 *.html·pages/**·infoux.json pages) — 엄격
//   template     루트 index.html이 <meta name="infoux:template">를 단 경우(스타터 틀) — 자리값은 warn
//   snippet      src/snippets·site/components·site/prompts(스니펫 사본) — 형식 예시를 인정
//   playground   src/playground — 데모
//   doc          그 밖의 사이트 문서
// 문구는 텍스트 노드가 아니라 '문구 덩어리'로 본다 — 블록·제목·버튼 하나 아래의 인라인 자손
// (strong·em·span·a·br…)을 이어 붙인 글. 강조 태그로 쪼갠 슬롭도, 강조가 섞인 정상 문구도 같은 기준을 받는다.
// 판정 자료(호스트·명사·자리값·어휘)는 contracts/fake-content.json·copy-lexicon.json에서 읽는다.
// 결과: { rule, severity: 'error'|'warn', line, message, code }

const fs = require('fs')
const path = require('path')
const T = require('./html-tree')
const { splitMarkdown, stripCssComments } = require('./visual-signature')

// ─── 계약 ──────────────────────────────────────────────

// 계약 파일을 읽지 못했을 때만 쓰는 최소 기본값 — 정본은 contracts/*.json
const DEFAULT_FAKE = {
  hotlinkHosts: ['placehold.co', 'placehold.it', 'placeholder.com', 'via.placeholder.com', 'picsum.photos', 'placekitten.com', 'dummyimage.com', 'source.unsplash.com', 'images.unsplash.com', 'plus.unsplash.com', 'images.pexels.com', 'loremflickr.com', 'pravatar.cc', 'randomuser.me', 'ui-avatars.com', 'fakeimg.pl', 'placeimg.com'],
  serialNouns: ['질문', '답변', '탭', '항목', '메뉴', '카드', '슬라이드', '이미지', '사진', '제목', '콘텐츠', '내용', '텍스트', '버튼', '링크', '게시물', '게시글', '공지사항', '공지', '배너', '섹션', '패널', '기능', 'Tab', 'Item', 'Menu', 'Slide', 'Card', 'Title', 'Section', 'Panel', 'Image', 'Question', 'Feature', 'FAQ'],
  placeholderTitles: ['새 프로젝트', '페이지 제목', '카드 제목', '섹션 제목', '제목', '타이틀', 'Document', 'Untitled', 'index', 'Home', 'Title', 'Page Title'],
  placeholderHeadings: ['제목', '타이틀', 'Title', '카드 제목', '섹션 제목', '페이지 제목', '제목을 입력하세요'],
  brandPlaceholders: ['기관명', '회사명', '사이트명', '서비스명', '[프로젝트명]', '프로젝트명', '브랜드명'],
  templateMarker: 'infoux:template'
}
const DEFAULT_LEXICON = { translationese: [], buttonImperativeEndings: '(?:세요|십시오)\\s*[!.~！]*$', exclamation: '[가-힣A-Za-z0-9)\\]~?…”’」』]\\s*[!！‼](?![=A-Za-z])', allow: [] }

function readJson(file, fallback, missing) {
  try {
    return { ...fallback, ...JSON.parse(fs.readFileSync(file, 'utf8')) }
  } catch {
    missing.push(path.basename(file))
    return fallback
  }
}

// 저장소의 계약을 읽어 판정에 쓰는 정규식으로 미리 만든다. missing: 읽지 못해 기본값으로 대신한 계약 파일
//   (기본값에는 번역투 어휘가 없다 — 검사기가 경고로 알린다)
function loadCopyContracts(root) {
  const missing = []
  const fake = readJson(path.join(root, 'contracts', 'fake-content.json'), DEFAULT_FAKE, missing)
  const lexicon = readJson(path.join(root, 'contracts', 'copy-lexicon.json'), DEFAULT_LEXICON, missing)
  return { ...compileContracts(fake, lexicon), missing }
}

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function compileContracts(fake = DEFAULT_FAKE, lexicon = DEFAULT_LEXICON) {
  const brands = fake.brandPlaceholders.map(escapeRe).join('|')
  return {
    hotlink: new RegExp(`(?:^|[^\\w-])(?:${fake.hotlinkHosts.map(escapeRe).join('|')})(?![\\w-])`, 'i'),
    serial: new RegExp(`^(.*?(?:${fake.serialNouns.map(escapeRe).join('|')}))\\s*0*(\\d{1,2})$`, 'i'),
    placeholderTitle: new RegExp(`^(?:${fake.placeholderTitles.map(escapeRe).join('|')})$`, 'i'),
    // 목록 + 'UI 부품 이름 + 제목'(모달 제목·공지 카드 제목) — 화면 부품 이름을 그대로 제목으로 쓴 자리값
    placeholderHeading: new RegExp(`^(?:${fake.placeholderHeadings.map(escapeRe).join('|')}|(?:[가-힣A-Za-z]{1,8}\\s)?(?:카드|모달|섹션|페이지|팝업|패널|탭|배너|목록|게시물|알림|대화상자)\\s?제목)$`, 'i'),
    brandWhole: new RegExp(`^(?:${brands})$`),
    // © 2026 기관명 · ⓒ 기관명 · (c) 2020-2026 회사명 · Copyright 2026 회사명
    // 뒤가 끝·문장부호·All rights·연도일 때만 — '(c) 회사명 변경' 같은 열거 항목은 아니다
    brandCopyright: new RegExp(`(?:©|ⓒ|\\(c\\)|copyright)\\s*(?:[©ⓒ]\\s*)?(?:\\d{4}(?:\\s*[-–]\\s*\\d{4})?\\.?\\s*)?(?:${brands})(?=\\s*(?:$|[.,·|]|all\\s+rights|\\d{4}))`, 'i'),
    templateMarker: fake.templateMarker || 'infoux:template',
    translationese: (lexicon.translationese || []).map(t => ({ re: new RegExp(t.pattern, 'u'), why: t.why, key: t.pattern, except: t.exceptIfSentence ? new RegExp(t.exceptIfSentence, 'u') : null })),
    buttonImperative: new RegExp(lexicon.buttonImperativeEndings, 'u'),
    exclamation: new RegExp(lexicon.exclamation, 'u'),
    allow: lexicon.allow || []
  }
}

// ─── 공통 ──────────────────────────────────────────────

const norm = T.norm
const CODE_LIKE = new Set(['code', 'pre', 'kbd', 'samp', 'script', 'style', 'textarea', 'template'])
const QUOTE_TAGS = new Set(['blockquote', 'q', 'cite'])
const AUX_CLASS = /(?:^|\s)(?:sr-only|blind|visually-hidden|screen-out)(?:\s|$)/
const LABEL_TAGS = new Set(['label', 'th', 'dt', 'legend', 'option', 'caption'])
const SEVERITY_RANK = { warn: 1, error: 2 }
const sentencesOf = t => t.split(/(?<=[.!?。！])\s+/).map(s => s.trim()).filter(Boolean)

const isDocTitle = n => n.tag === 'title' && !n.foreign
const isHeadingEl = n => /^h[1-6]$/.test(n.tag) || n.attrs?.role === 'heading' || isDocTitle(n)
const isButtonEl = n => n.tag === 'button' || (n.tag === 'a' && T.classesOf(n).includes('btn')) || (n.tag === 'input' && /^(?:submit|button|reset)$/i.test(n.attrs.type || '')) || n.attrs?.role === 'button'
const isContainer = n => !T.INLINE.has(n.tag) || isButtonEl(n) || isHeadingEl(n)
const chainOf = n => [n, ...T.ancestors(n)]
const hasHangul = s => /[가-힣]/.test(s)

function langOf(el) {
  for (const x of chainOf(el)) if (x.attrs && x.attrs.lang !== undefined && x.attrs.lang !== '') return x.attrs.lang
  return null
}
// 한국어가 아닌 lang 아래라도 한글이 있으면 검사한다 — <html lang="en"> 보일러플레이트가 카피 검사를 끄지 않게
const isForeignText = (lang, text) => !!lang && !/^ko\b/i.test(lang) && !hasHangul(text)

function severityTable(scope) {
  const D = scope === 'deliverable'
  return {
    filler: scope === 'playground' ? 'warn' : 'error',
    hotlink: 'error',
    serial: D ? 'error' : 'warn',
    title: D ? 'error' : (scope === 'snippet' || scope === 'template') ? 'warn' : null,
    contact: D ? 'error' : scope === 'template' ? 'warn' : null,
    realisticContact: D ? 'error' : 'warn',
    numbers: scope === 'doc' ? null : 'warn',
    review: 'warn'
  }
}

// ─── 문구 덩어리 ───────────────────────────────────────
// 덩어리 = 컨테이너(블록·제목·버튼) 하나 아래, 하위 컨테이너가 나오기 전까지의 인라인 텍스트.
//   segs: [{ node, at(raw 안 위치), text, code, quote, lang }] — code·quote는 그 조각이 코드·인용 안인가
function collectChunks(root) {
  const chunks = []
  const visit = container => {
    const chain = chainOf(container)
    const base = { code: chain.some(a => CODE_LIKE.has(a.tag)), quote: chain.some(a => QUOTE_TAGS.has(a.tag)), lang: langOf(container) }
    let cur = null
    const flush = () => {
      if (cur && /\S/.test(cur.raw)) chunks.push(cur)
      cur = null
    }
    const push = (node, text, flags) => {
      if (!cur) cur = { el: container, segs: [], raw: '', line: node.line }
      cur.segs.push({ node, at: cur.raw.length, text, ...flags })
      cur.raw += text
    }
    const walkInline = (n, inh) => {
      for (const c of n.children || []) {
        if (c.tag === '#text') {
          if (!c.rawText) push(c, c.text, inh)
          continue
        }
        if (c.tag === 'br' || c.tag === 'wbr') {
          if (cur) push(c, '\n', inh)
          continue
        }
        if (isContainer(c)) {
          flush()
          visit(c)
          continue
        }
        const ownLang = c.attrs.lang !== undefined && c.attrs.lang !== ''
        walkInline(c, {
          code: inh.code || CODE_LIKE.has(c.tag),
          quote: inh.quote || QUOTE_TAGS.has(c.tag),
          // 보조 글(sr-only '새 창 열림'·aria-hidden 장식 글자) — 카피 톤(R-43) 판정에서 뺀다
          aux: inh.aux || AUX_CLASS.test(c.attrs.class || '') || c.attrs['aria-hidden'] === 'true',
          lang: ownLang ? c.attrs.lang : inh.lang,
          ownLang: inh.ownLang || ownLang
        })
      }
    }
    walkInline(container, base)
    flush()
  }
  visit(root)
  return chunks
}

// 덩어리 글 — R-23은 코드만 빼고, R-43은 코드·인용·외국어(한글 없는) 조각도 뺀다(같은 길이의 공백으로)
const chunkText = (chunk, pred) => chunk.segs.map(s => (pred(s) ? ' '.repeat(s.text.length) : s.text)).join('')
const r23TextOf = chunk => chunkText(chunk, s => s.code)
// 물려받은 lang은 덩어리 전체에 한글이 있는지로, 인라인에서 직접 단 lang은 그 조각 글로 판정한다
const r43TextOf = chunk => chunkText(chunk, s => s.code || s.quote || s.aux || isForeignText(s.lang, s.ownLang ? s.text : chunk.raw))

// 일치 문자열이 실제로 있는 줄 — 여러 줄 문단·태그에서 문단 첫 줄이 아니라 그 글자가 있는 줄을 알린다
function lineOfMatch(chunk, sample) {
  const words = norm(sample).split(' ').filter(Boolean).slice(0, 4)
  if (!words.length) return chunk.line
  const re = new RegExp(words.map(escapeRe).join('\\s+'))
  const m = re.exec(chunk.raw)
  if (!m) return chunk.line
  const seg = [...chunk.segs].reverse().find(s => s.at <= m.index)
  if (!seg || seg.node.tag !== '#text') return seg ? seg.node.line : chunk.line
  const local = m.index - seg.at
  return seg.node.lineStart + (seg.text.slice(0, local).match(/\n/g) || []).length
}

// ─── R-23 가짜·자리 콘텐츠 ─────────────────────────────

// 문장 어디에 있든 채움 문구
const FILLER_ANYWHERE = [
  /\b(?:lorem|ipsum|dolor sit amet|consectetur adipiscing)\b/i,
  /더미\s*(?:텍스트|문구|제목|이미지)/,
  /여기에\s*(?:내용|텍스트|제목|설명)[을를]?\s*입력/
]
// 문장 단위로 고정해 보는 채움 문구 — '들어갑니다'류는 앞말(수식어)이 4낱말까지, 주제 조사(은·는)로 끝나는 낱말은 막는다
//   ('카드에 대한 간단한 설명이 들어갑니다.'는 잡고, '카드 제목 아래에는 요약 설명이 들어갑니다.' 같은 구조 설명은 놓아준다)
const FILLER_NOUN = '(?:제목|타이틀|문구|이미지|사진|콘텐츠|내용|텍스트|설명|소개)'
// 수식어 한 낱말 — '…에 대한'과 화면 부품 자리('영역에·카드에·배너에')만 처소격으로 받는다.
// '카드 앞면에 본인 사진이 들어갑니다'·'○○에는 … 내용이 들어갑니다' 같은 실제 안내문은 놓아준다
const UI_LOC = '(?:영역|칸|자리|카드|배너|섹션|패널|모달|팝업|탭|슬라이드|헤더|푸터|박스|상단|하단)에'
const FILLER_MOD = `(?:[가-힣A-Za-z0-9]{1,8}에\\s+(?:대한|관한)|${UI_LOC}|[가-힣A-Za-z0-9]{0,8}[가-힣A-Za-z0-9](?<![은는에]))`
const FILLER_SENTENCE = [
  new RegExp(`^(?:(?:여기에|이곳에)\\s*)?(?:${FILLER_MOD}\\s+){0,4}${FILLER_NOUN}[이가을를]?\\s*(?:여기에\\s*)?(?:들어갑니다|영역입니다)\\.?$`),
  new RegExp(`${FILLER_NOUN}[이가을를]?\\s*(?:여기에\\s*)?들어갈\\s*자리(?:입니다)?\\.?$`),
  new RegExp(`^(?:여기에|이곳에|이곳은)\\s.{0,40}${FILLER_NOUN}[이가을를]?\\s*(?:들어갑니다|영역입니다)\\.?$`),
  /^(?:샘플|임시)\s*(?:텍스트|문구|제목|데이터|이미지)\s*\d*(?:입니다)?\.?$/,
  /^(?:답변|질문|탭|패널|항목)\s*\d+\s*내용(?:입니다)?\.?$/,
  /^(?:sample|placeholder|dummy)\s+text\.?$|^(?:your\s+)?text\s+(?:goes\s+)?here\.?$/i
]
// '카드 본문 내용'·'모달 본문 내용입니다.'·'도움말 설명 텍스트' — 화면 부품 이름이 앞에 붙어야 잡는다.
// '본문 텍스트'(색 역할 이름)처럼 부품 없는 말은 실제 항목 이름일 수 있다. 표 머리·레이블('본문 내용' 입력란)도 뺀다
const BODY_FILLER = /^(?:(?:카드|모달|패널|팝업|탭|섹션|배너|알림|툴팁|도움말|대화상자|아코디언|목록|페이지)\s*(?:본문|설명)?\s*(?:내용|텍스트|문구)|설명\s*(?:텍스트|문구))(?:입니다)?\.?$/

function fillerHit(text, labelLike) {
  if (FILLER_ANYWHERE.some(re => re.test(text))) return true
  return sentencesOf(text).some(s => FILLER_SENTENCE.some(re => re.test(s)) || (!labelLike && BODY_FILLER.test(s)))
}

// '예:' 형식 예시 조각 — 그 조각만 빼고 검사한다('대표전화 064-000-0000 (예: 평일 09:00)'의 번호는 잡는다)
//   조각은 닫는 괄호·문장 끝·줄바꿈(<br>)까지 — 덩어리 끝까지 지워 뒤의 자리값을 놓치지 않게. 'ex)'도 예시 표기다
const EXAMPLE_FRAGMENT = /(?:^|[\s(])(?:(?:작성\s*)?예(?:시)?|ex|e\.g\.)\s*[:)][^)\n]*?(?:\)|(?=[.。](?:\s|$))|(?=\n)|$)/gim
const stripExamples = t => t.replace(EXAMPLE_FRAGMENT, ' ')
// 예시 컨테이너(class에 example 토큰) — 문서·스니펫에서만 인정한다. 납품 페이지는 class 이름으로 검사를 끌 수 없다
const inExampleBox = (el, scope) => scope !== 'deliverable' && chainOf(el).some(a => a.attrs && /(?:^|[\s_-])examples?(?:$|[\s_-])/.test(a.attrs.class || ''))

// 지어낸 연락처·자리 표기 — 성씨 마스킹(김○○ 주무관, 남궁○○님, 이OO씨)은 개인정보 관행이라 먼저 지운다
const CIRCLES = '[○◯〇]'
const MASKED_SURNAME = new RegExp(`(?<![가-힣])(?:남궁|제갈|선우|황보|독고|사공|서문|[가-힣])(?:${CIRCLES}{2}|O{2}|\\*{2})(?=$|[^가-힣A-Za-z○◯〇O*]|에게서|에게|한테|로부터|부터|까지|처럼|보다|님|씨|께|의|이|가|은|는|을|를|와|과|외|도|만|고객|회원|주무관|교수|대표|팀장|과장|계장|주임|선생님|기자|작가|학생|양)`, 'g')
const PHONE_SEP = '[\\s.\\-‐‑–]'
const PLACEHOLDER_CONTACT = [
  ['자리값 전화번호', new RegExp(`(?<!\\d)\\(?0\\d{1,2}\\)?[\\s.)\\-‐‑–]*(?:0000|000)${PHONE_SEP}\\d{4}(?!\\d)`)],
  ['자리값 전화번호', new RegExp(`(?<![\\dA-Za-z])0(?:\\d{1,2}|XX)${PHONE_SEP}X{3,4}${PHONE_SEP}X{4}(?![A-Za-z])|0XX-000-0000`, 'i')],
  ['1xxx-0000 대표번호', /(?<!\d)1\d{3}-0000(?!\d)/],
  ['example 도메인', /\bexample\.(?:go\.kr|or\.kr|co\.kr|com|org|net|kr)\b/i],
  ['자리값 이메일·도메인', /\bexample@|@(?:your-?)?domain\.|\byour-?(?:site|website|domain|name)\.(?:com|net|org|kr)\b|\btest@test\./i],
  ['홍길동', /(?<![가-힣])홍길동(?:님|씨)?(?![가-힣])/],
  ['○○ 자리 표기', new RegExp(`${CIRCLES}{2,}`)],
  ['OO 자리 표기', /(?<![A-Za-z])O{2,3}(?![A-Za-z])/],
  ['XX·△△ 자리 표기', /(?<![A-Za-z])X{2,}(?=[시군구동읍면로길])|△△/],
  ['자리값 사업자등록번호', /000-00-00000/],
  ['자리값 우편번호', /\(우\)\s*00000/],
  ['자리값 신고번호', /제0000-/]
]
// 실재처럼 보이는 가짜 번호 — 스니펫에서도 경고(K-04는 000·0000 같은 비실재 표기를 쓴다)
const REALISTIC_CONTACT = [
  ['실재처럼 보이는 가짜 전화번호', new RegExp(`(?<!\\d)\\(?0\\d{1,2}\\)?[\\s.)\\-‐‑–]*(?:1234|123|1111|111)${PHONE_SEP}\\d{4}(?!\\d)`)],
  ['실재처럼 보이는 가짜 사업자등록번호', /123-45-67890/]
]

// 수치 밴드 — 단위 붙은 값만 센다. 성과 단위(%·+·만·억·배)가 하나라도 있어야 밴드다
//   (순위 1·2·3위, 정원 2·3·4명, 게시판 글 수처럼 개수만 이어진 운영 정보는 밴드가 아니다)
const NUM_VALUE = /^[\d,.]+\s*(%|\+|만|억|배|명|건|개|곳|회|위)(?:\s*(?:명|원|건|곳|개))?\s*(?:이상|넘게)?\s*\+?$/
const STRONG_UNIT = new Set(['%', '+', '만', '억', '배'])
// 금액(30만 원·1,200억 원)은 성과 수치가 아니다 — 칸 수에는 세지만 밴드 판정의 근거는 아니다
const isStrongValue = m => STRONG_UNIT.has(m[1]) && !/원\s*(?:이상|넘게)?\s*\+?$/.test(m[0])
const VALUE_CLASS = /(?:^|[\s_-])(?:num|number|value|count|figure|amount)(?=$|[\s_-])/
const STAT_ITEM_CLASS = /(?:^|[\s_-])(?:stats?|metrics?|figures?|counters?|counts?)(?=$|[\s_-])/
// 가격·혜택 정보(할인율·적립률·요금)는 수치 밴드가 아니다
const PRICE_CLASS = /(?:^|[\s_-])(?:rate|discount|sale|off|price|benefit|coupon)(?=$|[\s_-])/
const PRICE_TEXT = /할인|적립|캐시백|쿠폰|혜택|\d[\d,]*\s*원/
// 출처·기준일 표지 — '출처: …'·'출처 통계청', 'YYYY. M. D. 기준', 'YYYY년 M월 말 현재', '2025년 기준', '14:00 기준', 'Source:'
const SOURCE_MARK = /출처(?![를가는이도와의은에])(?!\s*(?:없|미상|불명))\s*[:：\-–]?\s*[가-힣A-Za-z]|자료\s*[:：]|기준일|기준\s*[:：]|source\s*:|\d{4}\s*년(?:도)?\s*(?:말|상반기|하반기|[1-4]\s*분기)?\s*(?:기준|현재)|\d{4}\s*(?:[.-]|년)\s*\d{1,2}\s*(?:[.-]|월)?\s*(?:\d{1,2}\s*(?:\.|일)?\s*)?(?:\([월화수목금토일]\)\s*)?(?:\d{1,2}:\d{2}\s*)?(?:말\s*)?(?:기준|현재)|\d{1,2}:\d{2}\s*(?:기준|현재)/i
const REVIEW_CLASS = /(?:^|[\s_-])(?:review|testimonial)s?(?=$|[\s_-])/i
const MASKED_REVIEW = /[가-힣][○◯〇O*＊]{1,2}\s*(?:고객|회원|님)/
const STARS = /★{3,}/

// 출처는 위로 올라가며 표·그림·섹션마다 찾되 처음 만나는 section·article에서 멈춘다(다른 섹션의 출처를 빌리지 않는다).
// <cite>는 마스킹 이름(김○○ 고객)이 아닐 때만 출처다 — 가짜 후기의 서명 칸은 출처가 아니다
const SOURCE_HOSTS = new Set(['section', 'figure', 'article', 'aside', 'table'])
function hasSource(n) {
  const isCite = x => x.tag === 'cite' && !MASKED_REVIEW.test(norm(T.textOf(x)))
  const isSourceLabel = x => ['dt', 'th', 'strong'].includes(x.tag) && norm(T.textOf(x)) === '출처'
  for (const a of chainOf(n)) {
    if (a === n || SOURCE_HOSTS.has(a.tag)) {
      if (T.find(a, x => x.tag !== '#text' && (isCite(x) || isSourceLabel(x))) || SOURCE_MARK.test(norm(T.textOf(a)))) return true
    }
    if (a.tag === 'section' || a.tag === 'article') break
  }
  return false
}

function numericValues(n) {
  const kids = (n.children || []).filter(c => c.tag !== '#text')
  if (n.tag === 'dl') {
    const out = []
    T.walk(n, x => { if (x.tag === 'dd') out.push(norm(T.textOf(x))) })
    return out
  }
  const statGrid = kids.length >= 2 && kids.every(k => STAT_ITEM_CLASS.test(k.attrs.class || ''))
  if (!['ul', 'ol'].includes(n.tag) && !statGrid && kids.length < 3) return []
  const out = []
  for (const k of kids) {
    if (PRICE_TEXT.test(norm(T.textOf(k)))) continue
    const v = T.find(k, x => x.tag !== '#text' && !PRICE_CLASS.test(x.attrs.class || '') && (x.tag === 'strong' || x.tag === 'b' || VALUE_CLASS.test(x.attrs.class || '')))
    if (v) out.push(norm(T.textOf(v)))
  }
  return out
}

function r23(root, chunks, ctx, out) {
  const C = ctx.copy
  const sev = severityTable(ctx.scope)
  const push = (severity, line, message, sample) => {
    if (severity) out.push({ rule: 'R-23', severity, line, message, code: norm(sample || '').slice(0, 120) })
  }

  // 문구 덩어리: 채움 문구·글 속 핫링크 주소·지어낸 연락처
  for (const ch of chunks) {
    const raw = r23TextOf(ch)
    const t = norm(raw)
    if (!t) continue
    const example = inExampleBox(ch.el, ctx.scope)
    const body = norm(stripExamples(raw))
    const labelLike = chainOf(ch.el).some(a => LABEL_TAGS.has(a.tag))
    if (!example && fillerHit(body, labelLike)) push(sev.filler, lineOfMatch(ch, t), '채움 문구 — 실제 문안이나 contentSources의 실제 용어를 쓴다.', t)
    if (C.hotlink.test(t)) push(sev.hotlink, ch.line, 'placeholder 이미지 핫링크 주소.', t)
    if (!example) contactFindings(body, t, ch.el, ch, sev, push, C)
  }

  const reportedReview = new Set()
  const checkSerial = n => {
    // (3) 일반명사+연번 형제 — 조각 최상위(#root)의 형제도 본다
    const kids = (n.children || []).filter(c => c.tag !== '#text' && !T.isHiddenEl(c))
    if (kids.length < 2) return
    const groups = new Map()
    for (const k of kids) {
      const label = serialLabel(k)
      const m = label && label.match(C.serial)
      if (m) groups.set(m[1].trim(), [...(groups.get(m[1].trim()) || []), { num: +m[2], el: k }])
    }
    for (const [prefix, items] of groups) {
      if (items.length >= 2) push(sev.serial, items[0].el.line, `형제 ${items.length}개가 '${prefix} + 번호' 자리 레이블이다 — 실제 질문·탭 이름을 쓴다.`, `${prefix} ${items.map(i => i.num).join(', ')}`)
    }
  }

  T.walk(root, n => {
    if (n.tag === '#root') { checkSerial(n); return }
    if (n.tag === '#text') {
      // script·style·template·textarea 안의 핫링크(url()·문자열·img) — 줄마다, 주석은 빼고
      if (n.rawText) {
        const p = n.parent.tag
        const src = p === 'style' ? stripCssComments(n.text) : p === 'script' ? stripJsComments(n.text) : n.text.replace(/<!--[\s\S]*?-->/g, blankLine)
        src.split('\n').forEach((ln, i) => {
          if (C.hotlink.test(ln)) push(sev.hotlink, n.lineStart + i, 'placeholder 이미지 핫링크 — 실제 자산 경로를 쓴다(납품 self-contained 정책).', ln.trim())
        })
      }
      return
    }
    const at = n.attrs || {}
    for (const [k, v] of Object.entries(at)) {
      // 핫링크는 어느 속성이든(data-original·data-background·xlink:href·object data·onerror·data-placeholder LQIP)
      if (k !== 'placeholder' && k !== 'aria-placeholder' && C.hotlink.test(v)) push(sev.hotlink, T.attrLine(n, k), `placeholder 이미지 핫링크(${k}) — 실제 자산 경로를 쓴다.`, v)
      if (['alt', 'title', 'aria-label', 'aria-description'].includes(k) || (n.tag === 'meta' && k === 'content')) {
        const vv = norm(v)
        if (!vv || inExampleBox(n, ctx.scope)) continue
        const body = norm(stripExamples(vv))
        if (fillerHit(body, false)) push(sev.filler, T.attrLine(n, k), `채움 문구(${k}).`, vv)
        contactFindings(body, vv, n, null, sev, push, C, k)
      }
      if (k === 'href') {
        if (/\bexample\.(?:go\.kr|or\.kr|co\.kr|com|org|net|kr)\b/i.test(v)) push(sev.contact, T.attrLine(n, k), 'example 도메인 링크 — 실제 목적지를 쓴다.', v)
        const tel = v.match(/^\s*(?:tel|mailto):(.*)$/i)
        if (tel) contactFindings(norm(decodeURIComponentSafe(tel[1])), v, n, null, sev, push, C, 'href')
      }
    }
    checkSerial(n)
    // (4) 자리값 제목 — title은 구분자(| - : ·)로 나눈 조각마다도 본다('페이지 제목 | 서울시립도서관'). 'Home'은 통째일 때만
    if (isDocTitle(n) || n.tag === 'h1') {
      const t = norm(T.textOf(n))
      const pieces = isDocTitle(n) ? t.split(/\s+[|\-–—:·]\s+/).map(s => s.trim()).filter(Boolean) : []
      const hit = C.placeholderTitle.test(t) || (n.tag === 'h1' && C.placeholderHeading.test(t)) ||
        (pieces.length > 1 && pieces.some(p => !/^(?:home|홈)$/i.test(p) && C.placeholderTitle.test(p)))
      if (hit) push(sev.title, n.line, `<${n.tag}>가 자리값 "${t}"이다 — 실제 페이지 제목을 쓴다.`, t)
    } else if (/^h[2-6]$/.test(n.tag)) {
      const t = norm(T.textOf(n))
      if (C.placeholderHeading.test(t)) push(sev.title, n.line, `<${n.tag}>가 자리값 "${t}"이다.`, t)
    }
    // (6) 출처 없는 수치 밴드 — 단위 붙은 수치 3칸 이상, 성과 단위(%·+·만·억·배)가 하나 이상
    if (sev.numbers) {
      const values = numericValues(n).map(v => v.match(NUM_VALUE)).filter(Boolean)
      if (values.length >= 3 && values.some(isStrongValue) && !hasSource(n)) {
        push(sev.numbers, n.line, `수치 ${values.length}칸에 출처·기준일이 없다 — '출처: …(YYYY년 M월 기준)'을 붙이거나 수치를 뺀다.`, values.map(m => m[0]).join(' | '))
      }
    }
    // (7) 가짜 후기 — 가장 바깥 요소에서 한 번만, 출처(cite·출처 표기)가 있는 후기 묶음은 뺀다
    if ((n.tag === 'blockquote' || REVIEW_CLASS.test(at.class || '')) && !T.ancestors(n).some(a => reportedReview.has(a))) {
      const t = norm(T.textOf(n))
      if ((MASKED_REVIEW.test(t) || STARS.test(t)) && !hasSource(n)) {
        reportedReview.add(n)
        push(sev.review, n.line, '후기처럼 보이는 문구(마스킹 이름·별점) — 실제 출처가 있는 후기만 싣는다.', t)
      }
    }
  })
}

function decodeURIComponentSafe(s) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

// 형제 비교용 레이블 — 형제 안의 '이름 자리'(제목·summary·펼침 버튼·탭)가 있으면 그것, 없으면 보이는 텍스트.
// 폼 칸(입력 요소를 품은 칸 — '상품 이미지 1·2·3' 업로드, fieldset·form 안의 선택지)은 번호가 의미라 보지 않는다.
// 폼 밖의 체크박스·라디오 + label 짝은 CSS 토글 아코디언·탭이라 label 글로 비교한다
const NAME_SLOT = x => x.tag !== '#text' && (/^h[1-6]$/.test(x.tag) || x.tag === 'summary' || (x.tag === 'button' && x.attrs['aria-expanded'] !== undefined) || x.attrs.role === 'tab')
const isChoice = x => x.tag === 'input' && /^(?:checkbox|radio)$/i.test(x.attrs.type || '')
const isFormCtl = x => ['input', 'select', 'textarea'].includes(x.tag) && !isChoice(x)
function serialLabel(el) {
  if (T.find(el, isFormCtl)) return null
  const lab = el.tag === 'label' ? el : T.find(el, x => x.tag === 'label')
  const choice = T.find(el, isChoice) || (lab && lab.attrs.for && (el.parent?.children || []).find(x => x.attrs && x.attrs.id === lab.attrs.for))
  if (el.tag === 'label' || choice) {
    if (!choice || !isChoice(choice) || chainOf(el).some(a => a.tag === 'form' || a.tag === 'fieldset')) return null
    return lab ? norm(T.textOf(lab, { visible: true })) : null
  }
  const slot = T.find(el, NAME_SLOT)
  if (slot) return norm(T.textOf(slot, { visible: true }))
  const text = norm(T.textOf(el, { visible: true }))
  return text.length <= 40 ? text : null
}

// text: 예시 조각을 뺀 판정용 글, sample: 보고용 원문, el: 이름 자리 판정 기준 요소, chunk: 줄 찾기용(없으면 요소 줄)
function contactFindings(text, sample, el, chunk, sev, push, C, attr) {
  const t = text.replace(MASKED_SURNAME, ' ')
  const where = attr ? `(${attr})` : ''
  const lineFor = s => (chunk ? lineOfMatch(chunk, s) : attr ? T.attrLine(el, attr) : el.line)
  if (sev.contact) {
    for (const [name, re] of PLACEHOLDER_CONTACT) {
      const m = t.match(re)
      if (m) push(sev.contact, lineFor(m[0]), `${name}${where}이 남았다 — 실제 값으로 바꾼다.`, sample)
    }
    // 기관명 자리값은 이름이 놓이는 자리에서만 본다 — <title>(구분자 | - : · 로 나눈 조각마다), 로고 alt,
    // 브랜드·로고·저작권 블록, 사이트 이름 메타. 본문의 '기관명' 같은 항목 이름은 건드리지 않는다
    // 덩어리면 각 조각의 인라인 조상(<a class="site-header__brand"><span><strong>기관명)까지 본다
    const chains = chunk ? chunk.segs.map(s => chainOf(s.node.parent || el)) : [chainOf(el)]
    const inTitle = chains.some(ch => ch.some(isDocTitle))
    const siteMeta = el.tag === 'meta' && /(?:site_name|application-name|og:title|author)/i.test(`${el.attrs.property || ''} ${el.attrs.name || ''}`)
    const brandClass = a => /(?:^|[\s_-])(?:brand|logo|copy(?:right)?)(?=$|[\s_-])/.test(a.attrs?.class || '')
    // 폼 레이블·표 머리·dt의 '브랜드명·회사명'은 입력 항목 이름이다
    const labelCell = chains.some(ch => ch.some(a => LABEL_TAGS.has(a.tag)))
    const brandCtx = inTitle || siteMeta || attr === 'alt' || chains.some(ch => ch.slice(0, 3).some(brandClass) ||
      (ch.some(brandClass) && ch.some(a => a.tag === 'header' || a.tag === 'footer')))
    const parts = inTitle ? t.split(/\s+[|\-–—:·]\s+/) : [t]
    // 덩어리면 조각마다 가장 가까운 브랜드 블록의 글로도 본다('기관명' 옆에 '홈' 링크가 붙어도 잡는다)
    const segBrand = chunk && chunk.segs.map(s => {
      const ch = chainOf(s.node.parent || el)
      const b = (ch.slice(0, 3).some(brandClass) || ch.some(a => a.tag === 'header' || a.tag === 'footer')) && ch.find(brandClass)
      if (!b) return null
      const own = norm(s.text)
      return C.brandWhole.test(own) ? own : norm(T.textOf(b, { visible: true }))
    }).find(x => x && C.brandWhole.test(x))
    const brand = (brandCtx && parts.map(s => s.trim()).find(s => C.brandWhole.test(s))) || segBrand
    if (brand && !labelCell) push(sev.contact, lineFor(brand), `자리값 기관명 "${brand}"${where} — 실제 기관·서비스 이름을 쓴다.`, sample)
    const copyright = t.match(C.brandCopyright)
    if (copyright) push(sev.contact, lineFor(copyright[0]), `저작권 표기의 자리값 기관명${where}.`, sample)
  }
  for (const [name, re] of REALISTIC_CONTACT) {
    const m = t.match(re)
    if (m) push(sev.realisticContact, lineFor(m[0]), `${name}${where} — 형식 예시는 비실재 표기(064-000-0000, 000-00-00000)로 쓴다(K-04).`, sample)
  }
}

// ─── R-43 카피 톤 ──────────────────────────────────────

const PUBLIC_STRICT = new Set(['public-service'])
const PUBLIC_SOFT = new Set(['public-institution', 'cms-admin'])
const INTRO_CLASS = /(?:^|\s)(?:section--intro|hero-bleed|hero)(?:$|\s|__|--)/
// 따옴표 안 인용은 지운다. 영어 아포스트로피(Editor's·Today's)는 따옴표가 아니다
const QUOTED = /“[^”]*”|"[^"]*"|‘[^’]*’|(?<![A-Za-z])'[^']*'(?![A-Za-z])|「[^」]*」|『[^』]*』/g
const TRAILING_SYMBOLS = /[\s→›»…▶➜➔>·•~!！]+$/
// 버튼처럼 생겼지만 행동 레이블이 아닌 것 — 탭, 목록·메뉴 펼침 트리거, 제목 안의 펼침 버튼(아코디언)
const TRIGGER_POPUP = /^(?:listbox|menu|true|tree|grid)$/i
// (콤보박스·스위치·선택지 role, aria-controls로 패널을 펼치는 단독 디스클로저도 — 대화상자를 여는 버튼은 행동이라 본다)
const isTrigger = n => /^(?:tab|combobox|switch|menuitem(?:checkbox|radio)?|option|checkbox|radio)$/i.test(n.attrs.role || '') ||
  TRIGGER_POPUP.test(n.attrs['aria-haspopup'] || '') ||
  (n.attrs['aria-expanded'] !== undefined && (T.ancestors(n).some(isHeadingEl) || (n.attrs['aria-controls'] && !/dialog/i.test(n.attrs['aria-haspopup'] || ''))))

function placeOf(el) {
  const chain = chainOf(el)
  if (el.tag === 'title' && el.foreign) return 'label' // svg 아이콘 이름
  if (chain.some(isHeadingEl)) return 'heading'
  if (chain.some(isButtonEl)) return 'button'
  if (chain.some(x => INTRO_CLASS.test(x.attrs?.class || ''))) return 'intro'
  return 'body'
}
const isImageEl = n => n.tag === 'img' || n.attrs?.role === 'img'
// 보고 묶음 기준 — 같은 제목·버튼(바깥쪽) 안이면 aria-label과 보이는 글이 같은 문구를 두 번 보고하지 않는다
const reportAnchor = el => [...chainOf(el)].reverse().find(a => isHeadingEl(a) || isButtonEl(a)) || el

function r43(root, chunks, ctx, out) {
  const C = ctx.copy
  const allowN = [...(C.allow || []), ...(ctx.copyAllow || [])].map(s => norm(String(s))).filter(Boolean)
  const clean = s => norm(allowN.reduce((t, w) => t.split(w).join(' '), norm(s)).replace(QUOTED, ' '))
  const profile = ctx.profile || null
  const codeOrQuote = el => chainOf(el).some(a => CODE_LIKE.has(a.tag) || QUOTE_TAGS.has(a.tag))

  // 같은 묶음·같은 항목은 더 높은 심각도 하나만
  const best = new Map()
  const report = (anchor, key, severity, line, message, sample) => {
    if (!severity) return
    if (!best.has(anchor)) best.set(anchor, new Map())
    const m = best.get(anchor)
    const prev = m.get(key)
    if (!prev || SEVERITY_RANK[severity] > SEVERITY_RANK[prev.severity]) m.set(key, { rule: 'R-43', severity, line, message, code: norm(sample || '').slice(0, 120) })
  }

  // 문구 출처: 문구 덩어리, 접근성 속성, 입력 버튼 값
  const sinks = chunks.map(ch => ({ text: r43TextOf(ch), el: ch.el, kind: 'text', chunk: ch, line: ch.line }))
  T.walk(root, n => {
    if (n.tag === '#root' || n.tag === '#text') return
    for (const a of ['aria-label', 'title', 'alt']) if (n.attrs[a]) sinks.push({ text: n.attrs[a], el: n, kind: a, line: T.attrLine(n, a) })
    if (n.tag === 'input' && /^(?:submit|button)$/i.test(n.attrs.type || '') && n.attrs.value) sinks.push({ text: n.attrs.value, el: n, kind: 'value', line: T.attrLine(n, 'value') })
  })

  for (const s of sinks) {
    if (s.kind !== 'text' && (codeOrQuote(s.el) || isForeignText(langOf(s.el), s.text))) continue
    const t = clean(s.text)
    if (!t) continue
    // 이미지의 대체 글(alt, img·role=img의 aria-label·title)은 이미지 속 글자 전사일 수 있어 alt와 같게 본다
    const place = s.kind === 'alt' || ((s.kind === 'aria-label' || s.kind === 'title') && isImageEl(s.el)) ? 'alt'
      : s.kind === 'aria-label' || s.kind === 'title' ? 'label' : placeOf(s.el)
    const anchor = reportAnchor(s.el)
    const altKey = place === 'alt' ? 'alt' : 'copy'
    const lineFor = sample => (s.chunk ? lineOfMatch(s.chunk, sample) : s.line)
    // (1) 번역투·2인칭 마케팅 — 제목·버튼·intro·title·aria-label은 error, 본문·alt는 warn.
    //     예외 문형(…하십시오)은 문장마다 본다 — 같은 덩어리의 다른 문장이 예외를 빌려 주지 않는다
    for (const item of C.translationese) {
      const hitSentence = (item.except ? sentencesOf(t) : [t]).find(sen => item.re.test(sen) && !(item.except && item.except.test(sen)))
      if (!hitSentence) continue
      const m = hitSentence.match(item.re)
      const severity = place === 'body' || place === 'alt' ? 'warn' : 'error'
      report(anchor, `${item.key}|${altKey}`, severity, lineFor(m[0]), `"${m[0]}" — ${item.why}. 합쇼체 사실 서술로 쓴다(art-direction §8).`, t)
    }
    // (3) 느낌표 — 공공서비스의 제목·버튼·intro는 error, 그 밖은 프로필별 warn
    if (place !== 'alt' && C.exclamation.test(t)) {
      let severity = null
      if (PUBLIC_STRICT.has(profile)) severity = place === 'body' ? 'warn' : 'error'
      else if (PUBLIC_SOFT.has(profile)) severity = 'warn'
      else if (place === 'heading' || place === 'button' || place === 'label') severity = 'warn'
      const m = t.match(C.exclamation)
      report(anchor, `!|${altKey}`, severity, lineFor(m[0]), `느낌표 — ${PUBLIC_STRICT.has(profile) || PUBLIC_SOFT.has(profile) ? '공공 화면은' : '제목·버튼은'} 차분한 서술로 쓴다.`, t)
    }
  }

  // (2) 버튼 이름이 '~하세요·~하십시오·~해 보세요'처럼 재촉형으로 끝난다 — KRDS 동사형 레이블(신청하기·검색)을 쓴다.
  //     aria-label과 보이는 글을 둘 다 본다(이름이 다르면 이용자가 읽는 것은 보이는 글이다). 탭·펼침 트리거는 제목 구실이라 뺀다
  T.walk(root, n => {
    if (n.tag === '#root' || n.tag === '#text' || !isButtonEl(n) || isTrigger(n) || codeOrQuote(n)) return
    let target = n
    if (!['button', 'a', 'input'].includes(n.tag)) {
      const h = T.find(n, x => x !== n && x.tag !== '#text' && isHeadingEl(x))
      if (h) target = h
    }
    const names = []
    if (n.attrs['aria-label']) names.push(n.attrs['aria-label'])
    if (n.tag === 'input') names.push(n.attrs.value || '')
    else {
      names.push(T.textOf(target, { visible: true }))
      if (!n.attrs['aria-label']) names.push(T.textOf(target, { accessible: true }))
    }
    for (const raw of names) {
      if (isForeignText(langOf(n), raw)) continue
      const name = clean(raw).replace(TRAILING_SYMBOLS, '')
      if (name && C.buttonImperative.test(name)) {
        report(reportAnchor(n), 'button-imperative', 'error', n.line, `버튼 이름 "${name}"이 재촉형 명령으로 끝난다 — KRDS 동사형 레이블(예: "신청하기", "검색")을 쓴다.`, name)
        break
      }
    }
  })

  for (const m of best.values()) out.push(...m.values())
}

// ─── 스캐너 ─────────────────────────────────────────────

// 틀 표시 요소 — 요소 트리로 찾는다(주석·script 문자열 안의 표시는 표시가 아니다). 이름은 대소문자를 가리지 않는다
function templateMarkerEl(root, copy) {
  const marker = ((copy && copy.templateMarker) || 'infoux:template').toLowerCase()
  return T.find(root, n => n.tag === 'meta' && String(n.attrs.name || '').toLowerCase() === marker)
}
const hasTemplateMarker = (html, copy) => !!templateMarkerEl(T.parseHtml(html), copy)

// ctx: { scope, profile, copy(compileContracts 결과), copyAllow }
function scanHtmlCopy(html, ctx) {
  const root = T.parseHtml(html)
  const out = []
  const marker = templateMarkerEl(root, ctx.copy)
  // 틀 표시가 남은 페이지는 매번 알린다 — 스타터를 복제해 그대로 납품 페이지를 만들면 자리값 검사가 약해진 채로 남는다
  if (marker && ctx.scope === 'template') {
    out.push({ rule: 'R-23', severity: 'warn', line: marker.line, message: `스타터 틀 표시(${ctx.copy.templateMarker})가 남아 있다 — 이 페이지를 납품용으로 고쳤다면 표시 줄을 지운다. 그 전까지 자리값 제목·기관명·연락처는 경고로만 본다.`, code: `<meta name="${ctx.copy.templateMarker}">` })
  } else if (marker && ctx.scope === 'deliverable') {
    out.push({ rule: 'R-23', severity: 'warn', line: marker.line, message: `틀 표시(${ctx.copy.templateMarker})는 루트 index.html 전용이다 — 이 페이지는 납품 페이지로 검사한다. 표시 줄을 지운다.`, code: `<meta name="${ctx.copy.templateMarker}">` })
  }
  const chunks = collectChunks(root)
  r23(root, chunks, ctx, out)
  r43(root, chunks, ctx, out)
  return out.sort((a, b) => (a.line || 0) - (b.line || 0))
}

// 파일 → 범위. posixPath는 프로젝트 루트 기준 '/…', isPage는 page-scope가 납품 페이지로 모은 파일인가.
// 틀 표시는 .html에서만, 그리고 납품 페이지 중에서는 루트 index.html에서만 인정한다
// (스타터 index.html을 복사해 만든 pages/*.html이 표시를 끌고 가도 납품 검사를 받는다)
function copyScopeOf(posixPath, html, { isPage = false, copy } = {}) {
  if (/\.html$/i.test(posixPath) && (!isPage || posixPath === '/index.html') && hasTemplateMarker(html, copy)) return 'template'
  if (isPage) return 'deliverable'
  if (/\/src\/snippets\/|^\/site\/(?:components|prompts)\//.test(posixPath)) return 'snippet'
  if (/\/src\/playground\//.test(posixPath)) return 'playground'
  return 'doc'
}

// 마크다운 본문 문장 — 규칙 설명이 인용한 금지 문구('…'·"…"·`…`)는 빼고, 문장 단위로 고정해 본다
//   (앵커 없이 보면 '카드 제목 아래에는 요약 설명이 들어갑니다.' 같은 구조 설명이 오류가 된다)
function proseFillerHit(line) {
  const t = norm(line.replace(/^\s*(?:[-*+]|\d+[.)]|>)\s+/, ''))
  if (!t) return false
  if (FILLER_ANYWHERE.some(re => re.test(t))) return true
  return sentencesOf(t).some(s => FILLER_SENTENCE.some(re => re.test(s)) || BODY_FILLER.test(s))
}
const HTML_FENCE = new Set(['html', 'njk', 'nunjucks'])
const MARKDOWN_FENCE = new Set(['markdown', 'md'])
// 마크업에 가까운 펜스 — 본문 문장과 같은 줄 단위 채움 문구 검사를 더한다(트리 규칙은 적용하지 않는다)
const MARKUP_LIKE_FENCE = new Set(['', 'vue', 'jsx', 'tsx', 'svelte', 'astro', 'xml', 'svg', 'php'])
// 원시 HTML 블록의 시작 — 인라인 서식 태그(<strong>주의</strong> — …)로 시작하는 줄은 본문 문단이다
const RAW_HTML_START = /^\s*<(?!(?:strong|b|em|i|kbd|code|small|mark|abbr|sub|sup|u|s|del|ins|q|cite|var|samp|span)\b)[a-zA-Z]/i
const blankLine = s => s.replace(/[^\n]/g, ' ')

// 마크다운 — html 펜스와 본문 속 원시 HTML 블록(빈 줄까지)은 트리로 보고(금지 예시 펜스 제외),
// 본문 문장은 채움 문구·핫링크만 본다(카피 톤 R-43은 문장 서술에 적용하지 않는다).
// markdown 펜스(프롬프트 문서가 본문 전체를 감싼다)는 안을 다시 마크다운으로 본다
function scanMarkdownCopy(md, ctx) {
  const out = []
  const sev = severityTable(ctx.scope)
  const shift = base => f => ({ ...f, line: base + (f.line || 1) - 1 })
  // prose: 본문 문장이면 인라인 코드·따옴표 인용(규칙 설명이 인용한 금지 문구)을 빼고 본다. 코드 펜스는 문자열이 곧 내용이라 그대로
  const lineChecks = (text, base, withFiller, prose = false) => {
    text.split('\n').forEach((raw, i) => {
      const line = prose ? raw.replace(/`[^`\n]*`/g, ' ').replace(QUOTED, ' ') : raw
      const at = base + i
      if (withFiller ? proseFillerHit(line) : FILLER_ANYWHERE[0].test(line)) out.push({ rule: 'R-23', severity: sev.filler, line: at, message: '채움 문구 — 실제 문안이나 contentSources의 실제 용어를 쓴다.', code: raw.trim().slice(0, 120) })
      if (ctx.copy.hotlink.test(line)) out.push({ rule: 'R-23', severity: 'error', line: at, message: 'placeholder 이미지 핫링크 주소.', code: raw.trim().slice(0, 120) })
    })
  }
  for (const seg of splitMarkdown(md)) {
    if (seg.lang === 'prose') {
      const lines = seg.text.split('\n')
      let i = 0
      let buf = []
      let bufStart = 0
      const flushProse = () => {
        if (buf.length) lineChecks(buf.join('\n'), seg.startLine + bufStart, true, true)
        buf = []
      }
      while (i < lines.length) {
        if (RAW_HTML_START.test(lines[i])) {
          flushProse()
          let j = i
          while (j < lines.length && lines[j].trim() !== '') j++
          const block = lines.slice(i, j).join('\n').replace(/`[^`\n]*`/g, blankLine)
          out.push(...scanHtmlCopy(block, ctx).map(shift(seg.startLine + i)))
          i = j
          bufStart = i
          continue
        }
        if (!buf.length) bufStart = i
        buf.push(lines[i])
        i++
      }
      flushProse()
      continue
    }
    if (seg.counter) continue
    if (HTML_FENCE.has(seg.lang)) out.push(...scanHtmlCopy(seg.text, ctx).map(shift(seg.startLine)))
    else if (MARKDOWN_FENCE.has(seg.lang)) out.push(...scanMarkdownCopy(seg.text, ctx).map(shift(seg.startLine)))
    else if (seg.lang === 'css') out.push(...scanTextHotlinks(stripCssComments(seg.text), ctx).map(shift(seg.startLine)))
    else if (seg.lang === 'js' || seg.lang === 'javascript') out.push(...scanTextHotlinks(stripJsComments(seg.text), ctx).map(shift(seg.startLine)))
    else lineChecks(seg.text, seg.startLine, MARKUP_LIKE_FENCE.has(seg.lang))
  }
  return out
}

// CSS·JS 원문의 핫링크(url()·문자열) — 주석은 호출하는 쪽이 줄 수를 유지한 채 지워서 넘긴다
function scanTextHotlinks(text, ctx) {
  const out = []
  text.split('\n').forEach((line, i) => {
    if (ctx.copy.hotlink.test(line)) out.push({ rule: 'R-23', severity: 'error', line: i + 1, message: 'placeholder 이미지 핫링크 — 실제 자산 경로를 쓴다(납품 self-contained 정책).', code: line.trim().slice(0, 120) })
  })
  return out
}

// JS 주석을 줄 수를 유지한 채 지운다 — 문자열 속 '//'(https://…)는 남긴다(앞 글자가 ':'·따옴표면 주석이 아니다)
function stripJsComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, blankLine).replace(/(^|[^:'"`\\\w])\/\/.*$/gm, '$1')
}

// JS 원문 — 핫링크(error)와 문자열 리터럴의 자리 문구(lorem은 error, 그 밖의 채움 문구·지어낸 연락처는 warn).
// JS에는 페이지 범위가 없어 연락처는 경고로만 본다. '예:' 조각은 뺀다
function scanJsCopy(src, ctx) {
  const code = stripJsComments(src)
  const out = scanTextHotlinks(code, ctx)
  const lineAt = T.makeLineAt(code)
  const re = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g
  let m
  while ((m = re.exec(code))) {
    const lit = norm(m[0].slice(1, -1).replace(/\$\{[^}]*\}/g, ' '))
    if (!lit || !/[가-힣A-Za-z]/.test(lit)) continue
    const line = lineAt(m.index)
    const body = norm(stripExamples(lit))
    if (FILLER_ANYWHERE[0].test(body)) out.push({ rule: 'R-23', severity: 'error', line, message: 'lorem ipsum 채움 문구(문자열).', code: lit.slice(0, 120) })
    else if (fillerHit(body, false)) out.push({ rule: 'R-23', severity: 'warn', line, message: '채움 문구(문자열) — 화면에 나가는 글이면 실제 문안을 쓴다.', code: lit.slice(0, 120) })
    const t = body.replace(MASKED_SURNAME, ' ')
    for (const [name, rx] of [...PLACEHOLDER_CONTACT.filter(([n]) => !/OO|XX|○○/.test(n)), ...REALISTIC_CONTACT]) {
      if (rx.test(t)) out.push({ rule: 'R-23', severity: 'warn', line, message: `${name}(문자열) — 화면에 나가는 값이면 실제 값으로 바꾼다.`, code: lit.slice(0, 120) })
    }
  }
  return out
}

module.exports = { loadCopyContracts, compileContracts, scanHtmlCopy, scanMarkdownCopy, scanTextHotlinks, scanJsCopy, stripJsComments, hasTemplateMarker, copyScopeOf, severityTable, collectChunks }
