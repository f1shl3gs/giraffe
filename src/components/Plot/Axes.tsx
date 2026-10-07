// Libraries
import {CSSProperties, FunctionComponent, useLayoutEffect, useRef} from 'react'

import {getFormatterForColumn} from 'components/Plot/PlotEnv'

// Types
import {Formatter, Margins, Scale} from 'types'
import {PlotConfig} from './PlotConfig'
import {PlotEnv} from './PlotEnv'

// Utils
import {clearCanvas} from 'utils/clearCanvas'

// Constants
import {TICK_PADDING_RIGHT, TICK_PADDING_TOP} from 'constants/index'

interface Props {
  plot: PlotEnv
  style: CSSProperties
}

// A grid line must be at least this many pixels away from both parallel axes
// in order to be drawn
const GRID_LINE_MIN_DIST = 5

interface DrawAxesOptions {
  canvas: HTMLCanvasElement
  /* The axes canvas covers the whole plot, so it is sized by the plot's outer
     dimensions -- not innerWidth/innerHeight, and not config.width/height,
     which are optional and usually unset (the size comes from AutoSizer). */
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  margins: Margins
  xDomain: number[]
  yDomain: number[]
  xTicks: number[]
  yTicks: Array<number | string>
  xTickFormatter: Formatter
  yTickFormatter: Formatter
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  config: PlotConfig
}

const drawAxes = ({
  canvas,
  width,
  height,
  innerWidth,
  innerHeight,
  margins,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  xTickFormatter,
  yTickFormatter,
  xScale,
  yScale,
  config: {
    axisColor,
    axisOpacity,
    gridColor,
    gridOpacity,
    tickFont,
    tickFontColor,
    xAxisLabel,
    yAxisLabel,
  },
}: DrawAxesOptions) => {
  clearCanvas(canvas, width, height)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const xAxisY = height - margins.bottom
  const xDomainWidth = Math.abs(xDomain[1] - xDomain[0])

  // Draw and label each tick on the x-axis

  ctx.font = tickFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  for (const xTick of xTicks) {
    const x = xScale(xTick) + margins.left

    if (
      Math.abs(x - margins.left) > GRID_LINE_MIN_DIST &&
      Math.abs(x - (width - margins.right)) > GRID_LINE_MIN_DIST
    ) {
      ctx.strokeStyle = gridColor
      ctx.globalAlpha = gridOpacity
      ctx.beginPath()
      ctx.moveTo(x, xAxisY)
      ctx.lineTo(x, margins.top)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.fillStyle = tickFontColor
    ctx.fillText(
      xTickFormatter(xTick, {domainWidth: xDomainWidth}),
      x,
      xAxisY + TICK_PADDING_TOP,
    )
  }

  // Draw and label each tick on the y axis
  ctx.textAlign = 'end'
  ctx.textBaseline = 'middle'
  const yDomainWidth = yDomain[1] - yDomain[0]
  let count = 0
  for (const yTick of yTicks) {
    let y
    if (typeof yTick === 'string') {
      y = yScale(count) + margins.top - height / (yTicks.length * 2)
      ctx.globalAlpha = 1
      ctx.fillStyle = tickFontColor

      ctx.fillText(
        yTickFormatter(yTick, {domainWidth: yDomainWidth}),
        margins.left - TICK_PADDING_RIGHT,
        y,
      )
      count += 1
    } else {
      y = yScale(yTick) + margins.top
      if (
        Math.abs(y - margins.top) > GRID_LINE_MIN_DIST &&
        Math.abs(y - (height - margins.bottom)) > GRID_LINE_MIN_DIST
      ) {
        ctx.strokeStyle = gridColor
        ctx.globalAlpha = gridOpacity
        ctx.beginPath()
        ctx.moveTo(margins.left, y)
        ctx.lineTo(width - margins.right, y)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.fillStyle = tickFontColor
      ctx.fillText(
        yTickFormatter(yTick, {domainWidth: yDomainWidth}),
        margins.left - TICK_PADDING_RIGHT,
        y,
      )
    }
  }

  // Draw x and y axis lines

  ctx.globalAlpha = axisOpacity
  ctx.strokeStyle = axisColor

  ctx.beginPath()
  ctx.moveTo(margins.left, xAxisY)
  ctx.lineTo(width - margins.right, xAxisY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(margins.left, margins.top)
  ctx.lineTo(width - margins.right, margins.top)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(margins.left, xAxisY)
  ctx.lineTo(margins.left, margins.top)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(width - margins.right, xAxisY)
  ctx.lineTo(width - margins.right, margins.top)
  ctx.stroke()

  ctx.globalAlpha = 1

  // Draw the x axis label
  if (xAxisLabel) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(xAxisLabel, margins.left + innerWidth / 2, height)
  }

  // Draw the y axis label
  if (yAxisLabel) {
    const x = 0
    const y = margins.top + innerHeight / 2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(yAxisLabel, 0, 0)
    ctx.restore()
  }
}

export const Axes: FunctionComponent<Props> = ({
  style,
  plot: {
    width,
    height,
    innerWidth,
    innerHeight,
    margins,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    xScale,
    yScale,
    table,
    config,
  },
}) => {
  // valueFormatters is optional, and an absent one has to fall back to the
  // column's type -- the same resolution <Plot> does for everything else.
  const xTickFormatter = getFormatterForColumn(
    table,
    config.xColumn,
    config.valueFormatters,
  )
  const yTickFormatter = getFormatterForColumn(
    table,
    config.yColumn,
    config.valueFormatters,
  )

  // Axes owns its canvas: nothing else draws into it.
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    drawAxes({
      canvas: canvasRef.current,
      width,
      height,
      innerWidth,
      innerHeight,
      margins,
      xDomain,
      yDomain,
      xTicks,
      yTicks,
      xTickFormatter,
      yTickFormatter,
      xScale,
      yScale,
      config,
    })
  }, [
    canvasRef.current,
    width,
    height,
    innerWidth,
    innerHeight,
    margins,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    xTickFormatter,
    yTickFormatter,
    xScale,
    yScale,
    config,
  ])

  return (
    <canvas
      className='giraffe-axes'
      ref={canvasRef}
      style={style}
      data-testid='giraffe-axes'
    />
  )
}
