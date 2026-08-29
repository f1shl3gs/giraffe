import {Config, LayerTypes} from '../types'

export const hasPlotEnv = (config: Config): boolean => {
  const type = config.layers[0].type

  return !(
    type === LayerTypes.Gauge ||
    type === LayerTypes.SimpleTable ||
    type === LayerTypes.Table
  )
}
