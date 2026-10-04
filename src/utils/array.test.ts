import {describe, expect, it} from 'vitest'

import {extent, range, thresholdSturges, ticks} from './array'

describe('range', () => {
  describe('single argument', () => {
    it('counts from zero up to but excluding stop', () => {
      expect(range(5)).toEqual([0, 1, 2, 3, 4])
    })

    it('returns nothing when stop is zero or negative', () => {
      expect(range(0)).toEqual([])
      expect(range(-3)).toEqual([])
    })

    it('truncates a fractional stop', () => {
      expect(range(2.5)).toEqual([0, 1, 2])
    })
  })

  describe('two arguments', () => {
    it('starts at start and steps by one', () => {
      expect(range(2, 5)).toEqual([2, 3, 4])
    })

    it('returns nothing when start is not below stop', () => {
      expect(range(5, 5)).toEqual([])
      expect(range(5, 0)).toEqual([])
    })
  })

  describe('three arguments', () => {
    it('steps by the given amount', () => {
      expect(range(0, 5, 2)).toEqual([0, 2, 4])
      expect(range(0, 5, 1.5)).toEqual([0, 1.5, 3, 4.5])
      expect(range(0, 5, 2.5)).toEqual([0, 2.5])
      expect(range(0, 5, 7)).toEqual([0])
      expect(range(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75])
    })

    it('walks backwards when step is negative', () => {
      expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1])
      expect(range(10, 0, -3)).toEqual([10, 7, 4, 1])
    })

    it('steps across zero when start is negative', () => {
      expect(range(-10, 10, 3)).toEqual([-10, -7, -4, -1, 2, 5, 8])
    })

    it('returns nothing when the step points away from stop', () => {
      expect(range(0, 1, -1)).toEqual([])
    })

    it('returns nothing when step is zero rather than looping forever', () => {
      expect(range(0, 5, 0)).toEqual([])
      expect(range(0, 0, 0)).toEqual([])
      expect(range(0, -5, 0)).toEqual([])
    })
  })

  describe('explicit undefined arguments', () => {
    it('treats an explicit undefined stop as a supplied argument, not an absent one', () => {
      expect(range(5, undefined)).toEqual([])
    })

    it('treats an explicit undefined step as a supplied argument, not an absent one', () => {
      expect(range(0, 5, undefined)).toEqual([])
    })

    it('treats an explicit null step as a supplied argument', () => {
      expect(range(0, 5, null as unknown as number)).toEqual([])
    })
  })

  describe('floating point', () => {
    it('computes each element as start + i * step, not by accumulation', () => {
      expect(range(0, 1, 0.1)[3]).toBe(0.30000000000000004)
    })

    it('does not emit an extra element when the division lands just below an integer', () => {
      expect(range(0, 0.3, 0.1)).toHaveLength(3)
    })
  })
})

describe('extent', () => {
  it('returns the smallest and largest value', () => {
    expect(extent([3, 1, 2])).toEqual([1, 3])
  })

  it('returns a zero-width domain for a single repeated value', () => {
    expect(extent([5, 5])).toEqual([5, 5])
    expect(extent([7])).toEqual([7, 7])
  })

  it('returns null when there is nothing to measure', () => {
    expect(extent([])).toBeNull()
  })

  it('skips null and undefined entries', () => {
    expect(extent([null, 3, undefined, 1])).toEqual([1, 3])
  })

  it('skips NaN entries', () => {
    expect(extent([NaN, 1, 2])).toEqual([1, 2])
  })

  it('returns null when every entry is skipped', () => {
    expect(extent([NaN])).toBeNull()
    expect(extent([NaN, NaN])).toBeNull()
    expect(extent([null, undefined])).toBeNull()
  })

  it('keeps zero and negative values', () => {
    expect(extent([-5, 0, 5])).toEqual([-5, 5])
    expect(extent([0, 0])).toEqual([0, 0])
  })

  it('keeps infinities, because they are real bounds', () => {
    expect(extent([-Infinity, 0, Infinity])).toEqual([-Infinity, Infinity])
  })

  it('accepts a typed array', () => {
    expect(extent(new Float32Array([2, 8, 4]))).toEqual([2, 8])
  })
})

