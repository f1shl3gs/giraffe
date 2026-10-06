import {color} from 'd3-color'

import {Scale, Table} from 'types'
import {COUNT, FILL, X_MAX, X_MIN, Y_MAX, Y_MIN} from 'constants/columnKeys'

interface DrawRectsOptions {
  context: CanvasRenderingContext2D
  table: Table
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  fillScale: Scale<number, string>
  hoveredRowIndices: number[] | null
  strokeWidth: number
  strokePadding: number
  strokeOpacity: number
  fillOpacity: number
}

export const drawRects = (
  ctx: CanvasRenderingContext2D,
  table: Table,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
  fillScale: Scale<number, string>,
  hoveredRowIndices: number[] | null,
  strokeWidth: number,
  strokePadding: number,
  strokeOpacity: number,
  fillOpacity: number,
): void => {
  const xMinCol = table.getColumn(X_MIN, 'number')
  const xMaxCol = table.getColumn(X_MAX, 'number')
  const yMinCol = table.getColumn(Y_MIN, 'number')
  const yMaxCol = table.getColumn(Y_MAX, 'number')
  const fillCol =
    table.getColumn(FILL, 'number') || table.getColumn(COUNT, 'number')

  for (let i = 0; i < yMaxCol.length; i++) {
    if (yMinCol[i] === yMaxCol[i] || xMinCol[i] === xMaxCol[i]) {
      // Skip 0-length rects
      continue
    }

    const x = xScale(xMinCol[i]) + strokePadding
    const y = yScale(yMaxCol[i]) + strokePadding
    const width = xScale(xMaxCol[i]) - x - strokePadding
    const height = yScale(yMinCol[i]) - y - strokePadding

    let fill = fillScale(fillCol[i])

    if (hoveredRowIndices && hoveredRowIndices.includes(i)) {
      fill = color(fill).brighter(1).hex()
    }

    if (strokeWidth || strokeOpacity) {
      // See https://stackoverflow.com/a/45125187
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      ctx.save()
      ctx.clip()
      ctx.lineWidth = strokeWidth * 2
      ctx.globalAlpha = fillOpacity
      ctx.fillStyle = fill
      ctx.fill()
      ctx.globalAlpha = strokeOpacity
      ctx.strokeStyle = fill
      ctx.stroke()
      ctx.restore()
    } else {
      ctx.globalAlpha = fillOpacity
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      ctx.fill()
    }
  }
}
