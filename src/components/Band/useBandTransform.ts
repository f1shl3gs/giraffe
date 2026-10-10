// Libraries

// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, LOWER, RESULT, UPPER} from 'constants/columnKeys'
import {BAND_COLOR_SCALE_CONSTANT} from 'constants/index'
import {useMemo} from 'react'
import {
  Band,
  BandLineMap,
  ColumnData,
  ColumnGroupMap,
  DomainLabel,
  LatestIndexMap,
  LineData,
  Scale,
  Table,
} from 'types'
import {isSortable, sortIndicesByValueColumn} from 'utils/legend/sort'
import {scalePoints} from 'utils/lineData'
// Utils
import {
  createGroupIDColumn,
  createNominalColorScale,
  NO_FILL_COLUMNS,
} from 'utils/transform'

/* The transform's output, consumed only by Band and BandHover. */
export const getBands = (
  lineData: LineData,
  bandLineMap: BandLineMap,
): Band[] => {
  const {upperLines = [], rowLines = [], lowerLines = []} = bandLineMap
  const bands: Band[] = []

  rowLines.forEach((rowIndex, i) => {
    // Each band must have a "main column" which creates a row index
    // Any non-main column not associated with a "main" is not a band
    // Only bands get rendered
    if (Math.abs(rowIndex) === Infinity) {
      return
    }
    const upperIndex = upperLines[i]
    const upper =
      Math.abs(upperIndex) !== Infinity ? lineData.get(upperIndex) : undefined

    const lowerIndex = lowerLines[i]
    const lower =
      Math.abs(lowerIndex) === Infinity ? lineData.get(lowerIndex) : undefined

    const row = lineData.get(rowIndex)

    if (!row) {
      return
    }

    const upperBorder = upper ?? {fill: ''}
    const lowerBorder = lower ?? {fill: ''}
    upperBorder.fill = row.fill
    lowerBorder.fill = row.fill
    const result: Band = {...row}
    if (upper) {
      result.upper = upper
    }
    if (lower) {
      result.lower = lower
    }
    bands.push(result)
  })

  return bands
}

export const getBandLineMap = (
  fillColumnMap: ColumnGroupMap,
  lowerColumnName: string,
  rowColumnName: string,
  upperColumnName: string,
): BandLineMap => {
  const bandIndices = {
    rowLines: [],
    lowerLines: [],
    upperLines: [],
  }

  const bands = Object.values(
    groupLineIndicesIntoBands(
      fillColumnMap,
      lowerColumnName,
      rowColumnName,
      upperColumnName,
    ),
  )

  if (Array.isArray(bands)) {
    bands.forEach(band => {
      bandIndices.rowLines.push(band.row)
      bandIndices.lowerLines.push(band.lower)
      bandIndices.upperLines.push(band.upper)
    })
  }

  return bandIndices
}

export const createLatestBandIndices = (
  lineData: LineData,
  bandLineMap: BandLineMap,
  bandDimension: DomainLabel,
  hoveredLines?: LatestIndexMap,
): LatestIndexMap => {
  const latestIndices: LatestIndexMap = {}
  const lineDataLastIndices: LatestIndexMap = {}

  let counter = -1
  for (const [lineNumber, series] of lineData) {
    counter += series[bandDimension].length
    lineDataLastIndices[lineNumber] = counter
  }
  const {upperLines, rowLines, lowerLines} = bandLineMap

  rowLines.forEach((line, position) => {
    /*
      The ids come from bandLineMap, which is built from the same lineData, so
      every lookup below was already assumed present before this became a Map.
      `!` records that assumption instead of silently skipping a band.
    */
    const targetValues = lineData.get(line)![bandDimension]

    let lastIndex = lineDataLastIndices[line]
    let targetBandValue = targetValues[targetValues.length - 1]
    if (hoveredLines) {
      const offset = line === 0 ? 0 : lineDataLastIndices[line - 1] + 1
      lastIndex = hoveredLines[line]
      targetBandValue = targetValues[lastIndex - offset]
    }
    latestIndices[line] = lastIndex

    const upperLine = upperLines[position]
    const matchingUpperIndex = lineData
      .get(upperLine)!
      [bandDimension].findIndex(value => value === targetBandValue)
    if (matchingUpperIndex > -1) {
      const offset =
        upperLine === 0 ? 0 : lineDataLastIndices[upperLine - 1] + 1
      latestIndices[upperLine] = matchingUpperIndex + offset
    }

    const lowerLine = lowerLines[position]
    const matchingLowerIndex = lineData
      .get(lowerLine)!
      [bandDimension].findIndex(value => value === targetBandValue)
    if (matchingLowerIndex > -1) {
      const offset =
        lowerLine === 0 ? 0 : lineDataLastIndices[lowerLine - 1] + 1
      latestIndices[lowerLine] = matchingLowerIndex + offset
    }
  })
  return latestIndices
}

