import {describe, expect, it} from 'vitest'

import {extentOfExtents} from './extrema'

describe('extentOfExtents', () => {
  it('spans every list', () => {
    expect(extentOfExtents([1, 2], [0, 9])).toEqual([0, 9])
  })

  it('ignores empty lists', () => {
    expect(extentOfExtents([], [3, 7], [])).toEqual([3, 7])
  })

  it('returns null when every list is empty', () => {
    expect(extentOfExtents([], [])).toBeNull()
  })

  it('returns null when there are no lists at all', () => {
    expect(extentOfExtents()).toBeNull()
  })
})
