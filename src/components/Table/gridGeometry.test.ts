import {describe, expect, it} from 'vitest'

import {
  getItemOffset,
  getItemSize,
  getTotalSize,
  getVisibleRange,
} from './gridGeometry'

describe('getItemSize', () => {
  it('returns the numeric size directly', () => {
    expect(getItemSize(30, 5)).toBe(30)
  })

  it('calls a size function with the index', () => {
    expect(getItemSize(({index}) => index * 10, 3)).toBe(30)
  })
})

describe('getItemOffset', () => {
  it('returns 0 for the first item', () => {
    expect(getItemOffset(30, 5, 0)).toBe(0)
  })

  it('accumulates preceding numeric sizes', () => {
    expect(getItemOffset(30, 5, 2)).toBe(60)
  })

  it('accumulates preceding sizes from a size function', () => {
    const size = ({index}: {index: number}) => 10 + index * 5
    expect(getItemOffset(size, 4, 2)).toBe(25)
  })

  it('returns the total size for an out-of-range index equal to count', () => {
    expect(getItemOffset(30, 3, 3)).toBe(90)
  })
})

describe('getTotalSize', () => {
  it('sums numeric sizes', () => {
    expect(getTotalSize(30, 4)).toBe(120)
  })

  it('sums sizes from a size function', () => {
    const size = ({index}: {index: number}) => index + 1
    expect(getTotalSize(size, 4)).toBe(10)
  })

  it('returns 0 when count is 0', () => {
    expect(getTotalSize(30, 0)).toBe(0)
  })
})

describe('getVisibleRange', () => {
  const fixedRows = 10

  it('returns the rows covering the viewport at offset 0', () => {
    const range = getVisibleRange({
      itemCount: fixedRows,
      itemSize: 30,
      overscan: 0,
      scrollOffset: 0,
      viewportSize: 100,
    })

    expect(range).toEqual({start: 0, stop: 3})
  })

  it('starts at the row straddling the scroll offset', () => {
    const range = getVisibleRange({
      itemCount: fixedRows,
      itemSize: 30,
      overscan: 0,
      scrollOffset: 45,
      viewportSize: 100,
    })

    expect(range).toEqual({start: 1, stop: 4})
  })

  it('applies overscan and clamps to bounds', () => {
    const range = getVisibleRange({
      itemCount: fixedRows,
      itemSize: 30,
      overscan: 2,
      scrollOffset: 45,
      viewportSize: 100,
    })

    expect(range).toEqual({start: 0, stop: 6})
  })

  it('clamps to the last row when scrolled far past the end', () => {
    const range = getVisibleRange({
      itemCount: fixedRows,
      itemSize: 30,
      overscan: 0,
      scrollOffset: 10000,
      viewportSize: 100,
    })

    expect(range).toEqual({start: 9, stop: 9})
  })

  it('handles variable row heights', () => {
    const itemSize = ({index}: {index: number}) => (index === 0 ? 100 : 10)
    const range = getVisibleRange({
      itemCount: 20,
      itemSize,
      overscan: 0,
      scrollOffset: 105,
      viewportSize: 25,
    })

    expect(range).toEqual({start: 1, stop: 3})
  })

  it('returns an empty range when there are no items', () => {
    const range = getVisibleRange({
      itemCount: 0,
      itemSize: 30,
      overscan: 0,
      scrollOffset: 0,
      viewportSize: 100,
    })

    expect(range.stop).toBeLessThan(range.start)
  })
})
