// Libraries
import {useMemo} from 'react'

// Constants
import {DISPLAY_NAME, FILL, SERIES, X_MAX, X_MIN} from 'constants/columnKeys'

// Types
import type {ColumnGroupMap, NumericColumnData, Table} from 'types'

// Utils
import {newTable} from 'utils/newTable'
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'

/* The x values are numbers, so they have to sort numerically. A default sort
   compares them as strings, which puts `9` after `10` and inverts the ranges. */
const sortByValue = (a: number, b: number) => a - b

/* What one input column contributes to the scan below. */
interface MosaicColumns {
  xColumn: NumericColumnData
  /* The label columns that actually exist in yColumnKeys. */
  labelColumns: Array<string>
  yColumnsName: string
  yColumns: Map<string, Array<string>>
}

/* One timestamp's worth of rows, keyed by x. */
interface MosaicRow {
  yTickLabel: string
  yColumnTick: string
  fill: string
}
type MosaicTimeStampMap = Map<number, Array<MosaicRow>>

/* One series' x ranges, one entry per run of equal fill. */
interface MosaicSeries {
  xMin: Array<number>
  xMax: Array<number>
  fill: Array<string>
  series: Array<string>
  displayedColumns: Array<string>
  yTickLabel: string
}
type MosaicSeriesMap = Map<string, MosaicSeries>

/* Which fill group each row belongs to. */
const createMosaicFill = (inputTable: Table, fillColKeys: Array<string>) =>
  createGroupIDColumn(inputTable, fillColKeys)

/* The columns the scan reads, and the label the axis shows. */
const createMosaicColumns = (
  inputTable: Table,
  xColumnKey: string,
  yColumnKeys: Array<string>,
  yLabelColumns: Array<string>,
  yLabelColumnSeparator: string,
): MosaicColumns => {
  const xColumn = inputTable.getColumn(xColumnKey, 'number') || []

  let labelColumns = Array.isArray(yLabelColumns)
    ? yLabelColumns.filter(labelColumn => yColumnKeys.includes(labelColumn))
    : []
  if (labelColumns.length === 0 && Array.isArray(yColumnKeys)) {
    labelColumns = yColumnKeys
  }

  const yColumnsName = labelColumns.reduce(
    (combinedName, columnName) =>
      combinedName
        ? `${combinedName}${yLabelColumnSeparator}${columnName}`
        : columnName,
    '',
  )

  const yColumns = new Map<string, Array<string>>()
  if (Array.isArray(yColumnKeys)) {
    yColumnKeys.forEach(columnKey => {
      if (columnKey) {
        const column = inputTable.getColumn(columnKey, 'string')
        if (column) {
          yColumns.set(columnKey, column)
        }
      }
    })
  }

  return {xColumn, labelColumns, yColumnsName, yColumns}
}

/* Every row, bucketed by x value. This is the pass that scales with row count. */
const createMosaicTimeStampMap = (
  inputTable: Table,
  columns: MosaicColumns,
  fillColumn: NumericColumnData,
  fillColumnMap: ColumnGroupMap,
  yColumnKeys: Array<string>,
  yLabelColumnSeparator: string,
): MosaicTimeStampMap => {
  // Mosaic can have only one column as the fill value:
  // always the first fill column key
  const valueKey = fillColumnMap.columnKeys?.[0] ?? ''

  const {xColumn, labelColumns, yColumns} = columns

  const timeStampMap = new Map<number, Array<MosaicRow>>()

  for (let i = 0; i < inputTable.length; i++) {
    const yColumnTick = Array.isArray(yColumnKeys)
      ? yColumnKeys.reduce((combinedValue, key) => {
          let value = ''
          const column = yColumns.get(key)
          if (column) {
            value = column[i]
          }
          return `${combinedValue}${value}`
        }, '')
      : ''

    const yTickLabel = labelColumns.reduce((combinedValue, key) => {
      let value = ''
      const column = yColumns.get(key)
      if (column) {
        value = column[i]
      }
      return combinedValue
        ? `${combinedValue}${yLabelColumnSeparator}${value}`
        : value
    }, '')

    const currentX = xColumn[i]
    const currentFillValue = fillColumnMap.mappings[fillColumn[i]][valueKey]

    let bucket = timeStampMap.get(currentX)
    if (!bucket) {
      bucket = []
      timeStampMap.set(currentX, bucket)
    }

    bucket.push({yTickLabel, yColumnTick, fill: currentFillValue})
  }

  return timeStampMap
}

