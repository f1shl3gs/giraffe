// Libraries
import {range} from 'd3-array'
import {area, curveLinear, line} from 'd3-shape'
import {FunctionComponent, useMemo} from 'react'

import {
  alignMinMaxWithBand,
  bandTransform,
  getBands,
  groupLineIndicesIntoBands,
  simplifyBandData,
} from 'components/Band/transform'
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'

// Types
import {
  BandLineMap,
  LineData,
  LineHoverDimension,
  LineInterpolation,
  LinePosition,
} from 'types'

// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, LOWER, UPPER} from 'constants/columnKeys'
import {CURVES} from 'constants/index'

// Utils
import {getBandHoverIndices, getLineLengths} from './bandHover'
import {useBandHoverColumns} from './useBandHover'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'

// Components
import {BandHover} from './BandHover'

export interface BandConfig {
  x: string
  y: string
  fill: string[]
  position?: LinePosition
  hoverDimension?: LineHoverDimension | 'auto'
  maxTooltipRows?: number
  interpolation?: LineInterpolation
  lineWidth?: number
  lineOpacity?: number
  /*
    Defaults to NINETEEN_EIGHTY_FOUR. This used to come from LAYER_DEFAULTS.line
    / .band, and D9 moved layer defaults into each layer -- passing nothing used
    to mean the default palette, and with no default it means every line is drawn
    black.
  */
  colors?: string[]
  shadeOpacity?: number
  mainColumnName: string
  upperColumnName?: string
  lowerColumnName?: string
}

export interface BandProps {
  config: BandConfig
}

const HIGHLIGHT_HOVERED_LINE = 0.4
const NO_HIGHLIGHT = 1

export const Band: FunctionComponent<BandProps> = ({config}) => {
  const env = usePlot()
  const {hoverX, hoverY} = usePlotInteraction()
  const {width, height, xScale, yScale, table} = env
  const legendHide = env.config.legend?.hide ?? false

  const spec = useMemo(
    () =>
      bandTransform(
        table,
        env.config.xColumn,
        env.config.yColumn,
        config.fill,
        config.colors ?? NINETEEN_EIGHTY_FOUR,
        config.lowerColumnName ?? '',
        config.mainColumnName,
        config.upperColumnName ?? '',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config, env.config.xColumn, env.config.yColumn],
  )

  const {
    lowerColumnName,
    mainColumnName: rowColumnName,
    upperColumnName,
  } = config

  const simplifiedLineData = useMemo(
    () =>
      simplifyBandData(
        alignMinMaxWithBand(spec.lineData, spec.bandLineMap),
        xScale,
        yScale,
      ),
    [spec.lineData, xScale, yScale],
  )

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      draw(
        ctx,
        config.interpolation ?? 'linear',
        simplifiedLineData,
        spec.bandLineMap,
        config.lineWidth,
        config.lineOpacity,
        config.shadeOpacity,
      ),
    [
      spec.bandLineMap,
      config.interpolation,
      simplifiedLineData,
      config.lineWidth,
      config.lineOpacity,
      config.shadeOpacity,
    ],
  )

  let hoverDimension: 'x' | 'y' | 'xy'

  if (config.hoverDimension === 'auto') {
    hoverDimension = 'x'
    if (Object.keys(spec.lineData).length > config.maxTooltipRows) {
      hoverDimension = 'xy'
    }
  } else {
    hoverDimension = config.hoverDimension
  }

  // Band Plot allows hovering on the nearest band or bands,
  // and any hoverable point should be associated with a band
  const hoverableColumnData = useBandHoverColumns(
    hoverX,
    hoverY,
    spec.lineData,
    spec.table.getColumn(FILL, 'number'),
    spec.bandLineMap,
    width,
    height,
  )

  const hoverRowIndices = useHoverPointIndices(
    hoverDimension,
    hoverX,
    hoverY,
    hoverableColumnData.xs,
    hoverableColumnData.ys,
    hoverableColumnData.groupColData,
    xScale,
    yScale,
    width,
    height,
  )

  const lineLengths = getLineLengths(spec.lineData)

  const bandHoverIndices = getBandHoverIndices(
    lineLengths,
    hoverRowIndices,
    hoverableColumnData.groupColData,
    groupLineIndicesIntoBands(
      spec.columnGroupMaps.fill,
      lowerColumnName,
      rowColumnName,
      upperColumnName,
    ),
  )

  const hasHoverData =
    hoverRowIndices && hoverRowIndices.length > 0 && !legendHide

  return (
    <>
      <canvas
        className='giraffe-layer giraffe-layer-band-chart'
        ref={canvasRef}
        style={{
          position: 'absolute',
          opacity:
            hoverDimension === 'xy' && hasHoverData
              ? HIGHLIGHT_HOVERED_LINE
              : NO_HIGHLIGHT,
        }}
        data-testid='giraffe-layer-band-chart'
      />
      {hasHoverData && (
        <BandHover
          bandHoverIndices={bandHoverIndices}
          columnFormatter={(colKey: string) =>
            getFormatterForColumn(env.config, env.table, colKey)
          }
          config={config}
          dimension={hoverDimension}
          height={height}
          simplifiedLineData={simplifiedLineData}
          spec={spec}
          width={width}
          xScale={xScale}
          yScale={yScale}
        />
      )}
    </>
  )
}

