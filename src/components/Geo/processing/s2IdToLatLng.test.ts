import {s2IdToLatLngFixtures} from './s2IdToLatLng.fixtures'
import {s2IdToKey, s2IdToLatLng} from './s2IdToLatLng'

describe('s2IdToKey edge cases', () => {
  it('decodes canonical level-0 face ids to bare "<face>/" quadkeys', () => {
    // canonical level-0 id: face bits in the high positions + the marker bit
    // at the first position slot (e.g. face 0 -> 2^60)
    for (let face = 0; face < 6; face++) {
      const id = ((BigInt(face) << 61n) | (1n << 60n)).toString()
      expect(s2IdToKey(id)).toBe(`${face}/`)

      const {lat, lng} = s2IdToLatLng(id)
      expect(Number.isFinite(lat)).toBe(true)
      expect(Number.isFinite(lng)).toBe(true)
    }
  })

  it('throws on an all-zero id, unlike upstream which emitted junk', () => {
    expect(() => s2IdToKey('0')).toThrow(/Invalid S2 cell id/)
  })
})

describe('s2IdToLatLng', () => {
  it('matches the s2-geometry@1.2.10 golden fixtures (levels 0-30)', () => {
    for (const {id, lat, lng} of s2IdToLatLngFixtures) {
      const result = s2IdToLatLng(id)
      expect(Math.abs(result.lat - lat)).toBeLessThan(1e-9)
      expect(Math.abs(result.lng - lng)).toBeLessThan(1e-9)
    }
  })

  it('clamps lat into [-90, 90] and wraps lng into [-180, 180)', () => {
    for (const {id} of s2IdToLatLngFixtures) {
      const {lat, lng} = s2IdToLatLng(id)
      expect(lat).toBeGreaterThanOrEqual(-90)
      expect(lat).toBeLessThanOrEqual(90)
      expect(lng).toBeGreaterThanOrEqual(-180)
      expect(lng).toBeLessThan(180)
    }
  })
})
