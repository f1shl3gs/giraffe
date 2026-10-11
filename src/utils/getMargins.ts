import {
  AXIS_LABEL_PADDING_BOTTOM,
  TICK_PADDING_RIGHT,
  TICK_PADDING_TOP,
} from 'constants/index'
import {maxBy} from './extrema'
import {getTextMetrics} from './textMetrics'

export const getMargins = (
  showAxes: boolean,
  xAxisLabel: string,
  yAxisLabel: string,
  yTicks: Array<string | number>,
  yTickFormatter: (tick: number | string) => string,
  tickFont: string,
) => {
  if (!showAxes) {
    return {top: 1, right: 1, bottom: 1, left: 1}
  }

  const formattedYTicks = yTicks.map(t => yTickFormatter(t))
  const longestYTick = maxBy(d => d.length, formattedYTicks)

  const {width: maxTextWidth, height: textHeight} = getTextMetrics(
    tickFont,
    longestYTick,
  )

  const xAxisLabelHeight = xAxisLabel
    ? textHeight + AXIS_LABEL_PADDING_BOTTOM
    : 0

  /*
    Drawn rotated 90 degrees (see Axes), so what the label needs along the left
    edge is the height of a line of text -- the same figure the x axis label
    contributes to `bottom`, but spent horizontally. Adding the bottom axis
    padding here grew the left margin by a constant that has nothing to do with
    this axis, and only when the consumer supplied a y axis label.
  */
  const yAxisLabelWidth = yAxisLabel ? textHeight : 0

  return {
    top: textHeight / 2,
    right: 1,
    bottom: textHeight + TICK_PADDING_TOP + xAxisLabelHeight,
    left: maxTextWidth + TICK_PADDING_RIGHT + yAxisLabelWidth,
  }
}
