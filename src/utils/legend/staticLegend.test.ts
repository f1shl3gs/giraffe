import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {getRandomTable} from '../fixtures/randomTable'
import {newTable} from '../newTable'
import {getLegendData} from './staticLegend'

describe('getLegendData', () => {
  const yColKey = '_value'
  const getColumnFormatter = () => (x: string) => x
  const maxValue = 100
  const numberOfRecords = 20
  const recordsPerLine = 5
  const fillColumnKeys = ['cpu', 'host', 'machine']
  const sampleTable = getRandomTable(
    maxValue,
    false,
    numberOfRecords,
    recordsPerLine,
    fillColumnKeys,
  )

  describe('overlaid line graphs', () => {
    it('creates certain columns for overlaid line graphs', () => {
      const result = getLegendData(
        sampleTable,
        {fill: fillColumnKeys, colors: NINETEEN_EIGHTY_FOUR},
        yColKey,
        getColumnFormatter,
      )

      expect(result.length).toEqual(fillColumnKeys.length + 1)
      result.forEach(legendColumn => {
        expect(
          [...fillColumnKeys, yColKey].indexOf(legendColumn.key),
        ).toBeGreaterThanOrEqual(0)
        expect(legendColumn.values.length).toEqual(
          numberOfRecords / recordsPerLine,
        )
      })
    })

    it('sorts the legend data in descending order by the value axis', () => {
      const result = getLegendData(
        sampleTable,
        {fill: fillColumnKeys, colors: NINETEEN_EIGHTY_FOUR},
        yColKey,
        getColumnFormatter,
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].key).toEqual(yColKey)
      result[0].values.forEach((value, index, values) => {
        if (index > 0 && index < values.length) {
          expect(Number(value)).toBeLessThan(Number(values[index - 1]))
        }
      })
    })

    it('sorts the legend data in descending order with the correct values in fill columns when time values are sorted', () => {
      const customFillKeys = ['result', '_measurement']
      const table = newTable(8)
        .addColumn(
          '_time',
          'dateTime:RFC3339',
          'time',
          [
            1622065487240, 1622065487240, 1622065487240, 1622065487240,
            1622065667240, 1622065667240, 1622065667240, 1622065667240,
          ],
        )
        .addColumn('_value', 'double', 'number', [0, 0, 0, 0, 50, 100, 10, 15])
        .addColumn(customFillKeys[0], 'string', 'string', [
          'second',
          'first',
          'fourth',
          'third',
          'second',
          'first',
          'fourth',
          'third',
        ])
        .addColumn(customFillKeys[1], 'string', 'string', [
          '2nd',
          '1st',
          '4th',
          '3rd',
          '2nd',
          '1st',
          '4th',
          '3rd',
        ])

      const result = getLegendData(
        table,
        {fill: customFillKeys, colors: NINETEEN_EIGHTY_FOUR},
        yColKey,
        getColumnFormatter,
      )

      expect(
        result.find(legendColumn => legendColumn.key === customFillKeys[0]),
      ).toBeDefined()
      expect(
        result.find(legendColumn => legendColumn.key === customFillKeys[1]),
      ).toBeDefined()
      result.forEach(legendColumn => {
        if (legendColumn.key === customFillKeys[0]) {
          expect(legendColumn.values).toEqual([
            'first',
            'second',
            'third',
            'fourth',
          ])
        }
        if (legendColumn.key === customFillKeys[1]) {
          expect(legendColumn.values).toEqual(['1st', '2nd', '3rd', '4th'])
        }
      })
    })

    it('sorts the legend data in descending order with the correct values in fill columns when time values are unsorted', () => {
      const customFillKeys = ['result', '_measurement']
      const table = newTable(8)
        .addColumn(
          '_time',
          'dateTime:RFC3339',
          'time',
          [
            1622065487240, 1622065667240, 1622065487240, 1622065667240,
            1622065487240, 1622065667240, 1622065487240, 1622065667240,
          ],
        )
        .addColumn('_value', 'double', 'number', [0, 50, 0, 100, 0, 10, 0, 15])
        .addColumn(customFillKeys[0], 'string', 'string', [
          'second',
          'second',
          'first',
          'first',
          'fourth',
          'fourth',
          'third',
          'third',
        ])
        .addColumn(customFillKeys[1], 'string', 'string', [
          '2nd',
          '2nd',
          '1st',
          '1st',
          '4th',
          '4th',
          '3rd',
          '3rd',
        ])

      const result = getLegendData(
        table,
        {fill: customFillKeys, colors: NINETEEN_EIGHTY_FOUR},
        yColKey,
        getColumnFormatter,
      )

      expect(
        result.find(legendColumn => legendColumn.key === customFillKeys[0]),
      ).toBeDefined()
      expect(
        result.find(legendColumn => legendColumn.key === customFillKeys[1]),
      ).toBeDefined()
      result.forEach(legendColumn => {
        if (legendColumn.key === customFillKeys[0]) {
          expect(legendColumn.values).toEqual([
            'first',
            'second',
            'third',
            'fourth',
          ])
        }
        if (legendColumn.key === customFillKeys[1]) {
          expect(legendColumn.values).toEqual(['1st', '2nd', '3rd', '4th'])
        }
      })
    })
  })

  describe('band graphs', () => {
    it('returns no data when no fill columns are configured', () => {
      expect(
        getLegendData(
          sampleTable,
          {colors: NINETEEN_EIGHTY_FOUR},
          yColKey,
          getColumnFormatter,
        ),
      ).toEqual([])
    })

    it('returns no data when the value column is missing', () => {
      expect(
        getLegendData(
          sampleTable,
          {fill: fillColumnKeys, colors: NINETEEN_EIGHTY_FOUR},
          'notAColumn',
          getColumnFormatter,
        ),
      ).toEqual([])
    })
  })
})
