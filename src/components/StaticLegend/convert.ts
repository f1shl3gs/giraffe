// Types
import {
  ColumnData,
  ColumnGroupMap,
  Formatter,
  LatestIndexMap,
  LegendColumn,
  LegendData,
  NumericColumnData,
  Table,
} from 'types'
import type {StaticLegendConfig} from 'components/StaticLegend/StaticLegend'

// Utils
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'
import {sortIndicesByValueColumn} from 'utils/legend/sort'
import {formatLegendValues} from 'utils/legend/format'

// Constants
import {RESULT} from 'constants/columnKeys'

/*
  One legend row per line: the value it last took, plus optionally the smallest
  and largest it took over the whole table. Reading the bounds off the value
  column rather than off named columns keeps this to a single rule that any
  filled series can use -- no layer has to declare how its rows are laid out.
*/
export const getLegendData = (
  table: Table,
  staticLegend: StaticLegendConfig,
  valueColumnKey: string,
  getFormatter?: (columnKey: string) => Formatter,
): LegendData => {
  const {fill = [], colors = [], colorMapping, showBounds} = staticLegend

  if (!fill.length || !table.getColumn(valueColumnKey)) {
    return []
  }

  /*
    A legend of a string column has no values to sort or show, so it reads as an
    empty legend rather than throwing on `values.length` further down.
  */
  const values = table.getColumn(valueColumnKey, 'number') ?? []

  /*
    `result` is Flux's record of which column a row came from, not a property of
    the line. Grouping by it would give every line one legend row per column it
    was split into, all of them looking alike -- a band table's three rows per
    line become three identical legend rows. So it never becomes a group key.
  */
  const groupKeys = fill.filter(key => key !== RESULT)

  if (!groupKeys.length) {
    return []
  }

  const [groupIds, groupIdMap] = createGroupIDColumn(table, groupKeys)
  const latestIndices: LatestIndexMap = {}
  for (let i = 0; i < groupIds.length; i += 1) {
    latestIndices[groupIds[i]] = i
  }

  const valueFormatter = getFormatter
    ? getFormatter(valueColumnKey)
    : (x: unknown) => String(x)

  const groupColor = groupColorFor(groupIdMap, colors, colorMapping)
  const sortOrder = sortIndicesByValueColumn(values, [
    ...new Set(Object.values(latestIndices)),
  ])
  const rowColors = sortOrder.map(index => groupColor(groupIds[index]))

  const columns = [
    valueColumnAt(
      table,
      valueColumnKey,
      `Latest ${valueColumnKey}`,
      sortOrder,
      values,
      valueFormatter,
      rowColors,
    ),
  ]

  if (showBounds) {
    const bounds = boundsByGroup(groupIds, values)

    columns.push(
      boundsColumnAt(
        table,
        valueColumnKey,
        'Max',
        bounds,
        sortOrder,
        groupIds,
        'max',
        valueFormatter,
        rowColors,
      ),
      boundsColumnAt(
        table,
        valueColumnKey,
        'Min',
        bounds,
        sortOrder,
        groupIds,
        'min',
        valueFormatter,
        rowColors,
      ),
    )
  }

  return [
    ...columns,
    ...getGroupLegendColumns(
      table,
      sortOrder,
      groupKeys,
      getFormatter,
      rowColors,
    ),
  ]
}

/* The value column of a legend row: formatted values plus the row's colour. */
const valueColumnAt = (
  table: Table,
  valueColumnKey: string,
  name: string,
  rowIndices: number[],
  values: ColumnData,
  valueFormatter: Formatter,
  rowColors: string[],
): LegendColumn => ({
  key: valueColumnKey,
  name,
  type: table.getColumnType(valueColumnKey),
  colors: rowColors,
  values: formatLegendValues(values, rowIndices, valueFormatter),
})

const groupColorFor = (
  groupIdMap: ColumnGroupMap,
  colors: string[],
  colorMapping: ColumnGroupMap | undefined,
) => {
  const scale = getNominalColorScale(groupIdMap, colors)
  return (groupId: number): string =>
    colorMapping?.mappings?.[groupId]?.color ?? scale(groupId)
}

/*
  The fill columns of a legend: one column per grouping key, each row's value
  formatted and tinted with the colour that row was drawn in.

  `result` is skipped -- it only records which column a row came from, so
  showing it would repeat what the column names already say.
  A key with no column behind it yields null values rather than throwing, since
  fill comes from config and may name a column this table does not carry.
*/
export const getGroupLegendColumns = (
  table: Table,
  rowIndices: number[],
  fill: string[],
  getFormatter: ((columnKey: string) => (x: any) => string) | undefined,
  rowColors: string[] | null,
): LegendColumn[] =>
  fill.reduce((accum: LegendColumn[], key: string) => {
    if (key === RESULT) {
      return accum
    }

    const colData = table.getColumn(key) ?? []
    const format = getFormatter ? getFormatter(key) : (x: unknown) => String(x)

    accum.push({
      key,
      name: table.getColumnName(key) ?? key,
      type: table.getColumnType(key),
      colors: rowColors,
      values: rowIndices.map(i =>
        colData[i] == null ? null : format(colData[i]),
      ),
    } as LegendColumn)

    return accum
  }, [])

/*
  The smallest and largest value each line took. Walking the value column once
  per row beats asking for a minimum and a maximum separately, and skipping
  voids keeps a line that never reported a number from reading as zero.
*/
type BoundsByGroup = Map<number, {min: number; max: number}>

const boundsByGroup = (
  groupIds: NumericColumnData,
  values: NumericColumnData,
): BoundsByGroup => {
  const bounds: BoundsByGroup = new Map()

  for (let rowIndex = 0; rowIndex < groupIds.length; rowIndex += 1) {
    const value = values[rowIndex]

    if (value === undefined || value === null || Number.isNaN(value)) {
      continue
    }

    const groupId = groupIds[rowIndex]
    const seen = bounds.get(groupId)

    if (!seen) {
      bounds.set(groupId, {min: value, max: value})
    } else {
      if (value < seen.min) {
        seen.min = value
      }
      if (value > seen.max) {
        seen.max = value
      }
    }
  }

  return bounds
}

/* One bound column, laid out in the same line order as the latest value. */
const boundsColumnAt = (
  table: Table,
  valueColumnKey: string,
  label: string,
  bounds: BoundsByGroup,
  rowIndices: number[],
  groupIds: NumericColumnData,
  which: 'min' | 'max',
  valueFormatter: Formatter,
  rowColors: string[],
): LegendColumn => ({
  key: valueColumnKey,
  name: `${label} ${valueColumnKey}`,
  type: table.getColumnType(valueColumnKey),
  colors: rowColors,
  values: rowIndices.map(rowIndex => {
    const found = bounds.get(groupIds[rowIndex])
    return found ? valueFormatter(found[which]) : null
  }),
})
