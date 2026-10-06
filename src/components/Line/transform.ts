import {FILL, TIME} from 'constants/columnKeys'
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'
import {
  ColumnGroupMap,
  ColumnType,
  LatestIndexMap,
  LineData,
  Scale,
  Table,
} from 'types'

/* The transform's output, consumed only by Line and LineHover. */
export interface LineLayerSpec {
  inputTable: Table
  table: Table // has `FILL` column added
  lineData: LineData
  xDomain: number[]
  yDomain: number[]
  xColumnKey: string
  yColumnKey: string
  xColumnType: ColumnType
  yColumnType: ColumnType
  scales: {
    fill: Scale<number, string>
  }
  columnGroupMaps: {
    fill: ColumnGroupMap
    latestIndices: LatestIndexMap
  }
}

export const lineTransform = (
  inputTable: Table,
  xColumnKey: string,
  yColumnKey: string,
  fillColKeys: string[],
  colors: string[],
  colorMapping?: ColumnGroupMap,
): LineLayerSpec => {
  const [fillColumn, fillColumnMap] = createGroupIDColumn(
    inputTable,
    fillColKeys,
  )

  const table = inputTable.addColumn(FILL, 'system', 'number', fillColumn)
  const xCol = table.getColumn(xColumnKey, 'number') || []
  const yCol = table.getColumn(yColumnKey, 'number') || []
  const fillScale = getNominalColorScale(fillColumnMap, colors)
  const lineData: LineData = new Map()
  const latestIndices: LatestIndexMap = {}

  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity

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

    // remember the latest (most recent) index for each group
    if (latestIndices[groupID] == null) {
      latestIndices[groupID] = i
    } else if (yColumnKey === TIME) {
      if (
        y > yCol[latestIndices[groupID]] ||
        yCol[latestIndices[groupID]] == null
      ) {
        latestIndices[groupID] = i
      }
    } else if (
      x > xCol[latestIndices[groupID]] ||
      xCol[latestIndices[groupID]] == null
    ) {
      latestIndices[groupID] = i
    }

    if (x < xMin) {
      xMin = x
    }

    if (x > xMax) {
      xMax = x
    }

    if (y < yMin) {
      yMin = y
    }

    if (y > yMax) {
      yMax = y
    }
  }

  return {
    inputTable,
    table,
    lineData,
    xDomain: [xMin, xMax],
    yDomain: [yMin, yMax],
    xColumnKey,
    yColumnKey,
    xColumnType: table.getColumnType(xColumnKey) ?? 'number',
    yColumnType: table.getColumnType(yColumnKey) ?? 'number',
    scales: {fill: fillScale},
    columnGroupMaps: {fill: fillColumnMap, latestIndices},
  }
}
