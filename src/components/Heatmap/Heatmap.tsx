// Libraries
import type {CSSProperties} from 'react'
import {FunctionComponent, useMemo} from 'react'

// Components
import {AutoSizer} from 'components/AutoSizer'
import {heatmapTransform} from 'components/Heatmap/transform'
import {Axes} from 'components/Plot/Axes'
import {createPlotEnv} from 'components/Plot/Plot'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import {PLOT_DEFAULTS} from 'components/Plot/PlotDefaults'
import {getFormatterForColumn} from 'components/Plot/PlotEnv'
import {Rect} from 'components/Rect/Rect'
import type {RectSpec} from 'components/Rect/transform'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import type {Table, ValueFormatters} from 'types'
import {useMousePos} from 'utils/useMousePos'

export interface HeatmapConfig {
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
  /* See the note on ScatterConfig.valueFormatters. */
  valueFormatters?: ValueFormatters
  showAxes?: boolean
}

export interface HeatmapProps {
  config: HeatmapConfig
  table: Table
}

const FULL_SIZE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

export const Heatmap: FunctionComponent<HeatmapProps> = ({table, config}) => {
  return (
    <AutoSizer>
      {(width, height) => (
        <HeatmapSized
          table={table}
          config={config}
          width={width}
          height={height}
        />
      )}
    </AutoSizer>
  )
}

interface HeatmapSizedProps extends HeatmapProps {
  width: number
  height: number
}

/*
  Everything that calls a hook lives here. <AutoSizer> renders nothing until it
  has measured, so calling hooks from inside its child function would run a
  different number of them on the second pass. The split is also load-bearing
  beyond hooks: heatmapTransform needs width and height to size its bins.
*/
const HeatmapSized: FunctionComponent<HeatmapSizedProps> = ({
  table,
  config,
  width,
  height,
}) => {
  const {
    x,
    y,
    xDomain,
    yDomain,
    binSize = 10,
    colors = NINETEEN_EIGHTY_FOUR,
    valueFormatters,
    fillOpacity = 1,
    strokeOpacity = 0,
    strokePadding = 0,
    strokeWidth = 0,
    showAxes = true,
  } = config

  const {position, onMouseMove, onMouseLeave} = useMousePos()

  const spec: RectSpec = useMemo(
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
    [table, config, width, height],
  )

  const plotConfig: PlotConfig = {
    ...PLOT_DEFAULTS,
    xColumn: x,
    yColumn: y,
    valueFormatters,
  }

  const env = createPlotEnv(plotConfig, table, width, height, {
    yDomain: spec.yDomain,
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
            spec={spec}
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
