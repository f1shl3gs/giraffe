// Libraries
import {range} from 'd3-array'
import {interpolateRgbBasis} from 'd3-interpolate'
import {scaleOrdinal} from 'd3-scale'

// Types
import {ColumnGroupMap, NumericColumnData, Scale, Table} from 'types'

export const createGroupIDColumn = (
  table: Table,
  columnKeys: string[],
): [NumericColumnData, ColumnGroupMap] => {
  const groupIDColumn = new Float64Array(table.length)
  const mappings = []
  const groupIDs = {}

  let currentGroupID = 0

  for (let i = 0; i < table.length; i++) {
    const mapping = {}

    for (const k of columnKeys) {
      mapping[k] = table.getColumn(k)[i]
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
