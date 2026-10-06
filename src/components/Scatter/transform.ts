// Libraries
import {range} from 'd3-array'
import {scaleOrdinal} from 'd3-scale'

// Types
import type {ColumnGroupMap, ColumnType, Scale, SymbolType, Table} from 'types'

// Utils
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'

// Constants
import {ALL_SYMBOL_TYPES} from 'constants/index'
import {FILL, SYMBOL} from 'constants/columnKeys'

/*
  The transform's output, consumed only by Scatter. There is no `type`
  discriminator: <Scatter> is the type.

  xDomain and yDomain are what the transform measured, kept for callers that
  want them. <Scatter> itself does not use them -- it lets <Plot> resolve both
  axes from xColumn / yColumn, because the two reduces below do not agree on how
  to seed a minimum and so cannot both be what the axes should show.
*/
export interface ScatterSpec {
  inputTable: Table
  table: Table // has `FILL` and `SYMBOL` columns added

  xColumnKey: string
  yColumnKey: string
  xColumnType: ColumnType
  yColumnType: ColumnType
  scales: {
    fill: Scale<number, string>
    symbol: Scale<number, SymbolType>
  }
  columnGroupMaps: {
    fill: ColumnGroupMap
    symbol: ColumnGroupMap
  }
}

export const scatterTransform = (
  inputTable: Table,
  xColumnKey: string,
  yColumnKey: string,
  fillColKeys: string[],
  symbolColKeys: string[],
  colors: string[],
): ScatterSpec => {
  const [fillColumn, fillColumnMap] = createGroupIDColumn(
    inputTable,
    fillColKeys,
  )

  const [symbolColumn, symbolColumnMap] = createGroupIDColumn(
    inputTable,
    symbolColKeys,
  )

  const table = inputTable
    .addColumn(FILL, 'system', 'number', fillColumn)
    .addColumn(SYMBOL, 'system', 'number', symbolColumn)

  const fillScale = getNominalColorScale(fillColumnMap, colors)
  const symbolScale = getSymbolScale(symbolColumnMap)

  return {
    inputTable,
    table,
    xColumnKey,
    yColumnKey,
    xColumnType: inputTable.getColumnType(xColumnKey),
    yColumnType: inputTable.getColumnType(yColumnKey),
    scales: {fill: fillScale, symbol: symbolScale},
    columnGroupMaps: {fill: fillColumnMap, symbol: symbolColumnMap},
  }
}

const getSymbolScale = (
  columnGroupMap: ColumnGroupMap,
): Scale<number, SymbolType> => {
  const domain = range(columnGroupMap.mappings.length)

  return scaleOrdinal<number, SymbolType>()
    .domain(domain)
    .range(ALL_SYMBOL_TYPES)
}