describe('thresholdSturges', () => {
  const values = (n: number) => Array.from({length: n}, (_, i) => i)

  it('is ceil(log2(n)) + 1 for n valid values', () => {
    expect(thresholdSturges([1])).toBe(1)
    expect(thresholdSturges([1, 2])).toBe(2)
    expect(thresholdSturges([1, 2, 3])).toBe(3)
    expect(thresholdSturges(values(5))).toBe(4)
    expect(thresholdSturges(values(100))).toBe(8)
  })

  it('rounds down a power of two instead of up', () => {
    expect(thresholdSturges(values(4))).toBe(3)
    expect(thresholdSturges(values(128))).toBe(8)
  })

  it('steps up as soon as the power of two is exceeded', () => {
    expect(thresholdSturges(values(129))).toBe(9)
  })

  it('never returns less than one bin', () => {
    expect(thresholdSturges([])).toBe(1)
    expect(thresholdSturges(null)).toBe(1)
    expect(thresholdSturges(undefined)).toBe(1)
  })

  it('counts only entries that are neither null nor NaN', () => {
    expect(thresholdSturges([NaN, 1])).toBe(1)
    expect(thresholdSturges([null, undefined, NaN])).toBe(1)
    expect(thresholdSturges([1, 2, NaN, null, 3])).toBe(3)
  })

  it('accepts a typed array', () => {
    expect(thresholdSturges(new Float32Array([1, 2, 3, 4, 5]))).toBe(4)
  })
})

describe('ticks', () => {
  describe('ascending', () => {
    it('lands on round steps that span the whole range', () => {
      expect(ticks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100])
      expect(ticks(0, 100, 10)).toEqual([
        0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
      ])
      expect(ticks(2, 8, 3)).toEqual([2, 4, 6, 8])
    })

    it('includes both ends', () => {
      expect(ticks(-100, 100, 8)).toEqual([
        -100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100,
      ])
      expect(ticks(-50, -10, 4)).toEqual([-50, -40, -30, -20, -10])
      expect(ticks(0, 7, 7)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('scales down to a fractional step when the range is small', () => {
      expect(ticks(0, 1, 10)).toEqual([
        0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
      ])
      expect(ticks(0, 0.5, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5])
      expect(ticks(0, 0.001, 5)).toEqual([
        0, 0.0002, 0.0004, 0.0006, 0.0008, 0.001,
      ])
    })

    it('scales up to a coarse step when the range is large', () => {
      expect(ticks(0, 1000000, 4)).toEqual([
        0, 200000, 400000, 600000, 800000, 1000000,
      ])
    })

    it('keeps millisecond timestamps readable', () => {
      expect(ticks(1600000000000, 1600003600000, 5)).toEqual([
        1600000000000, 1600001000000, 1600002000000, 1600003000000,
      ])
    })
  })

  describe('degenerate input', () => {
    it('returns the single value when start equals stop', () => {
      expect(ticks(5, 5, 5)).toEqual([5])
    })

    it('returns nothing when count is zero or negative', () => {
      expect(ticks(0, 100, 0)).toEqual([])
      expect(ticks(0, 100, -3)).toEqual([])
    })

    it('falls back to fewer ticks when one tick cannot be spaced', () => {
      expect(ticks(0, 1, 1)).toEqual([0, 1])
      expect(ticks(0, 100, 1)).toEqual([0, 100])
    })

    it('rounds the count down to a step that fits', () => {
      expect(ticks(0, 1, 2)).toEqual([0, 0.5, 1])
      expect(ticks(0, 1, 3)).toEqual([0, 0.5, 1])
      expect(ticks(0, 1, 7)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    })
  })

  describe('descending', () => {
    it('counts down from start to stop', () => {
      expect(ticks(100, 0, 5)).toEqual([100, 80, 60, 40, 20, 0])
      expect(ticks(1, 0, 4)).toEqual([1, 0.8, 0.6, 0.4, 0.2, 0])
    })
  })
})
