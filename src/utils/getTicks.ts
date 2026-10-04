// Libraries

import {TICK_COUNT_LIMIT} from 'constants/index'
import {ticks} from 'd3-array'
import {utcTicks} from 'd3-time'
import memoizeOne from 'memoize-one'
// Types
import {AxisTicks, Formatter, FormatterType} from 'types'
// Constants
import {TIME, VALUE} from 'constants/columnKeys'
// Utils
import {getTextMetrics} from './textMetrics'

/*
  Guards the optional tick parameters, which arrive as null, undefined or NaN
  whenever the axis config leaves them unset. Each of those satisfies a bare
  `Math.abs(value) !== Infinity`, so the type check and the NaN check both have
  to stay -- dropping either one leaves `step` null and the axis renders no
  ticks at all.
*/
const isFiniteTickValue = (value: unknown): boolean =>
  typeof value === 'number' && value === value && Math.abs(value) !== Infinity

/*
  Minimum spacing defined as:
    I. when there are less than 4 ticks:
      for each tick, spacing is one-quarter of the length of a tick
      thusly: 0.25, 0.50, 0.75 of a tick's length as spacing for 1, 2, and 3 ticks respectively
    II. when there are 4 to 10 ticks:
      sum of all tick lengths is shorter than total available space by at least one tick's length
    III. when there are more than 10 ticks:
      for every group of up to 10 ticks there is spacing equal at least 1 tick's length
    IV. length of a tick is:
         vertical axis - the average of the height and width of a span that wraps the formatted last tick in the range
         horizontal axis - the width of a span that wraps the formatted last tick in the range
*/
const hasMinimumSpacing = (
  rangeLength: number,
  timeTickLength: number,
  ticks: AxisTicks,
): boolean => {
  const fractionalSpaceAsPadding = 0.25
  const totalLength = ticks.length * timeTickLength
  if (ticks.length < 4) {
    const padding = totalLength * fractionalSpaceAsPadding
    return totalLength < rangeLength - padding
  } else if (ticks.length <= 10) {
    return totalLength < rangeLength - timeTickLength
  } else if (
    totalLength <
    rangeLength - Math.ceil(ticks.length / 10) * timeTickLength
  ) {
    return true
  }
  return false
}

/*
  Optimal number of ticks is defined as:
  I. allow d3 to choose the ticks and
  II. meets minimum spacing requirements checked by hasMinimumSpacing
*/
const getOptimalTicks = (
  [d0, d1]: number[],
  rangeLength: number,
  tickLength: number,
): number[] => {
  const maxNumTicks = Math.floor(rangeLength / tickLength)
  let optimalTicks = ticks(d0, d1, maxNumTicks)

  for (
    let counter = 1;
    counter < maxNumTicks &&
    !hasMinimumSpacing(rangeLength, tickLength, optimalTicks);
    counter += 1
  ) {
    optimalTicks = ticks(d0, d1, maxNumTicks - counter)
  }
  return optimalTicks
}

/*
  Similar to getOptimalTicks but for Date objects
*/
const getOptimalTimeTicks = (
  [d0, d1]: number[],
  rangeLength: number,
  timeTickLength: number,
): Date[] => {
  const maxNumTicks = Math.floor(rangeLength / timeTickLength)
  let optimalTicks = utcTicks(d0, d1, maxNumTicks)

  for (
    let counter = 1;
    counter < maxNumTicks &&
    !hasMinimumSpacing(rangeLength, timeTickLength, optimalTicks);
    counter += 1
  ) {
    optimalTicks = utcTicks(d0, d1, maxNumTicks - counter)
  }
  return optimalTicks
}

// calculateTicks adheres to spacing requirements as described in helper functions above
export const calculateTicks = (
  domain: number[],
  rangeLength: number,
  tickSize: number,
  columnKey: string,
): number[] => {
  return columnKey === TIME
    ? getOptimalTimeTicks(domain, rangeLength, tickSize).map(d => d.getTime())
    : getOptimalTicks(domain, rangeLength, tickSize)
}

