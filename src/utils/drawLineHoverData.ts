export const drawLineHoverData = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  crosshairX: number | null,
  crosshairY: number | null,
  crosshairColor: string,
  points: Array<{x: number; y: number; fill: string}> | null,
  radius: number,
): void => {
  ctx.strokeStyle = crosshairColor

  if (crosshairX !== null) {
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(crosshairX, 0)
    ctx.lineTo(crosshairX, height)
    ctx.stroke()
  }

  if (crosshairY !== null) {
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, crosshairY)
    ctx.lineTo(width, crosshairY)
    ctx.stroke()
  }

  if (points !== null) {
    for (const {x, y, fill} of points) {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = fill
      ctx.fill()
    }
  }
}
