// Libraries

// Components
import {AutoSizer} from 'components/AutoSizer'
// Utils
import {useMosaicTransform} from 'components/Mosaic/useMosaicTransform'
import {Axes} from 'components/Plot/Axes'
// Types
import {createPlotEnv} from 'components/Plot/Plot'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import {PLOT_DEFAULTS} from 'components/Plot/PlotDefaults'
import {getFormatterForColumn} from 'components/Plot/PlotEnv'
import {Tooltip} from 'components/Tooltip'
// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, SERIES, X_MAX, X_MIN} from 'constants/columnKeys'
import {color} from 'd3-color'
import type {CSSProperties} from 'react'
import {FunctionComponent} from 'react'
import {LegendData, MosaicHoverDimension, Scale, Table} from 'types'
import {timeFormatter} from 'utils/formatters'
import {resolveTimeFormat} from 'utils/tableGraph'
import {useCanvas} from 'utils/useCanvas'
import {useMousePos} from 'utils/useMousePos'
// Utils
import {findHoveredBoxes, getMosaicTooltipData} from './tooltip'

export interface MosaicProps {
  table: Table
  x: string
  y: string[]
  yLabelColumns?: string[]
  yLabelColumnSeparator?: string
  /* Formats the x column everywhere it is displayed: the axis ticks and the
     tooltip both resolve their formatter from valueFormatters. */
  timeFormat?: string
  fill: string[]
  hoverDimension?: MosaicHoverDimension | 'auto'
  colors?: string[]
  strokeWidth?: number
  strokePadding?: number
  strokeOpacity?: number
  fillOpacity?: number
  showAxes?: boolean
}

const FULL_SIZE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

export const Mosaic: FunctionComponent<MosaicProps> = ({
  table,
  x,
  y,
  yLabelColumns = [],
  yLabelColumnSeparator = '',
  timeFormat,
  fill,
  hoverDimension = 'auto',
  colors = NINETEEN_EIGHTY_FOUR,
  strokeWidth = 1,
  strokePadding = 0.75,
  strokeOpacity = 1,
  fillOpacity = 0.75,
  showAxes = true,
}) => (
  <AutoSizer>
    {(width, height) => (
      <MosaicSized
        table={table}
        x={x}
        y={y}
        yLabelColumns={yLabelColumns}
        yLabelColumnSeparator={yLabelColumnSeparator}
        timeFormat={timeFormat}
        fill={fill}
        hoverDimension={hoverDimension}
        colors={colors}
        strokeWidth={strokeWidth}
        strokePadding={strokePadding}
        strokeOpacity={strokeOpacity}
        fillOpacity={fillOpacity}
        showAxes={showAxes}
        width={width}
        height={height}
      />
    )}
  </AutoSizer>
)

/* Every field the sizing wrapper needs is already resolved by <Mosaic>, so none
   of them are optional here. */
interface MosaicSizedProps {
  table: Table
  width: number
  height: number
  x: string
  y: string[]
  yLabelColumns: string[]
  yLabelColumnSeparator: string
  timeFormat: string | undefined
  fill: string[]
  hoverDimension: MosaicHoverDimension | 'auto'
  colors: string[]
  strokeWidth: number
  strokePadding: number
  strokeOpacity: number
  fillOpacity: number
  showAxes: boolean
}