function draw(
  ctx: CanvasRenderingContext2D,
  interpolation: LineInterpolation,
  lineData: LineData,
  bandLineMap: BandLineMap,
  lineWidth: number,
  lineOpacity: number,
  shadeOpacity: number,
) {
  const bands = getBands(lineData, bandLineMap)

  // draw shading
  for (const band of bands) {
    const lower = band[LOWER]
    const upper = band[UPPER]
    if (lower) {
      const {xs: xs_min, ys: ys_min} = lower
      const minAreaGenerator = area<number>()
        .y1((i: number) => band.ys[i])
        .y0((i: number) => ys_min[i])
        .x1((i: number) => band.xs[i])
        .x0((i: number) => xs_min[i])
        .context(ctx)
        .defined(
          (i: number) => xs_min[i] !== undefined && ys_min[i] !== undefined,
        )
        .curve(CURVES[interpolation] || curveLinear)

      ctx.fillStyle = lower.fill
      ctx.globalAlpha = shadeOpacity
      ctx.beginPath()
      minAreaGenerator(range(0, xs_min.length))
      ctx.fill()
    }

    if (upper) {
      const {xs: xs_max, ys: ys_max} = upper
      const maxAreaGenerator = area<number>()
        .y1((i: number) => ys_max[i])
        .y0((i: number) => band.ys[i])
        .x1((i: number) => xs_max[i])
        .x0((i: number) => band.xs[i])
        .context(ctx)
        .defined(
          (i: number) => xs_max[i] !== undefined && ys_max[i] !== undefined,
        )
        .curve(CURVES[interpolation] || curveLinear)

      ctx.fillStyle = upper.fill
      ctx.globalAlpha = shadeOpacity
      ctx.beginPath()
      maxAreaGenerator(range(0, xs_max.length))
      ctx.fill()
    }
  }

  ctx.lineWidth = lineWidth
  ctx.globalAlpha = lineOpacity

  // draw lines
  for (const {xs, ys, fill} of bands) {
    const lineGenerator = line<number>()
      .context(ctx)
      .y((i: number) => ys[i])
      .x((i: number) => xs[i])
      .context(ctx)
      .defined((i: number) => xs[i] !== undefined && ys[i] !== undefined)
      .curve(CURVES[interpolation] || curveLinear)

    ctx.strokeStyle = fill
    ctx.beginPath()
    lineGenerator(range(0, xs.length))
    ctx.stroke()
  }
}
