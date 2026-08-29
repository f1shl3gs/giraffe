import * as React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {Config, Plot, GaugeTheme} from '../../giraffe/src'
import {DEFAULT_GAUGE_COLORS} from '../../giraffe/src'

import {PlotContainer} from './helpers'
import {gaugeTable} from './data/gaugeLayer'

interface GaugeArgs {
  decimalPlaces: string
  lineCount: string
  smallLineCount: string
  valuePositionYOffset: number
  valuePositionXOffset: number
  gaugeSize: number
  minLineWidth: number
  gaugeMin: string
  gaugeMax: string
  prefix: string
  suffix: string
  tickPrefix: string
  tickSuffix: string
}

export default {
  title: 'Gauge',
} as Meta

type Story = StoryObj<GaugeArgs>

const render = (args: GaugeArgs) => {
  const {
    decimalPlaces,
    lineCount,
    smallLineCount,
    valuePositionYOffset,
    valuePositionXOffset,
    gaugeSize,
    minLineWidth,
    gaugeMin,
    gaugeMax,
    prefix,
    suffix,
    tickPrefix,
    tickSuffix,
  } = args

  const config: Config = {
    table: gaugeTable(Number(gaugeMin), Number(gaugeMax)),
    layers: [
      {
        type: 'gauge',
        prefix,
        suffix,
        tickPrefix,
        tickSuffix,
        decimalPlaces: {
          isEnforced: true,
          digits: Number(decimalPlaces),
        },
        gaugeColors: [
          {...DEFAULT_GAUGE_COLORS[0], value: Number(gaugeMin)},
          {...DEFAULT_GAUGE_COLORS[1], value: Number(gaugeMax)},
        ],
        gaugeSize,
        gaugeTheme: {
          valuePositionYOffset,
          valuePositionXOffset,
          lineCount: Number(lineCount),
          smallLineCount: Number(smallLineCount),
          minLineWidth,
        } as GaugeTheme,
      },
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const Gauge: Story = {
  render,
  args: {
    decimalPlaces: '4',
    lineCount: '6',
    smallLineCount: '10',
    valuePositionYOffset: 0.5,
    valuePositionXOffset: 0,
    gaugeSize: Math.PI,
    minLineWidth: 22,
    gaugeMin: '0',
    gaugeMax: '100',
    prefix: '',
    suffix: '',
    tickPrefix: '',
    tickSuffix: '',
  },
  argTypes: {
    valuePositionYOffset: {
      control: {type: 'range', min: -3, max: 3, step: 0.1},
    },
    valuePositionXOffset: {
      control: {type: 'range', min: -3, max: 3, step: 0.01},
    },
    gaugeSize: {
      control: {type: 'range', min: Math.PI, max: 2 * Math.PI, step: 0.01},
    },
    minLineWidth: {
      control: {type: 'range', min: 0, max: 200, step: 1},
    },
  },
}
