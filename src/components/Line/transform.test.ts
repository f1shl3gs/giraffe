import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, TIME, VALUE} from 'constants/columnKeys'
import type {ColumnGroupMap, LineData} from 'types'
import {newTable} from 'utils/newTable'

import {lineTransform} from './transform'

const seriesAt = (data: LineData, id: number) => data.get(id)!

const tableOf = (
  length: number,
  xData: Array<number>,
  yData: Array<number>,
  cpuData: Array<string>,
) =>
  newTable(length)
    .addColumn(TIME, 'dateTime:RFC3339', 'time', xData)
    .addColumn(VALUE, 'system', 'number', yData)
    .addColumn('cpu', 'string', 'string', cpuData)

describe('lineTransform', () => {
  const colors = NINETEEN_EIGHTY_FOUR

  describe('grouping rows into series', () => {
    const table = tableOf(
      4,
      [100, 200, 300, 400],
      [10, 20, 30, 40],
      ['cpu0', 'cpu0', 'cpu1', 'cpu1'],
    )

    it('should give every distinct fill value its own group ID, numbered in order of first appearance', () => {
      const {fillTable, lineData} = lineTransform(
        table,
        TIME,
        VALUE,
        ['cpu'],
        colors,
      )

      expect([...lineData.keys()]).toEqual([0, 1])
      expect(Array.from(fillTable.getColumn(FILL, 'number') ?? [])).toEqual([
        0, 0, 1, 1,
      ])
    })

    it('should collect each row into its series, keeping the order of the input rows', () => {
      const spec = lineTransform(table, TIME, VALUE, ['cpu'], colors)

      expect(seriesAt(spec.lineData, 0).xs).toEqual([100, 200])
      expect(seriesAt(spec.lineData, 0).ys).toEqual([10, 20])
      expect(seriesAt(spec.lineData, 1).xs).toEqual([300, 400])
      expect(seriesAt(spec.lineData, 1).ys).toEqual([30, 40])
    })
  })

  describe('assigning a fill to every series', () => {
    it('should reuse the single colour when there is only one series', () => {
      const spec = lineTransform(
        tableOf(2, [100, 200], [10, 20], ['cpu0', 'cpu0']),
        TIME,
        VALUE,
        ['cpu'],
        colors,
      )

      expect(seriesAt(spec.lineData, 0).fill).toEqual(colors[0])
    })

    it('should give each of several series a different colour', () => {
      const spec = lineTransform(
        tableOf(2, [100, 200], [10, 20], ['cpu0', 'cpu1']),
        TIME,
        VALUE,
        ['cpu'],
        colors,
      )

      expect(seriesAt(spec.lineData, 0).fill).not.toEqual(
        seriesAt(spec.lineData, 1).fill,
      )
    })

    it('should prefer the saved colorMapping over the colour scale', () => {
      const colorMapping: ColumnGroupMap = {
        columnKeys: ['cpu'],
        mappings: [
          {cpu: 'cpu0', color: '#111111'},
          {cpu: 'cpu1', color: '#222222'},
        ],
      }

      const spec = lineTransform(
        tableOf(2, [100, 200], [10, 20], ['cpu0', 'cpu1']),
        TIME,
        VALUE,
        ['cpu'],
        colors,
        colorMapping,
      )

      expect(seriesAt(spec.lineData, 0).fill).toEqual('#111111')
      expect(seriesAt(spec.lineData, 1).fill).toEqual('#222222')
    })
  })
})
