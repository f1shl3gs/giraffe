// Libraries
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'

// Components
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {ScatterHover} from 'components/Scatter/ScatterHover'
import {scatterTransform} from 'components/Scatter/transform'

// Utils
import {drawPoints} from 'utils/drawPoints'
import {useCanvas} from 'utils/useCanvas'
import {useMousePos} from 'utils/useMousePos'

// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, SYMBOL} from 'constants/columnKeys'
import {SCATTER_POINT_SIZE} from 'constants/index'

export interface ScatterProps {
  fill?: string[]
  colors?: string[]
  symbol?: string[]
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
export const Scatter: FunctionComponent<ScatterProps> = ({
  fill = [],
  symbol = [],
  colors = NINETEEN_EIGHTY_FOUR,
}) => {
  const env = usePlot()
  const {table, width, height, xScale, yScale} = env

  /*
    The plot owns which columns the axes show, so the transform and everything
    downstream read those -- the same split <Line> and <Band> have.
  */
  const {xColumn, yColumn} = env.config

  const {position, onMouseMove, onMouseLeave} = useMousePos()

  const {
    table: scatterTable,
    fillScale,
    symbolScale,
  } = useMemo(
    () => scatterTransform(table, fill, symbol, colors),
    [table, fill, symbol, colors],
  )

  const columnFormatter = (colKey: string) =>
    getFormatterForColumn(table, colKey, env.config.valueFormatters)

  const xColData = scatterTable.getColumn(xColumn, 'number') || []
  const yColData = scatterTable.getColumn(yColumn, 'number') || []
  const fillColData = scatterTable.getColumn(FILL, 'number') || []
  const symbolColData = scatterTable.getColumn(SYMBOL, 'number') || []

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
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
        plotConfig={env.config}
        hoverX={position.x}
        hoverY={position.y}
        legendHide={env.config.legend?.hide ?? false}
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        table={scatterTable}
        fillScale={fillScale}
        symbolScale={symbolScale}
      />
    </div>
  )
}
