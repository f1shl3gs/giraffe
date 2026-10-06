// Libraries
import {type CSSProperties, FunctionComponent, useEffect, useMemo} from 'react'

// Components
import {DapperScrollbars} from 'components/DapperScrollbars'
import {Legend} from 'components/Legend'

// Types
import type {ColumnGroupMap, TextMetrics} from 'types'
import type {LegendConfig} from 'components/Legend/LegendConfig'

// Utils
import {getStaticLegendTexMetrics} from 'utils/textMetrics'
import {getLegendData} from './convert'
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'

// Constants
import {
  STATIC_LEGEND_BOX_PADDING,
  STATIC_LEGEND_LINE_SPACING_RATIO,
  STATIC_LEGEND_SCROLL_PADDING,
} from 'constants/index'

export interface StaticLegendRenderEffectOptions {
  totalHeight: number
  staticLegendHeight: number
  legendDataLength: number
  lineCount: number
  lineSpacingRatio: number
  padding: number
  headerTextMetrics: TextMetrics
  sampleTextMetrics: TextMetrics
}

export interface StaticLegendConfig {
  backgroundColor?: string
  border?: string
  colorizeRows?: boolean
  columns?: string[]
  crosshairColor?: string
  cursor?: string // no corresponding legend property, unique to static legend
  font?: string
  fontBrightColor?: string
  fontColor?: string
  heightRatio?: number // no corresponding legend property, unique to static legend
  hide?: boolean
  message?: string
  opacity?: number
  orientationThreshold?: number
  renderEffect?: (options: StaticLegendRenderEffectOptions) => void // no corresponding legend property, unique to static legend
  style?: CSSProperties // no corresponding legend property, unique to static legend
  valueAxis?: 'x' | 'y' // no corresponding legend property, unique to static legend
  widthRatio?: number // no corresponding legend property, unique to static legend

  fill?: string[]
  colors?: string[]
  colorMapping?: ColumnGroupMap

  /*
    Adds a Min and a Max column beside the latest value, each holding the
    smallest and largest value that line took across the whole table. Off by
    default.
  */
  showBounds?: boolean
}

export interface StaticLegendProps {
  height: number
  top: number
  width: number
}

export const StaticLegend: FunctionComponent<StaticLegendProps> = ({
  height,
  top,
  width,
}) => {
  const {table, config} = usePlot()
  const staticLegend: StaticLegendConfig = {
    // Default static legend config
    cursor: 'auto',
    heightRatio: 0.2,
    valueAxis: 'y',
    widthRatio: 1.0,
    renderEffect: () => {},

    ...config.staticLegend,
  }

  /*
    The static legend used to be handed a whole config that had already been
    merged with CONFIG_DEFAULTS, so it inherited the plot's legend styling
    (background, border, fonts) and staticLegend only overrode it. Now that
    PlotConfig nests the legend, that inheritance is spelled out here.
  */
  const legendStyle: LegendConfig = {...config.legend, ...staticLegend}
  const {backgroundColor, border, font, fontBrightColor, opacity} = legendStyle

  const {
    cursor = 'auto',
    hide,
    renderEffect,
    style = {},
    valueAxis = 'y',
  } = staticLegend

  const valueColumnKey = valueAxis === 'x' ? config.xColumn : config.yColumn

  const legendData = useMemo(
    () =>
      getLegendData(table, staticLegend, valueColumnKey, colKey =>
        getFormatterForColumn(config, table, colKey),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config, valueColumnKey, staticLegend.fill, staticLegend.colors],
  )

  useEffect(() => {
    const {headerTextMetrics, sampleTextMetrics} = getStaticLegendTexMetrics()
    renderEffect({
      totalHeight: height + top,
      staticLegendHeight: height,
      legendDataLength: legendData.length,
      lineCount: legendData.length ? legendData[0].values.length : 0,
      lineSpacingRatio: STATIC_LEGEND_LINE_SPACING_RATIO,
      padding: 2 * STATIC_LEGEND_BOX_PADDING + STATIC_LEGEND_SCROLL_PADDING,
      headerTextMetrics,
      sampleTextMetrics,
    })
  }, [height, legendData, top, renderEffect])

  if (hide) {
    return null
  }

  return (
    <div
      className='giraffe-static-legend'
      style={{
        padding: STATIC_LEGEND_BOX_PADDING,
        ...style,
        backgroundColor,
        border,
        boxSizing: 'border-box',
        color: fontBrightColor,
        cursor,
        font,
        height: `${height}px`,
        opacity,
        overflow: 'auto',
        width: `${width}px`,
      }}
      data-testid='giraffe-static-legend'
    >
      <DapperScrollbars removeTracksWhenNotUsed={true} autoHide={true}>
        <Legend
          type='static'
          data={legendData}
          config={legendStyle}
          width={width}
          height={height}
          isScrollable={true}
        />
      </DapperScrollbars>
    </div>
  )
}
