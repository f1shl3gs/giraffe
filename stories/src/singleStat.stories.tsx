import * as React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {
  Config,
  LASER,
  LayerConfig,
  Plot,
  SINGLE_STAT_SVG_NO_USER_SELECT,
  timeFormatter,
} from '../../giraffe/src'

import {
  COLOR_SCHEME_OPTIONS,
  PlotContainer,
  findStringColumns,
  findXYColumns,
} from './helpers'

import {singleStatTable} from './data/singleStatLayer'

interface SingleStatArgs {
  decimalPlaces: number
  textOpacity: number
  viewBoxWidth: number
  viewBoxX: number
  viewBoxY: number
  prefix: string
  suffix: string
  csv: string
  includeSingleStatLayer: boolean
  colorScheme: string
  legendFont: string
  tickFont: string
  x: string
  y: string
  valueAxisLabel: string
  xScale: string
  yScale: string
  timeZone: string
  timeFormat: string
  fill: string[]
  position: string
  interpolation: string
  showAxes: boolean
  lineWidth: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  hoverDimension: string
  legendOrientationThreshold: number
  legendColorizeRows: boolean
}

export default {
  title: 'Single Stat',
} as Meta

type Story = StoryObj<SingleStatArgs>

const COLUMNS = findXYColumns(singleStatTable)
const STRING_COLUMNS = findStringColumns(singleStatTable)

const textOpacityControl = {
  control: {type: 'range', min: 0, max: 1, step: 0.01},
} as const
const viewBoxWidthControl = {
  control: {type: 'range', min: 0, max: 1000, step: 1},
} as const
const viewBoxXControl = {
  control: {type: 'range', min: -500, max: 500, step: 1},
} as const
const viewBoxYControl = {
  control: {type: 'range', min: -500, max: 500, step: 1},
} as const

export const SingleStat: Story = {
  render: args => {
    const {
      prefix,
      suffix,
      decimalPlaces,
      textOpacity,
      viewBoxWidth,
      viewBoxX,
      viewBoxY,
    } = args
    const config: Config = {
      table: singleStatTable,
      showAxes: false,
      layers: [
        {
          type: 'single stat',
          prefix,
          suffix,
          decimalPlaces: {
            isEnforced: true,
            digits: decimalPlaces,
          },
          textColor: LASER,
          textOpacity,
          svgAttributes: {
            viewBox: stat =>
              `${viewBoxX} ${viewBoxY} ${stat.length * viewBoxWidth} 100`,
          },
          svgTextStyle: {
            fontSize: '100',
            fontWeight: 'lighter',
            dominantBaseline: 'middle',
            textAnchor: 'middle',
            letterSpacing: '-0.05em',
          },
        },
      ],
    }
    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    decimalPlaces: 4,
    textOpacity: 1,
    viewBoxWidth: 55,
    viewBoxX: 0,
    viewBoxY: 0,
    prefix: '',
    suffix: '',
  },
  argTypes: {
    decimalPlaces: {control: {type: 'number'}},
    textOpacity: textOpacityControl,
    viewBoxWidth: viewBoxWidthControl,
    viewBoxX: viewBoxXControl,
    viewBoxY: viewBoxYControl,
  },
}

export const SingleStatCustomCsv: Story = {
  render: args => {
    const {
      csv,
      prefix,
      suffix,
      decimalPlaces,
      textOpacity,
      viewBoxWidth,
      viewBoxX,
      viewBoxY,
    } = args
    const config: Config = {
      fluxResponse: csv,
      showAxes: false,
      layers: [
        {
          type: 'single stat',
          prefix,
          suffix,
          decimalPlaces: {
            isEnforced: true,
            digits: decimalPlaces,
          },
          textColor: LASER,
          textOpacity,
          svgAttributes: {
            viewBox: stat =>
              `${viewBoxX} ${viewBoxY} ${stat.length * viewBoxWidth} 100`,
          },
          svgTextStyle: {
            fontSize: '100',
            fontWeight: 'lighter',
            dominantBaseline: 'middle',
            textAnchor: 'middle',
            letterSpacing: '-0.05em',
          },
        },
      ],
    }
    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    csv: '',
    decimalPlaces: 4,
    textOpacity: 1,
    viewBoxWidth: 55,
    viewBoxX: 0,
    viewBoxY: 0,
    prefix: '',
    suffix: '',
  },
  argTypes: {
    decimalPlaces: {control: {type: 'number'}},
    textOpacity: textOpacityControl,
    viewBoxWidth: viewBoxWidthControl,
    viewBoxX: viewBoxXControl,
    viewBoxY: viewBoxYControl,
  },
}

