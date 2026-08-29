import * as React from 'react'
import type {ArgTypes, Meta, StoryObj} from '@storybook/react'

import {
  Config,
  Plot,
  exportImage,
  fromFlux,
  timeFormatter,
} from '../../giraffe/src'
import type {LineInterpolation, LinePosition} from '../../giraffe/src'
import {stackedLineTable} from './data/stackedLineLayer'
import {PlotEnv} from '../../giraffe/src/utils/PlotEnv'

import {
  PlotContainer,
  COLOR_SCHEME_OPTIONS,
  TIME_FORMAT_OPTIONS,
  findStringColumns,
  findXYColumns,
  getCPUTable,
} from './helpers'

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

interface UtilitiesArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  legendFont: string
  tickFont: string
  valueAxisLabel: string
  x: string
  y: string
  fill: string[]
  position: LinePosition
  xScale: string
  yScale: string
  timeZone: string
  timeFormat: string
  interpolation: LineInterpolation
  showAxes: boolean
  lineWidth: number
  lineOpacity: number
  shadeOpacity: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  hoverDimension: 'auto' | 'x' | 'y' | 'xy'
  legendOpacity: number
  legendOrientationThreshold: number
  legendColorizeRows: boolean
  legendHide: boolean
  binCount: number
  upperColumnName: string
  mainColumnName: string
  lowerColumnName: string
  yTickStart: number
  yTickStep: number
  xTotalTicks: number
  staticData: string
}

export default {
  title: 'Utilities',
} as Meta

type Story = StoryObj<UtilitiesArgs>

const cpuTable = getCPUTable()
const CPU_XY_COLUMN_OPTIONS = Object.keys(findXYColumns(cpuTable))
const STACKED_XY_COLUMN_OPTIONS = Object.keys(findXYColumns(stackedLineTable))
const CPU_FILL_OPTIONS = findStringColumns(cpuTable)
const STACKED_FILL_OPTIONS = findStringColumns(stackedLineTable)
const COLOR_SCHEME_KEY_OPTIONS = Object.keys(COLOR_SCHEME_OPTIONS)
const TIME_ZONE_OPTIONS = ['UTC', 'America/Los_Angeles', 'America/New_York']
const INTERPOLATION_OPTIONS: LineInterpolation[] = [
  'linear',
  'monotoneX',
  'monotoneY',
  'cubic',
  'step',
  'stepBefore',
  'stepAfter',
  'natural',
]
const POSITION_OPTIONS: LinePosition[] = ['overlaid', 'stacked']
const HOVER_DIMENSION_OPTIONS = ['auto', 'x', 'y', 'xy']

const baseArgs: Partial<UtilitiesArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  legendFont: '12px sans-serif',
  tickFont: '10px sans-serif',
  valueAxisLabel: 'foo',
  x: '_time',
  y: '_value',
  fill: ['cpu'],
  xScale: 'linear',
  yScale: 'linear',
  timeZone: 'UTC',
  timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
  interpolation: 'monotoneX',
  showAxes: true,
  lineWidth: 1,
  shadeBelow: false,
  shadeBelowOpacity: 0.1,
  hoverDimension: 'auto',
  legendOpacity: 1.0,
  legendOrientationThreshold: 5,
  legendColorizeRows: true,
}

const baseArgTypes: Partial<ArgTypes<UtilitiesArgs>> = {
  colorScheme: {
    control: {type: 'select', options: COLOR_SCHEME_KEY_OPTIONS},
  },
  legendFont: {
    control: {type: 'text'},
  },
  tickFont: {
    control: {type: 'text'},
  },
  valueAxisLabel: {
    control: {type: 'text'},
  },
  xScale: {
    control: {type: 'select', options: ['linear', 'log']},
  },
  yScale: {
    control: {type: 'select', options: ['linear', 'log']},
  },
  timeZone: {
    control: {type: 'select', options: TIME_ZONE_OPTIONS},
  },
  timeFormat: {
    control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]},
  },
  position: {
    control: {type: 'select', options: POSITION_OPTIONS},
  },
  interpolation: {
    control: {type: 'select', options: INTERPOLATION_OPTIONS},
  },
  hoverDimension: {
    control: {type: 'select', options: HOVER_DIMENSION_OPTIONS},
  },
  showAxes: {
    control: {type: 'boolean'},
  },
  lineWidth: {
    control: {type: 'number'},
  },
  lineOpacity: {
    control: {type: 'number'},
  },
  shadeOpacity: {
    control: {type: 'number'},
  },
  shadeBelow: {
    control: {type: 'boolean'},
  },
  shadeBelowOpacity: {
    control: {type: 'number'},
  },
  legendOpacity: {
    control: {type: 'range', min: 0, max: 1, step: 0.05},
  },
  legendOrientationThreshold: {
    control: {type: 'number'},
  },
  legendColorizeRows: {
    control: {type: 'boolean'},
  },
  legendHide: {
    control: {type: 'boolean'},
  },
  binCount: {
    control: {type: 'number'},
  },
  upperColumnName: {
    control: {type: 'text'},
  },
  mainColumnName: {
    control: {type: 'text'},
  },
  lowerColumnName: {
    control: {type: 'text'},
  },
  yTickStart: {
    control: {type: 'number'},
  },
  yTickStep: {
    control: {type: 'number'},
  },
  xTotalTicks: {
    control: {type: 'number'},
  },
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
}

