import {FILL} from 'constants/columnKeys'
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'
import {ColumnGroupMap, LineData, Table} from 'types'

export const lineTransform = (
  inputTable: Table,
  xColumnKey: string,
  yColumnKey: string,
  fillColKeys: string[],
  colors: string[],
  colorMapping?: ColumnGroupMap,
) => {
  const [fillColumn, fillColumnMap] = createGroupIDColumn(
    inputTable,
    fillColKeys,
  )

  const table = inputTable.addColumn(FILL, 'system', 'number', fillColumn)
  const xCol = table.getColumn(xColumnKey, 'number') || []
  const yCol = table.getColumn(yColumnKey, 'number') || []
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
