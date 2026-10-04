import type {ColumnType} from 'types'

/*
  The legend half of <Plot>'s config.

  All thirteen fields appear in StaticLegendConfig as well; StaticLegendConfig
  adds the ones unique to the static legend (cursor, heightRatio, layer,
  renderEffect, style, valueAxis, widthRatio).

  `yColumnType` sits here rather than on PlotConfig because it decides the axis,
  not the legend's appearance — it is grouped with these for historical reasons,
  not because it belongs to them.
*/
export interface LegendConfig {
  backgroundColor?: string
  border?: string
  colorizeRows?: boolean
  columns?: string[]
  crosshairColor?: string

  font?: string
  fontBrightColor?: string
  fontColor?: string
  hide?: boolean

  message?: string
  opacity?: number
  orientationThreshold?: number

  yColumnType?: ColumnType
}
