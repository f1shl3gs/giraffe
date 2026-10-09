// Libraries

// Components
import {AutoSizer} from 'components/AutoSizer'
import {heatmapTransform} from 'components/Heatmap/transform'
import {Axes} from 'components/Plot/Axes'
import {createPlotEnv} from 'components/Plot/Plot'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import {PLOT_DEFAULTS} from 'components/Plot/PlotDefaults'
import {getFormatterForColumn} from 'components/Plot/PlotEnv'
import {Rect} from 'components/Rect/Rect'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'
import type {Table, ValueFormatters} from 'types'
import {useMousePos} from 'utils/useMousePos'

export interface HeatmapProps {
  table: Table
  x: string
  y: string
  xDomain?: number[]
  yDomain?: number[]
  binSize?: number
  colors?: string[]
  fillOpacity?: number
  strokeOpacity?: number
  strokeWidth?: number
  strokePadding?: number
  /* Reaches the same place <Scatter>'s does: PlotConfig.valueFormatters, which
     both the axis ticks and the tooltip resolve their formatter from. */
  valueFormatters?: ValueFormatters
  showAxes?: boolean
}

const FULL_SIZE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

export const Heatmap: FunctionComponent<HeatmapProps> = ({
  table,
  x,
  y,
  xDomain,
  yDomain,
  binSize = 10,
  colors = NINETEEN_EIGHTY_FOUR,
  fillOpacity = 1,
  strokeOpacity = 0,
  strokeWidth = 0,
  strokePadding = 0,
  valueFormatters,
  showAxes = true,
}) => {
  return (
    <AutoSizer>
      {(width, height) => (
        <HeatmapSized
          table={table}
          x={x}
          y={y}
          xDomain={xDomain}
          yDomain={yDomain}
          binSize={binSize}
          colors={colors}
          fillOpacity={fillOpacity}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
          strokePadding={strokePadding}
          valueFormatters={valueFormatters}
          showAxes={showAxes}
          width={width}
          height={height}
        />
      )}
    </AutoSizer>
  )
}

/* Every field the sizing wrapper needs is already resolved by <Heatmap>, so
   none of them are optional here. */
interface HeatmapSizedProps {
  table: Table
  width: number
  height: number
  x: string
  y: string
  xDomain: number[] | undefined
  yDomain: number[] | undefined
  binSize: number
  colors: string[]
  fillOpacity: number
  strokeOpacity: number
  strokeWidth: number
  strokePadding: number
  valueFormatters: ValueFormatters | undefined
  showAxes: boolean
}

/*
  Everything that calls a hook lives here. <AutoSizer> renders nothing until it
  has measured, so calling hooks from inside its child function would run a
  different number of them on the second pass. The split is also load-bearing
  beyond hooks: heatmapTransform needs width and height to size its bins.
*/
const HeatmapSized: FunctionComponent<HeatmapSizedProps> = ({
  table,
  width,
  height,
  x,
  y,
  xDomain,
  yDomain,
  binSize,
  colors,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
  strokePadding,
  valueFormatters,
  showAxes,
}) => {
  const {position, onMouseMove, onMouseLeave} = useMousePos()

  const {binnedTable, fillScale} = useMemo(
    () =>
      heatmapTransform(
        table,
        x,
        y,
        xDomain ?? null,
        yDomain ?? null,
        width,
        height,
        binSize,
        colors,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, x, y, xDomain, yDomain, width, height, binSize, colors],
  )

  const plotConfig: PlotConfig = {
    ...PLOT_DEFAULTS,
    xColumn: x,
    yColumn: y,
    valueFormatters,
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
            binDimension='xy'
            fillScale={fillScale}
            x={x}
            y={y}
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
            hoverX={position.x}
            hoverY={position.y}
          />
        </div>
      </div>
    </div>
  )
}
