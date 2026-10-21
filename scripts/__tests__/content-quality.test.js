// 이름의 질 — R-09 alt·R-30 링크 이름·R-50 placeholder (scripts/lib/content-quality.js)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { altFindings, linkNameFindings, placeholderFindings } = require('../lib/content-quality')

const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.message}`).join('\n')

test('R-09: 일반 어휘·파일명·연번·카메라 이름 alt는 경고', () => {
  for (const alt of ['서비스 메인 이미지', '제품 상세 이미지', '샘플 이미지', '메인 배너', '메인비주얼', 'hero image', 'main-hero@2x.webp', '이미지 1', 'banner01', '로고 3', 'IMG_2034', 'KakaoTalk_20261020'])
    assert.equal(altFindings(`<img src="a.jpg" alt="${alt}">`).length, 1, alt)
})

test('R-09: 구체적인 alt·장식·다른 이름 출처는 통과', () => {
  for (const html of [
    '<img src="a.jpg" alt="흰색 러닝화 측면 사진">',
    '<img src="a.jpg" alt="독도 위성사진">',
    '<img src="a.jpg" alt="감성미식 로고">',
    '<img src="a.jpg" alt="">',
    '<img src="a.jpg" alt="이미지" aria-hidden="true">',
    '<img src="a.jpg" alt="사진" aria-labelledby="cap">'
  ]) assert.deepEqual(altFindings(html), [], `${html}\n${brief(altFindings(html))}`)
})

test('R-09: 여러 줄 태그의 alt 누락은 오류', () => {
  const r = altFindings('<img\n  src="a.jpg"\n  width="100">')
  assert.equal(r[0]?.severity, 'error', brief(r))
  assert.deepEqual(altFindings('<img src="a.jpg">'), []) // 한 줄 태그는 check-violations.js가 본다
})

test('R-30: 목적지를 말하지 않는 링크 이름은 경고', () => {
  for (const name of ['더보기', '더 보기 ›', '자세히', '+ 더보기', 'VIEW MORE', 'Learn more'])
    assert.equal(linkNameFindings(`<a href="/notice">${name}</a>`).length, 1, name)
  assert.deepEqual(linkNameFindings('<a href="/notice">더보기<span class="sr-only"> 공지사항</span></a>'.replace('더보기<span class="sr-only"> 공지사항</span>', '공지사항 더보기')), [])
})

test('R-30: 같은 이름이 다른 목적지로 가면 경고, 끝 슬래시·페이지 번호는 통과', () => {
  assert.equal(linkNameFindings('<a href="/a.pdf">다운로드</a><a href="/b.pdf">다운로드</a>').length, 1)
  assert.deepEqual(linkNameFindings('<a href="/notice/">공지사항</a><a href="/notice">공지사항</a>'), [])
  assert.deepEqual(linkNameFindings('<nav><a href="?p=2">2</a></nav><nav><a href="?q=2">2</a></nav>'), [])
  assert.deepEqual(linkNameFindings('<a href="#">공지</a><a href="/notice">공지</a>'), [])
})

test('R-50: 빈 안내·레이블 반복 placeholder는 경고, 예시는 통과', () => {
  assert.equal(placeholderFindings('<label for="m">메모</label><textarea id="m" placeholder="내용을 입력하세요"></textarea>').length, 1)
  assert.equal(placeholderFindings('<input placeholder="내용 입력">').length, 1)
  assert.equal(placeholderFindings('<input placeholder="입력해 주십시오">').length, 1)
  assert.equal(placeholderFindings('<label for="e">이메일*</label><input id="e" placeholder="이메일">').length, 1)
  assert.deepEqual(placeholderFindings('<label for="p">프로젝트명</label><input id="p" placeholder="프로젝트명을 입력하세요">'), [])
  assert.deepEqual(placeholderFindings('<label for="d">방문일</label><input id="d" placeholder="예: 2026-11-03">'), [])
})
