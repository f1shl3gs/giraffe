import {
  curveBasis,
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape'

import {SymbolType} from 'types'

// TODO: Make configurable
export const TICK_PADDING_RIGHT = 8
export const TICK_PADDING_TOP = 8
export const AXIS_LABEL_PADDING_BOTTOM = 15
export const DEFAULT_RANGE_PADDING = 0 // pixels

export const SCATTER_POINT_SIZE = 6
export const SCATTER_HOVER_POINT_SIZE = 12

export const CURVES = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  cubic: curveBasis,
  step: curveStep,
  stepBefore: curveStepBefore,
  stepAfter: curveStepAfter,
  natural: curveNatural,
}

export const ALL_SYMBOL_TYPES: SymbolType[] = [
  'circle',
  'plus',
  'triangle',
  'square',
  'tritip',
  'ex',
]

/****************************************************************
 * Band Plot uses up to 3 "lines" of data:
 * upper, middle, lower
 * which will have the same color when shaded.
 *
 * When there are multiple bands on the same plot,
 * we want to contrast the bands to make them easily
 * distinguishable.
 *
 * Allow each band to take up 3 colors on the color scale,
 * even though only the first color is used. This is a simple way
 * to scale the band colors, and takes up the same scale with
 * the same number of total lines as Line Plot.
 */
export const BAND_COLOR_SCALE_CONSTANT = 3

export const STATIC_LEGEND_MAXIMUM_HEIGHT_RATIO = 1.0
export const STATIC_LEGEND_MINIMUM_HEIGHT_RATIO = 0

export const STATIC_LEGEND_MAXIMUM_WIDTH_RATIO = 1.0
export const STATIC_LEGEND_MINIMUM_WIDTH_RATIO = 0

export const STATIC_LEGEND_LINE_SPACING_RATIO = 1 / 6
export const STATIC_LEGEND_LINE_HEIGHT_RATIO = 5 / 4
export const STATIC_LEGEND_BOX_PADDING = 10
export const STATIC_LEGEND_SCROLL_PADDING = 15

export const STATIC_LEGEND_COLUMN_CLASSNAME = 'giraffe-static-legend-column'
export const LEGEND_COLUMN_CLASSNAME = 'giraffe-legend-column'

export const TOOLTIP_MINIMUM_OPACITY = 0
export const TOOLTIP_MAXIMUM_OPACITY = 1.0

export const CLOCKFACE_Z_INDEX = 9599

export const TICK_COUNT_LIMIT = 1000

export const ANNOTATION_DEFAULT_HOVER_MARGIN = 20
export const ANNOTATION_DEFAULT_OVERLAP_HOVER_MARGIN = 8
export const ANNOTATION_DEFAULT_MAX_WIDTH = 250

export const ANNOTATION_TOOLTIP_CONTAINER_NAME =
  'giraffe-annotation-tooltip-container'

// Geo stuff
export const LEAFLET_Z_INDEX = 399
