// Libraries
import {FunctionComponent, useMemo} from 'react'

// Components
import {LineHover} from './LineHover'

// Utils
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'
import {lineTransform} from 'components/Line/transform'

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
  config: LineConfig
}

export interface LineConfig {
  x: string
  y: string
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

  const spec = useMemo(
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
    () => simplifyLineData(spec.lineData, xScale, yScale),
    [spec.lineData, xScale, yScale],
  )

  const drawLinesOptions = {
    lineData: simplifiedLineData,
    interpolation: config.interpolation,
    lineWidth: config.lineWidth,
    shadeBelow: config.shadeBelow,
    shadeBelowOpacity: config.shadeBelowOpacity,
    shadeAboveY: height,
  }

  if (config.colorMapping && config.colorMappingCallback) {
    config.colorMappingCallback(config.colorMapping)
  }

  const canvasRef = useCanvas(
    width,
    height,
    context => drawLines({context, ...drawLinesOptions}),
    Object.values(drawLinesOptions),
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

  const hoverYColumnData = spec.table.getColumn(config.y, 'number')
  const hoverRowIndices = useHoverPointIndices(
    hoverDimension,
    hoverX,
    hoverY,
    spec.table.getColumn(config.x, 'number'),
    hoverYColumnData,
    spec.table.getColumn(FILL, 'number'),
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
            getFormatterForColumn(env.config, env.table, colKey)
          }
          config={config}
          height={height}
          spec={spec}
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
