import {renderHook} from '@testing-library/react'
import {TIME, VALUE, X_MAX, X_MIN} from 'constants/columnKeys'
import {newTable} from 'utils/newTable'

import {useMosaicTransform} from './useMosaicTransform'

describe('useMosaicTransform', () => {
  const timeCol = [
    1612482900000, 1612483000000, 1612483100000, 1612483200000, 1612483300000,
    1612483400000,
  ]
  const valueCol = ['red', 'green', 'green', 'yellow', 'red', 'yellow']
  const cpuCol = ['cpu0', 'cpu1', 'cpu2', 'cpu1', 'cpu0', 'cpu2']
  const hostCol = ['host-A', 'host-A', 'host-B', 'host-A', 'host-B', 'host-B']
  const machineCol = ['pc1', 'pc2', 'pc3', 'pc1', 'pc2', 'pc3']
  const testTable = newTable(6)
    .addColumn('_time', 'dateTime:RFC3339', 'time', timeCol)
    .addColumn('_value', 'string', 'string', valueCol)
    .addColumn('cpu', 'string', 'string', cpuCol)
    .addColumn('host', 'string', 'string', hostCol)
    .addColumn('machine', 'string', 'string', machineCol)
  const xColumnKey = TIME
  const fillColKeys = [VALUE]
  const colors = ['#31C0F6', '#A500A5']

  let yColumnKeys: Array<string>
  let yLabelColumns: Array<string>
  let yLabelColumnSeparator: string

  const run = (
    table = testTable,
    x = xColumnKey,
    fill = fillColKeys,
    palette = colors,
  ) =>
    renderHook(() =>
      useMosaicTransform(
        table,
        x,
        yColumnKeys,
        yLabelColumns,
        yLabelColumnSeparator,
        fill,
        palette,
      ),
    ).result.current

  it('should handle falsy value, empty array, and empty strings for yColumnKeys and yLabelColumns', () => {
    yColumnKeys = undefined
    yLabelColumns = undefined
    yLabelColumnSeparator = undefined
    let result = run()
    expect(result.ySeries.length).toEqual(result.yTicks.length)
    expect(result.yTicks.length).toEqual(1)
    expect(result.yTicks[0]).toEqual('')

    yColumnKeys = []
    yLabelColumns = []
    result = run()
    expect(result.ySeries.length).toEqual(result.yTicks.length)
    expect(result.yTicks.length).toEqual(1)
    expect(result.yTicks[0]).toEqual('')

    yColumnKeys = ['']
    yLabelColumns = ['']
    result = run()
    expect(result.ySeries.length).toEqual(result.yTicks.length)
    expect(result.yTicks.length).toEqual(1)
    expect(result.yTicks[0]).toEqual('')

    yColumnKeys = ['', '']
    yLabelColumns = ['', '']
    result = run()
    expect(result.ySeries.length).toEqual(result.yTicks.length)
    expect(result.yTicks.length).toEqual(1)
    expect(result.yTicks[0]).toEqual('')
  })

  it('should output correct spec when yColumnKeys and yLabelColumns are the same', () => {
    yColumnKeys = ['cpu', 'host']
    yLabelColumns = ['cpu', 'host']
    yLabelColumnSeparator = ''

    const result = run()

    expect(result.ySeries.length).toEqual(result.yTicks.length)
    expect(result.yDomain).toEqual([0, result.ySeries.length])
    expect(
      result.yTicks.every((tick, index) => {
        return tick === result.ySeries[index]
      }),
    ).toEqual(true)
  })

  it('should include the yLabelColumnSeparator in yTicks', () => {
    yColumnKeys = ['cpu', 'host']
    yLabelColumns = ['cpu', 'host']
    yLabelColumnSeparator = ' + '

    const result = run()

    expect(
      result.yTicks.every(tick => tick.indexOf(yLabelColumnSeparator) > -1),
    ).toEqual(true)
  })

  it('should ignore yLabelColumns elements that are not in yColumnKeys', () => {
    yColumnKeys = ['cpu', 'host']
    yLabelColumns = ['cpu', 'machine']
    yLabelColumnSeparator = ''

    const result = run()

    expect(result.ySeries.length).toEqual(result.yTicks.length)
    expect(result.yDomain).toEqual([0, result.ySeries.length])
    expect(
      result.yTicks.every((tick, index) => {
        return (
          machineCol.indexOf('tick') === -1 &&
          tick.length < result.ySeries[index].length
        )
      }),
    ).toEqual(true)
  })

  it('should sort time stamps by value, not by string', () => {
    // Digit count varies, so a lexicographic sort puts `9` after `10` and the
    // x ranges come out inverted.
    yColumnKeys = []
    yLabelColumns = []
    yLabelColumnSeparator = ''

    const mixedWidthTimeCol = [9, 10, 100, 11]
    const table = newTable(4)
      .addColumn('_time', 'dateTime:RFC3339', 'time', mixedWidthTimeCol)
      .addColumn('_value', 'string', 'string', valueCol.slice(0, 4))

    const {binnedTable} = run(table)

    const xMin = binnedTable.getColumn(X_MIN, 'number') as Array<number>
    const xMax = binnedTable.getColumn(X_MAX, 'number') as Array<number>

    expect(xMin.length).toBeGreaterThan(0)
    expect(xMax).toEqual(xMin.map((min, i) => (xMax[i] >= min ? xMax[i] : min)))
  })

  it('should keep the binning when only the colours change', () => {
    yColumnKeys = ['cpu']
    yLabelColumns = ['cpu']
    yLabelColumnSeparator = ''

    const {rerender, result} = renderHook(
      ({palette}) =>
        useMosaicTransform(
          testTable,
          xColumnKey,
          yColumnKeys,
          yLabelColumns,
          yLabelColumnSeparator,
          fillColKeys,
          palette,
        ),
      {initialProps: {palette: colors}},
    )

    const firstBinnedTable = result.current.binnedTable
    const firstScale = result.current.fillScale

    rerender({palette: ['#111111', '#222222']})

    expect(result.current.binnedTable).toBe(firstBinnedTable)
    expect(result.current.fillScale).not.toBe(firstScale)
  })
})
