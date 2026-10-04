import type {LegendConfig} from 'components/Legend/LegendConfig'
import {
  STATIC_LEGEND_BOX_PADDING,
  STATIC_LEGEND_LINE_SPACING_RATIO,
  STATIC_LEGEND_SCROLL_PADDING,
} from 'constants/index'
import {FunctionComponent, useEffect, useMemo} from 'react'
import {getLegendData} from 'utils/legend/staticLegend'
import {getStaticLegendTexMetrics} from 'utils/textMetrics'
import {DapperScrollbars} from '../DapperScrollbars'
import {Legend} from '../Legend'
import {getFormatterForColumn, usePlot} from './PlotEnv'
import {STATIC_LEGEND_DEFAULTS} from './StaticLegendDefaults'

export interface StaticLegendProps {
  height: number
  top: number
  width: number
}

/*
  D6: <Plot> owns the static legend and hands it nothing but its own box, so it
  never learns which child layer is on screen. The rows come from
  `config.staticLegend`, which declares them (see StaticLegendConfig).
*/
export const StaticLegend: FunctionComponent<StaticLegendProps> = ({
  height,
  top,
  width,
}) => {
  const {table, config} = usePlot()
  const staticLegend = {
    ...STATIC_LEGEND_DEFAULTS,
    ...config.staticLegend,
  }

  /*
    The static legend used to be handed a whole config that had already been
    merged with CONFIG_DEFAULTS, so it inherited the plot's legend styling
    (background, border, fonts) and staticLegend only overrode it. Now that
    PlotConfig nests the legend, that inheritance is spelled out here.
  */
  const legendStyle: LegendConfig = {...config.legend, ...staticLegend}
  const {
    backgroundColor,
    border,
    font,
    fontBrightColor,
    opacity,
  } = legendStyle

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
