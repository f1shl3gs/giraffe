// Vendored from s2-geometry@1.2.10 (MIT), Long → BigInt ported.
// Only the closure of S2.idToLatLng is included:
//   idToKey -> keyToLatLng -> FromHilbertQuadKey -> getLatLng
//     -> IJToST / STToUV / FaceUVToXYZ / XYZToLatLng (+ lat/lng clamp & wrap)
// Source: https://git.coolaj86.com/coolaj86/s2-geometry.js/src/branch/master/src/s2geometry.js

const FACE_BITS = 3
const POS_BITS = 61 // 60 bits of data + 1 bit lsb marker

// S2.L.LatLng: clamp latitude into -90..90, wrap longitude into -180..180
const makeLatLng = (
  rawLat: number,
  rawLng: number
): {lat: number; lng: number} => {
  const lat = Math.max(Math.min(rawLat, 90), -90)
  const lng =
    ((rawLng + 180) % 360) + (rawLng < -180 || rawLng === 180 ? 180 : -180)
  return {lat, lng}
}

const RAD_TO_DEG = 180 / Math.PI

const faceUVToXYZ = (face: number, uv: [number, number]): number[] => {
  const u = uv[0]
  const v = uv[1]

  switch (face) {
    case 0:
      return [1, u, v]
    case 1:
      return [-u, 1, v]
    case 2:
      return [-u, -v, 1]
    case 3:
      return [-1, -v, -u]
    case 4:
      return [v, -1, -u]
    case 5:
      return [v, u, -1]
    default:
      throw new Error(`Invalid face: ${face}`)
  }
}

const singleSTtoUV = (st: number): number => {
  if (st >= 0.5) {
    return (1 / 3) * (4 * st * st - 1)
  }
  return (1 / 3) * (1 - 4 * (1 - st) * (1 - st))
}

const stToUV = (st: [number, number]): [number, number] => [
  singleSTtoUV(st[0]),
  singleSTtoUV(st[1]),
]

const ijToST = (
  ij: [number, number],
  order: number,
  offsets: [number, number]
): [number, number] => {
  const maxSize = 1 << order

  return [(ij[0] + offsets[0]) / maxSize, (ij[1] + offsets[1]) / maxSize]
}

const xyzToLatLng = (xyz: number[]): {lat: number; lng: number} => {
  const lat = Math.atan2(xyz[2], Math.sqrt(xyz[0] * xyz[0] + xyz[1] * xyz[1]))
  const lng = Math.atan2(xyz[1], xyz[0])

  return makeLatLng(lat * RAD_TO_DEG, lng * RAD_TO_DEG)
}

const rotateAndFlipQuadrant = (
  n: number,
  point: {x: number; y: number},
  rx: number,
  ry: number
): void => {
  if (ry === 0) {
    if (rx === 1) {
      point.x = n - 1 - point.x
      point.y = n - 1 - point.y
    }

    const x = point.x
    point.x = point.y
    point.y = x
  }
}

// S2Cell.FromHilbertQuadKey + FromFaceIJ collapsed into one cell object
const fromHilbertQuadKey = (
  hilbertQuadkey: string
): {face: number; ij: [number, number]; level: number} => {
  const parts = hilbertQuadkey.split('/')
  const face = parseInt(parts[0])
  const position = parts[1]
  const maxLevel = position.length
  const point = {x: 0, y: 0}
  let level = maxLevel

  for (let i = maxLevel - 1; i >= 0; i--) {
    level = maxLevel - i
    const bit = position[i]
    let rx = 0
    let ry = 0
    if (bit === '1') {
      ry = 1
    } else if (bit === '2') {
      rx = 1
      ry = 1
    } else if (bit === '3') {
      rx = 1
    }

    const val = Math.pow(2, level - 1)
    rotateAndFlipQuadrant(val, point, rx, ry)

    point.x += val * rx
    point.y += val * ry
  }

  if (face % 2 === 1) {
    const t = point.x
    point.x = point.y
    point.y = t
  }

  return {face, ij: [point.x, point.y], level}
}

// S2.keyToLatLng
export const s2KeyToLatLng = (key: string): {lat: number; lng: number} => {
  const cell = fromHilbertQuadKey(key)

  const st = ijToST(cell.ij, cell.level, [0.5, 0.5])
  const uv = stToUV(st)
  const xyz = faceUVToXYZ(cell.face, uv)

  return xyzToLatLng(xyz)
}

// S2.idToKey: decimal cell id string -> "face/pos" hilbert quadkey.
// Ported verbatim from upstream (string surgery over the 64-bit two's
// complement form): the marker bit sits between the position bits and the
// trailing padding, so its index bounds the position field. Level-0 cells
// (marker immediately after the face bits) decode to a bare "<face>/".
// Divergence from upstream: an all-zero id throws instead of emitting junk.
export const s2IdToKey = (idS: string): string => {
  let bin = BigInt(idS).toString(2)

  while (bin.length < FACE_BITS + POS_BITS) {
    bin = '0' + bin
  }

  const lsbIndex = bin.lastIndexOf('1')
  if (lsbIndex === -1) {
    throw new Error(`Invalid S2 cell id: ${idS}`)
  }
  const faceB = bin.substring(0, 3)
  const posB = bin.substring(3, lsbIndex)
  const levelN = posB.length / 2

  const faceS = BigInt('0b' + faceB).toString()
  let posS = posB === '' ? '' : BigInt('0b' + posB).toString(4)

  while (posS.length < levelN) {
    posS = '0' + posS
  }

  return `${faceS}/${posS}`
}

// S2.idToLatLng
export const s2IdToLatLng = (
  idDecimalString: string
): {lat: number; lng: number} => s2KeyToLatLng(s2IdToKey(idDecimalString))
