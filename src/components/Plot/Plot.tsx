// Libraries
import {FunctionComponent, ReactNode, useCallback, useState} from 'react'

// Components
import {AutoSizer} from 'components/AutoSizer'
import {DomainOverride, PlotContainer} from 'components/Plot/PlotContainer'
import {PlotEnvContext} from 'components/Plot/PlotEnv'
import {StaticLegend} from 'components/Plot/StaticLegend'
// Constants
import {DEFAULT_RANGE_PADDING} from 'constants/index'
// Types
import {ColumnType, Formatter, Scale, Table} from 'types'
// Utils
import {timeFormatter} from 'utils/formatters'
import {getMargins} from 'utils/getMargins'
import {getScale} from 'utils/getScale'
import {getHorizontalTicks, getVerticalTicks} from 'utils/getTicks'
import {resizePlotWithStaticLegend} from 'utils/legend/resizePlot'
import {resolveDomain} from 'utils/resolveDomain'
import {PlotConfig} from './PlotConfig'
import {withPlotDefaults} from './PlotDefaults'
import {PlotEnv} from './PlotEnv'

export type AxisScale = 'linear' | 'logarithmic'

const DEFAULT_X_DOMAIN: [number, number] = [0, 1]
const DEFAULT_Y_DOMAIN: [number, number] = [0, 1]
const DEFAULT_TIME_FORMATTER = timeFormatter()
export const DEFAULT_FORMATTER: Formatter = x => String(x)

export const areDomainsStale = (
  next: {table: Table; xColumn: string; yColumn: string},
  prev: {table: Table; xColumn: string; yColumn: string},
): boolean =>
  next.table !== prev.table ||
  next.xColumn !== prev.xColumn ||
  next.yColumn !== prev.yColumn

export const getFormatterForColumn = (
  config: PlotConfig,
  table: Table,
  colKey: string,
): Formatter => {
  const preferredFormatter = config.valueFormatters?.[colKey]

  if (preferredFormatter) {
    return preferredFormatter
  }

  return table.getColumnType(colKey) === 'time'
    ? DEFAULT_TIME_FORMATTER
    : DEFAULT_FORMATTER
}

export const getXTickFormatter = (
  config: PlotConfig,
  table: Table,
): Formatter => getFormatterForColumn(config, table, config.xColumn)

export const getYTickFormatter = (
  config: PlotConfig,
  table: Table,
): Formatter => getFormatterForColumn(config, table, config.yColumn)

export const getYColumnType = (config: PlotConfig): ColumnType =>
  config.yColumnType ?? 'number'

export interface PlotProps {
  config: PlotConfig
  table: Table
  children?: ReactNode
}

export const Plot: FunctionComponent<PlotProps> = ({
  config,
  table,
  children,
}) => {
  const {width, height} = config

  const [brush, setBrush] = useState<{
    table: Table
    xColumn: string
    yColumn: string
    domain: DomainOverride
  } | null>(null)

  const onBrushChange = useCallback(
    (domain: DomainOverride | null) => {
      setBrush(b => {
        // null clears the override, so the domains get recomputed from the data
        if (!domain) {
          return null
        }

        return {
          table,
          xColumn: config.xColumn,
          yColumn: config.yColumn,
          domain: {...b?.domain, ...domain},
        }
      })
    },
    [table, config.xColumn, config.yColumn],
  )

  const renderSized = (width: number, height: number) => {
    const stale = brush ? areDomainsStale({table, ...config}, brush) : true
    /*
      The static legend takes its share of the box away from the plot, and that
      has to happen before the environment is built: the scales, the tick
      counts and every layer canvas are sized from the height passed here.
      Shrinking only the container div would leave the canvas and the
      coordinate system at the full height, and the legend would overlap them.
    */
    const resized = resizePlotWithStaticLegend(
      height,
      width,
      config.staticLegend,
    )
    const env = createPlotEnv(
      config,
      table,
      resized.width,
      resized.height,
      stale ? {} : brush.domain,
    )

    return (
      <PlotEnvContext value={env}>
        <PlotContainer plot={env} onBrushChange={onBrushChange}>
          {children}
        </PlotContainer>
        {/*
          A sibling of the plot, not a child: everything inside .giraffe-plot is
          absolutely positioned, so an in-flow child would overlap the canvas
          instead of sitting below it. It needs the provider above it, which is
          why <Plot> -- not <PlotContainer> -- owns PlotEnvContext.
        */}
        {config.staticLegend && !config.staticLegend.hide && (
          <StaticLegend
            height={height - resized.height}
            top={resized.height}
            width={resized.width}
          />
        )}
      </PlotEnvContext>
    )
  }

  if (width && height) {
    return renderSized(width, height)
  }

  /*
    AutoSizer calls its child as `children(width, height)`, so `renderSized`
    has to be wrapped to unpack those two positional arguments.
  */
  return <AutoSizer>{(width, height) => renderSized(width, height)}</AutoSizer>
}

