import {DISPLAY_NAME, FILL, SERIES, X_MAX, X_MIN} from 'constants/columnKeys'
import type {Scale, Table} from 'types'
import {newTable} from 'utils/newTable'
import {describe, expect, it} from 'vitest'

import {findHoveredBoxes} from './tooltip'

/* Only invert() is used by findHoveredBoxes. */
const xScale = {invert: () => 0} as unknown as Scale<number, number>

const boxTable = (): Table =>
  newTable(1)
    .addColumn(X_MIN, 'system', 'number', [0])
    .addColumn(X_MAX, 'system', 'number', [10])
    .addColumn(FILL, 'string', 'string', ['a'])
    .addColumn(SERIES, 'string', 'string', ['cpu0'])
    .addColumn(DISPLAY_NAME, 'string', 'string', ['cpu0'])

describe('findHoveredBoxes', () => {
  const invertTo = (dataY: number) =>
    ({invert: () => dataY}) as unknown as Scale<number, number>

  it('should hover rows inside the bands', () => {
    expect(
      findHoveredBoxes(
        'xy',
        5,
        0,
        boxTable(),
        xScale,
        invertTo(0.5),
        [0, 1],
        ['cpu0'],
        100,
        100,
      ),
    ).toEqual([0])
  })

  it('should report nothing below the first band', () => {
    expect(
      findHoveredBoxes(
        'xy',
        5,
        0,
        boxTable(),
        xScale,
        invertTo(-0.5),
        [0, 1],
        ['cpu0'],
        100,
        100,
      ),
    ).toEqual([])
  })

  it('should report nothing outside the plot', () => {
    expect(
      findHoveredBoxes(
        'xy',
        -1,
        0,
        boxTable(),
        xScale,
        invertTo(0.5),
        [0, 1],
        ['cpu0'],
        100,
        100,
      ),
    ).toEqual([])
  })
})
