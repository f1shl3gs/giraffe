import {getBandLineMap} from 'components/Band/transform'
import type {StaticLegendConfig} from 'components/Plot/PlotConfig'
import {FILL} from 'constants/columnKeys'
import {BAND_COLOR_SCALE_CONSTANT} from 'constants/index'
import {
  createGroupIDColumn,
  getBandColorScale,
  getNominalColorScale,
} from 'utils/transform'
import {
  ColumnGroupMap,
  Formatter,
  LatestIndexMap,
  LegendData,
  Table,
} from 'types'

import {getTooltipBandGroupColumns} from './band'
import {formatLegendValues} from './format'
import {sortBandLines, sortIndicesByValueColumn} from './sort'

/*
  D6: the static legend gets no layer spec. Everything convertLineSpec /
  convertBandSpec used to read out of one -- the fill grouping, the latest row
  per group, the value column and the colour each group was drawn in -- is
  rebuilt here from the table plus the fields StaticLegendConfig declares. The
  cost is that `fill` / `colors` / the band column names are stated twice, once
  on the layer and once on the legend; D6 accepted that in exchange for <Plot>
  no longer knowing which child is which.

  `mainColumnName` is what tells a band legend from a line legend -- the same
  structural test getYDomain uses.
*/
export const getLegendData = (
  table: Table,
  staticLegend: StaticLegendConfig,
  valueColumnKey: string,
  getFormatter?: (columnKey: string) => Formatter,
): LegendData => {
  const {fill = [], colors = [], colorMapping} = staticLegend

  if (!fill.length || !table.getColumn(valueColumnKey)) {
    return []
  }

  const [groupIds, groupIdMap] = createGroupIDColumn(table, fill)
  const latestIndices: LatestIndexMap = {}
  for (let i = 0; i < groupIds.length; i += 1) {
    latestIndices[groupIds[i]] = i
  }

  const valueFormatter = getFormatter
    ? getFormatter(valueColumnKey)
    : (x: unknown) => String(x)

  if (staticLegend.mainColumnName !== undefined) {
    return convertBand({
      table,
      fill,
      groupIdMap,
      latestIndices,
      colors,
      colorMapping,
      valueColumnKey,
      valueFormatter,
      getFormatter,
      staticLegend,
    })
  }

  const groupColor = groupColorFor(groupIdMap, colors, colorMapping)
  const values = table.getColumn(valueColumnKey, 'number')
  const sortOrder = sortIndicesByValueColumn(values, [
    ...new Set(Object.values(latestIndices)),
  ])
  const rowColors = sortOrder.map(index => groupColor(groupIds[index]))

  const valueColumn = {
    key: valueColumnKey,
    name: `Latest ${valueColumnKey}`,
    type: table.getColumnType(valueColumnKey),
    colors: rowColors,
    values: formatLegendValues(values, sortOrder, valueFormatter),
  }

  const fillColumns = fill.map(key => ({
    key,
    name: key,
    type: table.getColumnType(key),
    values: sortOrder.map(index =>
      getFormatter
        ? getFormatter(key)(groupIdMap.mappings[groupIds[index]][key])
        : groupIdMap.mappings[groupIds[index]][key],
    ),
    colors: rowColors,
  }))

  return [valueColumn, ...fillColumns]
}

const groupColorFor = (
  groupIdMap: ColumnGroupMap,
  colors: string[],
  colorMapping: ColumnGroupMap | undefined,
) => {
  const scale = getNominalColorScale(groupIdMap, colors)
  return (groupId: number): string =>
    colorMapping?.mappings?.[groupId]?.color ?? scale(groupId)
}

interface BandLegendInput {
  table: Table
  fill: string[]
  groupIdMap: ColumnGroupMap
  latestIndices: LatestIndexMap
  colors: string[]
  colorMapping: ColumnGroupMap | undefined
  valueColumnKey: string
  valueFormatter: Formatter
  getFormatter: ((columnKey: string) => Formatter) | undefined
  staticLegend: StaticLegendConfig
}

const convertBand = ({
  table,
  fill,
  groupIdMap,
  latestIndices,
  colors,
  colorMapping,
  valueColumnKey,
  valueFormatter,
  getFormatter,
  staticLegend,
}: BandLegendInput): LegendData => {
  const {bandName = '', upperColumnName, lowerColumnName} = staticLegend

  const bandLineMap = getBandLineMap(
    groupIdMap,
    lowerColumnName,
    staticLegend.mainColumnName,
    upperColumnName,
  )
  const groupIds = table.getColumn(FILL) as string[]

  const bandValues = table.getColumn(valueColumnKey, 'number')
  const sorted = sortBandLines(bandValues, bandLineMap, latestIndices)
  const scale = getBandColorScale(bandLineMap, colors)
  const rowColors = sorted.rowLines.map(
    (line, i) =>
      colorMapping?.mappings?.[groupIds[line]]?.color ??
      scale(i * BAND_COLOR_SCALE_CONSTANT),
  )

  const valueAt = (lines: Array<number | string>) =>
    formatLegendValues(
      bandValues,
      lines.map(line => latestIndices[line]),
      valueFormatter,
    )

  const columns = [
    {
      key: valueColumnKey,
      name: `Latest ${valueColumnKey}:${bandName}`,
      type: table.getColumnType(valueColumnKey),
      colors: rowColors,
      values: valueAt(sorted.rowLines),
    },
  ]

  if (upperColumnName) {
    columns.push({
      key: valueColumnKey,
      name: `${valueColumnKey}:${upperColumnName}`,
      type: table.getColumnType(valueColumnKey),
      colors: rowColors,
      values: valueAt(sorted.upperLines),
    })
  }

  if (lowerColumnName) {
    columns.push({
      key: valueColumnKey,
      name: `${valueColumnKey}:${lowerColumnName}`,
      type: table.getColumnType(valueColumnKey),
      colors: rowColors,
      values: valueAt(sorted.lowerLines),
    })
  }

  const fillColumns = getTooltipBandGroupColumns(
    table,
    sorted.rowLines.map(line => latestIndices[line]),
    fill,
    getFormatter,
    rowColors,
  )

  return [...columns, ...fillColumns]
}
