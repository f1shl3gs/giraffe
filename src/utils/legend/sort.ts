// Types
import {BandLineMap, ColumnData, LatestIndexMap} from 'types'

export const sortIndicesByValueColumn = (
  valuesColumn: ColumnData,
  rowIndices: Array<number>,
): Array<number> => {
  if (!valuesColumn || !rowIndices?.length) {
    return []
  }

  const rows: Array<{key: number; rowIndex: number}> = []
  rowIndices.forEach(rowIndex => {
    const colValue = valuesColumn[`${rowIndex}`]

    rows.push({
      key: typeof colValue === 'number' ? colValue : 0,
      rowIndex,
    })
  })

  rows.sort((first, second) => second.key - first.key)

  return rows.map(({rowIndex}) => rowIndex)
}

export const isSortable = (values): boolean => {
  if (!values || !values.length || values.length == 1) {
    return false
  }
  const initialValue = values[0]
  return values.every((value, index) => {
    if (index === 0) {
      return true
    }
    return value !== initialValue
  })
}

export const sortBandLines = (
  bandValues: ColumnData,
  bandLineMap: BandLineMap,
  selectedLinesIndexMap: LatestIndexMap,
): BandLineMap => {
  const sortedBandLineMap: BandLineMap = {
    upperLines: [],
    rowLines: [],
    lowerLines: [],
  }

  const {upperLines, rowLines, lowerLines} = bandLineMap

  const indexToPreviousPositionMap: LatestIndexMap = {}
  const rowIndices = []
  const upperIndices = []
  const lowerIndices = []
  rowLines.forEach((line, position) => {
    const index = selectedLinesIndexMap[line]
    indexToPreviousPositionMap[index] = position
    rowIndices.push(index)
  })
  upperLines.forEach((line, position) => {
    const index = selectedLinesIndexMap[line]
    indexToPreviousPositionMap[index] = position
    upperIndices.push(index)
  })
  lowerLines.forEach((line, position) => {
    const index = selectedLinesIndexMap[line]
    indexToPreviousPositionMap[index] = position
    lowerIndices.push(index)
  })
  const rowValues = rowIndices.map(index => bandValues[index])
  const upperValues = upperIndices.map(index => bandValues[index])
  const lowerValues = lowerIndices.map(index => bandValues[index])

  let sortOrder
  if (isSortable(rowValues)) {
    sortOrder = sortIndicesByValueColumn(bandValues, rowIndices)
  } else if (isSortable(upperValues)) {
    sortOrder = sortIndicesByValueColumn(bandValues, upperIndices)
  } else if (isSortable(lowerValues)) {
    sortOrder = sortIndicesByValueColumn(bandValues, lowerIndices)
  }

  if (Array.isArray(sortOrder)) {
    sortOrder.forEach(index => {
      const previousPosition = indexToPreviousPositionMap[index]
      sortedBandLineMap.rowLines.push(rowLines[previousPosition])
      sortedBandLineMap.upperLines.push(upperLines[previousPosition])
      sortedBandLineMap.lowerLines.push(lowerLines[previousPosition])
    })
    return sortedBandLineMap
  }
  return bandLineMap
}
