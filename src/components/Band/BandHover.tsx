// Libraries

import {usePlot} from 'components/Plot/PlotEnv'
// Constants
import {FILL, RESULT, TIME, VALUE} from 'constants/columnKeys'
import {FunctionComponent} from 'react'

// Types
import {
  BandLineMap,
  DomainLabel,
  LatestIndexMap,
  LegendColumn,
  LegendData,
  LineData,
  LineHoverDimension,
  LineInterpolation,
  Scale,
  Table,
} from 'types'
import {drawLineHoverData} from 'utils/drawLineHoverData'
import {drawLines} from 'utils/drawLines'
import {formatLegendValues} from 'utils/legend/format'
import {useCanvas} from 'utils/useCanvas'
// Components
import {Tooltip} from '../Tooltip'
// Utils
import {getBandHoverPoints} from './bandHover'
import {createLatestBandIndices, sortBandLines} from './useBandTransform'

interface Props {
  bandHoverIndices: BandLineMap
  dimension: LineHoverDimension
  simplifiedLineData: LineData
  interpolation: LineInterpolation
  fill: string[]
  lineWidth: number
  lowerColumnName: string
  mainColumnName: string
  shadeOpacity: number
  upperColumnName: string
  bandLineMap: BandLineMap
  lineData: LineData
  fillTable: Table
  width: number
  height: number
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  columnFormatter: (colKey: string) => (x: any) => string
}

export const BandHover: FunctionComponent<Props> = ({
  bandHoverIndices,
  dimension,
  simplifiedLineData,
  interpolation,
  fill: fillColKeys,
  lineWidth,
  lowerColumnName,
  mainColumnName: rowColumnName,
  shadeOpacity,
  upperColumnName,
  bandLineMap,
  lineData,
  fillTable,
  width,
  height,
  xScale,
  yScale,
  columnFormatter,
}) => {
  const env = usePlot()
  const {xColumn: xColKey, yColumn: yColKey} = env.config
  const crosshairColor = env.config.legend?.crosshairColor

  const xColData = fillTable.getColumn(xColKey, 'number')
  const yColData = fillTable.getColumn(yColKey, 'number')
  const groupColData = fillTable.getColumn(FILL, 'number')

  const {rowLines} = bandHoverIndices

  const points = getBandHoverPoints(
    fillTable,
    rowLines,
    xColKey,
    yColKey,
    xScale,
    yScale,
    lineData,
  )

  const crosshairX =
    dimension === 'xy' || dimension === 'x'
      ? xScale(xColData[rowLines[0]])
      : null

  const crosshairY =
    dimension === 'xy' || dimension === 'y'
      ? yScale(yColData[rowLines[0]])
      : null

  const canvasRef = useCanvas(
    width,
    height,
    ctx => {
      if (dimension === 'xy') {
        const groupKey = groupColData[rowLines[0]]
        const lineDatum = simplifiedLineData.get(groupKey)

        if (!lineDatum) {
          return
        }

        // Highlight the line that the single hovered point belongs to
        drawLines(
          ctx,
          interpolation,
          new Map([[groupKey, lineDatum]]),
          lineWidth * 2,
          false,
          shadeOpacity * 1.5,
          height,
        )
      }

      drawLineHoverData(
        ctx,
        env.innerWidth,
        env.innerHeight,
        crosshairX,
        crosshairY,
        crosshairColor,
        points,
        2 * lineWidth,
      )
    },
    [
      dimension,
      groupColData,
      rowLines,
      simplifiedLineData,
      interpolation,
      lineWidth,
      shadeOpacity,
      crosshairX,
      crosshairY,
      crosshairColor,
      points,
    ],
  )

  const tooltipData = getBandTooltipData(
    bandHoverIndices,
    env.config.xColumn,
    env.config.yColumn,
    rowColumnName,
    lowerColumnName,
    upperColumnName,
    columnFormatter,
    fillColKeys,
    bandLineMap,
    lineData,
    fillTable,
  )

  return (
    <>
      <canvas
        className='giraffe-layer giraffe-band-hover-line'
        ref={canvasRef}
        style={{position: 'absolute'}}
        data-testid='giraffe-band-hover-line'
      />
      <Tooltip
        data={tooltipData}
        config={env.config.legend}
        width={width}
        height={height}
      />
    </>
  )
}