/*
  generateTicks gives control to the user over placement, number, and interval of ticks
    defers to the user's judgement on spacing (tick labels may overlap)
*/
export const generateTicks = (
  domain: number[],
  columnKey: string,
  totalTicks: number,
  tickStart: number,
  tickStep: number,
): number[] => {
  const generated: number[] = []
  const [start = 0, end = 0] = domain
  const stepStart = isFiniteTickValue(tickStart) ? tickStart : start

  let step = tickStep
  if (!isFiniteTickValue(tickStep)) {
    const parts =
      isFiniteTickValue(totalTicks) && totalTicks !== 0 ? totalTicks : 1
    step = (end - stepStart) / (isFiniteTickValue(tickStart) ? parts : parts + 1)
  }

  const tickCountLimit = isFiniteTickValue(totalTicks)
    ? Math.min(totalTicks, TICK_COUNT_LIMIT)
    : TICK_COUNT_LIMIT

  let counter = isFiniteTickValue(tickStart) ? 0 : 1
  let generatedTick = stepStart + step * counter

  if (
    tickStep !== 0 &&
    (isFiniteTickValue(totalTicks) || isFiniteTickValue(tickStep))
  ) {
    /*
      - When 'step' marks the ticks to the right (or up) on the axis
        it is a positive number and should stop at 'end'
      - When 'step' marks the ticks to the left (or down) on the axis
        it is a negative number and should stop at 'start'
    */
    while (
      ((step > 0 && generatedTick <= end) ||
        (step < 0 && generatedTick >= start)) &&
      generated.length < tickCountLimit
    ) {
      if (generatedTick >= start && generatedTick <= end) {
        if (columnKey === TIME) {
          generated.push(new Date(generatedTick))
        } else {
          generated.push(generatedTick)
        }
      }
      counter += 1
      generatedTick = stepStart + step * counter
    }
  }

  return generated
}

/*
  ticks can be either
    - generated: user's defined parameters and judgment for spacing
    - calculated: Giraffe's determination and spacing requirements
*/
const getTicks = (
  domain: number[],
  rangeLength: number,
  tickSize: number,
  columnKey: string,
  totalTicks?: number,
  tickStart?: number,
  tickStep?: number,
) => {
  const [start = 0, end = 0] = domain
  if (isFiniteTickValue(totalTicks) || isFiniteTickValue(tickStep)) {
    return generateTicks(domain, columnKey, totalTicks, tickStart, tickStep)
  }
  if (isFiniteTickValue(tickStart)) {
    const specifiedTickStart = Math.min(Math.max(tickStart, start), end)
    return calculateTicks(
      [specifiedTickStart, end],
      rangeLength,
      tickSize,
      columnKey,
    )
  }
  return calculateTicks(domain, rangeLength, tickSize, columnKey)
}

/*
  for performance memoize both the original arguments and calculated arguments
    keep this separate from a memoized horizontal version
*/
const getMemoizedVerticalTicks = memoizeOne(getTicks)
export const getVerticalTicks = memoizeOne(
  (
    domain: number[],
    rangeLength: number,
    tickFont: string,
    formatter: Formatter,
    totalTicks?: number,
    tickStart?: number,
    tickStep?: number,
  ): number[] => {
    const sampleTick = formatter(domain[1])
    const tickTextMetrics = getTextMetrics(tickFont, sampleTick)

    const maxTickHeight = 5 * tickTextMetrics.height
    const tickHeight = Math.min(
      tickTextMetrics.height + tickTextMetrics.width / 2,
      maxTickHeight,
    )
    const columnKey =
      formatter._GIRAFFE_FORMATTER_TYPE === FormatterType.Time ? TIME : VALUE

    return getMemoizedVerticalTicks(
      domain,
      rangeLength,
      tickHeight,
      columnKey,
      totalTicks,
      tickStart,
      tickStep,
    )
  },
)

/*
  for performance memoize both the original arguments and calculated arguments
    keep this separate from a memoized vertical version
*/
const getMemoizedHorizontalTicks = memoizeOne(getTicks)
export const getHorizontalTicks = memoizeOne(
  (
    domain: number[],
    rangeLength: number,
    tickFont: string,
    formatter: Formatter,
    totalTicks?: number,
    tickStart?: number,
    tickStep?: number,
  ): number[] => {
    const sampleTick = formatter(domain[1])
    const tickTextMetrics = getTextMetrics(tickFont, sampleTick)

    const columnKey =
      formatter._GIRAFFE_FORMATTER_TYPE === FormatterType.Time ? TIME : VALUE

    return getMemoizedHorizontalTicks(
      domain,
      rangeLength,
      tickTextMetrics.width,
      columnKey,
      totalTicks,
      tickStart,
      tickStep,
    )
  },
)
