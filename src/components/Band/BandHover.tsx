// Libraries
import {FunctionComponent} from 'react'

import {usePlot} from 'components/Plot/PlotEnv'

// Components
import {Tooltip} from '../Tooltip'
import {formatLegendValues} from 'utils/legend/format'

// Types
import {
  BandLineMap,
  DomainLabel,
  LatestIndexMap,
  LegendColumn,
  LegendData,
  LineData,
  LineHoverDimension,
  Scale,
  Table,
} from 'types'
import type {BandConfig} from './Band'
import {BandLayerSpec, sortBandLines} from './transform'

// Utils
import {getBandHoverPoints} from './bandHover'
import {drawLineHoverData} from 'utils/drawLineHoverData'
import {drawLines} from 'utils/drawLines'
import {useCanvas} from 'utils/useCanvas'
import {createLatestBandIndices} from './transform'

// Constants
import {FILL, RESULT, TIME, VALUE} from 'constants/columnKeys'

interface Props {
  bandHoverIndices: BandLineMap
  dimension: LineHoverDimension
  simplifiedLineData: LineData
  config: BandConfig
  spec: BandLayerSpec
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
  config,
  spec,
  width,
  height,
  xScale,
  yScale,
  columnFormatter,
}) => {
  const {
    interpolation,
    fill: fillColKeys,
    lineWidth,
    lowerColumnName,
    mainColumnName: rowColumnName,
    shadeOpacity,
    upperColumnName,
  } = config

  const env = usePlot()
  const {xColumn: xColKey, yColumn: yColKey} = env.config
  const crosshairColor = env.config.legend?.crosshairColor

  const xColData = spec.table.getColumn(xColKey, 'number')
  const yColData = spec.table.getColumn(yColKey, 'number')
  const groupColData = spec.table.getColumn(FILL, 'number')

  const {rowLines} = bandHoverIndices

  const points = getBandHoverPoints(
    spec.table,
    rowLines,
    xColKey,
    yColKey,
    xScale,
    yScale,
    spec.lineData,
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
        width,
        height,
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
    spec,
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
  spec: BandLayerSpec,
): LegendData => {
  const {bandLineMap, lineData, table} = spec

  const groupColData = table.getColumn(FILL, 'number')
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
    xColKey === VALUE ? table.getColumn(xColKey) : table.getColumn(yColKey)

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
    xColKey === VALUE ? `${xColKey}:${bandName}` : table.getColumnName(xColKey)
  const yColumnName =
    yColKey === VALUE ? `${yColKey}:${bandName}` : table.getColumnName(yColKey)
  const xColData = table.getColumn(xColKey, 'number')
  const yColData = table.getColumn(yColKey, 'number')
  const xFormatter = getValueFormatter(xColKey)
  const yFormatter = getValueFormatter(yColKey)

  const tooltipXCol = {
    key: xColKey,
    name: xColumnName,
    type: table.getColumnType(xColKey),
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
    type: table.getColumnType(yColKey),
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
        type: table.getColumnType(yColKey),
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
        type: table.getColumnType(yColKey),
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
        type: table.getColumnType(xColKey),
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
        type: table.getColumnType(xColKey),
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
    table,
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