export const groupLineIndicesIntoBands = (
  fill: ColumnGroupMap,
  lowerColumnName: string,
  rowColumnName: string,
  upperColumnName: string,
) => {
  const {columnKeys, mappings} = fill
  const columnKeysWithoutResult = Array.isArray(columnKeys)
    ? columnKeys.filter(key => key !== RESULT)
    : []
  const bandLineIndexMap: {
    [lineName: string]: {
      lower: number | null
      upper: number | null
      row: number | null
    }
  } = {}

  if (Array.isArray(mappings)) {
    mappings.forEach((line, index) => {
      const lineName = columnKeysWithoutResult.reduce((accum, current) => {
        return `${accum}${line[current]}`
      }, '')
      if (!bandLineIndexMap[lineName]) {
        bandLineIndexMap[lineName] = {
          lower: null,
          upper: null,
          row: null,
        }
      }
      if (line[RESULT] === lowerColumnName) {
        bandLineIndexMap[lineName][LOWER] = index
      } else if (line[RESULT] === upperColumnName) {
        bandLineIndexMap[lineName][UPPER] = index
      } else if (line[RESULT] === rowColumnName) {
        bandLineIndexMap[lineName].row = index
      }
    })
  }

  return bandLineIndexMap
}

export const alignMinMaxWithBand = (
  lineData: LineData,
  bandLineMap: BandLineMap,
): LineData => {
  const {rowLines, upperLines, lowerLines} = bandLineMap

  const alignedData: LineData = new Map()

  for (let i = 0; i < rowLines.length; i += 1) {
    let bandXs: number[] = []
    let bandYs: number[] = []
    let upperXs: number[] = []
    let upperYs: number[] = []
    let lowerXs: number[] = []
    let lowerYs: number[] = []

    const bandId = rowLines[i]
    const upperId = upperLines[i]
    const lowerId = lowerLines[i]

    const bandSeries = lineData.get(bandId)
    const upperSeries = lineData.get(upperId)
    const lowerSeries = lineData.get(lowerId)

    if (upperSeries) {
      alignedData.set(upperId, {fill: upperSeries.fill, xs: [], ys: []})
      upperXs = upperSeries.xs
      upperYs = upperSeries.ys
    }

    if (lowerSeries) {
      alignedData.set(lowerId, {fill: lowerSeries.fill, xs: [], ys: []})
      lowerXs = lowerSeries.xs
      lowerYs = lowerSeries.ys
    }

    if (bandSeries) {
      alignedData.set(bandId, {fill: bandSeries.fill, xs: [], ys: []})
      bandXs = bandSeries.xs
      bandYs = bandSeries.ys
    }

    /*
      The loop body below only ever pushes onto these three, so they are
      resolved once instead of re-looking-up ~99 times. All three are asserted
      non-null because the pushes were already unguarded before; the remaining
      `if (band)` checks still do their job at runtime, since an undefined id
      yields an undefined entry that the assertion cannot see.
    */
    const band = alignedData.get(bandId)!
    const upper = alignedData.get(upperId)!
    const lower = alignedData.get(lowerId)!

    let bandIterator = 0
    let upperIterator = 0
    let lowerIterator = 0

    while (
      bandIterator < bandXs.length ||
      upperIterator < upperXs.length ||
      lowerIterator < lowerXs.length
    ) {
      const bandTime = bandXs[bandIterator]
      const bandValue = bandYs[bandIterator]
      const upperTime = upperXs[upperIterator]
      const upperValue = upperYs[upperIterator]
      const lowerTime = lowerXs[lowerIterator]
      const lowerValue = lowerYs[lowerIterator]

      // 1. All three are equal
      if (bandTime === upperTime && bandTime === lowerTime) {
        if (bandTime != null) {
          band.xs.push(bandTime)
          band.ys.push(bandValue)
          bandIterator += 1
        }
        if (upperTime != null) {
          upper.xs.push(upperTime)
          upper.ys.push(upperValue)
          upperIterator += 1
        }
        if (lowerTime != null) {
          lower.xs.push(lowerTime)
          lower.ys.push(lowerValue)
          lowerIterator += 1
        }
      }
      // 2. Lower is not equal to the other two
      else if (bandTime === upperTime) {
        if (bandTime > lowerTime || bandTime == null) {
          if (band) {
            band.xs.push(lowerTime)
            band.ys.push(lowerValue)
          }
          if (upper) {
            upper.xs.push(lowerTime)
            upper.ys.push(lowerValue)
          }
          lower.xs.push(lowerTime)
          lower.ys.push(lowerValue)
          lowerIterator += 1
        } else if (bandTime < lowerTime || lowerTime == null) {
          band.xs.push(bandTime)
          band.ys.push(bandValue)
          upper.xs.push(upperTime)
          upper.ys.push(upperValue)
          if (lower) {
            lower.xs.push(bandTime)
            lower.ys.push(bandValue)
          }
          bandIterator += 1
          upperIterator += 1
        }
      }
      // 3. Upper is not equal to the other two
      else if (bandTime === lowerTime) {
        if (bandTime > upperTime || bandTime == null) {
          if (band) {
            band.xs.push(upperTime)
            band.ys.push(upperValue)
          }
          if (lower) {
            lower.xs.push(upperTime)
            lower.ys.push(upperValue)
          }
          upper.xs.push(upperTime)
          upper.ys.push(upperValue)
          upperIterator += 1
        } else if (bandTime < upperTime || upperTime == null) {
          band.xs.push(bandTime)
          band.ys.push(bandValue)
          if (upper) {
            upper.xs.push(bandTime)
            upper.ys.push(bandValue)
          }
          lower.xs.push(lowerTime)
          lower.ys.push(lowerValue)
          bandIterator += 1
          lowerIterator += 1
        }
      }
      // 4. Band is not equal to the other two
      else if (upperTime === lowerTime) {
        if (upperTime > bandTime || upperTime == null) {
          band.xs.push(bandTime)
          band.ys.push(bandValue)
          if (upper) {
            upper.xs.push(bandTime)
            upper.ys.push(bandValue)
          }
          if (lower) {
            lower.xs.push(bandTime)
            lower.ys.push(bandValue)
          }
          bandIterator += 1
        } else if (upperTime < bandTime || bandTime == null) {
          if (band) {
            band.xs.push(upperTime)
            band.ys.push(upperValue)
          }
          upper.xs.push(upperTime)
          upper.ys.push(upperValue)
          lower.xs.push(lowerTime)
          lower.ys.push(lowerValue)
          upperIterator += 1
          lowerIterator += 1
        }
      }
      // 5. They are all different
      else {
        if (bandTime == null) {
          if (upperTime > lowerTime) {
            if (band) {
              band.xs.push(lowerTime)
              band.ys.push(lowerValue)
            }
            upper.xs.push(lowerTime)
            upper.ys.push(lowerValue)
            lower.xs.push(lowerTime)
            lower.ys.push(lowerValue)
            lowerIterator += 1
          } else {
            if (band) {
              band.xs.push(upperTime)
              band.ys.push(upperValue)
            }
            upper.xs.push(upperTime)
            upper.ys.push(upperValue)
            lower.xs.push(upperTime)
            lower.ys.push(upperValue)
            upperIterator += 1
          }
        } else if (upperTime == null) {
          if (bandTime > lowerTime) {
            band.xs.push(lowerTime)
            band.ys.push(lowerValue)
            if (upper) {
              upper.xs.push(lowerTime)
              upper.ys.push(lowerValue)
            }
            lower.xs.push(lowerTime)
            lower.ys.push(lowerValue)
            lowerIterator += 1
          } else {
            band.xs.push(bandTime)
            band.ys.push(bandValue)
            if (upper) {
              upper.xs.push(bandTime)
              upper.ys.push(bandValue)
            }
            lower.xs.push(bandTime)
            lower.ys.push(bandValue)
            bandIterator += 1
          }
        } else if (lowerTime == null) {
          if (bandTime > upperTime) {
            band.xs.push(upperTime)
            band.ys.push(upperValue)
            upper.xs.push(upperTime)
            upper.ys.push(upperValue)
            if (lower) {
              lower.xs.push(upperTime)
              lower.ys.push(upperValue)
            }
            upperIterator += 1
          } else {
            band.xs.push(bandTime)
            band.ys.push(bandValue)
            upper.xs.push(bandTime)
            upper.ys.push(bandValue)
            if (lower) {
              lower.xs.push(bandTime)
              lower.ys.push(bandValue)
            }
            bandIterator += 1
          }
        } else {
          const lowest = Math.min(bandTime, upperTime, lowerTime)

          if (lowest === lowerTime) {
            band.xs.push(lowerTime)
            band.ys.push(lowerValue)
            upper.xs.push(lowerTime)
            upper.ys.push(lowerValue)
            lower.xs.push(lowerTime)
            lower.ys.push(lowerValue)
            lowerIterator += 1
          } else if (lowest === upperTime) {
            band.xs.push(upperTime)
            band.ys.push(upperValue)
            upper.xs.push(upperTime)
            upper.ys.push(upperValue)
            lower.xs.push(upperTime)
            lower.ys.push(upperValue)
            upperIterator += 1
          } else {
            band.xs.push(bandTime)
            band.ys.push(bandValue)
            upper.xs.push(bandTime)
            upper.ys.push(bandValue)
            lower.xs.push(bandTime)
            lower.ys.push(bandValue)
            bandIterator += 1
          }
        }
      }
    }
  }

  return alignedData
}

