// Types
import type {ColumnType, InteractionHandlers, ValueFormatters} from 'types'
import type {LegendConfig} from 'components/Legend/LegendConfig'
import {StaticLegendConfig} from 'components/StaticLegend/StaticLegend'

export interface PlotConfig {
  /*
    Which columns the axes read (D4a), and the only two required fields. Every
    other axis property was already on this object, so the keys belong here too
    — one axis, one definition.

    Both are plain numeric columns. There is no categorical y axis (D13) and no
    stacked y axis (D12), so a y column is always a column and nothing else.
  */
  xColumn: string
  yColumn: string

  // Give both and the plot is that size; give neither and it fills its
  // parent. One alone counts as unsized. Same rule as the old Plot.tsx:31.
  width?: number
  height?: number

  interactionHandlers?: InteractionHandlers
  cursor?: string

  showAxes?: boolean
  axisColor?: string
  axisOpacity?: number
  gridColor?: string
  gridOpacity?: number
  xAxisLabel?: string
  yAxisLabel?: string
  // usually linear or logarithmic
  xScale?: string
  yScale?: string

  // Tick placement can be given outright or derived from a step / total.
  xTicks?: number[]
  xTickStart?: number
  xTickStep?: number
  xTotalTicks?: number
  yTicks?: Array<number | string>
  yTickStart?: number
  yTickStep?: number
  yTotalTicks?: number
  tickFont?: string
  tickFontColor?: string
  // Tagging a formatter with a FormatterType lets giraffe pick nicer ticks —
  // formatting x as times means a 2:00 PM tick is fine and 2:37:43 PM is not.
  valueFormatters?: ValueFormatters

  // Pixels of inset at each end of the value axis, so a thick line is not
  // clipped by the plot edge. It replaces a scan for the widest lineWidth
  // across the layers (PlotEnv.ts:503-512).
  //
  // The default is 0, which is what that scan produced: the getter returns
  // `layer.lineWidth ?? DEFAULT_RANGE_PADDING` for line and band and
  // `DEFAULT_RANGE_PADDING` for everything else, and DEFAULT_RANGE_PADDING is
  // 0 (`constants/index.ts:19`). A consumer who wanted the old behaviour set
  // lineWidth on their widest layer; now they set this instead.
  rangePadding?: number

  // applies to both the static legend and the tooltip
  legend?: LegendConfig

  // static-legend only; overrides the properties in `legend` above
  staticLegend?: StaticLegendConfig

  yColumnType?: ColumnType
}
