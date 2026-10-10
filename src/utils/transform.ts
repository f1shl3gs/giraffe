// Libraries
import {range} from 'd3-array'
import {interpolateRgbBasis} from 'd3-interpolate'
import {scaleOrdinal} from 'd3-scale'

// Types
import {ColumnGroupMap, NumericColumnData, Scale, Table} from 'types'

/*
  A shared identity for "no grouping columns".

  An inline `fill = []` default is a fresh array on every render. Hand one to a
  memo dependency and it misses every time, which here rebuilds the line data,
  rebuilds the simplified copy, and repaints -- on every mouse move, since
  hovering re-renders the layer through PlotInteractionContext. Nothing warns
  about it; the chart just gets quietly expensive.

  <Line> and <Band> both need a real array to pass on to their hover layer, so
  the constant lives here rather than being duplicated per component.
*/
export const NO_FILL_COLUMNS: string[] = []

export const createGroupIDColumn = (
  table: Table,
  columnKeys: string[],
): [NumericColumnData, ColumnGroupMap] => {
  /*
    Resolved once, up front. Reading `table.getColumn(k)` inside the row loop
    meant one lookup per row per grouping column -- 100,000 of them for a
    5,000-row table over 20 columns, where the table holds 20. This runs on every
    `table` change, which for a live dashboard is often, and it was the single
    largest cost in both <Line> and <Band>.
  */
  const columns = columnKeys.map(key => table.getColumn(key))

  const groupIDColumn = new Float64Array(table.length)
  const mappings = []
  const groupIDs = {}

  let currentGroupID = 0

  for (let i = 0; i < table.length; i++) {
    const mapping = {}

    for (let c = 0; c < columnKeys.length; c++) {
      mapping[columnKeys[c]] = columns[c][i]
    }

    const hashedGroupValues = Object.values(mapping).sort().join('')

    let groupID = groupIDs[hashedGroupValues]

    if (groupID === undefined) {
      groupID = currentGroupID

      groupIDs[hashedGroupValues] = groupID
      mappings[groupID] = mapping

      currentGroupID++
    }

    groupIDColumn[i] = groupID
  }

  const columnGroupMap: ColumnGroupMap = {mappings, columnKeys}

  return [groupIDColumn, columnGroupMap]
}

export const createNominalColorScale = (
  length: number,
  colors: string[],
): Scale<number, string> => {
  if (colors.length === 0) {
    return scaleOrdinal<number, string>().domain(range(length)).range([])
  }

  if (length === 1) {
    return scaleOrdinal<number, string>().domain([0]).range([colors[0]])
  }

  const domain = range(length)

  let scaleRange = []

  if (domain.length <= colors.length) {
    scaleRange = colors.slice(0, domain.length)
  } else {
    const interpolator = interpolateRgbBasis(colors)

    scaleRange = range(domain.length).map(k =>
      interpolator(k / (domain.length - 1)),
    )
  }

  return scaleOrdinal<number, string>().domain(domain).range(scaleRange)
}

export const getNominalColorScale = (
  groupMap: ColumnGroupMap,
  colors: string[],
): Scale<number, string> =>
  createNominalColorScale(groupMap.mappings.length, colors)
