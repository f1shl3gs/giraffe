// Libraries
import {FunctionComponent} from 'react'

import {usePlot} from 'components/Plot/PlotEnv'

// Constants
import {FILL} from 'constants/columnKeys'

// Types
import type {BandLineMap, LineData, LineHoverDimension, Scale} from 'types'

// Utils
import {getBandHoverPoints} from 'utils/bandHover'
import {drawLineHoverData} from 'utils/drawLineHoverData'
import {drawLines} from 'utils/drawLines'
import {getBandTooltipData} from 'utils/legend/tooltip'
import {useCanvas} from 'utils/useCanvas'

// Components
import {Tooltip} from '../Tooltip'
import type {BandConfig} from './Band'
import type {BandLayerSpec} from './transform'

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
    x: xColKey,
    y: yColKey,
    fill: fillColKeys,
    lineWidth,
    lowerColumnName,
    mainColumnName: rowColumnName,
    shadeOpacity,
    upperColumnName,
  } = config

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

  const env = usePlot()
  const crosshairColor = env.config.legend?.crosshairColor

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
    context => {
      if (dimension === 'xy') {
        const groupKey = groupColData[rowLines[0]]
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
          shadeBelow: false,
          shadeBelowOpacity: shadeOpacity * 1.5,
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
    config.x,
    config.y,
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