export const getXDomain = (config: PlotConfig, table: Table): number[] => {
  const column = table.getColumn(config.xColumn, 'number')

  return column && column.length ? resolveDomain(column) : DEFAULT_X_DOMAIN
}

export const getYDomain = (config: PlotConfig, table: Table): number[] => {
  const column = table.getColumn(config.yColumn, 'number')

  return column && column.length ? resolveDomain(column) : DEFAULT_Y_DOMAIN
}

export const getXTicks = (
  config: PlotConfig,
  xDomain: number[],
  xTickFormatter: Formatter,
  width: number,
): number[] => {
  if (config.xTicks) {
    return config.xTicks
  }

  return getHorizontalTicks(
    xDomain,
    width,
    config.tickFont,
    xTickFormatter,
    config.xTotalTicks,
    config.xTickStart,
    config.xTickStep,
  )
}

export const getYTicks = (
  config: PlotConfig,
  yDomain: number[],
  yTickFormatter: Formatter,
  height: number,
): Array<number | string> => {
  if (config.yTicks) {
    return config.yTicks
  }

  return getVerticalTicks(
    yDomain,
    height,
    config.tickFont,
    yTickFormatter,
    config.yTotalTicks,
    config.yTickStart,
    config.yTickStep,
  )
}

export const getXScale = (
  config: PlotConfig,
  xDomain: number[],
  rangePadding: number,
  innerWidth: number,
): Scale<number, number> =>
  getScale(config.xScale)(
    xDomain[0],
    xDomain[1],
    rangePadding,
    innerWidth - rangePadding * 2,
  )

export const getYScale = (
  config: PlotConfig,
  yDomain: number[],
  rangePadding: number,
  innerHeight: number,
): Scale<number, number> =>
  getScale(config.yScale)(
    yDomain[0],
    yDomain[1],
    innerHeight - rangePadding * 2,
    rangePadding,
  )

export const createPlotEnv = (
  rawConfig: PlotConfig,
  table: Table,
  width: number,
  height: number,
  override: DomainOverride = {},
): PlotEnv => {
  const config = withPlotDefaults(rawConfig)

  const xDomain = override.xDomain ?? getXDomain(config, table)
  const yDomain = override.yDomain ?? getYDomain(config, table)

  const xTickFormatter = getXTickFormatter(config, table)
  const yTickFormatter = getYTickFormatter(config, table)
  const yColumnType = getYColumnType(config)

  const xTicks = getXTicks(config, xDomain, xTickFormatter, width)
  const yTicks = getYTicks(config, yDomain, yTickFormatter, height)

  /*
    Margins need ticks, ticks need a height, and the height depends on the
    margins — so this is the one place the cycle has to be broken. The old
    `margins` getter broke it by measuring against a second set of ticks
    computed with the default count, ignoring whatever tick configuration the
    consumer passed. That is deliberate and is kept: a consumer who sets
    `yTotalTicks: 50` should not get 50 rows of margin.
  */
  const margins = getMargins(
    config.showAxes,
    config.xAxisLabel,
    config.yAxisLabel,
    yTicks.length
      ? yTicks
      : getVerticalTicks(
          yDomain,
          height,
          config.tickFont,
          yTickFormatter,
          null,
          null,
          null,
        ),
    yTickFormatter,
    config.tickFont,
  )

  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom
  const rangePadding = config.rangePadding ?? DEFAULT_RANGE_PADDING

  return {
    config,
    table,
    width,
    height,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    margins,
    innerWidth,
    innerHeight,
    yColumnType,
    xScale: getXScale(config, xDomain, rangePadding, innerWidth),
    yScale: getYScale(config, yDomain, rangePadding, innerHeight),
  }
}
