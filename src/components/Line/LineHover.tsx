// Libraries

// Utils
import {usePlot} from 'components/Plot/PlotEnv'

// Components
import {Tooltip} from 'components/Tooltip'
// Constants
import {FILL} from 'constants/columnKeys'
import {FunctionComponent} from 'react'
// Types
import {
  ColumnGroupMap,
  LineData,
  LineHoverDimension,
  LineInterpolation,
  Scale,
  Table,
} from 'types'
import {drawLineHoverData} from 'utils/drawLineHoverData'
import {drawLines} from 'utils/drawLines'
import {getPointsTooltipData} from 'utils/legend/tooltip'
import {useCanvas} from 'utils/useCanvas'

interface Props {
  interpolation: LineInterpolation
  fill: string[]
  lineWidth: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  colorMapping?: ColumnGroupMap
  table: Table
  fillScale: Scale<number, string>
  width: number
  height: number
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  columnFormatter: (colKey: string) => (x: any) => string
  rowIndices: number[]
  dimension: LineHoverDimension
  simplifiedLineData: LineData
}

export const LineHover: FunctionComponent<Props> = ({
  rowIndices,
  dimension,
  simplifiedLineData,
  interpolation,
  fill: fillColKeys,
  lineWidth,
  shadeBelow,
  shadeBelowOpacity,
  colorMapping,
  table,
  fillScale,
  width,
  height,
  xScale,
  yScale,
  columnFormatter,
}) => {
  const env = usePlot()
  const {xColumn, yColumn, legend} = env.config

  const xColData = table.getColumn(xColumn, 'number')
  const yColData = table.getColumn(yColumn, 'number')
  const groupColData = table.getColumn(FILL, 'number')

  const points = getLineHoverPoints(
    table,
    rowIndices,
    xColumn,
    yColumn,
    xScale,
    yScale,
    fillScale,
    colorMapping,
  )

  const crosshairColor = legend?.crosshairColor

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
    table,
    xColumn,
    yColumn,
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
        config={legend}
        width={width}
        height={height}
      />
    </>
  )
}

const getLineHoverPoints = (
  table: Table,
  hoverRowIndices: number[],
  xColKey: string,
  yColKey: string,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
  fillScale: Scale<number, string>,
  colorMapping?: ColumnGroupMap,
): Array<{x: number; y: number; fill: string}> => {
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
