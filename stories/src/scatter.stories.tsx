import * as React from 'react'
import type {Meta, StoryObj, ArgTypes} from '@storybook/react'

import {Config, Plot, fromFlux, timeFormatter} from '../../giraffe/src'

import {
  PlotContainer,
  getCPUTable,
  findXYColumns,
  findStringColumns,
  TIME_FORMAT_OPTIONS,
  COLOR_SCHEME_OPTIONS,
} from './helpers'

interface ScatterArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  legendFont: string
  tickFont: string
  x: string
  y: string
  xScale: string
  yScale: string
  fill: string[]
  symbol: string[]
  legendOrientationThreshold: number
  legendColorizeRows: boolean
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
    control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
  },
  xScale: {control: {type: 'select', options: ['linear', 'log']}},
  yScale: {control: {type: 'select', options: ['linear', 'log']}},
  timeZone: {
    control: {
      type: 'select',
      options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
    },
  },
  timeFormat: {control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]}},
  showAxes: {control: {type: 'boolean'}},
  legendOrientationThreshold: {control: {type: 'number'}},
  legendColorizeRows: {control: {type: 'boolean'}},
}

const commonArgs: Partial<ScatterArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  legendFont: '12px sans-serif',
  tickFont: '10px sans-serif',
  xScale: 'linear',
  yScale: 'linear',
  legendOrientationThreshold: 5,
  legendColorizeRows: true,
  showAxes: true,
}

const render = (args: ScatterArgs) => {
  const {
    colorScheme,
    legendFont,
    tickFont,
    x,
    y,
    xScale,
    yScale,
    fill,
    symbol,
    legendOrientationThreshold,
    legendColorizeRows,
    showAxes,
  } = args

  const table = cpuTable

  const config: Config = {
    table,
    valueFormatters: {_value: val => `${Math.round(val)}%`},
    legendFont,
    legendOrientationThreshold,
    legendColorizeRows,
    tickFont,
    showAxes,
    xScale,
    yScale,
    layers: [
      {
        type: 'scatter',
        x,
        y,
        fill,
        symbol,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      },
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
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
      control: {type: 'select', options: Object.keys(findXYColumns(cpuTable))},
    },
    y: {
      control: {type: 'select', options: Object.keys(findXYColumns(cpuTable))},
    },
    fill: {
      control: {type: 'multi-select', options: findStringColumns(cpuTable)},
    },
    symbol: {
      control: {type: 'multi-select', options: findStringColumns(cpuTable)},
    },
  },
}

const renderCustomCSV = (args: ScatterArgs) => {
  const {
    csv,
    colorScheme,
    legendFont,
    tickFont,
    x,
    y,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    showAxes,
    legendOrientationThreshold,
    legendColorizeRows,
  } = args

  const table = fromFlux(csv).table

  const config: Config = {
    table,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val => `${Math.round(val)}`,
    },
    legendFont,
    legendOrientationThreshold,
    legendColorizeRows,
    tickFont,
    showAxes,
    xScale,
    yScale,
    layers: [
      {
        type: 'scatter',
        x,
        y,
        fill: findStringColumns(table),
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      },
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
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
