// Libraries
import {useMemo} from 'react'

// Types
import {ColumnGroupMap, LineData, Table} from 'types'

// Utils
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'

// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL} from 'constants/columnKeys'

export const lineTransform = (
  inputTable: Table,
  xColumn: string,
  yColumn: string,
  fillColKeys: string[],
  colors: string[],
  colorMapping?: ColumnGroupMap,
) => {
  const [fillColumn, fillColumnMap] = createGroupIDColumn(
    inputTable,
    fillColKeys,
  )

  const table = inputTable.addColumn(FILL, 'system', 'number', fillColumn)
  const xCol = table.getColumn(xColumn, 'number') || []
  const yCol = table.getColumn(yColumn, 'number') || []
  const fillScale = getNominalColorScale(fillColumnMap, colors)
  const lineData: LineData = new Map()

  for (let i = 0; i < table.length; i++) {
    const groupID = fillColumn[i]
    const x = xCol[i]
    const y = yCol[i]

    let series = lineData.get(groupID)

    if (!series) {
      series = {xs: [], ys: [], fill: fillScale(groupID)}
      // override the fill with the saved colorMapping, when it exists
      if (colorMapping) {
        series.fill = colorMapping.mappings[groupID].color
      }
      lineData.set(groupID, series)
    }

    series.xs.push(x)
    series.ys.push(y)
  }

  return {
    /*
      Not the input table: this one has the FILL group column added, which is
      what the lines are grouped and coloured by.
    */
    fillTable: table,
    lineData,
    fillScale,
  }
}

export const useLineTransform = (
  table: Table,
  xColumn: string,
  yColumn: string,
  fillColKeys: string[] = [],
  colors: string[] = NINETEEN_EIGHTY_FOUR,
  colorMapping?: ColumnGroupMap,
) => {
  return useMemo(
    () =>
      lineTransform(table, xColumn, yColumn, fillColKeys, colors, colorMapping),
    [table, xColumn, yColumn, fillColKeys, colors, colorMapping],
  )
}
