import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {RESULT} from 'constants/columnKeys'
import {getRandomTable} from 'utils/fixtures/randomTable'
import {newTable} from 'utils/newTable'
import {
  getGroupLegendColumns,
  getLegendData,
} from 'components/StaticLegend/convert'

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
      const customFillKeys = ['series', '_measurement']
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
      const customFillKeys = ['series', '_measurement']
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

  it('keeps result out of the legend, as a column and as a group key', () => {
    /*
      Flux tables carry `result`, and findStringColumns hands it back with the
      rest of the string columns. It records which column a row came from, not
      what the line is, so it earns neither a legend column nor a group key.

      Grouping by it would give one legend row per (line, result) pair -- three
      near-identical rows for a table split into min/mean/max, differing only in
      a Min column that each row had computed over its own rows alone.
    */
    const table = newTable(6)
      .addColumn('_time', 'dateTime:RFC3339', 'time', [1, 2, 3, 1, 2, 3])
      .addColumn(RESULT, 'string', 'string', [
        'mean',
        'max',
        'min',
        'mean',
        'max',
        'min',
      ])
      .addColumn('cpu', 'string', 'string', ['a', 'a', 'a', 'b', 'b', 'b'])
      .addColumn('_value', 'number', 'number', [10, 11, 12, 40, 41, 42])

    const columns = getLegendData(
      table,
      {fill: [RESULT, 'cpu'], showBounds: true},
      '_value',
      () => String,
    )

    expect(columns.map(c => c.name)).toEqual([
      'Latest _value',
      'Max _value',
      'Min _value',
      'cpu',
    ])
    /* Two lines, so two rows -- not one per result value. */
    expect(columns[0].values.length).toEqual(2)
    expect(columns[3].values).toEqual(['b', 'a'])

    /*
      The rows labelled `min` hold the largest numbers here, so a bound read
      off one result's rows would report 42. Reading across the line reports
      the real extremes instead.
    */
    expect(columns[1].values).toEqual(['42', '12'])
    expect(columns[2].values).toEqual(['40', '10'])
  })

  it('returns nothing when result was the only fill column', () => {
    const table = newTable(2)
      .addColumn('_time', 'dateTime:RFC3339', 'time', [1, 2])
      .addColumn(RESULT, 'string', 'string', ['mean', 'max'])
      .addColumn('_value', 'number', 'number', [1, 2])

    expect(
      getLegendData(table, {fill: [RESULT]}, '_value', () => String),
    ).toEqual([])
  })

  describe('when there is nothing to show', () => {
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

    it('empties only the value column when that column is not numeric', () => {
      const result = getLegendData(
        sampleTable,
        {fill: ['cpu']},
        'host',
        getColumnFormatter,
      )

      /*
        The value column reads undefined, not null: it goes through
        formatLegendValues, which hands the formatter whatever the column holds.
        Fill columns report a missing cell as null instead -- see
        getGroupLegendColumns. The two sentinels do not agree.
      */
      expect(result.find(c => c.key === 'host')?.values).toEqual([
        undefined,
        undefined,
        undefined,
        undefined,
      ])
      expect(result.find(c => c.key === 'cpu')?.values).toEqual([
        'cpu0',
        'cpu1',
        'cpu2',
        'cpu3',
      ])
    })
  })
  describe('showBounds', () => {
    /*
      Two lines over three timestamps, with a void in each:

        row 0  a  10        row 3  b  40
        row 1  a  30        row 4  b  void
        row 2  a  void      row 5  b  25
    */
    const seriesTable = () =>
      newTable(6)
        .addColumn('_time', 'dateTime:RFC3339', 'time', [1, 2, 3, 4, 5, 6])
        .addColumn('cpu', 'string', 'string', ['a', 'a', 'a', 'b', 'b', 'b'])
        .addColumn('_value', 'number', 'number', [
          10,
          30,
          null,
          40,
          null,
          25,
        ] as any)

    /* getLegendData resolves the column formatter once, so hand it a stringifier. */
    const stringify = () => String

    const boundsOf = (result: ReturnType<typeof getLegendData>) => ({
      latest: result.find(c => c.name === 'Latest _value')?.values,
      max: result.find(c => c.name === 'Max _value')?.values,
      min: result.find(c => c.name === 'Min _value')?.values,
    })

    it('is off unless asked for', () => {
      const result = getLegendData(
        seriesTable(),
        {fill: ['cpu']},
        '_value',
        stringify,
      )

      expect(result.map(c => c.name)).toEqual(['Latest _value', 'cpu'])
    })

    it('adds a max and a min column beside the latest value', () => {
      const result = getLegendData(
        seriesTable(),
        {fill: ['cpu'], showBounds: true},
        '_value',
        stringify,
      )

      expect(result.map(c => c.name)).toEqual([
        'Latest _value',
        'Max _value',
        'Min _value',
        'cpu',
      ])
    })

    it('reads each bound off the whole line, not off one row', () => {
      const {latest, max, min} = boundsOf(
        getLegendData(
          seriesTable(),
          {fill: ['cpu'], showBounds: true},
          '_value',
          stringify,
        ),
      )

      /*
        a spans 10..30 and b spans 25..40, so each bound column mixes the two
        lines -- reading them off the latest row alone would give the same
        number twice in every column.

        b leads on its latest value. a's latest row is the void at row 2, and
        the latest column passes voids straight to the formatter rather than
        reporting them as missing.
      */
      expect(latest).toEqual(['25', 'null'])
      expect(max).toEqual(['40', '30'])
      expect(min).toEqual(['25', '10'])
    })

    it('skips voids rather than counting them as zero', () => {
      const table = newTable(3)
        .addColumn('_time', 'dateTime:RFC3339', 'time', [1, 2, 3])
        .addColumn('cpu', 'string', 'string', ['a', 'a', 'a'])
        .addColumn('_value', 'number', 'number', [null, null, null] as any)

      const {max, min} = boundsOf(
        getLegendData(
          table,
          {fill: ['cpu'], showBounds: true},
          '_value',
          stringify,
        ),
      )

      expect(max).toEqual([null])
      expect(min).toEqual([null])
    })

    it('gives every line the same colour across the bound columns', () => {
      const result = getLegendData(
        seriesTable(),
        {fill: ['cpu'], showBounds: true},
        '_value',
        stringify,
      )

      const [latest, max, min] = result
      expect(max.colors).toEqual(latest.colors)
      expect(min.colors).toEqual(latest.colors)
    })

    it('applies the value formatter to the bounds', () => {
      const {max, min} = boundsOf(
        getLegendData(
          seriesTable(),
          {fill: ['cpu'], showBounds: true},
          '_value',
          () => (v: number) => `${v}px`,
        ),
      )

      expect(max).toEqual(['40px', '30px'])
      expect(min).toEqual(['25px', '10px'])
    })
  })
})

