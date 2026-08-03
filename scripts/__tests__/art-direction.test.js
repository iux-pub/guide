// 아트 디렉션 정본 검증 — contracts/art-direction.json이 저장소 실물과 어긋나지 않는지 본다
// 폰트 woff2는 원 배포처 입수 대기 상태를 허용한다 — 파일 실존·sha256 검사는
// sha256이 기록된 폰트에만 적용한다(정본 policy 문장과 동일 기준)

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'art-direction.json'), 'utf8'))
const profileSpec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))

// 원 배포처 기준 판정 원칙 승계 — 재배포 가능 라이선스만 카탈로그에 입고한다
const REDISTRIBUTABLE = ['OFL-1.1', 'Apache-2.0', 'MIT']
const PENDING = '입수 대기'

/** '-0.02em' / '0' 형태의 letter-spacing 값을 숫자로 바꾼다. */
function parseEm(value) {
  return parseFloat(String(value)) || 0
}

test('타이포 카탈로그가 필수 필드를 갖췄다', () => {
  assert.ok(spec.typography.length > 0, 'typography가 비어 있다')
  for (const entry of spec.typography) {
    for (const field of ['id', 'label']) {
      assert.ok(typeof entry[field] === 'string' && entry[field].length > 0, `${entry.id ?? '?'}: ${field} 누락`)
    }
    assert.ok(Array.isArray(entry.mood) && entry.mood.length > 0, `${entry.id}: mood 누락`)
    assert.ok(typeof entry.heading?.stack === 'string' && entry.heading.stack.length > 0, `${entry.id}: heading.stack 누락`)
    assert.ok(typeof entry.body?.lineHeight === 'number', `${entry.id}: body.lineHeight 누락`)
    assert.ok(Array.isArray(entry.fonts) && entry.fonts.length > 0, `${entry.id}: fonts가 비어 있다`)
    assert.ok(Array.isArray(entry.cautions), `${entry.id}: cautions 누락`)
  }
})

test('폰트 라이선스는 재배포 가능 목록만 허용한다', () => {
  for (const entry of spec.typography) {
    for (const font of entry.fonts) {
      assert.ok(
        REDISTRIBUTABLE.includes(font.license?.type),
        `${entry.id}/${font.family}: 라이선스 "${font.license?.type}"는 재배포 가능 목록(${REDISTRIBUTABLE.join(', ')})에 없다`
      )
      assert.ok(font.license.verifiedAt, `${entry.id}/${font.family}: license.verifiedAt 누락`)
      assert.ok(font.provenance, `${entry.id}/${font.family}: provenance(원 배포처) 누락`)
    }
  }
})

test('셀프호스팅 폰트는 파일 경로를 선언하고, sha256 기록분은 실물이 있다', () => {
  for (const entry of spec.typography) {
    for (const font of entry.fonts) {
      if (font.hosting !== 'self') continue
      assert.ok(Array.isArray(font.files) && font.files.length > 0, `${entry.id}/${font.family}: files가 비어 있다`)

      // 입수 대기 폰트는 경로 선언만 검사한다 — 실존·sha256 검사는 입수 후부터 적용
      if (font.sha256 === PENDING) {
        assert.equal(font.acquiredAt, PENDING, `${entry.id}/${font.family}: sha256이 입수 대기면 acquiredAt도 입수 대기여야 한다`)
        continue
      }
      assert.match(font.sha256, /^[0-9a-f]{64}$/, `${entry.id}/${font.family}: sha256 형식 오류`)
      assert.notEqual(font.acquiredAt, PENDING, `${entry.id}/${font.family}: sha256이 기록됐는데 acquiredAt이 입수 대기다`)
      for (const file of font.files) {
        assert.ok(fs.existsSync(path.join(ROOT, file)), `${entry.id}/${font.family}: ${file} 실물 누락`)
      }
    }
  }
})

test('제목 스택은 한글 가용 폰트와 --font-sans 폴백을 갖는다', () => {
  // 한글 글리프 없는 표시 폰트 단독 스택(fallback 뒤죽박죽)을 구조적으로 차단한다
  for (const entry of spec.typography) {
    assert.ok(
      entry.fonts.some(font => font.hangul === true),
      `${entry.id}: hangul: true 폰트가 없다`
    )
    assert.ok(
      entry.heading.stack.includes('var(--font-sans)'),
      `${entry.id}: heading.stack에 var(--font-sans) 폴백이 없다`
    )
  }
})

