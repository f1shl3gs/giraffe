import type {StaticLegendConfig} from 'components/Plot/PlotConfig'
import {STATIC_LEGEND_DEFAULTS} from 'components/Plot/StaticLegendDefaults'
import {
  STATIC_LEGEND_MAXIMUM_HEIGHT_RATIO,
  STATIC_LEGEND_MAXIMUM_WIDTH_RATIO,
  STATIC_LEGEND_MINIMUM_HEIGHT_RATIO,
  STATIC_LEGEND_MINIMUM_WIDTH_RATIO,
} from 'constants/index'

interface ResizedPlotDimensions {
  height: number
  width: number
}

export const resizePlotWithStaticLegend = (
  height: number,
  width: number,
  staticLegendProperties?: StaticLegendConfig,
): ResizedPlotDimensions => {
  const resizedPlotDimensions = {
    height: height || 0,
    width: width || 0,
  } as ResizedPlotDimensions

  if (staticLegendProperties && !staticLegendProperties.hide) {
    const {
      heightRatio = STATIC_LEGEND_DEFAULTS.heightRatio,
      widthRatio = STATIC_LEGEND_DEFAULTS.widthRatio,
    } = staticLegendProperties

    if (
      heightRatio > STATIC_LEGEND_MINIMUM_HEIGHT_RATIO &&
      heightRatio < STATIC_LEGEND_MAXIMUM_HEIGHT_RATIO
    ) {
      resizedPlotDimensions.height = height - heightRatio * height
    }

    if (
      widthRatio > STATIC_LEGEND_MINIMUM_WIDTH_RATIO &&
      widthRatio < STATIC_LEGEND_MAXIMUM_WIDTH_RATIO
    ) {
      resizedPlotDimensions.width = width - widthRatio * width
    }
  }

  return resizedPlotDimensions
}
