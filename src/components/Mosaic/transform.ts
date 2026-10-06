// Libraries
import memoizeOne from 'memoize-one'

// Types
import type {ColumnGroupMap, ColumnType, Scale, Table} from 'types'

// Utils
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'
import {newTable} from 'utils/newTable'
import {resolveDomain} from 'utils/resolveDomain'

// Constants
import {DISPLAY_NAME, FILL, SERIES, X_MAX, X_MIN} from 'constants/columnKeys'

/*
  memoize-one hands its comparator the argument list, so this sees
  [[...timeStamps]] rather than [...timeStamps] and has to look one level in.

  Both callers spread a fresh array on every call, so comparing by reference
  would never match and the memo would recompute every time.
*/
const sameKeys = (next: unknown[], last: unknown[]): boolean => {
  if (next.length !== last.length) {
    return false
  }

  return next.every((argument, i) => {
    const previous = last[i]

    if (Array.isArray(argument) && Array.isArray(previous)) {
      return (
        argument.length === previous.length &&
        argument.every((key, j) => key === previous[j])
      )
    }

    return argument === previous
  })
}

const memoizedSortTimeStamps = memoizeOne(
  (timeStamps: Iterable<number>) => [...timeStamps].sort(),
  sameKeys,
)

const memoizedSortDataMapKeys = memoizeOne(
  (dataMapKeys: Iterable<string>) => [...dataMapKeys].sort(),
  sameKeys,
)

