import * as React from 'react'
import type {Meta, StoryObj, ArgTypes} from '@storybook/react'

import {
  Config,
  Plot,
  timeFormatter,
  fromFlux,
  LineInterpolation,
} from '../../giraffe/src'

import {
  colors6,
  cpu1,
  cpu2,
  graphEdge1,
  hoverAlignment1,
  hoverAlignment2,
  hoverAlignment3,
  mem1,
  mem2,
  noLowerAndUpper,
  same3,
} from './data/bandCSV'

import {
  PlotContainer,
  findStringColumns,
  TIME_FORMAT_OPTIONS,
  COLOR_SCHEME_OPTIONS,
} from './helpers'

interface BandArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  legendFont: string
  tickFont: string
  valueAxisLabel: string
  xScale: string
  yScale: string
  timeZone: string
  timeFormat: string
  interpolation: LineInterpolation
  showAxes: boolean
  lineWidth: number
  lineOpacity: number
  shadeOpacity: number
  hoverDimension: 'auto' | 'x' | 'y' | 'xy'
  upperColumnName: string
  mainColumnName: string
  lowerColumnName: string
  legendOpacity: number
  legendOrientationThreshold: number
  legendColorizeRows: boolean
  yTickStart: number
  yTickStep: number
  xTotalTicks: number
  staticData: string
  csv: string
}

export default {
  title: 'Band Chart',
} as Meta

type Story = StoryObj<BandArgs>

const INTERPOLATION_OPTIONS = [
  'linear',
  'monotoneX',
  'monotoneY',
  'cubic',
  'step',
  'stepBefore',
  'stepAfter',
  'natural',
]

const commonArgTypes: Partial<ArgTypes<BandArgs>> = {
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
  interpolation: {control: {type: 'select', options: INTERPOLATION_OPTIONS}},
  showAxes: {control: {type: 'boolean'}},
  hoverDimension: {
    control: {type: 'select', options: ['auto', 'x', 'y', 'xy']},
  },
  lineWidth: {control: {type: 'number'}},
  lineOpacity: {control: {type: 'number'}},
  shadeOpacity: {control: {type: 'number'}},
  legendOpacity: {
    control: {type: 'range', min: 0, max: 1.0, step: 0.05},
  },
  legendOrientationThreshold: {control: {type: 'number'}},
  legendColorizeRows: {control: {type: 'boolean'}},
}

const commonArgs: Partial<BandArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  legendFont: '12px sans-serif',
  tickFont: '10px sans-serif',
  valueAxisLabel: '',
  xScale: 'linear',
  yScale: 'linear',
  timeZone: 'UTC',
  interpolation: 'monotoneX',
  showAxes: true,
  lineWidth: 3,
  lineOpacity: 0.7,
  shadeOpacity: 0.3,
  hoverDimension: 'auto',
  legendOpacity: 1.0,
  legendOrientationThreshold: 15,
  legendColorizeRows: true,
}

const render = (args: BandArgs) => {
  const {
    colorScheme,
    legendFont,
    tickFont,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    interpolation,
    showAxes,
    lineWidth,
    lineOpacity,
    shadeOpacity,
    hoverDimension,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    yTickStart,
    yTickStep,
    xTotalTicks,
  } = args

  const config: Config = {
    fluxResponse: hoverAlignment3,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        typeof val === 'number'
          ? `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`
          : val,
    },
    xScale,
    yScale,
    legendFont,
    tickFont,
    showAxes,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    xTotalTicks,
    yTickStart,
    yTickStep,
    layers: [
      {
        type: 'band',
        x: '_time',
        y: '_value',
        fill: ['result', 'env'],
        interpolation,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
        lineWidth,
        lineOpacity,
        hoverDimension,
        shadeOpacity,
        upperColumnName,
        mainColumnName,
        lowerColumnName,
      },
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const StaticGroupByApplied: Story = {
  render,
  args: {
    ...commonArgs,
    timeFormat: 'hh:mm a',
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    yTickStart: 0,
    yTickStep: 100,
    xTotalTicks: 20,
  },
  argTypes: {
    ...commonArgTypes,
    yTickStart: {control: {type: 'number'}},
    yTickStep: {control: {type: 'number'}},
    xTotalTicks: {control: {type: 'number'}},
  },
}

const renderAllStringColumns = (args: BandArgs) => {
  const {
    staticData,
    colorScheme,
    legendFont,
    tickFont,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    interpolation,
    showAxes,
    lineWidth,
    lineOpacity,
    shadeOpacity,
    hoverDimension,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    xTotalTicks,
  } = args

  const fromFluxTable = fromFlux(staticData).table

  const config: Config = {
    fluxResponse: staticData,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        typeof val === 'number'
          ? `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`
          : val,
    },
    xScale,
    yScale,
    legendFont,
    tickFont,
    showAxes,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    xTotalTicks,
    layers: [
      {
        type: 'band',
        x: '_time',
        y: '_value',
        fill: findStringColumns(fromFluxTable),
        interpolation,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
        lineWidth,
        lineOpacity,
        hoverDimension,
        shadeOpacity,
        upperColumnName,
        mainColumnName,
        lowerColumnName,
      },
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const StaticAllStringColumns: Story = {
  render: renderAllStringColumns,
  args: {
    ...commonArgs,
    staticData: cpu2,
    timeFormat: 'hh:mm a',
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    xTotalTicks: 20,
  },
  argTypes: {
    ...commonArgTypes,
    staticData: {
      control: {
        type: 'select',
        options: [
          colors6,
          cpu1,
          cpu2,
          graphEdge1,
          hoverAlignment1,
          hoverAlignment2,
          mem1,
          mem2,
          noLowerAndUpper,
          same3,
        ],
      },
    },
    xTotalTicks: {control: {type: 'number'}},
  },
}

const renderCustomCSV = (args: BandArgs) => {
  const {
    csv,
    colorScheme,
    legendFont,
    tickFont,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    interpolation,
    showAxes,
    lineWidth,
    lineOpacity,
    shadeOpacity,
    hoverDimension,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
  } = args

  const fromFluxTable = fromFlux(csv).table

  const config: Config = {
    fluxResponse: csv,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        typeof val === 'number'
          ? `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`
          : val,
    },
    xScale,
    yScale,
    legendFont,
    tickFont,
    showAxes,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    layers: [
      {
        type: 'band',
        x: '_time',
        y: '_value',
        fill: findStringColumns(fromFluxTable),
        interpolation,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
        lineWidth,
        lineOpacity,
        hoverDimension,
        shadeOpacity,
        upperColumnName,
        mainColumnName,
        lowerColumnName,
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
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    upperColumnName: '',
    mainColumnName: '',
    lowerColumnName: '',
  },
  argTypes: commonArgTypes,
}
