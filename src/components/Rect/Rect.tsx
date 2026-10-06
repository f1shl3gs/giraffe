// Libraries
import {FunctionComponent} from 'react'

// Components
import {Tooltip} from 'components/Tooltip'

// Types
import type {LegendConfig} from 'components/Legend/LegendConfig'
import type {Formatter, Scale} from 'types'
import type {RectSpec} from './transform'

// Utils
import {findHoveredRects, get1DTooltipData, get2DTooltipData} from './tooltip'
import {drawRects} from 'utils/drawRects'
import {useCanvas} from 'utils/useCanvas'

/*
  The rect body, shared by <Heatmap> and <Histogram>.

  It takes the values it needs already resolved. It deliberately does NOT take a
  `HeatmapConfig | HistogramConfig` union: the old RectLayer did, and had to
  reach through it with `config as any` to read `y`, because the two configs
  disagree about whether there is a y column. Here the caller passes `x` and `y`
  as plain strings and the only branch left is `binDimension`, which is a fact
  about the binning rather than about configuration.

  Internal to the library -- not exported from src/index.ts. The two public
  components are <Heatmap> and <Histogram>.
*/
interface RectProps {
  spec: RectSpec
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
  spec,
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
    spec.table,
    hoverX,
    hoverY,
    xScale,
    yScale,
    spec.binDimension,
  )

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      drawRects(
        ctx,
        spec.table,
        xScale,
        yScale,
        spec.scales.fill,
        hoveredRowIndices,
        strokeWidth,
        strokePadding,
        strokeOpacity,
        fillOpacity,
      ),
    [
      spec.table,
      xScale,
      yScale,
      spec.scales.fill,
      hoveredRowIndices,
      strokeWidth,
      strokePadding,
      strokeOpacity,
      fillOpacity,
    ],
  )

  let tooltipData = []
  if (hoveredRowIndices.length > 0 && spec.binDimension === 'xy') {
    tooltipData = get2DTooltipData(
      hoveredRowIndices,
      spec.table,
      spec.inputTable,
      x,
      y,
      columnFormatter,
    )
  } else if (hoveredRowIndices.length > 0 && spec.binDimension === 'x') {
    tooltipData = get1DTooltipData(
      hoveredRowIndices,
      spec.table,
      spec.inputTable,
      x,
      spec.columnGroupMaps.fill,
      spec.scales.fill,
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
