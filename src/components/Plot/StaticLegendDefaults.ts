import type {StaticLegendConfig} from './PlotConfig'

export const STATIC_LEGEND_DEFAULTS: Partial<StaticLegendConfig> = {
  cursor: 'auto',
  heightRatio: 0.2,
  renderEffect: () => {},
  valueAxis: 'y',
  widthRatio: 1.0,
}
