import * as React from 'react'
import type {ArgTypes, Meta, StoryObj} from '@storybook/react'
import {Config, Plot, fromFlux, timeFormatter} from '../../giraffe/src'
import type {LineInterpolation, LinePosition} from '../../giraffe/src'
import {
  binaryPrefixFormatter,
  siPrefixFormatter,
} from '../../giraffe/src/utils/formatters'
import {stackedLineTable} from './data/stackedLineLayer'
import {getRandomTable} from '../../giraffe/src/utils/fixtures/randomTable'

import {
  PlotContainer,
  COLOR_SCHEME_OPTIONS,
  TIME_FORMAT_OPTIONS,
  findStringColumns,
  findXYColumns,
  getCPUTable,
} from './helpers'

import {fluxCSVAirData, tooltipFalsyValues} from './data/fluxCSV'
import {
  formattableNumbersBillions,
  formattableNumbersMillions,
  formattableNumbersThousands,
  formattableNumbersTrillions,
} from './data/formatterCSV'

const maxValue = Math.random() * Math.floor(200)
const defaultXTickStart = new Date().getTime()

const cpuTable = getCPUTable()
const XY_COLUMN_OPTIONS = Object.keys(findXYColumns(cpuTable))
const CPU_FILL_OPTIONS = findStringColumns(cpuTable)
const STACKED_FILL_OPTIONS = findStringColumns(stackedLineTable)
const USER_DEFINED_TICKS_TABLE = getRandomTable(maxValue, false)
const USER_DEFINED_TICKS_FILL_OPTIONS = findStringColumns(
  USER_DEFINED_TICKS_TABLE
)

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

const DEFAULT_COLOR_MAPPING = `{
    "mappings": [
        {
            "_start": 1637779429742,
            "_stop": 1637783029742,
            "_field": "co",
            "_measurement": "airSensors",
            "sensor_id": "TLM0100",
            "result": "mean",
            "color": "#ffffff"
        },
        {
            "_start": 1637779429742,
            "_stop": 1637783029742,
            "_field": "co",
            "_measurement": "airSensors",
            "sensor_id": "TLM0101",
            "result": "mean",
            "color": "#ff0000"
        },
        {
            "_start": 1637779429742,
            "_stop": 1637783029742,
            "_field": "co",
            "_measurement": "airSensors",
            "sensor_id": "TLM0103",
            "result": "mean",
            "color": "#ffffff"
        },
        {
            "_start": 1637779429742,
            "_stop": 1637783029742,
            "_field": "co",
            "_measurement": "airSensors",
            "sensor_id": "TLM0102",
            "result": "mean",
            "color": "#ff0000"
        }
    ],
    "columnKeys": [
        "_start",
        "_stop",
        "_field",
        "_measurement",
        "sensor_id",
        "result"
    ]
}`

interface LineArgs {
  colorScheme: string
  legendFont: string
  tickFont: string
  valueAxisLabel?: string
  x: string
  y: string
  fill?: string
  position?: LinePosition
  interpolation: LineInterpolation
  xScale: string
  yScale: string
  showAxes: boolean
  lineWidth: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  hoverDimension: string
  timeZone: string
  timeFormat: string
  legendOpacity: number
  legendOrientationThreshold: number
  legendColorizeRows: boolean
  legendHide?: boolean
  lines?: number
  fillColumnsCount?: number
  fillColumnNameLength?: number
  fixedWidthText?: string
  fixedHeightText?: string
  yDomainMin?: number
  yDomainMax?: number
  includeYDomainZoom?: boolean
  includeOnSetYDomain?: boolean
  includeOnResetYDomain?: boolean
  includeNegativeNumbers?: boolean
  xTickStart?: number
  xTickStep?: number
  xTotalTicks?: number
  yTickStartText?: string
  yTickStepText?: string
  yTotalTicks?: number
  staticData?: string
  csv?: string
  colorMap?: string
  formattableNumbersCSV?: string
  format?: boolean
  base?: string
  significantDigits?: number
  trimZeros?: boolean
  prefix?: string
  suffix?: string
}

export default {
  title: 'Line',
} as Meta

type Story = StoryObj<LineArgs>

const getColors = (colorScheme: string) =>
  COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS]

const baseArgs = {
  colorScheme: 'Nineteen Eighty Four',
  legendFont: '12px sans-serif',
  tickFont: '10px sans-serif',
  x: '_time',
  y: '_value',
  xScale: 'linear',
  yScale: 'linear',
  timeZone: 'UTC',
  timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
  interpolation: 'monotoneX' as LineInterpolation,
  showAxes: true,
  lineWidth: 1,
  shadeBelow: false,
  shadeBelowOpacity: 0.1,
  hoverDimension: 'auto',
  legendOpacity: 1,
  legendOrientationThreshold: 5,
  legendColorizeRows: true,
}