const groupTable = newTable(4)
  .addColumn('_time', 'dateTime:RFC3339', 'time', [1, 2, 3, 4])
  .addColumn('cpu', 'string', 'string', ['cpu0', 'cpu1', 'cpu0', 'cpu1'])
  .addColumn('host', 'string', 'string', ['a', 'b', 'a', 'b'])
  .addColumn(RESULT, 'string', 'string', ['max', 'max', 'mean', 'mean'])
  .addColumn('_value', 'number', 'number', [1, 2, 3, 4])

const groupColors = ['red', 'blue', 'green', 'yellow']
const groupFmt = (key: string) => (x: unknown) => `<${key}:${x}>`

describe('getGroupLegendColumns', () => {
  it('makes one column per fill key', () => {
    const columns = getGroupLegendColumns(
      groupTable,
      [0, 1, 2, 3],
      ['cpu', 'host'],
      groupFmt,
      groupColors,
    )

    expect(columns.map(c => c.key)).toEqual(['cpu', 'host'])
    expect(columns.map(c => c.name)).toEqual(['cpu', 'host'])
    expect(columns.map(c => c.values)).toEqual([
      ['<cpu:cpu0>', '<cpu:cpu1>', '<cpu:cpu0>', '<cpu:cpu1>'],
      ['<host:a>', '<host:b>', '<host:a>', '<host:b>'],
    ])
  })

  it('passes the row colours through to every column', () => {
    const columns = getGroupLegendColumns(
      groupTable,
      [0, 1],
      ['cpu', 'host'],
      groupFmt,
      groupColors,
    )

    columns.forEach(c => expect(c.colors).toEqual(groupColors))
  })

  it('reads the row indices it is given, in order', () => {
    const columns = getGroupLegendColumns(
      groupTable,
      [3, 0],
      ['cpu'],
      groupFmt,
      groupColors,
    )

    expect(columns[0].values).toEqual(['<cpu:cpu1>', '<cpu:cpu0>'])
  })

  it('skips the result column, which only records which column a row came from', () => {
    const columns = getGroupLegendColumns(
      groupTable,
      [0, 1],
      [RESULT, 'cpu'],
      groupFmt,
      groupColors,
    )

    expect(columns.map(c => c.key)).toEqual(['cpu'])
  })

  it('skips result wherever it appears in the fill keys', () => {
    const columns = getGroupLegendColumns(
      groupTable,
      [0],
      ['cpu', RESULT, 'host'],
      groupFmt,
      groupColors,
    )

    expect(columns.map(c => c.key)).toEqual(['cpu', 'host'])
  })

  it('formats falsy values rather than reading them as missing', () => {
    const falsy = newTable(3)
      .addColumn('n', 'number', 'number', [0, 1, 2])
      .addColumn('s', 'string', 'string', ['', 'x', 'y'])
      .addColumn('b', 'boolean', 'boolean', [false, true, false])

    const columns = getGroupLegendColumns(
      falsy,
      [0, 1, 2],
      ['n', 's', 'b'],
      groupFmt,
      null,
    )

    expect(columns[0].values).toEqual(['<n:0>', '<n:1>', '<n:2>'])
    expect(columns[1].values).toEqual(['<s:>', '<s:x>', '<s:y>'])
    expect(columns[2].values).toEqual(['<b:false>', '<b:true>', '<b:false>'])
  })

  it('reports missing cells as null and keeps the rest of the column', () => {
    const gappy = newTable(3)
      .addColumn('cpu', 'string', 'string', ['cpu0', 'cpu1', 'cpu2'])
      .addColumn('host', 'string', 'string', ['a', null, 'c'] as any)
      .addColumn('_value', 'number', 'number', [1, 2, 3])

    const columns = getGroupLegendColumns(
      gappy,
      [0, 1, 2],
      ['host'],
      groupFmt,
      null,
    )

    expect(columns[0].values).toEqual(['<host:a>', null, '<host:c>'])
  })

  describe('when a fill key names no column in the table', () => {
    it('does not throw', () => {
      expect(() =>
        getGroupLegendColumns(groupTable, [0, 1], ['nope'], groupFmt, null),
      ).not.toThrow()
    })

    it('reports every row as null', () => {
      const columns = getGroupLegendColumns(
        groupTable,
        [0, 1],
        ['nope'],
        groupFmt,
        null,
      )

      expect(columns[0].values).toEqual([null, null])
    })

    it('falls back to the key for the column name', () => {
      const columns = getGroupLegendColumns(
        groupTable,
        [0, 1],
        ['nope'],
        groupFmt,
        null,
      )

      expect(columns[0].name).toEqual('nope')
    })
  })

  describe('when no formatter is supplied', () => {
    it('stringifies the values instead of failing', () => {
      const columns = getGroupLegendColumns(
        groupTable,
        [0, 1, 2, 3],
        ['cpu'],
        undefined,
        null,
      )

      expect(columns[0].values).toEqual(['cpu0', 'cpu1', 'cpu0', 'cpu1'])
    })

    it('still reports nulls as null', () => {
      const columns = getGroupLegendColumns(
        groupTable,
        [0],
        ['nope'],
        undefined,
        null,
      )

      expect(columns[0].values).toEqual([null])
    })
  })

  it('returns nothing when there are no fill keys', () => {
    expect(
      getGroupLegendColumns(groupTable, [0, 1], [], groupFmt, groupColors),
    ).toEqual([])
  })
})
