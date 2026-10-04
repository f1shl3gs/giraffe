import type {ArgTypes, Meta, StoryObj} from '@storybook/react'
import type {ScatterConfig} from 'components/Scatter'
import {Scatter} from 'components/Scatter'
import {
  COLOR_SCHEME_OPTIONS,
  findStringColumns,
  findXYColumns,
  getCPUTable,
  StoryFrame,
  TIME_FORMAT_OPTIONS,
} from 'stories/helpers'
import {timeFormatter} from 'utils/formatters'
import {fromFlux} from 'utils/fromFlux'

interface ScatterArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  x: string
  y: string
  fill: string[]
  symbol: string[]
  valueAxisSuffix: string
  showAxes: boolean
  timeZone: string
  timeFormat: string
  csv: string
}

export default {
  title: 'Scatter',
} as Meta

type Story = StoryObj<ScatterArgs>

const cpuTable = getCPUTable()

const commonArgTypes: Partial<ArgTypes<ScatterArgs>> = {
  colorScheme: {
    control: {type: 'select'},
    options: Object.keys(COLOR_SCHEME_OPTIONS),
  },
  timeZone: {
    control: {type: 'select'},
    options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
  },
  timeFormat: {
    control: {type: 'select'},
    options: [...TIME_FORMAT_OPTIONS],
  },
  showAxes: {control: {type: 'boolean'}},
  valueAxisSuffix: {control: {type: 'text'}},
}

const commonArgs: Partial<ScatterArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  valueAxisSuffix: '%',
  showAxes: true,
}

const render = (args: ScatterArgs) => {
  const {colorScheme, x, y, fill, symbol, valueAxisSuffix, showAxes} = args

  const config: ScatterConfig = {
    x,
    y,
    fill,
    symbol,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
    valueFormatters: {_value: val => `${Math.round(val)}${valueAxisSuffix}`},
    showAxes,
  }

  return (
    <StoryFrame>
      <Scatter table={cpuTable} config={config} />
    </StoryFrame>
  )
}

export const StaticCSV: Story = {
  render,
  args: {
    ...commonArgs,
    x: '_time',
    y: '_value',
    fill: ['cpu'],
    symbol: ['host'],
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {type: 'select'},
      options: Object.keys(findXYColumns(cpuTable)),
    },
    y: {
      control: {type: 'select'},
      options: Object.keys(findXYColumns(cpuTable)),
    },
    fill: {
      control: {type: 'multi-select'},
      options: findStringColumns(cpuTable),
    },
    symbol: {
      control: {type: 'multi-select'},
      options: findStringColumns(cpuTable),
    },
  },
}

const renderCustomCSV = (args: ScatterArgs) => {
  const {
    csv,
    colorScheme,
    x,
    y,
    timeZone,
    timeFormat,
    showAxes,
    valueAxisSuffix,
  } = args

  const table = fromFlux(csv).table

  const config: ScatterConfig = {
    x,
    y,
    fill: findStringColumns(table),
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val => `${Math.round(val)}${valueAxisSuffix}`,
    },
    showAxes,
  }

  return (
    <StoryFrame>
      <Scatter table={table} config={config} />
    </StoryFrame>
  )
}

export const CustomCSV: Story = {
  render: renderCustomCSV,
  args: {
    ...commonArgs,
    csv: '',
    x: '_time',
    y: '_value',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
  },
  argTypes: commonArgTypes,
}