const baseArgTypes: Partial<ArgTypes<LineArgs>> = {
  colorScheme: {
    control: {type: 'select', options: COLOR_SCHEME_KEY_OPTIONS},
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
  interpolation: {
    control: {type: 'select', options: INTERPOLATION_OPTIONS},
  },
  showAxes: {
    control: {type: 'boolean'},
  },
  lineWidth: {
    control: {type: 'number'},
  },
  shadeBelow: {
    control: {type: 'boolean'},
  },
  shadeBelowOpacity: {
    control: {type: 'number'},
  },
  hoverDimension: {
    control: {type: 'select', options: HOVER_DIMENSION_OPTIONS},
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
  position: {
    control: {type: 'select', options: POSITION_OPTIONS},
  },
}

export const Line: Story = {
  render: args => {
    const {
      colorScheme,
      legendFont,
      tickFont,
      x,
      y,
      fill,
      xScale,
      yScale,
      timeZone,
      timeFormat,
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
          fill: [fill],
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    fill: 'cpu',
    legendHide: false,
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: XY_COLUMN_OPTIONS},
    },
    y: {
      control: {type: 'select', options: XY_COLUMN_OPTIONS},
    },
    fill: {
      control: {type: 'select', options: CPU_FILL_OPTIONS},
    },
  },
}

export const StackedLineLayer: Story = {
  render: args => {
    const {
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
          fill: [fill],
          position,
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    fill: 'cpu',
    valueAxisLabel: 'foo',
    position: 'stacked',
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: XY_COLUMN_OPTIONS},
    },
    y: {
      control: {type: 'select', options: XY_COLUMN_OPTIONS},
    },
    fill: {
      control: {type: 'select', options: STACKED_FILL_OPTIONS},
    },
  },
}

export const YDomainControlledMode: Story = {
  render: args => {
    const {
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
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      lines,
      fillColumnsCount,
      fillColumnNameLength,
      fixedWidthText,
      fixedHeightText,
      yDomainMin,
      yDomainMax,
      includeYDomainZoom,
      includeOnSetYDomain,
      includeOnResetYDomain,
      includeNegativeNumbers,
    } = args

    const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
    const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)

    const fixedPlotSize =
      fixedHeight > 0 && fixedWidth > 0
        ? {height: fixedHeight, width: fixedWidth}
        : {}

    const isValidYDomain = yDomainMin > 0 && yDomainMax > 0
    const table = getRandomTable(
      maxValue,
      includeNegativeNumbers,
      lines * 20,
      20,
      fillColumnsCount,
      fillColumnNameLength
    )

    const config: Config = {
      ...fixedPlotSize,
      table,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val =>
          `${val.toFixed(2)}${
            valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
          }`,
      },
      yDomain: isValidYDomain ? [yDomainMin, yDomainMax] : null,
      includeYDomainZoom,
      onSetYDomain: includeOnSetYDomain ? () => {} : null,
      onResetYDomain: includeOnResetYDomain ? () => {} : null,
      xScale,
      yScale,
      tickFont,
      legendFont,
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      showAxes,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill: fill
            ? fill.split(',').map(col => col.trim())
            : findStringColumns(table),
          position,
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    fill: '',
    valueAxisLabel: 'foo',
    position: 'overlaid',
    lines: 4,
    fillColumnsCount: 5,
    fillColumnNameLength: 4,
    fixedWidthText: '',
    fixedHeightText: '',
    yDomainMin: -1,
    yDomainMax: -1,
    includeYDomainZoom: false,
    includeOnSetYDomain: false,
    includeOnResetYDomain: false,
    includeNegativeNumbers: false,
  },
  argTypes: {
    ...baseArgTypes,
    lines: {
      control: {type: 'number'},
    },
    fillColumnsCount: {
      control: {type: 'number'},
    },
    fillColumnNameLength: {
      control: {type: 'number'},
    },
    yDomainMin: {
      control: {type: 'number'},
    },
    yDomainMax: {
      control: {type: 'number'},
    },
    includeYDomainZoom: {
      control: {type: 'boolean'},
    },
    includeOnSetYDomain: {
      control: {type: 'boolean'},
    },
    includeOnResetYDomain: {
      control: {type: 'boolean'},
    },
    includeNegativeNumbers: {
      control: {type: 'boolean'},
    },
  },
}

