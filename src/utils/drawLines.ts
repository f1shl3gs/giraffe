import {CURVES} from 'constants/index'
import {range} from 'd3-array'
import {area, curveLinear, line} from 'd3-shape'
import {LineData, LineInterpolation} from 'types'
import {isDefined} from 'utils/isDefined'

interface DrawLinesOptions {
  context: CanvasRenderingContext2D
  interpolation: LineInterpolation
  lineData: LineData
  lineWidth: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  shadeAboveY: number
}

export const drawLines = ({
  context,
  lineData,
  interpolation,
  lineWidth,
  shadeBelow,
  shadeBelowOpacity,
  shadeAboveY,
}: DrawLinesOptions): void => {
  if (shadeBelow) {
    for (const {xs, ys, fill} of lineData.values()) {
      const areaGenerator = area<number>()
        .y0(shadeAboveY)
        .y1((i: any) => ys[i])
        .x((i: any) => xs[i])
        .context(context)
        .defined((i: any) => isDefined(xs[i]) && isDefined(ys[i]))
        .curve(CURVES[interpolation] || curveLinear)

      context.fillStyle = fill
      context.globalAlpha = shadeBelowOpacity
      context.beginPath()
      areaGenerator(range(0, xs.length))
      context.fill()
    }
  }

  context.lineWidth = lineWidth
  context.globalAlpha = 1

  for (const {xs, ys, fill} of lineData.values()) {
    const lineGenerator = line<number>()
      .context(context)
      .y((i: any) => ys[i])
      .x((i: any) => xs[i])
      .context(context)
      .defined((i: any) => isDefined(xs[i]) && isDefined(ys[i]))
      .curve(CURVES[interpolation] || curveLinear)

    context.strokeStyle = fill
    context.beginPath()
    lineGenerator(range(0, xs.length))
    context.stroke()
  }
}