/*
  Everything that calls a hook lives here. <AutoSizer> renders nothing until it
  has measured, so calling hooks from inside its child function would run a
  different number of them on the second pass.
*/
const MosaicSized: FunctionComponent<MosaicSizedProps> = ({
  table,
  width,
  height,
  x,
  y,
  yLabelColumns,
  yLabelColumnSeparator,
  timeFormat,
  fill,
  hoverDimension,
  colors,
  strokeWidth,
  strokePadding,
  strokeOpacity,
  fillOpacity,
  showAxes,
}) => {
  const {position, onMouseMove, onMouseLeave} = useMousePos()

  const {
    binnedTable,
    yDomain,
    yColumnsName,
    fillScale,
    fillColumnMap,
    ySeries,
    yTicks,
  } = useMosaicTransform(
    table,
    x,
    y,
    yLabelColumns,
    yLabelColumnSeparator,
    fill,
    colors,
  )

  const plotConfig: PlotConfig = {
    ...PLOT_DEFAULTS,
    xColumn: x,
    /* Unused: the y domain and the y ticks both come from the spec, as the
       overrides below. It is still required by PlotConfig. */
    yColumn: y[0],
    yTicks,
    /* The x column only holds times in practice. Keying the formatter off the
       column type rather than the config keeps a numeric x on the number
       formatter instead of formatting it as a date. */
    valueFormatters:
      table.getColumnType(x) === 'time'
        ? {[x]: timeFormatter({format: resolveTimeFormat(timeFormat ?? '')})}
        : undefined,
  }

  const env = createPlotEnv(plotConfig, table, width, height, {
    yDomain,
  })
  const {margins, xScale, yScale} = env

  const columnFormatter = (colKey: string) =>
    getFormatterForColumn(table, colKey, plotConfig.valueFormatters)

  const hoveredRowIndices = findHoveredBoxes(
    hoverDimension,
    position.x,
    position.y,
    binnedTable,
    xScale,
    yScale,
    env.yDomain,
    ySeries,
    width,
    height,
  )

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      drawMosaic(
        ctx,
        binnedTable,
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
      binnedTable,
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

  let tooltipData: LegendData = []
  if (hoveredRowIndices.length > 0) {
    tooltipData = getMosaicTooltipData(
      hoveredRowIndices,
      binnedTable,
      table,
      x,
      yColumnsName,
      fillColumnMap,
      fillScale,
      columnFormatter,
    )
  }

  return (
    <div
      className='giraffe-plot'
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        userSelect: 'none',
      }}
    >
      {showAxes && <Axes plot={env} style={FULL_SIZE_STYLE} />}
      <div
        className='giraffe-inner-plot'
        style={{
          position: 'absolute',
          top: `${margins.top}px`,
          right: `${margins.right}px`,
          bottom: `${margins.bottom}px`,
          left: `${margins.left}px`,
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className='giraffe-layers' style={FULL_SIZE_STYLE}>
          <canvas
            className='giraffe-layer giraffe-layer-mosaic'
            ref={canvasRef}
            style={{position: 'absolute'}}
            data-testid='giraffe-layer-mosaic'
          />
        </div>
      </div>
      {
        /*
         Kept mounted on purpose: see the note on Tooltip's props. The legend
         guard is only for the type -- PLOT_DEFAULTS always supplies one, so it
         never unmounts anything.
       */
        plotConfig.legend && (
          <Tooltip
            data={tooltipData}
            config={plotConfig.legend}
            width={width}
            height={height}
          />
        )
      }
    </div>
  )
}

const drawMosaic = (
  ctx: CanvasRenderingContext2D,
  table: Table,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
  fillScale: Scale<number, string>,
  hoveredRowIndices: number[],
  strokeWidth: number,
  strokePadding: number,
  strokeOpacity: number,
  fillOpacity: number,
): void => {
  const xMinCol = table.getColumn(X_MIN, 'number')
  const xMaxCol = table.getColumn(X_MAX, 'number')
  const valueCol = table.getColumn(FILL, 'string')
  const yCol = table.getColumn(SERIES, 'string')
  ctx.globalAlpha = fillOpacity

  const yValMap = new Map()
  // if key isn't in map yet, add it & increment number
  let i = 0
  for (const key of yCol) {
    if (!yValMap.has(key)) {
      yValMap.set(key, i)
      i++
    }
  }

  for (let i = 0; i < xMaxCol.length; i++) {
    const x = xScale(xMinCol[i])

    const yVal = yValMap.get(yCol[i])
    const y = yScale(yVal)

    const width = xScale(xMaxCol[i]) - x - strokePadding
    const height = yScale(yValMap.size + 1)
    let fill = fillScale(valueCol[i] as unknown as number)

    if (hoveredRowIndices && hoveredRowIndices.includes(i)) {
      fill = color(fill).brighter(1).hex()
    }

    if (strokeWidth || strokeOpacity) {
      // See https://stackoverflow.com/a/45125187
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      ctx.save()
      ctx.clip()
      ctx.lineWidth = strokeWidth * 2

      ctx.fillStyle = fill
      ctx.fill()
      ctx.strokeStyle = fill
      ctx.stroke()
      ctx.restore()
    } else {
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      ctx.fill()
    }
  }
}
