// ZIP 쓰기 — 의존성 없이.
//
// 왜 직접 쓰나: 스튜디오는 NAS에서 `npm install` 없이 도는 것을 전제로 한다
// (node 하나만 있으면 뜬다). zip 하나 만들자고 그 전제를 깨지 않는다.
// 필요한 것은 저장·deflate 두 방식뿐이고 zlib은 node 코어에 있다.
//
// 왜 zip이어야 하나: 예전에는 파일을 낱개로 내려보내며 이름에 폴더를 접어 넣고
// (`svg_star.svg`) 「svg_로 시작하는 파일은 svg/ 폴더에 넣으세요」라고 안내했다.
// 받는 사람이 손으로 다시 조립해야 했고, 폰트(woff2)는 이진이라 아예 못 보냈다.
// zip이면 폴더 구조와 이진 파일이 그대로 간다.

import zlib from 'node:zlib'

// ── CRC32 ──────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// ── DOS 시각 ───────────────────────────────────────────

/**
 * zip은 1980년 기준 DOS 시각을 쓴다. 초는 2초 단위라 홀수 초는 표현되지 않는다.
 * 날짜를 밖에서 받는 이유: 같은 입력이면 같은 zip이 나와야 검증이 가능하다.
 */
function dosTime(date) {
  const y = Math.max(1980, date.getFullYear())
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((y - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  }
}

// ── 쓰기 ───────────────────────────────────────────────

/**
 * @param {Array<{name: string, data: Buffer|string}>} entries 경로는 `/`로 구분한다
 * @param {Date} [now] 기록할 시각. 생략하면 현재 시각
 * @returns {Buffer}
 */
export function makeZip(entries, now = new Date()) {
  const { time, date } = dosTime(now)
  const locals = []
  const centrals = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const raw = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8')
    const crc = crc32(raw)

    // 줄여서 되레 커지는 파일이 있다(이미 압축된 woff2). 그럴 땐 그냥 담는다.
    const deflated = zlib.deflateRawSync(raw, { level: 9 })
    const compressed = deflated.length < raw.length
    const body = compressed ? deflated : raw
    const method = compressed ? 8 : 0

    // 파일명이 ASCII를 벗어날 수 있으므로 UTF-8 플래그(비트 11)를 세운다
    const flags = 0x0800

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) // 필요한 버전
    local.writeUInt16LE(flags, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28) // extra 없음
    locals.push(local, name, body)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4) // 만든 버전
    central.writeUInt16LE(20, 6) // 필요한 버전
    central.writeUInt16LE(flags, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(date, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(body.length, 20)
    central.writeUInt32LE(raw.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30) // extra
    central.writeUInt16LE(0, 32) // 주석
    central.writeUInt16LE(0, 34) // 디스크 번호
    central.writeUInt16LE(0, 36) // 내부 속성
    central.writeUInt32LE(0, 38) // 외부 속성
    central.writeUInt32LE(offset, 42)
    centrals.push(central, name)

    offset += local.length + name.length + body.length
  }

  const centralBuf = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4) // 이 디스크 번호
  end.writeUInt16LE(0, 6) // 중앙 디렉터리가 시작하는 디스크
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuf.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20) // 주석 길이

  return Buffer.concat([...locals, centralBuf, end])
}