export const UserDefinedTicks: Story = {
  render: args => {
    const {
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
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      xTickStart,
      xTickStep,
      xTotalTicks,
      yTickStartText,
      yTickStepText,
      yTotalTicks,
    } = args

    const table = getRandomTable(maxValue, false)
    const yTickStart = !yTickStartText ? null : Number(yTickStartText)
    const yTickStep = !yTickStepText ? null : Number(yTickStepText)

    const config: Config = {
      table,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val =>
          `${val.toFixed(2)}${
            valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
          }`,
      },
      xScale,
      yScale,
      xTickStart,
      xTickStep,
      xTotalTicks,
      yTickStart,
      yTickStep,
      yTotalTicks,
      legendFont,
      tickFont,
      legendOpacity,
      legendOrientationThreshold,
      legendColorizeRows,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill: [fill],
          position,
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    fill: 'cpu',
    valueAxisLabel: 'foo',
    position: 'overlaid',
    timeFormat: 'HH:mm:ss',
    xTickStart: defaultXTickStart,
    xTickStep: 200_000,
    xTotalTicks: 5,
    yTickStartText: '',
    yTickStepText: '',
    yTotalTicks: 8,
  },
  argTypes: {
    ...baseArgTypes,
    x: {
      control: {type: 'select', options: XY_COLUMN_OPTIONS},
    },
    y: {
      control: {type: 'select', options: XY_COLUMN_OPTIONS},
    },
    fill: {
      control: {type: 'select', options: USER_DEFINED_TICKS_FILL_OPTIONS},
    },
    xTickStart: {
      control: {type: 'number'},
    },
    xTickStep: {
      control: {type: 'number'},
    },
    xTotalTicks: {
      control: {type: 'number'},
    },
    yTotalTicks: {
      control: {type: 'number'},
    },
  },
}

export const StaticCSV: Story = {
  render: args => {
    const {
      staticData,
      colorScheme,
      legendFont,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args

    const table = fromFlux(staticData).table

    const config: Config = {
      fluxResponse: staticData,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val => `${Math.round(val)}`,
      },
      legendFont,
      tickFont,
      showAxes,
      xScale,
      yScale,
      legendOrientationThreshold,
      legendColorizeRows,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill: findStringColumns(table),
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    staticData: tooltipFalsyValues,
  },
  argTypes: {
    ...baseArgTypes,
    staticData: {
      control: {type: 'select', options: [tooltipFalsyValues]},
    },
  },
}

export const CustomCSV: Story = {
  render: args => {
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
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args

    const table = fromFlux(csv).table

    const config: Config = {
      fluxResponse: csv,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val => `${Math.round(val)}`,
      },
      legendFont,
      tickFont,
      showAxes,
      xScale,
      yScale,
      legendOrientationThreshold,
      legendColorizeRows,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill: findStringColumns(table),
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    csv: '',
  },
  argTypes: {
    ...baseArgTypes,
  },
}

export const StaticCSVWithColorMapping: Story = {
  render: args => {
    const {
      staticData,
      colorScheme,
      colorMap,
      legendFont,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args

    const table = fromFlux(staticData).table

    const config: Config = {
      fluxResponse: staticData,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val => `${Math.round(val)}`,
      },
      legendFont,
      tickFont,
      showAxes,
      xScale,
      yScale,
      legendOrientationThreshold,
      legendColorizeRows,
      staticLegend: {},
      layers: [
        {
          type: 'line',
          x,
          y,
          fill: findStringColumns(table),
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
          colorMapping: JSON.parse(colorMap),
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
    ...baseArgs,
    staticData: fluxCSVAirData,
    colorMap: DEFAULT_COLOR_MAPPING,
  },
  argTypes: {
    ...baseArgTypes,
    staticData: {
      control: {type: 'select', options: [fluxCSVAirData]},
    },
  },
}

export const InfluxDataCloudUINumberFormatter: Story = {
  render: args => {
    const {
      formattableNumbersCSV,
      format,
      base,
      significantDigits,
      trimZeros,
      prefix,
      suffix,
      colorScheme,
      legendFont,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOrientationThreshold,
      legendColorizeRows,
    } = args

    const table = fromFlux(formattableNumbersCSV).table

    const config: Config = {
      fluxResponse: formattableNumbersCSV,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value:
          base === '2'
            ? binaryPrefixFormatter({
                prefix,
                suffix,
                significantDigits: significantDigits ?? 0,
                trimZeros,
                format,
              })
            : siPrefixFormatter({
                prefix,
                suffix,
                significantDigits: significantDigits ?? 0,
                trimZeros,
                format,
              }),
      },
      legendFont,
      tickFont,
      showAxes,
      xScale,
      yScale,
      legendOrientationThreshold,
      legendColorizeRows,
      layers: [
        {
          type: 'line',
          x,
          y,
          fill: findStringColumns(table),
          interpolation,
          colors: getColors(colorScheme),
          lineWidth,
          hoverDimension: hoverDimension as 'auto' | 'x' | 'y' | 'xy',
          shadeBelow,
          shadeBelowOpacity,
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
    ...baseArgs,
    formattableNumbersCSV: formattableNumbersThousands,
    format: true,
    base: '',
    significantDigits: 6,
    trimZeros: true,
    prefix: '',
    suffix: '',
  },
  argTypes: {
    ...baseArgTypes,
    formattableNumbersCSV: {
      control: {
        type: 'select',
        options: [
          formattableNumbersThousands,
          formattableNumbersMillions,
          formattableNumbersBillions,
          formattableNumbersTrillions,
        ],
      },
    },
    format: {
      control: {type: 'boolean'},
    },
    base: {
      control: {type: 'select', options: ['2', '10', '']},
    },
    significantDigits: {
      control: {type: 'number'},
    },
    trimZeros: {
      control: {type: 'boolean'},
    },
  },
}