export const mosaicTransform = (
  inputTable: Table,
  xColumnKey: string,
  yColumnKeys: Array<string>,
  yLabelColumns: Array<string>,
  yLabelColumnSeparator: string,
  xDomain: Array<number>,
  fillColKeys: Array<string>,
  colors: Array<string>,
): MosaicLayerSpec => {
  const [fillColumn, fillColumnMap] = createGroupIDColumn(
    inputTable,
    fillColKeys,
  )
  const xInputCol = inputTable.getColumn(xColumnKey, 'number') || []

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
  const yInputCols = new Map()
  if (Array.isArray(yColumnKeys)) {
    yColumnKeys.forEach(columnKey => {
      if (columnKey) {
        const column = inputTable.getColumn(columnKey, 'string')
        yInputCols.set(columnKey, column)
      }
    })
  }

  // Mosaic can have only one column as the fill value:
  // always the first fill column key
  const valueKey = fillColumnMap.columnKeys?.[0] ?? ''

  const timeStampMap = new Map<
    number,
    Array<{yTickLabel: string; yColumnTick: string; fill: string}>
  >()
  for (let i = 0; i < inputTable.length; i++) {
    const yColumnTick = Array.isArray(yColumnKeys)
      ? yColumnKeys.reduce((combinedValue, key) => {
          let value = ''
          if (yInputCols.has(key) && Array.isArray(yInputCols.get(key))) {
            value = yInputCols.get(key)[i]
          }
          return `${combinedValue}${value}`
        }, '')
      : ''

    const yTickLabel = labelColumns.reduce((combinedValue, key) => {
      let value = ''
      if (yInputCols.has(key)) {
        value = yInputCols.get(key)[i]
      }
      return combinedValue
        ? `${combinedValue}${yLabelColumnSeparator}${value}`
        : value
    }, '')

    const currentX = xInputCol[i]
    const currentFillValue = fillColumnMap.mappings[fillColumn[i]][valueKey]

    let bucket = timeStampMap.get(currentX)
    if (!bucket) {
      bucket = []
      timeStampMap.set(currentX, bucket)
    }

    bucket.push({
      yTickLabel,
      yColumnTick,
      fill: currentFillValue,
    })
  }

  const sortedTimeStamps = memoizedSortTimeStamps([...timeStampMap.keys()])
  let tableLength = 0

  /*
    This is the structure used to create and update the data map below:

    dataMap[series] = {
      xMin: NumericColumnData,
      xMax: NumericColumnData,
      fill: NumericColumnData,
      series: string[],
      displayedColumns: string[],
      yTickLabel: string,
    }
  */
  const dataMap = new Map()

  sortedTimeStamps.forEach(timeStamp => {
    timeStampMap.get(timeStamp)?.forEach(data => {
      if (!dataMap.has(data.yColumnTick)) {
        dataMap.set(data.yColumnTick, {
          xMin: [timeStamp],
          xMax: [timeStamp],
          fill: [data.fill],
          series: [data.yColumnTick],
          displayedColumns: [data.yTickLabel],
          yTickLabel: data.yTickLabel,
        })
        tableLength += 1
      } else {
        const prevMaxIndex = dataMap.get(data.yColumnTick).xMax.length - 1
        const prevFill = dataMap.get(data.yColumnTick).fill[
          dataMap.get(data.yColumnTick).fill.length - 1
        ]

        dataMap.get(data.yColumnTick).xMax[prevMaxIndex] = timeStamp
        if (prevFill !== data.fill) {
          dataMap.get(data.yColumnTick).xMin.push(timeStamp)
          dataMap.get(data.yColumnTick).xMax.push(timeStamp)
          dataMap.get(data.yColumnTick).fill.push(data.fill)
          dataMap.get(data.yColumnTick).series.push(data.yColumnTick)
          dataMap.get(data.yColumnTick).displayedColumns.push(data.yTickLabel)
          tableLength += 1
        }
      }
    })
  })

  let xMinData: number[] = []
  let xMaxData: number[] = []
  let fillData: string[] = []
  let seriesData: string[] = []
  let displayedColumnsData: string[] = []
  const yTicks: string[] = []
  const ySeries: string[] = []

  const sortedDataMapKeys = memoizedSortDataMapKeys([...dataMap.keys()])

  sortedDataMapKeys.forEach(key => {
    // combine all series into the proper shape
    xMinData = xMinData.concat(dataMap.get(key).xMin)
    xMaxData = xMaxData.concat(dataMap.get(key).xMax)
    fillData = fillData.concat(dataMap.get(key).fill)
    seriesData = seriesData.concat(dataMap.get(key).series)
    displayedColumnsData = displayedColumnsData.concat(
      dataMap.get(key).displayedColumns,
    )
    ySeries.push(key)
    yTicks.push(dataMap.get(key).yTickLabel)
  })

  const table = newTable(tableLength)
    .addColumn(X_MIN, 'system', 'number', xMinData)
    .addColumn(X_MAX, 'system', 'number', xMaxData)
    .addColumn(FILL, 'string', 'string', fillData)
    .addColumn(SERIES, 'string', 'string', seriesData)
    .addColumn(DISPLAY_NAME, 'string', 'string', displayedColumnsData)

  const resolvedXDomain = resolveDomain(xInputCol, xDomain)
  const resolvedYDomain = [0, yTicks.length]
  const fillScale = getNominalColorScale(fillColumnMap, colors)

  return {
    inputTable,
    table,
    xDomain: resolvedXDomain,
    xColumnKey,
    xColumnType: inputTable.getColumnType(xColumnKey) ?? 'number',
    yDomain: resolvedYDomain,
    yColumnType: 'string',
    yColumnsName,
    ySeries,
    yTicks,
    scales: {fill: fillScale},
    columnGroupMaps: {fill: fillColumnMap},
  }
}

/* The transform output, consumed only by Mosaic. */
export interface MosaicLayerSpec {
  inputTable: Table
  table: Table // has `X_MIN`, `X_MAX`, `Y_MIN`, `Y_MAX`, and `COUNT` columns, and maybe a `FILL` column
  xDomain: number[]
  yDomain: number[]
  xColumnKey: string
  xColumnType: ColumnType
  yColumnType: ColumnType
  yColumnsName: string
  scales: {fill: Scale<number, string>}
  columnGroupMaps: {
    fill: ColumnGroupMap
  }
  ySeries: Array<string>
  yTicks: Array<string>
}