export const bandTransform = (
  inputTable: Table,
  xColumnKey: string,
  yColumnKey: string,
  fillColKeys: string[],
  colors: string[],
  lowerColumnName: string,
  rowColumnName: string,
  upperColumnName: string,
) => {
  const [fillColumn, fillColumnMap] = createGroupIDColumn(
    inputTable,
    fillColKeys,
  )

  const table = inputTable.addColumn(FILL, 'system', 'number', fillColumn)
  const xCol = table.getColumn(xColumnKey, 'number')
  const yCol = table.getColumn(yColumnKey, 'number')
  const bandLineMap = getBandLineMap(
    fillColumnMap,
    lowerColumnName,
    rowColumnName,
    upperColumnName,
  )

  const bandColorScale = createNominalColorScale(
    bandLineMap.rowLines.length * BAND_COLOR_SCALE_CONSTANT,
    colors,
  )
  const fillScale = (index: number) =>
    bandColorScale(index * BAND_COLOR_SCALE_CONSTANT)

  const lineData: LineData = new Map()

  for (let i = 0; i < table.length; i++) {
    const groupID = fillColumn[i]
    const x = xCol[i]
    const y = yCol[i]

    let series = lineData.get(groupID)

    if (!series) {
      series = {xs: [], ys: [], fill: ''}
      // 'fill' is set temporarily to no color
      //    it will be updated with another loop later,
      //    because it is faster to walk bandLineMap once
      //    than to search for the indices of many lines
      lineData.set(groupID, series)
    }

    series.xs.push(x)
    series.ys.push(y)
  }

  Object.keys(bandLineMap).forEach(indexType => {
    bandLineMap[indexType].forEach((groupID: number, index: number) => {
      const series = lineData.get(groupID)

      if (series) {
        series.fill = fillScale(index)
      }
    })
  })

  return {
    bandLineMap,
    /*
      Not the input table: this one has the FILL group column added, which is
      what the hover columns and the band grouping are keyed on.
    */
    fillTable: table,
    lineData,
    fillColumnMap,
  }
}

export const simplifyBandData = (
  lineData: LineData,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
): LineData => {
  const result: LineData = new Map()

  for (const [groupID, {xs, ys, fill}] of lineData) {
    const [{xs: scaledXs, ys: scaledYs}] = scalePoints(xs, ys, xScale, yScale)

    result.set(groupID, {xs: scaledXs, ys: scaledYs, fill})
  }

  return result
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
  const rowIndices: number[] = []
  const upperIndices: number[] = []
  const lowerIndices: number[] = []
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

export const useBandTransform = (
  table: Table,
  xColumnKey: string,
  yColumnKey: string,
  fillColKeys: string[] = NO_FILL_COLUMNS,
  colors: string[] = NINETEEN_EIGHTY_FOUR,
  lowerColumnName: string = '',
  rowColumnName: string = '',
  upperColumnName: string = '',
) =>
  useMemo(
    () =>
      bandTransform(
        table,
        xColumnKey,
        yColumnKey,
        fillColKeys,
        colors,
        lowerColumnName,
        rowColumnName,
        upperColumnName,
      ),
    [
      table,
      xColumnKey,
      yColumnKey,
      fillColKeys,
      colors,
      lowerColumnName,
      rowColumnName,
      upperColumnName,
    ],
  )
