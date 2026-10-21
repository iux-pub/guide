// HX-07 기준 문서 정합 — 정본과 모순되는 처방 (scripts/lib/doc-prescriptions.js + contracts/copy-lexicon.json prescriptions)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { scanDocPrescriptions } = require('../lib/doc-prescriptions')
const { prescriptions } = require('../../contracts/copy-lexicon.json')

const scan = md => scanDocPrescriptions(md, prescriptions)

test('HX-07: 처방형 문구는 오류', () => {
  for (const md of [
    '- 첫 뷰포트의 **40% 이상**은 비어있어야 한다',
    '- 배경: 오프화이트 `#faf9f6`를 쓴다',
    '- Glassmorphism: 반투명 카드로 깊이를 만든다',
    '- 버튼은 16~24px 둥근 모서리',
    '- 같은 서체 내 극단적 대비: Thin(100~300) + Bold(700~900)',
    '- 랜딩은 스크롤 스토리텔링으로 구성한다',
    '- 좌우 대칭에 안주하지 않는다',
    '- Easing: linear/ease는 구식'
  ]) assert.equal(scan(md).length, 1, md)
})

test('HX-07: 교정 문장·반례 블록·KRDS 긍정 서술은 통과', () => {
  for (const md of [
    '- 글래스모피즘은 쓰지 않는다(R-34)',
    '- 스크롤 스토리텔링 같은 진입 모션 연출은 피한다',
    '## 안티패턴\n- Aurora UI 흐르는 그라디언트\n- 그라디언트 메시 배경',
    '**금지 예시** — 장식 효과\n\n| 스타일 | 이유 |\n|---|---|\n| **Aurora UI** | 장식 그라디언트 |',
    '| 권장 | 금지 스타일 |\n|---|---|\n| Flat | Aurora UI, Glassmorphism |',
    '- ❌ 커스텀 커서로 개성을 준다',
    '- 예측 가능한 레이아웃으로 같은 위치에 같은 기능을 둔다(KRDS)',
    '```css\n.hero { background: radial-gradient(#fff, #000); } /* 그라디언트 메시 */\n```'
  ]) assert.deepEqual(scan(md), [], md)
})

test('HX-07: 예측 가능한 레이아웃을 안티패턴 표에 적으면 반례 블록 안에서도 오류', () => {
  assert.equal(scan('## 안티패턴\n\n| 안티패턴 | 이유 |\n|---|---|\n| 예측 가능한 레이아웃 | 틀에 박힘 |').length, 1)
})
