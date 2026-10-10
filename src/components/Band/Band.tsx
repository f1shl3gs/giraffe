// Libraries
import {range} from 'd3-array'
import {area, curveLinear, line} from 'd3-shape'
import {FunctionComponent, useMemo} from 'react'

// Components
import {BandHover} from './BandHover'

// Types
import {
  BandLineMap,
  LineData,
  LineHoverDimension,
  LineInterpolation,
} from 'types'

// Utils
import {
  alignMinMaxWithBand,
  getBands,
  groupLineIndicesIntoBands,
  simplifyBandData,
  useBandTransform,
} from 'components/Band/useBandTransform'
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'
import {getBandHoverIndices, getLineLengths} from './bandHover'
import {useBandHoverColumns} from './useBandHover'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'

// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL, LOWER, UPPER} from 'constants/columnKeys'
import {CURVES} from 'constants/index'
import {NO_FILL_COLUMNS} from 'utils/transform'

const HIGHLIGHT_HOVERED_LINE = 0.4
const NO_HIGHLIGHT = 1

export interface BandProps {
  fill?: string[]
  hoverDimension?: LineHoverDimension | 'auto'
  maxTooltipRows?: number
  interpolation?: LineInterpolation
  lineWidth?: number
  lineOpacity?: number
  colors?: string[]
  shadeOpacity?: number
  mainColumnName: string
  upperColumnName?: string
  lowerColumnName?: string
}

export const Band: FunctionComponent<BandProps> = ({
  fill = NO_FILL_COLUMNS,
  hoverDimension = 'auto',
  maxTooltipRows = 24,
  interpolation = 'linear',
  lineWidth = 1,
  lineOpacity = 1,
  colors = NINETEEN_EIGHTY_FOUR,
  shadeOpacity = 0.8,
  mainColumnName,
  upperColumnName = '',
  lowerColumnName = '',
}) => {
  const {
    width,
    height,
    xScale,
    yScale,
    table,
    config: {xColumn, yColumn, valueFormatters, legend = {hide: true}},
  } = usePlot()
  const {hoverX, hoverY} = usePlotInteraction()
  const legendHide = legend?.hide ?? false

  const {bandLineMap, fillTable, lineData, fillColumnMap} = useBandTransform(
    table,
    xColumn,
    yColumn,
    fill,
    colors,
    lowerColumnName,
    mainColumnName,
    upperColumnName,
  )

  const simplifiedLineData = useMemo(
    () =>
      simplifyBandData(
        alignMinMaxWithBand(lineData, bandLineMap),
        xScale,
        yScale,
      ),
    [lineData, xScale, yScale],
  )

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      draw(
        ctx,
        interpolation,
        simplifiedLineData,
        bandLineMap,
        lineWidth,
        lineOpacity,
        shadeOpacity,
      ),
    [
      bandLineMap,
      interpolation,
      simplifiedLineData,
      lineWidth,
      lineOpacity,
      shadeOpacity,
    ],
  )

  const resolvedHoverDimension: LineHoverDimension =
    hoverDimension === 'auto'
      ? lineData.size > maxTooltipRows
        ? 'xy'
        : 'x'
      : hoverDimension

  // Band Plot allows hovering on the nearest band or bands,
  // and any hoverable point should be associated with a band
  const hoverableColumnData = useBandHoverColumns(
    hoverX,
    hoverY,
    lineData,
    fillTable.getColumn(FILL, 'number'),
    bandLineMap,
    width,
    height,
  )

  const hoverRowIndices = useHoverPointIndices(
    resolvedHoverDimension,
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

  const lineLengths = getLineLengths(lineData)

  const bandHoverIndices = getBandHoverIndices(
    lineLengths,
    hoverRowIndices,
    hoverableColumnData.groupColData,
    groupLineIndicesIntoBands(
      fillColumnMap,
      lowerColumnName,
      mainColumnName,
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
            resolvedHoverDimension === 'xy' && hasHoverData
              ? HIGHLIGHT_HOVERED_LINE
              : NO_HIGHLIGHT,
        }}
        data-testid='giraffe-layer-band-chart'
      />
      {hasHoverData && (
        <BandHover
          bandHoverIndices={bandHoverIndices}
          bandLineMap={bandLineMap}
          lineData={lineData}
          fillTable={fillTable}
          columnFormatter={(colKey: string) =>
            getFormatterForColumn(table, colKey, valueFormatters)
          }
          dimension={resolvedHoverDimension}
          height={height}
          simplifiedLineData={simplifiedLineData}
          interpolation={interpolation}
          fill={fill}
          lineWidth={lineWidth}
          lowerColumnName={lowerColumnName}
          mainColumnName={mainColumnName}
          shadeOpacity={shadeOpacity}
          upperColumnName={upperColumnName}
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
