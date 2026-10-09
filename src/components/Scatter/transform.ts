// Libraries

import {FILL, SYMBOL} from 'constants/columnKeys'
// Constants
import {ALL_SYMBOL_TYPES} from 'constants/index'
import {range} from 'd3-array'
import {scaleOrdinal} from 'd3-scale'
// Types
import type {ColumnGroupMap, Scale, SymbolType, Table} from 'types'
// Utils
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'

export const scatterTransform = (
  inputTable: Table,
  fillColKeys: string[],
  symbolColKeys: string[],
  colors: string[],
) => {
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
    /*
      inputTable with `FILL` and `SYMBOL` added, so it still carries every
      original column -- there is no need to pass both tables along.
    */
    table,
    fillScale,
    symbolScale,
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
