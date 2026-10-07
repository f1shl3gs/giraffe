// Libraries
import {FunctionComponent, ReactNode, useCallback, useState} from 'react'

// Components
import {AutoSizer} from 'components/AutoSizer'
import {DomainOverride, PlotContainer} from 'components/Plot/PlotContainer'
import {PlotEnvContext} from 'components/Plot/PlotEnv'
import {StaticLegend} from 'components/StaticLegend'

// Types
import {ColumnType, Formatter, Scale, Table} from 'types'
import {PlotConfig} from './PlotConfig'

// Utils
import {getMargins} from 'utils/getMargins'
import {getScale} from 'utils/getScale'
import {getHorizontalTicks, getVerticalTicks} from 'utils/getTicks'
import {resizePlotWithStaticLegend} from './resizePlot'
import {resolveDomain} from 'utils/resolveDomain'
import {withPlotDefaults} from './PlotDefaults'
import {getFormatterForColumn, PlotEnv} from './PlotEnv'

// Constants
import {DEFAULT_RANGE_PADDING} from 'constants/index'

export type AxisScale = 'linear' | 'logarithmic'

const DEFAULT_X_DOMAIN: [number, number] = [0, 1]
const DEFAULT_Y_DOMAIN: [number, number] = [0, 1]

const areDomainsStale = (
  prev: {table: Table; xColumn: string; yColumn: string},
  next: {table: Table; xColumn: string; yColumn: string},
): boolean =>
  prev.table !== next.table ||
  prev.xColumn !== next.xColumn ||
  prev.yColumn !== next.yColumn

const getXTickFormatter = (config: PlotConfig, table: Table): Formatter =>
  getFormatterForColumn(table, config.xColumn, config.valueFormatters)

const getYTickFormatter = (config: PlotConfig, table: Table): Formatter =>
  getFormatterForColumn(table, config.yColumn, config.valueFormatters)

const getYColumnType = (config: PlotConfig): ColumnType =>
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

const getXDomain = (config: PlotConfig, table: Table): number[] => {
  const column = table.getColumn(config.xColumn, 'number')

  return column && column.length ? resolveDomain(column) : DEFAULT_X_DOMAIN
}

const getYDomain = (config: PlotConfig, table: Table): number[] => {
  const column = table.getColumn(config.yColumn, 'number')

  return column && column.length ? resolveDomain(column) : DEFAULT_Y_DOMAIN
}

const getXTicks = (
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

const getYTicks = (
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

const getXScale = (
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

const getYScale = (
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
