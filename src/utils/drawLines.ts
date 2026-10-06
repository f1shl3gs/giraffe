// Libraries
import {range} from 'd3-array'
import {area, curveLinear, line} from 'd3-shape'

// Types
import {LineData, LineInterpolation} from 'types'

// Utils

// Constants
import {CURVES} from 'constants/index'

export const drawLines = (
  ctx: CanvasRenderingContext2D,
  interpolation: LineInterpolation,
  lineData: LineData,
  lineWidth: number,
  shadeBelow: boolean,
  shadeBelowOpacity: number,
  shadeAboveY: number,
): void => {
  if (shadeBelow) {
    for (const {xs, ys, fill} of lineData.values()) {
      const areaGenerator = area<number>()
        .y0(shadeAboveY)
        .y1((i: any) => ys[i])
        .x((i: any) => xs[i])
        .context(ctx)
        .defined((i: any) => xs[i] != null && ys[i] != null)
        .curve(CURVES[interpolation] || curveLinear)

      ctx.fillStyle = fill
      ctx.globalAlpha = shadeBelowOpacity
      ctx.beginPath()
      areaGenerator(range(0, xs.length))
      ctx.fill()
    }
  }

  ctx.lineWidth = lineWidth
  ctx.globalAlpha = 1

  for (const {xs, ys, fill} of lineData.values()) {
    const lineGenerator = line<number>()
      .context(ctx)
      .y((i: any) => ys[i])
      .x((i: any) => xs[i])
      .context(ctx)
      .defined((i: any) => xs[i] != null && ys[i] != null)
      .curve(CURVES[interpolation] || curveLinear)

    ctx.strokeStyle = fill
    ctx.beginPath()
    lineGenerator(range(0, xs.length))
    ctx.stroke()
  }
}
