// Libraries
import {FunctionComponent} from 'react'

import {FILL, SYMBOL} from 'constants/columnKeys'
import {SCATTER_HOVER_POINT_SIZE} from 'constants/index'
import {Tooltip} from '../Tooltip'
import type {ScatterSpec} from './transform'

import {drawPoints} from 'utils/drawPoints'
import {getPointsTooltipData} from 'utils/legend/tooltip'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'
import type {ColumnType, Scale} from 'types'
import type {PlotConfig} from 'components/Plot'

interface Props {
  columnFormatter: (colKey: string) => (x: any) => string
  yColumnType: ColumnType
  plotConfig: PlotConfig
  hoverX: number | null
  hoverY: number | null
  legendHide: boolean
  height: number
  width: number
  xScale: Scale<number, number>
  yScale: Scale<number, number>

  x: string
  y: string
  fill: string[]
  symbol: string[]

  spec: ScatterSpec
}

export const ScatterHover: FunctionComponent<Props> = ({
  x,
  y,
  fill,
  symbol,
  spec,
  plotConfig,
  width,
  height,
  xScale,
  yScale,
  hoverX,
  hoverY,
  columnFormatter,
}) => {
  const xColData = spec.table.getColumn(x, 'number')
  const yColData = spec.table.getColumn(y, 'number')
  const fillColData = spec.table.getColumn(FILL, 'number')
  const symbolColData = spec.table.getColumn(SYMBOL, 'number')
  const fillScale = spec.scales.fill
  const symbolScale = spec.scales.symbol

  const rowIndices = useHoverPointIndices(
    'xy',
    hoverX,
    hoverY,
    xColData,
    yColData,
    [],
    xScale,
    yScale,
    width,
    height,
  )

  /*
    The `!rowIndices` bail-out below sits after this hook (hooks cannot be
    called conditionally), so this draw effect does run on mount with no hover
    data. Guard inside the callback -- drawPoints reads `rowIndices.length`.
  */
  const canvasRef = useCanvas(
    width,
    height,
    ctx => {
      if (!rowIndices) {
        return
      }

      drawPoints(
        ctx,
        xColData,
        yColData,
        fillColData,
        symbolColData,
        xScale,
        yScale,
        fillScale,
        symbolScale,
        SCATTER_HOVER_POINT_SIZE,
        rowIndices,
      )
    },
    [
      xColData,
      yColData,
      fillColData,
      symbolColData,
      xScale,
      yScale,
      fillScale,
      symbolScale,
      rowIndices,
    ],
  )

  if (!rowIndices) {
    return null
  }

  const tooltipData = getPointsTooltipData(
    rowIndices,
    spec.table,
    x,
    y,
    FILL,
    columnFormatter,
    [...new Set([...fill, ...symbol])],
    fillScale,
  )

  return (
    <>
      <canvas
        className='giraffe-layer scatter-interactions'
        ref={canvasRef}
        style={{position: 'absolute'}}
        data-testid='giraffe-layer--scatter-interact'
      />
      {tooltipData && (
        <Tooltip
          data={tooltipData}
          config={plotConfig.legend}
          width={width}
          height={height}
        />
      )}
    </>
  )
}
