// Types
import type {
  Band,
  BandLineMap,
  ColumnGroupMap,
  ColumnType,
  LatestIndexMap,
  LineData,
  Scale,
  Table,
} from 'types'
import {DomainLabel} from 'types'

// Utils
import {isDefined} from 'utils/isDefined'
import {createGroupIDColumn, getBandColorScale} from 'utils/transform'
import {createLatestBandIndices} from 'utils/legend/band'

// Constants
import {FILL, LOWER, RESULT, TIME, UPPER} from 'constants/columnKeys'
import {BAND_COLOR_SCALE_CONSTANT} from 'constants/index'

/* The transform's output, consumed only by Band and BandHover. */
export interface BandLayerSpec {
  bandLineMap: BandLineMap
  bandName: string
  upperColumnName: string
  lowerColumnName: string
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
    const upper = Math.abs(upperIndex) !== Infinity ? lineData.get(upperIndex) : undefined

    const lowerIndex = lowerLines[i]
    const lower = Math.abs(lowerIndex) === Infinity ? lineData.get(lowerIndex) : undefined

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
        if (isDefined(bandTime)) {
          band.xs.push(bandTime)
          band.ys.push(bandValue)
          bandIterator += 1
        }
        if (isDefined(upperTime)) {
          upper.xs.push(upperTime)
          upper.ys.push(upperValue)
          upperIterator += 1
        }
        if (isDefined(lowerTime)) {
          lower.xs.push(lowerTime)
          lower.ys.push(lowerValue)
          lowerIterator += 1
        }
      }
      // 2. Lower is not equal to the other two
      else if (bandTime === upperTime) {
        if (bandTime > lowerTime || !isDefined(bandTime)) {
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
        } else if (bandTime < lowerTime || !isDefined(lowerTime)) {
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
        if (bandTime > upperTime || !isDefined(bandTime)) {
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
        } else if (bandTime < upperTime || !isDefined(upperTime)) {
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
        if (upperTime > bandTime || !isDefined(upperTime)) {
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
        } else if (upperTime < bandTime || !isDefined(bandTime)) {
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
        if (!isDefined(bandTime)) {
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
        } else if (!isDefined(upperTime)) {
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
        } else if (!isDefined(lowerTime)) {
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
): BandLayerSpec => {
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
  const fillScale = range =>
    getBandColorScale(bandLineMap, colors)(range * BAND_COLOR_SCALE_CONSTANT)

  const lineData: LineData = new Map()

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
      series = {xs: [], ys: [], fill: ''}
      // 'fill' is set temporarily to no color
      //    it will be updated with another loop later,
      //    because it is faster to walk bandLineMap once
      //    than to search for the indices of many lines
      lineData.set(groupID, series)
    }

    series.xs.push(x)
    series.ys.push(y)

    xMin = Math.min(x, xMin)
    xMax = Math.max(x, xMax)
    yMin = Math.min(y, yMin)
    yMax = Math.max(y, yMax)
  }
  // remember the latest (most recent) index for each group
  const bandDimension = yColumnKey === TIME ? DomainLabel.Y : DomainLabel.X
  const latestIndices: LatestIndexMap = createLatestBandIndices(
    lineData,
    bandLineMap,
    bandDimension,
  )

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
    bandName: rowColumnName,
    upperColumnName,
    lowerColumnName,
    inputTable,
    table,
    lineData,
    xDomain: [xMin, xMax],
    yDomain: [yMin, yMax],
    xColumnKey,
    yColumnKey,
    xColumnType: table.getColumnType(xColumnKey),
    yColumnType: table.getColumnType(yColumnKey),
    scales: {fill: fillScale},
    columnGroupMaps: {fill: fillColumnMap, latestIndices},
  }
}
