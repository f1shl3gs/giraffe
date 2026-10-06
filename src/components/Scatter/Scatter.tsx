// Libraries
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'

// Components
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {ScatterHover} from 'components/Scatter/ScatterHover'
import type {ScatterSpec} from 'components/Scatter/transform'
import {scatterTransform} from 'components/Scatter/transform'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, SYMBOL} from 'constants/columnKeys'
import {SCATTER_POINT_SIZE} from 'constants/index'

// Utils
import {drawPoints} from 'utils/drawPoints'
import {useCanvas} from 'utils/useCanvas'
import {useMousePos} from 'utils/useMousePos'

export interface ScatterConfig {
  fill?: string[]
  colors?: string[]
  symbol?: string[]
}

export interface ScatterProps {
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
  Unlike <Heatmap> and <Histogram> this layer does no binning, so it has no
  domain override to hand createPlotEnv. (scatterTransform does compute an xDomain
  and a yDomain, but the x one seeds its reduce with [0, 0] and the y one with
  [Infinity, -Infinity]; those two are not equivalent, and neither is what the
  axes used to end up with. Leaving the domains to <Plot> is both consistent
  across the two axes and the same thing the axes showed before.)
*/
export const Scatter: FunctionComponent<ScatterProps> = ({config}) => {
  const {fill = [], symbol = [], colors = NINETEEN_EIGHTY_FOUR} = config
  const env = usePlot()
  const {table, width, height, xScale, yScale} = env

  /*
    The plot owns which columns the axes show, so the transform and everything
    downstream read those. `config.x` / `config.y` stay for the hover layer,
    which names them separately -- the same split <Line> has.
  */
  const {xColumn: xColumnKey, yColumn: yColumnKey} = env.config

  const [hoverEvent, hoverTargetProps] = useMousePos()
  const hoverX = hoverEvent.x
  const hoverY = hoverEvent.y

  const spec: ScatterSpec = useMemo(
    () => scatterTransform(table, xColumnKey, yColumnKey, fill, symbol, colors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config],
  )

  const columnFormatter = (colKey: string) =>
    getFormatterForColumn(env.config, table, colKey)

  const xColData = spec.table.getColumn(xColumnKey, 'number') || []
  const yColData = spec.table.getColumn(yColumnKey, 'number') || []
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
      className='giraffe-layers'
      style={FULL_SIZE_STYLE}
      {...hoverTargetProps}
    >
      <canvas
        className='giraffe-layer scatter'
        ref={canvasRef}
        style={{position: 'absolute'}}
        data-testid='giraffe-layer--scatter'
      />
      <ScatterHover
        fill={fill}
        symbol={symbol}
        columnFormatter={columnFormatter}
        yColumnType={env.yColumnType}
        plotConfig={env.config}
        hoverX={hoverX}
        hoverY={hoverY}
        legendHide={env.config.legend?.hide ?? false}
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        spec={spec}
      />
    </div>
  )
}
