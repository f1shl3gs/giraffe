// Direct coverage of the time-token engine inside formatters.ts, exercised
// through the public timeFormatter API. Only deterministic axes are asserted
// here (UTC + formats without 'hh'/ambiguous meridiem paths, which depend on
// the host locale's default hour cycle); the 12h matrix is covered by the
// pre-existing cases in formatters.test.ts.

import {timeFormatter} from './formatters'

// 2023-03-05T09:26:53.589Z — a Sunday with a single-digit day of month
const TS = Date.UTC(2023, 2, 5, 9, 26, 53, 589)

const fmt = (format: string): string =>
  timeFormatter({locale: 'en-US', timeZone: 'UTC', format})(TS)

describe('time token engine (via timeFormatter)', () => {
  it('formats core date tokens', () => {
    expect(fmt('YYYY-MM-DD')).toBe('2023-03-05')
    expect(fmt('YY')).toBe('23')
    expect(fmt('MMMM')).toBe('March')
    expect(fmt('MMM')).toBe('Mar')
    expect(fmt('dddd|ddd')).toBe('Sunday|Sun')
  })

  it('keeps DD padded but D unpadded', () => {
    expect(fmt('DD')).toBe('05')
    expect(fmt('D')).toBe('5')
  })

  it('formats time tokens under UTC', () => {
    expect(fmt('HH:mm:ss')).toBe('09:26:53')
    expect(fmt('sss')).toBe('589')
  })

  it('emits ZZ as the short timezone name', () => {
    expect(fmt('ZZ')).toBe('UTC')
  })

  it('emits unknown token runs verbatim and keeps literals', () => {
    // runs without a named token ('q', 'mmm', 's', 'aa') are emitted
    // verbatim — giraffe's custom table only names the single-letter 'a'
    expect(fmt('q mmm [v] s aa')).toBe('q mmm [v] s aa')
    expect(fmt('vYYYY.v')).toBe('v2023.v')
  })
})