const getBandTooltipData = (
  bandHoverIndices: BandLineMap,
  xColKey: string,
  yColKey: string,
  bandName: string,
  lowerColumnName: string,
  upperColumnName: string,
  getValueFormatter: (colKey: string) => (x: any) => string,
  fillColKeys: string[],
  bandLineMap: BandLineMap,
  lineData: LineData,
  fillTable: Table,
): LegendData => {
  const groupColData = fillTable.getColumn(FILL, 'number')
  const bandDimension = yColKey === TIME ? DomainLabel.Y : DomainLabel.X
  const {rowLines: rowIndices} = bandHoverIndices
  const hoveredLinesMap: LatestIndexMap = {}
  rowIndices.forEach(index => {
    hoveredLinesMap[groupColData[index]] = index
  })

  const hoveredIndices = createLatestBandIndices(
    lineData,
    bandLineMap,
    bandDimension,
    hoveredLinesMap,
  )
  const bandValues =
    xColKey === VALUE
      ? fillTable.getColumn(xColKey)
      : fillTable.getColumn(yColKey)

  const sortedBandLineMap = sortBandLines(
    bandValues,
    bandLineMap,
    hoveredIndices,
  )
  const {
    upperLines: sortedUpperLines,
    rowLines: sortedRowLines,
    lowerLines: sortedLowerLines,
  } = sortedBandLineMap

  // rowLines come from bandLineMap, which is built from this same lineData
  const colors = sortedRowLines.map(line => lineData.get(line)!.fill)

  const xColumnName =
    xColKey === VALUE
      ? `${xColKey}:${bandName}`
      : fillTable.getColumnName(xColKey)
  const yColumnName =
    yColKey === VALUE
      ? `${yColKey}:${bandName}`
      : fillTable.getColumnName(yColKey)
  const xColData = fillTable.getColumn(xColKey, 'number')
  const yColData = fillTable.getColumn(yColKey, 'number')
  const xFormatter = getValueFormatter(xColKey)
  const yFormatter = getValueFormatter(yColKey)

  const tooltipXCol = {
    key: xColKey,
    name: xColumnName,
    type: fillTable.getColumnType(xColKey),
    colors,
    values: formatLegendValues(
      xColData,
      sortedRowLines.map(line => hoveredIndices[line]),
      xFormatter,
    ),
  }

  const tooltipYCol = {
    key: yColKey,
    name: yColumnName,
    type: fillTable.getColumnType(yColKey),
    colors,
    values: formatLegendValues(
      yColData,
      sortedRowLines.map(line => hoveredIndices[line]),
      yFormatter,
    ),
  }

  const tooltipAdditionalColumns = []

  if (yColKey === VALUE) {
    if (upperColumnName) {
      tooltipAdditionalColumns.push({
        key: yColKey,
        name: `${yColKey}:${upperColumnName}`,
        type: fillTable.getColumnType(yColKey),
        colors,
        values: formatLegendValues(
          yColData,
          sortedUpperLines.map(line => hoveredIndices[line]),
          yFormatter,
        ),
      })
    }

    if (lowerColumnName) {
      tooltipAdditionalColumns.push({
        key: yColKey,
        name: `${yColKey}:${lowerColumnName}`,
        type: fillTable.getColumnType(yColKey),
        colors,
        values: formatLegendValues(
          yColData,
          sortedLowerLines.map(line => hoveredIndices[line]),
          yFormatter,
        ),
      })
    }
  } else {
    if (upperColumnName) {
      tooltipAdditionalColumns.push({
        key: xColKey,
        name: `${xColKey}:${upperColumnName}`,
        type: fillTable.getColumnType(xColKey),
        colors,
        values: formatLegendValues(
          xColData,
          sortedUpperLines.map(line => hoveredIndices[line]),
          xFormatter,
        ),
      })
    }

    if (lowerColumnName) {
      tooltipAdditionalColumns.push({
        key: xColKey,
        name: `${xColKey}:${lowerColumnName}`,
        type: fillTable.getColumnType(xColKey),
        colors,
        values: formatLegendValues(
          xColData,
          sortedLowerLines.map(line => hoveredIndices[line]),
          xFormatter,
        ),
      })
    }
  }

  const fillColumns = getBandGroupLegendColumns(
    fillTable,
    sortedRowLines.map(line => hoveredIndices[line]),
    fillColKeys,
    getValueFormatter,
    colors,
  )

  if (yColKey === VALUE) {
    return [
      tooltipXCol,
      tooltipYCol,
      ...tooltipAdditionalColumns,
      ...fillColumns,
    ]
  }
  return [tooltipYCol, tooltipXCol, ...tooltipAdditionalColumns, ...fillColumns]
}

const getBandGroupLegendColumns = (
  table: Table,
  rowIndices: number[],
  groupColKeys: string[],
  getValueFormatter: (colKey: string) => (x: any) => string,
  rowColors: string[] | null,
): LegendColumn[] => {
  return groupColKeys.reduce((accum: LegendColumn[], key: string) => {
    if (key === RESULT) {
      return accum
    }
    const colData = table.getColumn(key)
    const formatter = getValueFormatter(key)

    accum.push({
      key,
      name: table.getColumnName(key),
      type: table.getColumnType(key),
      colors: rowColors,
      values: rowIndices.map(i =>
        colData[i] == null ? null : formatter(colData[i]),
      ),
    })
    return accum
  }, [])
}