/*
  Walks the buckets in ascending x order and merges each series' consecutive
  rows into x ranges, starting a new range whenever the fill changes.
*/
const createMosaicSeries = (
  timeStampMap: MosaicTimeStampMap,
): MosaicSeriesMap => {
  const sortedTimeStamps = [...timeStampMap.keys()].sort(sortByValue)
  const seriesMap = new Map<string, MosaicSeries>()

  sortedTimeStamps.forEach(timeStamp => {
    timeStampMap.get(timeStamp)?.forEach(row => {
      const existing = seriesMap.get(row.yColumnTick)

      if (!existing) {
        seriesMap.set(row.yColumnTick, {
          xMin: [timeStamp],
          xMax: [timeStamp],
          fill: [row.fill],
          series: [row.yColumnTick],
          displayedColumns: [row.yTickLabel],
          yTickLabel: row.yTickLabel,
        })
        return
      }

      const prevMaxIndex = existing.xMax.length - 1
      const prevFill = existing.fill[existing.fill.length - 1]

      existing.xMax[prevMaxIndex] = timeStamp
      if (prevFill !== row.fill) {
        existing.xMin.push(timeStamp)
        existing.xMax.push(timeStamp)
        existing.fill.push(row.fill)
        existing.series.push(row.yColumnTick)
        existing.displayedColumns.push(row.yTickLabel)
      }
    })
  })

  return seriesMap
}

/*
  The series as the columns <Rect> draws from.

  Not the input table: this one is built from scratch with the bin boundary and
  series columns, so it has none of the original columns on it.
*/
const createMosaicTable = (
  seriesMap: MosaicSeriesMap,
): {
  binnedTable: Table
  ySeries: Array<string>
  yTicks: Array<string>
} => {
  let xMinData: Array<number> = []
  let xMaxData: Array<number> = []
  let fillData: Array<string> = []
  let seriesData: Array<string> = []
  let displayedColumnsData: Array<string> = []
  const ySeries: Array<string> = []
  const yTicks: Array<string> = []

  // The keys are y column ticks, i.e. strings, so a default sort is right here.
  const sortedKeys = [...seriesMap.keys()].sort()

  sortedKeys.forEach(key => {
    const series = seriesMap.get(key)

    if (!series) {
      return
    }

    xMinData = xMinData.concat(series.xMin)
    xMaxData = xMaxData.concat(series.xMax)
    fillData = fillData.concat(series.fill)
    seriesData = seriesData.concat(series.series)
    displayedColumnsData = displayedColumnsData.concat(series.displayedColumns)
    ySeries.push(key)
    yTicks.push(series.yTickLabel)
  })

  const binnedTable = newTable(xMinData.length)
    .addColumn(X_MIN, 'system', 'number', xMinData)
    .addColumn(X_MAX, 'system', 'number', xMaxData)
    .addColumn(FILL, 'string', 'string', fillData)
    .addColumn(SERIES, 'string', 'string', seriesData)
    .addColumn(DISPLAY_NAME, 'string', 'string', displayedColumnsData)

  return {binnedTable, ySeries, yTicks}
}

/*
  One memo per binning stage, instead of one memo around all of it.

  Listing each stage's own inputs means a change only invalidates the stages
  downstream of it. `colors` only reaches the scale, so recolouring skips the
  binning entirely; `fillColKeys` only reaches the grouping, and the row scan
  reads that grouping, so changing the fill stops before the series merge.
  Keying a single memo on the whole config object would redo all of it whenever
  an unrelated option changed -- legend visibility, stroke opacity, and so on.
*/
export const useMosaicTransform = (
  table: Table,
  xColumnKey: string,
  yColumnKeys: Array<string>,
  yLabelColumns: Array<string>,
  yLabelColumnSeparator: string,
  fillColKeys: Array<string>,
  colors: Array<string>,
) => {
  const [fillColumn, fillColumnMap] = useMemo(
    () => createMosaicFill(table, fillColKeys),
    [table, fillColKeys],
  )

  const columns = useMemo(
    () =>
      createMosaicColumns(
        table,
        xColumnKey,
        yColumnKeys,
        yLabelColumns,
        yLabelColumnSeparator,
      ),
    [table, xColumnKey, yColumnKeys, yLabelColumns, yLabelColumnSeparator],
  )

  const timeStampMap = useMemo(
    () =>
      createMosaicTimeStampMap(
        table,
        columns,
        fillColumn,
        fillColumnMap,
        yColumnKeys,
        yLabelColumnSeparator,
      ),
    [
      table,
      columns,
      fillColumn,
      fillColumnMap,
      yColumnKeys,
      yLabelColumnSeparator,
    ],
  )

  const seriesMap = useMemo(
    () => createMosaicSeries(timeStampMap),
    [timeStampMap],
  )

  const {binnedTable, ySeries, yTicks} = useMemo(
    () => createMosaicTable(seriesMap),
    [seriesMap],
  )

  const fillScale = useMemo(
    () => getNominalColorScale(fillColumnMap, colors),
    [fillColumnMap, colors],
  )

  return {
    binnedTable,
    yDomain: [0, yTicks.length],
    yColumnsName: columns.yColumnsName,
    ySeries,
    yTicks,
    fillScale,
    fillColumnMap,
  }
}
