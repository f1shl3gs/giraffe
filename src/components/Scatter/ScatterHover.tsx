// Libraries

// Types
import type {PlotConfig} from 'components/Plot'
// Constants
import {FILL, SYMBOL} from 'constants/columnKeys'
import {SCATTER_HOVER_POINT_SIZE} from 'constants/index'
import {FunctionComponent} from 'react'
import type {Scale, SymbolType, Table} from 'types'
// Utils
import {drawPoints} from 'utils/drawPoints'
import {getPointsTooltipData} from 'utils/legend/tooltip'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'
// Components
import {Tooltip} from '../Tooltip'

interface Props {
  columnFormatter: (colKey: string) => (x: any) => string
  plotConfig: PlotConfig
  hoverX: number | null
  hoverY: number | null
  legendHide: boolean
  height: number
  width: number
  xScale: Scale<number, number>
  yScale: Scale<number, number>

  fill: string[]
  symbol: string[]

  table: Table
  fillScale: Scale<number, string>
  symbolScale: Scale<number, SymbolType>
}

export const ScatterHover: FunctionComponent<Props> = ({
  fill,
  symbol,
  table,
  fillScale,
  symbolScale,
  plotConfig,
  width,
  height,
  xScale,
  yScale,
  hoverX,
  hoverY,
  columnFormatter,
  legendHide,
}) => {
  const xColData = table.getColumn(plotConfig.xColumn, 'number')
  const yColData = table.getColumn(plotConfig.yColumn, 'number')
  const fillColData = table.getColumn(FILL, 'number')
  const symbolColData = table.getColumn(SYMBOL, 'number')

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

  const canvasRef = useCanvas(
    width,
    height,
    ctx =>
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
      ),
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

  const tooltipData = getPointsTooltipData(
    rowIndices,
    table,
    plotConfig.xColumn,
    plotConfig.yColumn,
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
      {!legendHide && tooltipData.length > 0 && (
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
