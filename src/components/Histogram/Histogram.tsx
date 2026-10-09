// Libraries

// Components
import {AutoSizer} from 'components/AutoSizer'
import {histogramTransform} from 'components/Histogram/transform'
import {Axes} from 'components/Plot/Axes'
// Types
import {createPlotEnv} from 'components/Plot/Plot'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import {PLOT_DEFAULTS} from 'components/Plot/PlotDefaults'
import {getFormatterForColumn} from 'components/Plot/PlotEnv'
import {Rect} from 'components/Rect/Rect'
// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {COUNT} from 'constants/columnKeys'
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'
import type {HistogramPosition, Table} from 'types'
// Utils
import {useMousePos} from 'utils/useMousePos'

export interface HistogramProps {
  table: Table
  x: string
  xDomain?: number[]
  position?: HistogramPosition
  showAxes?: boolean
  binCount?: number | null
  fill?: string[]
  colors?: string[]
  fillOpacity?: number
  strokeOpacity?: number
  strokeWidth?: number
  strokePadding?: number
}

const FULL_SIZE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

export const Histogram: FunctionComponent<HistogramProps> = ({
  table,
  x,
  xDomain,
  position = 'overlaid',
  showAxes = true,
  binCount = null,
  fill = [],
  colors = NINETEEN_EIGHTY_FOUR,
  fillOpacity = 0.75,
  strokeOpacity = 1,
  strokeWidth = 1,
  strokePadding = 0.75,
}) => (
  <AutoSizer>
    {(width, height) => (
      <HistogramSized
        table={table}
        x={x}
        xDomain={xDomain}
        position={position}
        showAxes={showAxes}
        binCount={binCount}
        fill={fill}
        colors={colors}
        fillOpacity={fillOpacity}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
        strokePadding={strokePadding}
        width={width}
        height={height}
      />
    )}
  </AutoSizer>
)

/* Every field the sizing wrapper needs is already resolved by <Histogram>, so
   none of them are optional here. */
interface HistogramSizedProps {
  table: Table
  width: number
  height: number
  x: string
  xDomain: number[] | undefined
  position: HistogramPosition
  showAxes: boolean
  binCount: number | null
  fill: string[]
  colors: string[]
  fillOpacity: number
  strokeOpacity: number
  strokeWidth: number
  strokePadding: number
}

const HistogramSized: FunctionComponent<HistogramSizedProps> = ({
  table,
  width,
  height,
  x,
  xDomain,
  position,
  showAxes,
  binCount,
  fill,
  colors,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
  strokePadding,
}) => {
  const {
    position: {x: hoverX, y: hoverY},
    onMouseMove,
    onMouseLeave,
  } = useMousePos()

  const {binnedTable, fillScale, fillColumnMap, yDomain} = useMemo(
    () =>
      histogramTransform(table, x, xDomain, colors, fill, binCount, position),
    [table, x, xDomain, colors, fill, binCount, position],
  )

  const plotConfig: PlotConfig = {
    ...PLOT_DEFAULTS,
    xColumn: x,
    /* Unused by the rect itself -- the y domain comes from the override below. It is
       still required by PlotConfig, and `x` is the only numeric column a
       histogram's input table is guaranteed to have. */
    yColumn: x,
  }

  const env = createPlotEnv(plotConfig, table, width, height, {
    yDomain,
  })
  const {margins, xScale, yScale} = env

  const columnFormatter = (colKey: string) =>
    getFormatterForColumn(table, colKey, plotConfig.valueFormatters)

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
            inputTable={table}
            table={binnedTable}
            binDimension='x'
            fillScale={fillScale}
            fillColumnMap={fillColumnMap}
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
