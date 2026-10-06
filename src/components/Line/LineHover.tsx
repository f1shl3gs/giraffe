// Libraries
import {FunctionComponent} from 'react'

// Components
import {Tooltip} from 'components/Tooltip'

// Types
import {ColumnGroupMap, LineData, LineHoverDimension, Scale} from 'types'
import type {LineConfig} from './Line'
import type {LineLayerSpec} from './transform'

// Utils
import {usePlot} from 'components/Plot/PlotEnv'
import {getPointsTooltipData} from 'utils/legend/tooltip'
import {useCanvas} from 'utils/useCanvas'
import {drawLineHoverData} from 'utils/drawLineHoverData'
import {drawLines} from 'utils/drawLines'

// Constants
import {FILL} from 'constants/columnKeys'

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
    fill: fillColKeys,
    lineWidth,
    shadeBelow,
    shadeBelowOpacity,
    colorMapping,
  } = config

  const env = usePlot()
  const {xColumn: xColKey, yColumn: yColKey} = env.config

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
    ctx => {
      if (dimension === 'xy') {
        const groupKey = groupColData[rowIndices[0]]
        const lineDatum = simplifiedLineData.get(groupKey)

        if (!lineDatum) {
          return
        }

        // Highlight the line that the single hovered point belongs to
        drawLines(
          ctx,
          interpolation,
          new Map([[groupKey, lineDatum]]),
          2 * lineWidth,
          shadeBelow,
          shadeBelowOpacity * 1.5,
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
    env.config.xColumn,
    env.config.yColumn,
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
