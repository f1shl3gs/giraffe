// Libraries
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'

// Components
import {AutoSizer} from 'components/AutoSizer'
import {Axes} from 'components/Plot/Axes'
import {createPlotEnv} from 'components/Plot/Plot'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import {PLOT_DEFAULTS} from 'components/Plot/PlotDefaults'
import {getFormatterForColumn} from 'components/Plot/PlotEnv'
import {ScatterHover} from 'components/Scatter/ScatterHover'
import type {ScatterSpec} from 'components/Scatter/transform'
import {scatterTransform} from 'components/Scatter/transform'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, SYMBOL} from 'constants/columnKeys'
import {SCATTER_POINT_SIZE} from 'constants/index'
import type {Formatter, Table} from 'types'

// Utils
import {drawPoints} from 'utils/drawPoints'
import {useCanvas} from 'utils/useCanvas'
import {useMousePos} from 'utils/useMousePos'

export interface ScatterConfig {
  x: string
  y: string
  fill?: string[]
  colors?: string[]
  symbol?: string[]
  /*
    Axis tick labels and the tooltip both read this. It is the one piece of
    what used to live on PlotConfig that a standalone component cannot do without:
    its axes are its own, so it has to be told how to format them.
  */
  valueFormatters?: {[columnKey: string]: Formatter}
  showAxes?: boolean
}

export interface ScatterProps {
  table: Table
  config: ScatterConfig
}

const FULL_SIZE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

/*
  Scatter is standalone and is not a <Plot> layer. Unlike <Heatmap> and
  <Histogram> it does no binning, so it has no domain override to hand
  createPlotEnv: both axes are plain numeric columns and <Plot> resolves them
  from xColumn / yColumn the usual way. (scatterTransform does compute an xDomain
  and a yDomain, but the x one seeds its reduce with [0, 0] and the y one with
  [Infinity, -Infinity]; those two are not equivalent, and neither is what the
  axes used to end up with. Leaving the domains to <Plot> is both consistent
  across the two axes and the same thing the axes showed before.)
*/
export const Scatter: FunctionComponent<ScatterProps> = ({table, config}) => (
  <AutoSizer>
    {(width, height) => (
      <ScatterSized
        table={table}
        config={config}
        width={width}
        height={height}
      />
    )}
  </AutoSizer>
)

interface ScatterSizedProps extends ScatterProps {
  width: number
  height: number
}

/*
  Everything that calls a hook lives here: <AutoSizer> renders nothing until it
  has measured, so hooks called from inside its child function would run a
  different number of them on the second pass.
*/
const ScatterSized: FunctionComponent<ScatterSizedProps> = ({
  table,
  config,
  width,
  height,
}) => {
  const {
    x,
    y,
    fill = [],
    symbol = [],
    colors = NINETEEN_EIGHTY_FOUR,
    valueFormatters,
    showAxes = true,
  } = config

  const [hoverEvent, hoverTargetProps] = useMousePos()
  const hoverX = hoverEvent.x
  const hoverY = hoverEvent.y

  const spec: ScatterSpec = useMemo(
    () => scatterTransform(table, x, y, fill, symbol, colors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config],
  )

  const plotConfig: PlotConfig = {
    ...PLOT_DEFAULTS,
    xColumn: x,
    yColumn: y,
    valueFormatters,
  }

  const env = createPlotEnv(plotConfig, table, width, height)
  const {margins, xScale, yScale} = env

  const columnFormatter = (colKey: string) =>
    getFormatterForColumn(plotConfig, table, colKey)

  const xColData = spec.table.getColumn(x, 'number') || []
  const yColData = spec.table.getColumn(y, 'number') || []
  const fillColData = spec.table.getColumn(FILL, 'number') || []
  const symbolColData = spec.table.getColumn(SYMBOL, 'number') || []
  const fillScale = spec.scales.fill
  const symbolScale = spec.scales.symbol

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      drawPoints(
        ctx,
        xColData,
        yColData,
        fillColData,
        symbolColData,
        xScale,
        yScale,
        fillScale,
        symbolScale,
        SCATTER_POINT_SIZE,
      ),
    [xColData, yColData, fillColData, symbolColData, fillScale, symbolScale],
  )

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
        {...hoverTargetProps}
      >
        <div className='giraffe-layers' style={FULL_SIZE_STYLE}>
          <canvas
            className='giraffe-layer scatter'
            ref={canvasRef}
            style={{position: 'absolute'}}
            data-testid='giraffe-layer--scatter'
          />
          <ScatterHover
            x={config.x}
            y={config.y}
            fill={config.fill ?? []}
            symbol={config.symbol ?? []}
            columnFormatter={columnFormatter}
            yColumnType={env.yColumnType}
            plotConfig={plotConfig}
            hoverX={hoverX}
            hoverY={hoverY}
            legendHide={plotConfig.legend?.hide ?? false}
            width={width}
            height={height}
            xScale={xScale}
            yScale={yScale}
            spec={spec}
          />
        </div>
      </div>
    </div>
  )
}
