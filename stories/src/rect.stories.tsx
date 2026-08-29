import * as React from 'react'
import type {Meta, StoryObj} from '@storybook/react'

import {Config, Plot} from '../../giraffe/src'

import {
  COLOR_SCHEME_OPTIONS,
  PlotContainer,
  findXYColumns,
  getCPUTable,
} from './helpers'

interface RectArgs {
  colorScheme: string
  legendFont: string
  tickFont: string
  x: string
  y: string
  xScale: string
  yScale: string
  showAxes: boolean
  binCount: number
  legendOrientationThreshold: number
  legendColorizeRows: boolean
}

export default {
  title: 'Rect',
} as Meta

type Story = StoryObj<RectArgs>

const TABLE = getCPUTable()
const COLUMNS = findXYColumns(TABLE)

export const Heatmap: Story = {
  render: args => {
    const {
      colorScheme,
      legendFont,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      showAxes,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args
    const colors =
      COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS]

    const config: Config = {
      table: TABLE,
      legendFont,
      legendOrientationThreshold,
      legendColorizeRows,
      xScale,
      yScale,
      tickFont,
      showAxes,
      valueFormatters: {_value: val => `${Math.round(val)}%`},
      layers: [{type: 'heatmap', x, y, colors}],
    }

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    colorScheme: 'Magma',
    legendFont: '12px sans-serif',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    xScale: 'linear',
    yScale: 'linear',
    showAxes: true,
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
  },
  argTypes: {
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    x: {control: {type: 'select', options: Object.keys(COLUMNS)}},
    y: {control: {type: 'select', options: Object.keys(COLUMNS)}},
    xScale: {control: {type: 'select', options: ['linear', 'log']}},
    yScale: {control: {type: 'select', options: ['linear', 'log']}},
    showAxes: {control: {type: 'boolean'}},
    legendOrientationThreshold: {control: {type: 'number'}},
    legendColorizeRows: {control: {type: 'boolean'}},
  },
}

export const Histogram: Story = {
  render: args => {
    const {
      colorScheme,
      legendFont,
      tickFont,
      x,
      xScale,
      yScale,
      showAxes,
      binCount,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args
    const colors =
      COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS]

    const config: Config = {
      table: TABLE,
      legendFont,
      legendOrientationThreshold,
      legendColorizeRows,
      tickFont,
      showAxes,
      xScale,
      yScale,
      valueFormatters: {[x]: val => `${Math.round(val)}%`},
      layers: [{type: 'histogram', x, fill: ['cpu'], colors, binCount}],
    }

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    colorScheme: 'Nineteen Eighty Four',
    legendFont: '12px sans-serif',
    tickFont: '10px sans-serif',
    x: '_value',
    xScale: 'linear',
    yScale: 'linear',
    showAxes: true,
    binCount: 10,
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
  },
  argTypes: {
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    x: {control: {type: 'select', options: Object.keys(COLUMNS)}},
    xScale: {control: {type: 'select', options: ['linear', 'log']}},
    yScale: {control: {type: 'select', options: ['linear', 'log']}},
    showAxes: {control: {type: 'boolean'}},
    binCount: {control: {type: 'number'}},
    legendOrientationThreshold: {control: {type: 'number'}},
    legendColorizeRows: {control: {type: 'boolean'}},
  },
}
