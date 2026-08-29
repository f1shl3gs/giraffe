import {applyPalette} from './drawHeatmap'

describe('applyPalette', () => {
  const buildLUT = (): Uint8ClampedArray => {
    const lut = new Uint8ClampedArray(256 * 4)
    lut[255 * 4] = 250
    lut[255 * 4 + 1] = 10
    lut[255 * 4 + 2] = 5
    lut[255 * 4 + 3] = 200
    lut[128 * 4] = 100
    lut[128 * 4 + 1] = 60
    lut[128 * 4 + 2] = 30
    lut[128 * 4 + 3] = 255
    return lut
  }

  it('replaces RGB of opaque pixels via the LUT and keeps their alpha', () => {
    const data = new Uint8ClampedArray([
      1,
      2,
      3,
      255, // pixel 0: alpha 255
      4,
      5,
      6,
      0, // pixel 1: transparent
    ])

    applyPalette(data, buildLUT())

    expect(Array.from(data.slice(0, 8))).toEqual([250, 10, 5, 255, 4, 5, 6, 0])
  })

  it('leaves fully transparent pixels untouched', () => {
    const data = new Uint8ClampedArray([9, 9, 9, 0])

    applyPalette(data, buildLUT())

    expect(Array.from(data)).toEqual([9, 9, 9, 0])
  })

  it('reads the mid-range LUT entry for partial alpha', () => {
    const data = new Uint8ClampedArray([7, 7, 7, 128])

    applyPalette(data, buildLUT())

    expect(Array.from(data)).toEqual([100, 60, 30, 128])
  })
})
