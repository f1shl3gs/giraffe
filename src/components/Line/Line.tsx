// Libraries
import {FunctionComponent, useMemo} from 'react'

// Components
import {LineHover} from 'components/Line/LineHover'

// Types
import type {ColumnGroupMap, LineHoverDimension, LineInterpolation} from 'types'

// Utils
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'
import {lineTransform} from 'components/Line/transform'
import {drawLines} from 'utils/drawLines'
import {simplifyLineData} from 'utils/lineData'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'

// Constants
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL} from 'constants/columnKeys'

export interface LineProps {
  config: LineConfig
}

export interface LineConfig {
  fill?: string[]
  hoverDimension?: LineHoverDimension | 'auto'
  maxTooltipRows?: number
  interpolation?: LineInterpolation
  lineWidth?: number
  colors?: string[]
  shadeBelow?: boolean
  shadeBelowOpacity?: number
  colorMapping?: ColumnGroupMap
  colorMappingCallback?: (arg: ColumnGroupMap) => void
}

export const Line: FunctionComponent<LineProps> = ({config}) => {
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
    () =>
      lineTransform(
        table,
        xColumn,
        yColumn,
        config.fill ?? [],
        config.colors ?? NINETEEN_EIGHTY_FOUR,
        config.colorMapping,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config, xColumn, yColumn],
  )

  const simplifiedLineData = useMemo(
    () => simplifyLineData(lineData, xScale, yScale),
    [lineData, xScale, yScale],
  )

  if (config.colorMapping && config.colorMappingCallback) {
    config.colorMappingCallback(config.colorMapping)
  }

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
      drawLines(
        ctx,
        config.interpolation ?? 'linear',
        simplifiedLineData,
        config.lineWidth ?? 1,
        config.shadeBelow ?? false,
        config.shadeBelowOpacity ?? 0.1,
        height,
      ),
    [
      config.interpolation,
      simplifiedLineData,
      config.lineWidth,
      config.shadeBelow,
      config.shadeBelowOpacity,
    ],
  )

  const maxTooltipRows = config.maxTooltipRows ?? 24

  let hoverDimension: 'x' | 'y' | 'xy'
  if (config.hoverDimension === 'auto' || config.hoverDimension === undefined) {
    hoverDimension = lineData.size > maxTooltipRows ? 'xy' : 'x'
  } else {
    hoverDimension = config.hoverDimension
  }

  const hoverYColumnData = fillTable.getColumn(yColumn, 'number')
  const hoverRowIndices = useHoverPointIndices(
    hoverDimension,
    hoverX,
    hoverY,
    fillTable.getColumn(xColumn, 'number'),
    hoverYColumnData,
    fillTable.getColumn(FILL, 'number'),
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
          config={config}
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
