// Libraries
import {createContext, useContext} from 'react'

// Types
import {ColumnType, Formatter, Margins, Scale, Table} from 'types'
import {PlotConfig} from './PlotConfig'

// Utils
import {timeFormatter} from 'utils/formatters'

const DEFAULT_FORMATTER: Formatter = x => String(x)
const DEFAULT_TIME_FORMATTER = timeFormatter()

export interface PlotEnv {
  readonly config: PlotConfig

  table: Table
  width: number
  height: number

  xDomain: number[]
  xScale: Scale<number, number>
  xTicks: number[]

  yDomain: number[]
  yScale: Scale<number, number>
  yTicks: Array<number | string>

  margins: Margins
  innerWidth: number
  innerHeight: number
  yColumnType: ColumnType
}

export const PlotEnvContext = createContext<PlotEnv | null>(null)

export const usePlot = (): PlotEnv => {
  const env = useContext(PlotEnvContext)
  if (!env) {
    throw new Error(
      'usePlotEnv: layer components must be rendered inside <Plot>',
    )
  }

  return env
}

export const getFormatterForColumn = (
  config: PlotConfig,
  table: Table,
  colKey: string,
): Formatter => {
  const preferredFormatter = config.valueFormatters?.[colKey]

  if (preferredFormatter) {
    return preferredFormatter
  }

  return table.getColumnType(colKey) === 'time'
    ? DEFAULT_TIME_FORMATTER
    : DEFAULT_FORMATTER
}
