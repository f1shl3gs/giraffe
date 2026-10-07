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
  /*
    Defaults to NINETEEN_EIGHTY_FOUR. This used to come from LAYER_DEFAULTS.line
    / .band, and D9 moved layer defaults into each layer -- passing nothing used
    to mean the default palette, and with no default it means every line is drawn
    black.
  */
  colors?: string[]
  shadeBelow?: boolean
  shadeBelowOpacity?: number
  colorMapping?: ColumnGroupMap
  colorMappingCallback?: (arg: ColumnGroupMap) => void
}

export const Line: FunctionComponent<LineProps> = ({config}) => {
  const env = usePlot()
  const {hoverX, hoverY} = usePlotInteraction()
  const {width, height, xScale, yScale, table} = env

  const {fillTable, lineData, fillScale} = useMemo(
    () =>
      lineTransform(
        table,
        env.config.xColumn,
        env.config.yColumn,
        config.fill ?? [],
        config.colors ?? NINETEEN_EIGHTY_FOUR,
        config.colorMapping,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, config, env.config.xColumn, env.config.yColumn],
  )

  const legendHide = env.config.legend?.hide ?? false

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
        config.interpolation,
        simplifiedLineData,
        config.lineWidth,
        config.shadeBelow,
        config.shadeBelowOpacity,
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

  let hoverDimension: 'x' | 'y' | 'xy'

  if (config.hoverDimension === 'auto') {
    hoverDimension = 'x'
    if (Object.keys(lineData).length > config.maxTooltipRows) {
      hoverDimension = 'xy'
    }
  } else {
    hoverDimension = config.hoverDimension
  }

  const hoverYColumnData = fillTable.getColumn(env.config.yColumn, 'number')
  const hoverRowIndices = useHoverPointIndices(
    hoverDimension,
    hoverX,
    hoverY,
    fillTable.getColumn(env.config.xColumn, 'number'),
    hoverYColumnData,
    fillTable.getColumn(FILL, 'number'),
    xScale,
    yScale,
    width,
    height,
  )

  const hasHoverData =
    hoverRowIndices && hoverRowIndices.length > 0 && !legendHide

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
            getFormatterForColumn(env.table, colKey, env.config.valueFormatters)
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
