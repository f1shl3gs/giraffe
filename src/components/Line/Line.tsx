// Libraries
import {FunctionComponent, useMemo} from 'react'

// Components
import {LineHover} from 'components/Line/LineHover'
import {lineTransform} from 'components/Line/transform'
// Utils
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'
// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL} from 'constants/columnKeys'

// Types
import type {ColumnGroupMap, LineHoverDimension, LineInterpolation} from 'types'
import {drawLines} from 'utils/drawLines'
import {simplifyLineData} from 'utils/lineData'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'

export interface LineProps {
  fill?: string[]
  colors?: string[]
  colorMapping?: ColumnGroupMap
  colorMappingCallback?: (arg: ColumnGroupMap) => void
  interpolation?: LineInterpolation
  lineWidth?: number
  shadeBelow?: boolean
  shadeBelowOpacity?: number
  hoverDimension?: LineHoverDimension | 'auto'
  maxTooltipRows?: number
}

export const Line: FunctionComponent<LineProps> = ({
  fill = [],
  colors = NINETEEN_EIGHTY_FOUR,
  colorMapping,
  colorMappingCallback,
  interpolation = 'linear',
  lineWidth = 1,
  shadeBelow = false,
  shadeBelowOpacity = 0.1,
  hoverDimension: hoverDimensionProp = 'auto',
  maxTooltipRows = 24,
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

  const {fillTable, lineData, fillScale} = useMemo(
    () => lineTransform(table, xColumn, yColumn, fill, colors, colorMapping),
    [table, xColumn, yColumn, fill, colors, colorMapping],
  )

  const simplifiedLineData = useMemo(
    () => simplifyLineData(lineData, xScale, yScale),
    [lineData, xScale, yScale],
  )

  if (colorMapping && colorMappingCallback) {
    colorMappingCallback(colorMapping)
  }

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      drawLines(
        ctx,
        interpolation,
        simplifiedLineData,
        lineWidth,
        shadeBelow,
        shadeBelowOpacity,
        height,
      ),
    [
      interpolation,
      simplifiedLineData,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
    ],
  )

  /* 'auto' widens the hover to both axes once a single-axis tooltip cannot list
     every series. `size` counts series; `Object.keys` on the Map is always
     empty. */
  const hoverDimension: LineHoverDimension =
    hoverDimensionProp === 'auto'
      ? lineData.size > maxTooltipRows
        ? 'xy'
        : 'x'
      : hoverDimensionProp

  const hoverRowIndices = useHoverPointIndices(
    hoverDimension,
    hoverX,
    hoverY,
    fillTable.getColumn(xColumn, 'number') ?? [],
    fillTable.getColumn(yColumn, 'number') ?? [],
    fillTable.getColumn(FILL, 'number') ?? [],
    xScale,
    yScale,
    width,
    height,
  )

  const hasHoverData =
    hoverRowIndices && hoverRowIndices.length > 0 && !legend.hide

  return (
    <>
      <canvas
        className='giraffe-layer giraffe-layer-line'
        ref={canvasRef}
        style={{
          position: 'absolute',
          opacity: hoverDimension === 'xy' && hasHoverData ? 0.4 : 1,
        }}
        data-testid='giraffe-layer-line'
      />
      {hasHoverData && (
        <LineHover
          columnFormatter={(colKey: string) =>
            getFormatterForColumn(table, colKey, valueFormatters)
          }
          interpolation={interpolation}
          fill={fill}
          lineWidth={lineWidth}
          shadeBelow={shadeBelow}
          shadeBelowOpacity={shadeBelowOpacity}
          colorMapping={colorMapping}
          height={height}
          table={fillTable}
          fillScale={fillScale}
          width={width}
          xScale={xScale}
          yScale={yScale}
          rowIndices={hoverRowIndices}
          dimension={hoverDimension}
          simplifiedLineData={simplifiedLineData}
        />
      )}
    </>
  )
}
