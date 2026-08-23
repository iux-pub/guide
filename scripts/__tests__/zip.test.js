// ZIP 쓰기 테스트.
//
// 직접 쓴 형식이라 「우리가 읽으면 읽힌다」로는 증명이 안 된다. 남의 도구(unzip)가
// 읽어야 진짜다. 그래서 마지막 테스트는 실제 unzip에 물린다 — 없는 환경에서는
// 조용히 건너뛴다(CI가 이유 없이 빨개지지 않게).

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const zlib = require('node:zlib')
const { execFileSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const STAMP = new Date('2026-08-23T18:30:00Z')

let makeZip
test('zip 모듈을 읽는다', async () => {
  ;({ makeZip } = await import(path.join(ROOT, 'studio/lib/zip.mjs')))
  assert.equal(typeof makeZip, 'function')
})

/** 중앙 디렉터리를 뒤에서부터 읽어 항목 이름을 뽑는다. */
function namesInZip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  assert.ok(eocd > 0, 'EOCD 없음')
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const out = []
  for (let i = 0; i < count; i += 1) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50, `${i}번째 중앙 헤더 서명이 다르다`)
    const nlen = buf.readUInt16LE(p + 28)
    const elen = buf.readUInt16LE(p + 30)
    const clen = buf.readUInt16LE(p + 32)
    out.push(buf.toString('utf8', p + 46, p + 46 + nlen))
    p += 46 + nlen + elen + clen
  }
  return out
}

test('폴더 경로를 그대로 담는다', async () => {
  const { makeZip: mk } = await import(path.join(ROOT, 'studio/lib/zip.mjs'))
  const z = mk([
    { name: 'sprite.svg', data: '<svg/>' },
    { name: 'svg/star.svg', data: '<svg/>' },
    { name: 'svg/fill/star.svg', data: '<svg/>' }
  ], STAMP)
  assert.deepEqual(namesInZip(z), ['sprite.svg', 'svg/star.svg', 'svg/fill/star.svg'])
})

test('같은 입력이면 같은 zip이 나온다', async () => {
  const { makeZip: mk } = await import(path.join(ROOT, 'studio/lib/zip.mjs'))
  const entries = [{ name: 'a.txt', data: 'hello' }, { name: 'b/c.txt', data: '한글' }]
  // 시각을 밖에서 받는 이유가 이것이다 — 안에서 now()를 부르면 매번 달라져
  // 「묶음이 바뀌었는지」를 비교할 수 없다
  assert.ok(mk(entries, STAMP).equals(mk(entries, STAMP)))
})

test('줄여서 커지는 파일은 그냥 담는다', async () => {
  const { makeZip: mk } = await import(path.join(ROOT, 'studio/lib/zip.mjs'))
  // 이미 압축된 바이트(폰트가 이렇다)를 다시 줄이면 되레 커진다
  const random = require('node:crypto').randomBytes(4096)
  const z = mk([{ name: 'f.bin', data: random }], STAMP)
  const method = z.readUInt16LE(8) // 첫 로컬 헤더의 압축 방식
  assert.equal(method, 0, '저장(0)이어야 한다 — deflate로 부풀리지 않는다')
  assert.ok(z.length < random.length + 300, `헤더 몫만 붙어야 한다 (${z.length})`)
})

test('이진 파일이 바이트 그대로 돌아온다', async () => {
  const { makeZip: mk } = await import(path.join(ROOT, 'studio/lib/zip.mjs'))
  const font = path.join(ROOT, 'assets/icons/infoux-icons.woff2')
  if (!fs.existsSync(font)) return
  const raw = fs.readFileSync(font)
  const z = mk([{ name: 'infoux-icons.woff2', data: raw }], STAMP)

  // 로컬 헤더를 직접 읽어 본문만 떼어 낸다
  const nlen = z.readUInt16LE(26)
  const elen = z.readUInt16LE(28)
  const csize = z.readUInt32LE(18)
  const method = z.readUInt16LE(8)
  const body = z.subarray(30 + nlen + elen, 30 + nlen + elen + csize)
  const back = method === 8 ? zlib.inflateRawSync(body) : body
  assert.ok(back.equals(raw), '푼 바이트가 원본과 다르다')
})

test('unzip이 읽을 수 있는 zip이다', async () => {
  const { makeZip: mk } = await import(path.join(ROOT, 'studio/lib/zip.mjs'))
  let unzip
  try {
    unzip = execFileSync('which', ['unzip'], { encoding: 'utf8' }).trim()
  } catch {
    return // unzip이 없는 환경에서는 건너뛴다
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-zip-'))
  try {
    const z = mk([
      { name: 'README.txt', data: '한글 내용\n둘째 줄\n' },
      { name: 'svg/star.svg', data: '<svg viewBox="0 0 24 24"/>' }
    ], STAMP)
    const zp = path.join(dir, 't.zip')
    fs.writeFileSync(zp, z)

    // -t는 CRC까지 대조한다. 여기서 통과하면 형식이 맞는 것이다.
    execFileSync(unzip, ['-t', zp], { stdio: 'pipe' })
    execFileSync(unzip, ['-q', zp, '-d', path.join(dir, 'out')], { stdio: 'pipe' })

    assert.equal(fs.readFileSync(path.join(dir, 'out/README.txt'), 'utf8'), '한글 내용\n둘째 줄\n')
    assert.ok(fs.existsSync(path.join(dir, 'out/svg/star.svg')), '폴더가 만들어지지 않았다')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
