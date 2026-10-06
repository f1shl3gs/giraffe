import {VALUE} from 'constants/columnKeys'

// Types
import {ColumnGroupMap, LegendColumn, LegendData, Scale, Table} from 'types'

import {sortIndicesByValueColumn} from './sort'

const orderDataByValue = (
  originalOrder: number[],
  nextOrder: number[],
  data: Array<any>,
) => {
  const dataMap = {}
  originalOrder.forEach((place, index) => (dataMap[place] = data[index]))
  return nextOrder.map(place => dataMap[place])
}

export const getRangeLabel = (
  min: number,
  max: number,
  formatter: (v: any) => string,
): string => {
  let label = ''

  if (min === max) {
    label = formatter(min)
  } else {
    label = `${formatter(min)} – ${formatter(max)}`
  }

  return label
}

const getTooltipGroupColumns = (
  table: Table,
  rowIndices: number[],
  groupColKeys: string[],
  getValueFormatter: (colKey: string) => (x: any) => string,
  rowColors: string[] | null,
): LegendColumn[] => {
  return groupColKeys.map(key => {
    const colData = table.getColumn(key)
    const formatter = getValueFormatter(key)

    return {
      key,
      name: table.getColumnName(key),
      type: table.getColumnType(key),
      colors: rowColors,
      values: rowIndices.map(i =>
        colData[i] == null ? null : formatter(colData[i]),
      ),
    }
  })
}

export const getPointsTooltipData = (
  hoveredRowIndices: number[],
  table: Table,
  xColKey: string,
  yColKey: string,
  groupColKey: string,
  getValueFormatter: (colKey: string) => (x: any) => string,
  fillColKeys: string[],
  fillScale: Scale<number, string>,
  colorMapping?: ColumnGroupMap,
): LegendData => {
  const lineValues =
    xColKey === VALUE ? table.getColumn(xColKey) : table.getColumn(yColKey)
  const sortOrder = sortIndicesByValueColumn(lineValues, hoveredRowIndices)
  const xColData = table.getColumn(xColKey, 'number')
  const yColData = table.getColumn(yColKey, 'number')
  const groupColData = table.getColumn(groupColKey, 'number')

  const colors = orderDataByValue(
    hoveredRowIndices,
    sortOrder,
    hoveredRowIndices.map(i =>
      colorMapping
        ? colorMapping.mappings[groupColData[i]].color
        : fillScale(groupColData[i]),
    ),
  )

  const xFormatter = getValueFormatter(xColKey)
  const yFormatter = getValueFormatter(yColKey)

  const tooltipXCol = {
    key: xColKey,
    name: table.getColumnName(xColKey),
    type: table.getColumnType(xColKey),
    colors,
    values: hoveredRowIndices.map(i => xFormatter(xColData[i])),
  }

  const tooltipYCol = {
    key: yColKey,
    name: table.getColumnName(yColKey),
    type: table.getColumnType(yColKey),
    colors,
    values: orderDataByValue(
      hoveredRowIndices,
      sortOrder,
      hoveredRowIndices.map(i => yFormatter(yColData[i])),
    ),
  }

  const tooltipAdditionalColumns = []

  const fillColumns = getTooltipGroupColumns(
    table,
    sortOrder,
    fillColKeys,
    getValueFormatter,
    colors,
  )

  return [tooltipXCol, tooltipYCol, ...tooltipAdditionalColumns, ...fillColumns]
}