export const SingleStatOnTopOfLineLayer: Story = {
  render: args => {
    const {
      includeSingleStatLayer,
      decimalPlaces,
      textOpacity,
      viewBoxWidth,
      viewBoxX,
      viewBoxY,
      prefix,
      suffix,
      colorScheme,
      legendFont,
      tickFont,
      x,
      y,
      valueAxisLabel,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      fill,
      position,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args
    const colors =
      COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS]

    const layers = [
      {
        type: 'line',
        x,
        y,
        fill,
        position,
        interpolation,
        colors,
        lineWidth,
        hoverDimension,
        shadeBelow,
        shadeBelowOpacity,
      },
    ] as LayerConfig[]

    if (includeSingleStatLayer) {
      layers.push({
        type: 'single stat',
        prefix,
        suffix,
        decimalPlaces: {
          isEnforced: true,
          digits: decimalPlaces,
        },
        textColor: LASER,
        textOpacity,
        svgAttributes: {
          viewBox: stat =>
            `${viewBoxX} ${viewBoxY} ${stat.length * viewBoxWidth} 100`,
        },
        svgStyle: SINGLE_STAT_SVG_NO_USER_SELECT,
        svgTextStyle: {
          fontSize: '100',
          fontWeight: 'lighter',
          dominantBaseline: 'middle',
          textAnchor: 'middle',
          letterSpacing: '-0.05em',
        },
      })
    }

    const config: Config = {
      table: singleStatTable,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val =>
          `${val.toFixed(2)}${
            valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
          }`,
      },
      xScale,
      yScale,
      legendFont,
      legendOrientationThreshold,
      legendColorizeRows,
      tickFont,
      showAxes,
      layers,
    }

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    includeSingleStatLayer: true,
    decimalPlaces: 2,
    textOpacity: 1,
    viewBoxWidth: 55,
    viewBoxX: 0,
    viewBoxY: 0,
    prefix: '',
    suffix: '',
    colorScheme: 'Nineteen Eighty Four',
    legendFont: '12px sans-serif',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    valueAxisLabel: 'foo',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    fill: ['cpu'],
    position: 'overlaid',
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 1,
    shadeBelow: false,
    shadeBelowOpacity: 0.1,
    hoverDimension: 'auto',
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
  },
  argTypes: {
    decimalPlaces: {control: {type: 'number'}},
    textOpacity: textOpacityControl,
    viewBoxWidth: viewBoxWidthControl,
    viewBoxX: viewBoxXControl,
    viewBoxY: viewBoxYControl,
    includeSingleStatLayer: {control: {type: 'boolean'}},
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    x: {control: {type: 'select', options: Object.keys(COLUMNS)}},
    y: {control: {type: 'select', options: Object.keys(COLUMNS)}},
    xScale: {control: {type: 'select', options: ['linear', 'log']}},
    yScale: {control: {type: 'select', options: ['linear', 'log']}},
    timeZone: {
      control: {
        type: 'select',
        options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
      },
    },
    timeFormat: {
      control: {
        type: 'select',
        options: [
          'DD/MM/YYYY HH:mm:ss.sss',
          'MM/DD/YYYY HH:mm:ss.sss',
          'YYYY/MM/DD HH:mm:ss',
          'YYYY-MM-DD HH:mm:ss ZZ',
          'hh:mm a',
          'HH:mm',
          'HH:mm:ss',
          'HH:mm:ss ZZ',
          'HH:mm:ss.sss',
          'MMMM D, YYYY HH:mm:ss',
          'dddd, MMMM D, YYYY HH:mm:ss',
        ],
      },
    },
    fill: {control: {type: 'check', options: STRING_COLUMNS}},
    position: {control: {type: 'select', options: ['stacked', 'overlaid']}},
    interpolation: {
      control: {
        type: 'select',
        options: [
          'linear',
          'monotoneX',
          'monotoneY',
          'cubic',
          'step',
          'stepBefore',
          'stepAfter',
          'natural',
        ],
      },
    },
    showAxes: {control: {type: 'boolean'}},
    lineWidth: {control: {type: 'number'}},
    shadeBelow: {control: {type: 'boolean'}},
    shadeBelowOpacity: {control: {type: 'number'}},
    hoverDimension: {
      control: {type: 'select', options: ['auto', 'x', 'y', 'xy']},
    },
    legendOrientationThreshold: {control: {type: 'number'}},
    legendColorizeRows: {control: {type: 'boolean'}},
  },
}