test('타이포 수치가 hangul 블록 범위 안에 있다', () => {
  const body = spec.hangul.bodyLineHeight
  const heading = spec.hangul.headingLineHeight
  const lsMin = parseEm(spec.hangul.headingLetterSpacing.min)
  const lsMax = parseEm(spec.hangul.headingLetterSpacing.max)

  for (const entry of spec.typography) {
    assert.ok(
      entry.body.lineHeight >= body.min && entry.body.lineHeight <= body.max,
      `${entry.id}: body.lineHeight ${entry.body.lineHeight}가 ${body.min}~${body.max} 밖이다`
    )
    assert.ok(
      entry.heading.lineHeight >= heading.min && entry.heading.lineHeight <= heading.max,
      `${entry.id}: heading.lineHeight ${entry.heading.lineHeight}가 ${heading.min}~${heading.max} 밖이다`
    )
    const ls = parseEm(entry.heading.letterSpacing)
    assert.ok(ls >= lsMin && ls <= lsMax, `${entry.id}: letterSpacing ${entry.heading.letterSpacing}가 ${lsMin}~${lsMax}em 밖이다`)

    for (const weight of [...entry.heading.weights, ...entry.body.weights]) {
      assert.ok(weight >= 400 && weight <= 900, `${entry.id}: weight ${weight}가 400~900 밖이다`)
    }
  }
})

test('expression id가 expressionLevels 정의와 일치한다', () => {
  const levels = Object.keys(profileSpec.expressionLevels)
  for (const entry of spec.typography) {
    assert.ok(entry.expression.length > 0, `${entry.id}: expression이 비어 있다`)
    for (const level of entry.expression) {
      assert.ok(levels.includes(level), `${entry.id}: 표현 등급 "${level}" 정의 없음`)
    }
  }
  for (const palette of spec.palettes) {
    assert.ok(palette.expression.length > 0, `${palette.id}: expression이 비어 있다`)
    for (const level of palette.expression) {
      assert.ok(levels.includes(level), `${palette.id}: 표현 등급 "${level}" 정의 없음`)
    }
  }
})

test('profiles 매핑이 profiles.json 5종과 일치하고 실존 id만 가리킨다', () => {
  const profileIds = profileSpec.profiles.map(p => p.id).sort()
  assert.deepEqual(Object.keys(spec.profiles).sort(), profileIds, 'art-direction profiles 키가 profiles.json과 다르다')

  const typographyIds = spec.typography.map(entry => entry.id)
  const paletteIds = spec.palettes.map(palette => palette.id)

  for (const [profileId, map] of Object.entries(spec.profiles)) {
    for (const id of map.typography) {
      assert.ok(typographyIds.includes(id), `${profileId}: 타이포 "${id}"가 카탈로그에 없다`)
    }
    for (const id of map.palettes) {
      assert.ok(paletteIds.includes(id), `${profileId}: 팔레트 "${id}"가 카탈로그에 없다`)
    }
    assert.ok(map.rhythm, `${profileId}: rhythm 누락`)
    assert.ok(map.copyTone, `${profileId}: copyTone 누락`)
  }

  for (const entry of spec.typography) {
    for (const id of entry.profiles) {
      assert.ok(profileIds.includes(id), `${entry.id}: 프로필 "${id}" 정의 없음`)
    }
  }
  for (const palette of spec.palettes) {
    for (const id of palette.profiles) {
      assert.ok(profileIds.includes(id), `${palette.id}: 프로필 "${id}" 정의 없음`)
    }
  }
})

test('팔레트 인덱스는 실존 프리셋 파일만 가리킨다', () => {
  for (const palette of spec.palettes) {
    const file = path.join(ROOT, palette.file)
    assert.ok(fs.existsSync(file), `${palette.id}: ${palette.file} 실물 누락`)
    const preset = JSON.parse(fs.readFileSync(file, 'utf8'))
    assert.equal(preset.$meta?.preset?.id, palette.id, `${palette.id}: 프리셋 $meta.preset.id와 인덱스 id가 다르다`)
  }
})

test('생성 문서에 마커 4쌍이 살아 있다', () => {
  // 마커가 사라지면 build:art-direction이 실패하는 대신 표가 조용히 낡는다
  const doc = fs.readFileSync(path.join(ROOT, 'references', 'art-direction.md'), 'utf8')
  for (const id of ['expression', 'hangul', 'typography', 'palettes']) {
    assert.match(doc, new RegExp(`<!-- art-direction:${id}:begin`), `${id} begin 마커 누락 — npm run build:art-direction`)
    assert.ok(doc.includes(`<!-- art-direction:${id}:end -->`), `${id} end 마커 누락 — npm run build:art-direction`)
  }
})
