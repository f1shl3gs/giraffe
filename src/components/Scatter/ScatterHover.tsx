// Libraries
import {FunctionComponent} from 'react'

// Components
import {Tooltip} from '../Tooltip'

// Types
import type {PlotConfig} from 'components/Plot'
import type {ColumnType, Scale, SymbolType, Table} from 'types'

// Utils
import {drawPoints} from 'utils/drawPoints'
import {getPointsTooltipData} from 'utils/legend/tooltip'
import {useCanvas} from 'utils/useCanvas'
import {useHoverPointIndices} from 'utils/useHoverPointIndices'

// Constants
import {FILL, SYMBOL} from 'constants/columnKeys'
import {SCATTER_HOVER_POINT_SIZE} from 'constants/index'

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
