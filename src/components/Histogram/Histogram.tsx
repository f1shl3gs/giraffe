// Libraries
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'

import {AutoSizer} from 'components/AutoSizer'
import {histogramTransform} from 'components/Histogram/transform'
import {Axes} from 'components/Plot/Axes'
import {createPlotEnv} from 'components/Plot/Plot'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import {PLOT_DEFAULTS} from 'components/Plot/PlotDefaults'
import {getFormatterForColumn} from 'components/Plot/PlotEnv'
import {Rect} from 'components/Rect/Rect'
import type {RectSpec} from 'components/Rect/transform'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {COUNT} from 'constants/columnKeys'
import type {Table} from 'types'
import {useMousePos} from 'utils/useMousePos'

export interface HistogramConfig {
  x: string
  xDomain?: number[]
  position?: 'overlaid' | 'stacked'
  binCount?: number
  fill?: string[]
  colors?: string[]
  fillOpacity?: number
  strokeOpacity?: number
  strokeWidth?: number
  strokePadding?: number
  showAxes?: boolean
}

export interface HistogramProps {
  config: HistogramConfig
  table: Table
}

const FULL_SIZE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

/*
  Histogram is standalone and is not a <Plot> layer (D14): it is the other of
  the two components built on the shared internal <Rect>, binning on x alone and
  drawing counts on y.

  The y axis is the count axis, so the spec's own extent is handed to
  createPlotEnv as the domain override. The old <Plot> read that extent off the
  layer spec; nothing reads a spec now.
*/
export const Histogram: FunctionComponent<HistogramProps> = ({
  table,
  config,
}) => (
  <AutoSizer>
    {(width, height) => (
      <HistogramSized
        table={table}
        config={config}
        width={width}
        height={height}
      />
    )}
  </AutoSizer>
)

interface HistogramSizedProps extends HistogramProps {
  width: number
  height: number
}

const HistogramSized: FunctionComponent<HistogramSizedProps> = ({
  table,
  config,
  width,
  height,
}) => {
  const {
    x,
    xDomain,
    fill = [],
    colors = NINETEEN_EIGHTY_FOUR,
    binCount,
    position = 'overlaid',
    fillOpacity = 0.75,
    strokeOpacity = 1,
    strokePadding = 0.75,
    strokeWidth = 1,
    showAxes = true,
  } = config

  const {
    position: {x: hoverX, y: hoverY},
    onMouseMove,
    onMouseLeave,
  } = useMousePos()

  const spec: RectSpec = useMemo(
    () =>
      histogramTransform(
        table,
        x,
        xDomain ?? null,
        colors,
        fill,
        binCount,
        position,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config],
  )

  const plotConfig: PlotConfig = {
    ...PLOT_DEFAULTS,
    xColumn: x,
    /* Unused by the rect itself -- the y domain comes from the spec below, as
       the override. It is still required by PlotConfig, and `x` is the only
       numeric column a histogram's input table is guaranteed to have. */
    yColumn: x,
  }

  const env = createPlotEnv(plotConfig, table, width, height, {
    yDomain: spec.yDomain,
  })
  const {margins, xScale, yScale} = env

  const columnFormatter = (colKey: string) =>
    getFormatterForColumn(plotConfig, table, colKey)

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
          <Rect
            spec={spec}
            x={x}
            y={COUNT}
            strokeWidth={strokeWidth}
            strokePadding={strokePadding}
            strokeOpacity={strokeOpacity}
            fillOpacity={fillOpacity}
            columnFormatter={columnFormatter}
            legendConfig={plotConfig.legend}
            width={width}
            height={height}
            xScale={xScale}
            yScale={yScale}
            hoverX={hoverX}
            hoverY={hoverY}
          />
        </div>
      </div>
    </div>
  )
}
