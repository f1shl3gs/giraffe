// Types
import type {StaticLegendConfig} from 'components/StaticLegend/StaticLegend'

// Constants
import {
  STATIC_LEGEND_DEFAULT_HEIGHT_RATIO,
  STATIC_LEGEND_DEFAULT_WIDTH_RATIO,
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
  staticLegendConfig?: StaticLegendConfig,
): ResizedPlotDimensions => {
  const dimensions: ResizedPlotDimensions = {
    height: height || 0,
    width: width || 0,
  }

  if (staticLegendConfig && !staticLegendConfig.hide) {
    const {
      heightRatio = STATIC_LEGEND_DEFAULT_HEIGHT_RATIO,
      widthRatio = STATIC_LEGEND_DEFAULT_WIDTH_RATIO,
    } = staticLegendConfig

    if (
      heightRatio > STATIC_LEGEND_MINIMUM_HEIGHT_RATIO &&
      heightRatio < STATIC_LEGEND_MAXIMUM_HEIGHT_RATIO
    ) {
      dimensions.height = height - heightRatio * height
    }

    if (
      widthRatio > STATIC_LEGEND_MINIMUM_WIDTH_RATIO &&
      widthRatio < STATIC_LEGEND_MAXIMUM_WIDTH_RATIO
    ) {
      dimensions.width = width - widthRatio * width
    }
  }

  return dimensions
}
