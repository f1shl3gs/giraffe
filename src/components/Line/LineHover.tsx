// Libraries

import {usePlot} from 'components/Plot/PlotEnv'
// Constants
import {FILL} from 'constants/columnKeys'
import {FunctionComponent} from 'react'
// Types
import {ColumnGroupMap, LineData, LineHoverDimension, Scale} from 'types'
import {drawLineHoverData} from 'utils/drawLineHoverData'
import {drawLines} from 'utils/drawLines'
// Utils
import {getPointsTooltipData} from 'utils/legend/tooltip'

import {useCanvas} from 'utils/useCanvas'
// Components
import {Tooltip} from '../Tooltip'
import type {LineConfig} from './Line'
import type {LineLayerSpec} from './transform'

interface Props {
  config: LineConfig
  spec: LineLayerSpec
  width: number
  height: number
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  columnFormatter: (colKey: string) => (x: any) => string
  rowIndices: number[] | null
  dimension: LineHoverDimension
  simplifiedLineData: LineData
}

export const LineHover: FunctionComponent<Props> = ({
  rowIndices,
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
    x: xColKey,
    y: yColKey,
    fill: fillColKeys,
    lineWidth,
    shadeBelow,
    shadeBelowOpacity,
    colorMapping,
  } = config

  const xColData = spec.table.getColumn(xColKey, 'number')
  const yColData = spec.table.getColumn(yColKey, 'number')
  const groupColData = spec.table.getColumn(FILL, 'number')
  const fillScale = spec.scales.fill

  const points = getLineHoverPoints(
    spec,
    rowIndices,
    xColKey,
    yColKey,
    xScale,
    yScale,
    fillScale,
    colorMapping,
  )

  const env = usePlot()
  const crosshairColor = env.config.legend?.crosshairColor

  const crosshairX =
    dimension === 'xy' || dimension === 'x'
      ? xScale(xColData[rowIndices[0]])
      : null

  const crosshairY =
    dimension === 'xy' || dimension === 'y'
      ? yScale(yColData[rowIndices[0]])
      : null

  const canvasRef = useCanvas(
    width,
    height,
    context => {
      if (dimension === 'xy') {
        const groupKey = groupColData[rowIndices[0]]
        const lineDatum = simplifiedLineData.get(groupKey)

        if (!lineDatum) {
          return
        }

        // Highlight the line that the single hovered point belongs to
        drawLines({
          context,
          lineData: new Map([[groupKey, lineDatum]]),
          interpolation,
          lineWidth: lineWidth * 2,
          shadeBelow,
          shadeBelowOpacity: shadeBelowOpacity * 1.5,
          shadeAboveY: height,
        })
      }

      drawLineHoverData({
        context,
        width,
        height,
        crosshairX,
        crosshairY,
        crosshairColor,
        points,
        radius: lineWidth * 2,
      })
    },
    [
      dimension,
      groupColData,
      rowIndices,
      simplifiedLineData,
      interpolation,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      crosshairX,
      crosshairY,
      crosshairColor,
      points,
    ],
  )

  const tooltipData = getPointsTooltipData(
    rowIndices,
    spec.table,
    config.x,
    config.y,
    FILL,
    columnFormatter,
    fillColKeys,
    fillScale,
    colorMapping,
  )

  return (
    <>
      <canvas
        className='giraffe-layer giraffe-layer-hover-line'
        ref={canvasRef}
        style={{position: 'absolute'}}
        data-testid='giraffe-layer-hover-line'
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

export const getLineHoverPoints = (
  spec: LineLayerSpec,
  hoverRowIndices: number[],
  xColKey: string,
  yColKey: string,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
  fillScale: Scale<number, string>,
  colorMapping?: ColumnGroupMap,
): Array<{x: number; y: number; fill: string}> => {
  const {table} = spec
  const xColData = table.getColumn(xColKey, 'number')
  const yColData = table.getColumn(yColKey, 'number')
  const groupColData = table.getColumn(FILL, 'number')

  return hoverRowIndices.map(i => ({
    x: xScale(xColData[i]),
    y: yScale(yColData[i]),
    fill: colorMapping
      ? colorMapping.mappings[groupColData[i]].color
      : fillScale(groupColData[i]),
  }))
}
