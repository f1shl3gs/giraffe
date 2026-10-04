// Types
import {NumericColumnData, Scale, SymbolType} from 'types'

// Utils
import {
  drawCircle,
  drawEx,
  drawPlus,
  drawSquare,
  drawTriangle,
  drawTritip,
} from 'utils/drawShapes'

export const drawPoints = (
  ctx: CanvasRenderingContext2D,
  xColData: NumericColumnData,
  yColData: NumericColumnData,
  fillColData: NumericColumnData,
  symbolColData: NumericColumnData,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
  fillScale: Scale<number, string>,
  symbolScale: Scale<number, SymbolType>,
  pointSize: number,
  rowIndices?: number[],
): void => {
  const n = rowIndices ? rowIndices.length : xColData.length

  for (let i = 0; i < n; i++) {
    const rowIndex = rowIndices ? rowIndices[i] : i
    const x = xScale(xColData[rowIndex])
    const y = yScale(yColData[rowIndex])
    const fillStyle = fillScale(fillColData[rowIndex])
    const symbolType = symbolScale(symbolColData[rowIndex])

    ctx.fillStyle = fillStyle
    ctx.strokeStyle = fillStyle

    if (symbolType === 'circle') {
      drawCircle(ctx, x, y, pointSize)
    } else if (symbolType === 'square') {
      drawSquare(ctx, x, y, pointSize)
    } else if (symbolType === 'triangle') {
      drawTriangle(ctx, x, y, pointSize)
    } else if (symbolType === 'plus') {
      drawPlus(ctx, x, y, pointSize)
    } else if (symbolType === 'tritip') {
      drawTritip(ctx, x, y, pointSize)
    } else if (symbolType === 'ex') {
      drawEx(ctx, x, y, pointSize)
    }
  }
}