const renderScreenshot = (config: Config) => {
  const axesCanvasRef: React.RefObject<HTMLCanvasElement> = React.createRef()
  const layerCanvasRef: React.RefObject<HTMLCanvasElement> = React.createRef()

  const plotEnv = new PlotEnv()
  plotEnv.config = config as any

  return (
    <PlotContainer>
      <button
        onClick={() => {
          if (layerCanvasRef.current && axesCanvasRef.current) {
            exportImage(layerCanvasRef.current, axesCanvasRef.current, {
              top: plotEnv.margins.top,
            }).then(image => window.open(image, '_blank'))
          }
        }}
      >
        Click to Open a screenshot in new Window/Tab
      </button>
      <Plot
        config={config}
        axesCanvasRef={axesCanvasRef}
        layerCanvasRef={layerCanvasRef}
      />
    </PlotContainer>
  )
}

export const ScreenshotAStackedLineLayer: Story = {
  render: args => {
    const {
      colorScheme,
      legendFont,
      tickFont,
      valueAxisLabel,
      x,
      y,
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
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args

    const config: Config = {
      table: stackedLineTable,
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
      tickFont,
      showAxes,
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill,
          position,
          interpolation,
          colors: COLOR_SCHEME_OPTIONS[colorScheme],
          lineWidth,
          hoverDimension,
          shadeBelow,
          shadeBelowOpacity,
        },
      ],
    }

    return renderScreenshot(config)
  },
  args: {
    ...baseArgs,
    position: 'stacked',
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: STACKED_XY_COLUMN_OPTIONS},
    },
    y: {
      control: {type: 'select', options: STACKED_XY_COLUMN_OPTIONS},
    },
    fill: {
      control: {type: 'multi-select', options: STACKED_FILL_OPTIONS},
    },
  },
}

export const ScreenshotALine: Story = {
  render: args => {
    const {
      colorScheme,
      legendFont,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      fill,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      legendHide,
    } = args

    const config: Config = {
      table: cpuTable,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val => `${Math.round(val)}%`,
      },
      legendFont,
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      legendHide,
      tickFont,
      showAxes,
      xScale,
      yScale,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill,
          interpolation,
          colors: COLOR_SCHEME_OPTIONS[colorScheme],
          lineWidth,
          hoverDimension,
          shadeBelow,
          shadeBelowOpacity,
        },
      ],
    }

    return renderScreenshot(config)
  },
  args: {
    ...baseArgs,
    legendHide: false,
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: CPU_XY_COLUMN_OPTIONS},
    },
    y: {
      control: {type: 'select', options: CPU_XY_COLUMN_OPTIONS},
    },
    fill: {
      control: {type: 'multi-select', options: CPU_FILL_OPTIONS},
    },
  },
}

export const ScreenshotAHeatmap: Story = {
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

    const config: Config = {
      table: cpuTable,
      legendFont,
      legendOrientationThreshold,
      legendColorizeRows,
      xScale,
      yScale,
      tickFont,
      showAxes,
      width: 500,
      height: 500,
      valueFormatters: {_value: val => `${Math.round(val)}%`},
      layers: [
        {
          type: 'heatmap',
          x,
          y,
          colors: COLOR_SCHEME_OPTIONS[colorScheme],
        },
      ],
    }

    return renderScreenshot(config)
  },
  args: {
    ...baseArgs,
    colorScheme: 'Magma',
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: CPU_XY_COLUMN_OPTIONS},
    },
    y: {
      control: {type: 'select', options: CPU_XY_COLUMN_OPTIONS},
    },
  },
}

export const ScreenshotAHistogram: Story = {
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

    const config: Config = {
      table: cpuTable,
      legendFont,
      legendOrientationThreshold,
      legendColorizeRows,
      tickFont,
      showAxes,
      xScale,
      yScale,
      valueFormatters: {[x]: val => `${Math.round(val)}%`},
      layers: [
        {
          type: 'histogram',
          x,
          fill: ['cpu'],
          colors: COLOR_SCHEME_OPTIONS[colorScheme],
          binCount,
        },
      ],
    }

    return renderScreenshot(config)
  },
  args: {
    ...baseArgs,
    x: '_value',
    binCount: 10,
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: CPU_XY_COLUMN_OPTIONS},
    },
  },
}

export const ScreenshotABandChart: Story = {
  render: args => {
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

    return renderScreenshot(config)
  },
  args: {
    ...baseArgs,
    valueAxisLabel: '',
    timeFormat: 'hh:mm a',
    lineWidth: 3,
    lineOpacity: 0.7,
    shadeOpacity: 0.3,
    legendOrientationThreshold: 15,
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    yTickStart: 0,
    yTickStep: 100,
    xTotalTicks: 20,
  },
  argTypes: baseArgTypes,
}

export const ScreenshotAStaticBandChart: Story = {
  render: args => {
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

    return renderScreenshot(config)
  },
  args: {
    ...baseArgs,
    staticData: cpu2,
    valueAxisLabel: '',
    timeFormat: 'hh:mm a',
    lineWidth: 3,
    lineOpacity: 0.7,
    shadeOpacity: 0.3,
    legendOrientationThreshold: 15,
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    xTotalTicks: 20,
  },
  argTypes: baseArgTypes,
}
