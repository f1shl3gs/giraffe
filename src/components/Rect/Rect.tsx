// Libraries

// Types
import type {LegendConfig} from 'components/Legend/LegendConfig'

// Components
import {Tooltip} from 'components/Tooltip'
import {FunctionComponent} from 'react'
import type {ColumnGroupMap, Formatter, Scale, Table} from 'types'
import {drawRects} from 'utils/drawRects'
import {useCanvas} from 'utils/useCanvas'
// Utils
import {findHoveredRects, get1DTooltipData, get2DTooltipData} from './tooltip'

/*
  The rect body, shared by <Heatmap> and <Histogram>.

  It takes the values it needs already resolved. It deliberately does NOT take a
  layer-config union: the old RectLayer did, and had to
  reach through it with `config as any` to read `y`, because the two configs
  disagree about whether there is a y column. Here the caller passes `x` and `y`
  as plain strings and the only branch left is `binDimension`, which is a fact
  about the binning rather than about configuration.

  Internal to the library -- not exported from src/index.ts. The two public
  components are <Heatmap> and <Histogram>.
*/
interface RectProps {
  inputTable: Table
  table: Table
  binDimension: 'xy' | 'x'
  fillScale: Scale<number, string>
  fillColumnMap?: ColumnGroupMap
  x: string
  y: string
  strokeWidth: number
  strokePadding: number
  strokeOpacity: number
  fillOpacity: number
  columnFormatter: (columnKey: string) => Formatter
  legendConfig: LegendConfig
  width: number
  height: number
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  hoverX?: number
  hoverY?: number
}

export const Rect: FunctionComponent<RectProps> = ({
  inputTable,
  table,
  binDimension,
  fillScale,
  fillColumnMap,
  x,
  y,
  strokeWidth,
  strokePadding,
  strokeOpacity,
  fillOpacity,
  columnFormatter,
  legendConfig,
  width,
  height,
  xScale,
  yScale,
  hoverX,
  hoverY,
}) => {
  const hoveredRowIndices = findHoveredRects(
    table,
    hoverX,
    hoverY,
    xScale,
    yScale,
    binDimension,
  )

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      drawRects(
        ctx,
        table,
        xScale,
        yScale,
        fillScale,
        hoveredRowIndices,
        strokeWidth,
        strokePadding,
        strokeOpacity,
        fillOpacity,
      ),
    [
      table,
      xScale,
      yScale,
      fillScale,
      hoveredRowIndices,
      strokeWidth,
      strokePadding,
      strokeOpacity,
      fillOpacity,
    ],
  )

  let tooltipData = []
  if (hoveredRowIndices.length > 0 && binDimension === 'xy') {
    tooltipData = get2DTooltipData(
      hoveredRowIndices,
      table,
      inputTable,
      x,
      y,
      columnFormatter,
    )
  } else if (hoveredRowIndices.length > 0 && binDimension === 'x') {
    tooltipData = get1DTooltipData(
      hoveredRowIndices,
      table,
      inputTable,
      x,
      fillColumnMap,
      fillScale,
      columnFormatter,
    )
  }

  return (
    <>
      <canvas
        className='giraffe-layer giraffe-layer-rect'
        ref={canvasRef}
        style={{position: 'absolute'}}
        data-testid='giraffe-layer-rect'
      />
      {tooltipData.length > 0 && (
        <Tooltip
          data={tooltipData}
          config={legendConfig}
          width={width}
          height={height}
        />
      )}
    </>
  )
}
