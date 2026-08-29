import * as React from 'react'
import type {Meta, StoryObj, ArgTypes} from '@storybook/react'

import {Config, Plot, fromFlux, timeFormatter} from '../../giraffe/src'
import {getRandomTable} from '../../giraffe/src/utils/fixtures/randomTable'

import {
  PlotContainer,
  findStringColumns,
  findXYColumns,
  TIME_FORMAT_OPTIONS,
  COLOR_SCHEME_OPTIONS,
} from './helpers'
import {
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
} from './data/bandCSV'
import {columnAlignment} from './data/staticLegend'

const maxValue = Math.random() * Math.floor(200)
let callCounter = 0
const STATIC_LEGEND_HEIGHT_RATIO_NOT_SET = 0

const columnAlignmentTable = fromFlux(columnAlignment).table
const columnAlignmentXYOptions = Object.keys(
  findXYColumns(columnAlignmentTable)
)
const columnAlignmentStringColumns = findStringColumns(columnAlignmentTable)

const STATIC_CSV_OPTIONS: Array<{label: string; value: string}> = [
  {label: 'colors6', value: colors6},
  {label: 'cpu1', value: cpu1},
  {label: 'cpu2', value: cpu2},
  {label: 'graphEdge1', value: graphEdge1},
  {label: 'hoverAlignment1', value: hoverAlignment1},
  {label: 'hoverAlignment2', value: hoverAlignment2},
  {label: 'mem1', value: mem1},
  {label: 'mem2', value: mem2},
  {label: 'noLowerAndUpper', value: noLowerAndUpper},
  {label: 'same3', value: same3},
]

const LINE_POSITION_OPTIONS = ['stacked', 'overlaid']
const HOVER_DIMENSION_OPTIONS = ['auto', 'x', 'y', 'xy']
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
const SCALE_OPTIONS = ['linear', 'log']
const TIME_ZONE_OPTIONS = ['UTC', 'America/Los_Angeles', 'America/New_York']
const COLOR_SCHEME_KEYS = Object.keys(COLOR_SCHEME_OPTIONS)

interface Args {
  lines: number
  fillColumnsCount: number
  fillColumnNameLength: number
  staticLegendHeightRatio: number
  fixedWidth: string
  fixedHeight: string
  legendHide: boolean
  staticLegendHide: boolean
  includeNegativeNumbers: boolean
  position: 'stacked' | 'overlaid'
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  legendOrientationThreshold: number
  staticLegendOrientationThreshold: number
  legendColorizeRows: boolean
  staticLegendColorizeRows: boolean
  legendFont: string
  staticLegendFont: string
  staticLegendBorder: string
  staticLegendBackgroundColor: string
  tickFont: string
  x: string
  y: string
  valueAxisLabel: string
  xScale: 'linear' | 'log'
  yScale: 'linear' | 'log'
  timeZone: 'UTC' | 'America/Los_Angeles' | 'America/New_York'
  timeFormat: (typeof TIME_FORMAT_OPTIONS)[number]
  fill: string | string[]
  interpolation:
    | 'linear'
    | 'monotoneX'
    | 'monotoneY'
    | 'cubic'
    | 'step'
    | 'stepBefore'
    | 'stepAfter'
    | 'natural'
  showAxes: boolean
  lineWidth: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  hoverDimension: 'auto' | 'x' | 'y' | 'xy'
  legendOpacity: number
  fillColumns: string
  staticData: string
  lineOpacity: number
  shadeOpacity: number
  upperColumnName: string
  mainColumnName: string
  lowerColumnName: string
  csv: string
}

export default {
  title: 'Static Legend',
} as Meta

type Story = StoryObj<Args>

const sharedArgTypes: Partial<ArgTypes<Args>> = {
  staticLegendHeightRatio: {
    control: {type: 'range', min: 0, max: 1, step: 0.01},
  },
  legendOpacity: {
    control: {type: 'range', min: 0, max: 1, step: 0.05},
  },
  legendOrientationThreshold: {
    control: {type: 'number'},
  },
  staticLegendOrientationThreshold: {
    control: {type: 'number'},
  },
  lineWidth: {
    control: {type: 'number'},
  },
  shadeBelowOpacity: {
    control: {type: 'number'},
  },
  legendHide: {
    control: {type: 'boolean'},
  },
  staticLegendHide: {
    control: {type: 'boolean'},
  },
  legendColorizeRows: {
    control: {type: 'boolean'},
  },
  staticLegendColorizeRows: {
    control: {type: 'boolean'},
  },
  shadeBelow: {
    control: {type: 'boolean'},
  },
  showAxes: {
    control: {type: 'boolean'},
  },
  position: {
    control: {type: 'select', options: LINE_POSITION_OPTIONS},
  },
  colorScheme: {
    control: {type: 'select', options: COLOR_SCHEME_KEYS},
  },
  xScale: {
    control: {type: 'select', options: SCALE_OPTIONS},
  },
  yScale: {
    control: {type: 'select', options: SCALE_OPTIONS},
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
  hoverDimension: {
    control: {type: 'select', options: HOVER_DIMENSION_OPTIONS},
  },
}

const randomTableArgTypes: Partial<ArgTypes<Args>> = {
  ...sharedArgTypes,
  lines: {
    control: {type: 'number'},
  },
  fillColumnsCount: {
    control: {type: 'number'},
  },
  fillColumnNameLength: {
    control: {type: 'number'},
  },
  includeNegativeNumbers: {
    control: {type: 'boolean'},
  },
}

const lineGraphRender = (args: Args) => {
  const {
    lines,
    fillColumnsCount,
    fillColumnNameLength,
    staticLegendHeightRatio,
    fixedWidth: fixedWidthText,
    fixedHeight: fixedHeightText,
    legendHide,
    staticLegendHide,
    includeNegativeNumbers,
    position,
    colorScheme,
    legendOrientationThreshold,
    staticLegendOrientationThreshold,
    legendColorizeRows,
    staticLegendColorizeRows,
    legendFont,
    staticLegendFont,
    staticLegendBorder,
    staticLegendBackgroundColor,
    tickFont,
    x,
    y,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    fill: fillArg,
    interpolation,
    showAxes,
    lineWidth,
    shadeBelow,
    shadeBelowOpacity,
    hoverDimension,
    legendOpacity,
  } = args

  const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
  const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)
  const fixedPlotSize = {}
  if (fixedHeight > 0 && fixedWidth > 0) {
    fixedPlotSize['height'] = fixedHeight
    fixedPlotSize['width'] = fixedWidth
  }
  const table = getRandomTable(
    maxValue,
    includeNegativeNumbers,
    lines * 20,
    20,
    fillColumnsCount,
    fillColumnNameLength
  )
  const fill = Array.isArray(fillArg)
    ? fillArg
    : fillArg !== ''
      ? fillArg.split(',')
      : findStringColumns(table)

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
    xScale,
    yScale,
    tickFont,
    showAxes,
    legendColorizeRows,
    legendFont,
    legendHide,
    legendOpacity,
    legendOrientationThreshold,
    staticLegend: {
      backgroundColor: staticLegendBackgroundColor,
      border: staticLegendBorder,
      colorizeRows: staticLegendColorizeRows,
      font: staticLegendFont || legendFont,
      heightRatio: staticLegendHeightRatio,
      hide: staticLegendHide,
      orientationThreshold: staticLegendOrientationThreshold,
    },
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

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const LineGraphWithRandomFillColumnNames: Story = {
  render: lineGraphRender,
  args: {
    lines: 4,
    fillColumnsCount: 5,
    fillColumnNameLength: 4,
    staticLegendHeightRatio: 0.2,
    fixedWidth: '',
    fixedHeight: '',
    legendHide: false,
    staticLegendHide: false,
    includeNegativeNumbers: false,
    position: 'overlaid',
    colorScheme: 'Nineteen Eighty Four',
    legendOrientationThreshold: 20,
    staticLegendOrientationThreshold: 20,
    legendColorizeRows: true,
    staticLegendColorizeRows: true,
    legendFont: '12px sans-serif',
    staticLegendFont: '12px sans-serif',
    staticLegendBorder: '1px solid orange',
    staticLegendBackgroundColor: 'transparent',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    valueAxisLabel: 'foo',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    fill: '',
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 1,
    shadeBelow: false,
    shadeBelowOpacity: 0.1,
    hoverDimension: 'auto',
    legendOpacity: 1.0,
  },
  argTypes: randomTableArgTypes,
}

export const LineGraphWithRandomCustomFillColumns: Story = {
  render: (args: Args) => {
    const {
      lines,
      staticLegendHeightRatio,
      fixedWidth: fixedWidthText,
      fixedHeight: fixedHeightText,
      legendHide,
      staticLegendHide,
      includeNegativeNumbers,
      position,
      colorScheme,
      legendOrientationThreshold,
      staticLegendOrientationThreshold,
      legendColorizeRows,
      staticLegendColorizeRows,
      legendFont,
      staticLegendFont,
      staticLegendBorder,
      staticLegendBackgroundColor,
      tickFont,
      x,
      y,
      valueAxisLabel,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      fill: fillArg,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOpacity,
      fillColumns,
    } = args
    const fillColumnNames = fillColumns.split(',')

    const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
    const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)
    const fixedPlotSize = {}
    if (fixedHeight > 0 && fixedWidth > 0) {
      fixedPlotSize['height'] = fixedHeight
      fixedPlotSize['width'] = fixedWidth
    }
    const table = getRandomTable(
      maxValue,
      includeNegativeNumbers,
      20 * lines,
      20,
      fillColumnNames
    )
    const fill = Array.isArray(fillArg)
      ? fillArg
      : fillArg !== ''
        ? fillArg.split(',')
        : findStringColumns(table)

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
      xScale,
      yScale,
      tickFont,
      showAxes,
      legendColorizeRows,
      legendFont,
      legendHide,
      legendOpacity,
      legendOrientationThreshold,
      staticLegend: {
        backgroundColor: staticLegendBackgroundColor,
        border: staticLegendBorder,
        colorizeRows: staticLegendColorizeRows,
        font: staticLegendFont || legendFont,
        heightRatio: staticLegendHeightRatio,
        hide: staticLegendHide,
        orientationThreshold: staticLegendOrientationThreshold,
      },
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

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    lines: 4,
    fillColumns: 'cluster,host,machine,cpu',
    staticLegendHeightRatio: 0.2,
    fixedWidth: '',
    fixedHeight: '',
    legendHide: false,
    staticLegendHide: false,
    includeNegativeNumbers: false,
    position: 'overlaid',
    colorScheme: 'Nineteen Eighty Four',
    legendOrientationThreshold: 20,
    staticLegendOrientationThreshold: 20,
    legendColorizeRows: true,
    staticLegendColorizeRows: true,
    legendFont: '12px sans-serif',
    staticLegendFont: '12px sans-serif',
    staticLegendBorder: '1px solid orange',
    staticLegendBackgroundColor: 'transparent',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    valueAxisLabel: 'foo',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    fill: '',
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 1,
    shadeBelow: false,
    shadeBelowOpacity: 0.1,
    hoverDimension: 'auto',
    legendOpacity: 1.0,
  },
  argTypes: randomTableArgTypes,
}

export const BandPlotWithStaticCSV: Story = {
  render: (args: Args) => {
    const {
      staticData,
      staticLegendHeightRatio,
      fixedWidth: fixedWidthText,
      fixedHeight: fixedHeightText,
      legendHide,
      staticLegendHide,
      colorScheme,
      legendOrientationThreshold,
      staticLegendOrientationThreshold,
      legendColorizeRows,
      staticLegendColorizeRows,
      legendFont,
      staticLegendFont,
      staticLegendBorder,
      staticLegendBackgroundColor,
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
    } = args

    const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
    const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)
    const fixedPlotSize = {}
    if (fixedHeight > 0 && fixedWidth > 0) {
      fixedPlotSize['height'] = fixedHeight
      fixedPlotSize['width'] = fixedWidth
    }
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
      tickFont,
      showAxes,
      legendColorizeRows,
      legendFont,
      legendHide,
      legendOpacity,
      legendOrientationThreshold,
      staticLegend: {
        backgroundColor: staticLegendBackgroundColor,
        border: staticLegendBorder,
        colorizeRows: staticLegendColorizeRows,
        font: staticLegendFont || legendFont,
        heightRatio: staticLegendHeightRatio,
        hide: staticLegendHide,
        orientationThreshold: staticLegendOrientationThreshold,
      },
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
  },
  args: {
    staticData: cpu2,
    staticLegendHeightRatio: 0.2,
    fixedWidth: '',
    fixedHeight: '',
    legendHide: false,
    staticLegendHide: false,
    colorScheme: 'Nineteen Eighty Four',
    legendOrientationThreshold: 20,
    staticLegendOrientationThreshold: 20,
    legendColorizeRows: true,
    staticLegendColorizeRows: true,
    legendFont: '12px sans-serif',
    staticLegendFont: '12px sans-serif',
    staticLegendBorder: '1px solid orange',
    staticLegendBackgroundColor: 'transparent',
    tickFont: '10px sans-serif',
    valueAxisLabel: '',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'hh:mm a',
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 3,
    lineOpacity: 0.7,
    shadeOpacity: 0.3,
    hoverDimension: 'auto',
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    legendOpacity: 1.0,
  },
  argTypes: {
    ...sharedArgTypes,
    staticData: {
      control: {type: 'select', options: STATIC_CSV_OPTIONS},
    },
    lineOpacity: {
      control: {type: 'number'},
    },
    shadeOpacity: {
      control: {type: 'number'},
    },
  },
}

export const ColumnAlignment: Story = {
  render: (args: Args) => {
    const {
      staticLegendHeightRatio,
      fixedWidth: fixedWidthText,
      fixedHeight: fixedHeightText,
      legendHide,
      staticLegendHide,
      position,
      colorScheme,
      legendOrientationThreshold,
      staticLegendOrientationThreshold,
      legendColorizeRows,
      staticLegendColorizeRows,
      legendFont,
      staticLegendFont,
      staticLegendBorder,
      staticLegendBackgroundColor,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      fill: fillArg,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOpacity,
    } = args

    const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
    const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)
    const fixedPlotSize = {}
    if (fixedHeight > 0 && fixedWidth > 0) {
      fixedPlotSize['height'] = fixedHeight
      fixedPlotSize['width'] = fixedWidth
    }
    const fill = Array.isArray(fillArg)
      ? fillArg
      : fillArg !== ''
        ? fillArg.split(',')
        : findStringColumns(columnAlignmentTable)

    const config: Config = {
      ...fixedPlotSize,
      fluxResponse: columnAlignment,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
      },
      yDomain: [0, 5],
      onResetYDomain: () => {},
      onSetYDomain: () => {},
      xScale,
      yScale,
      tickFont,
      showAxes,
      legendColorizeRows,
      legendFont,
      legendHide,
      legendOpacity,
      legendOrientationThreshold,
      staticLegend: {
        backgroundColor: staticLegendBackgroundColor,
        border: staticLegendBorder,
        colorizeRows: staticLegendColorizeRows,
        font: staticLegendFont || legendFont,
        heightRatio: staticLegendHeightRatio,
        hide: staticLegendHide,
        orientationThreshold: staticLegendOrientationThreshold,
      },
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

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    staticLegendHeightRatio: 0.2,
    fixedWidth: '',
    fixedHeight: '',
    legendHide: false,
    staticLegendHide: false,
    position: 'overlaid',
    colorScheme: 'Nineteen Eighty Four',
    legendOrientationThreshold: 20,
    staticLegendOrientationThreshold: 20,
    legendColorizeRows: true,
    staticLegendColorizeRows: true,
    legendFont: '12px sans-serif',
    staticLegendFont: '12px sans-serif',
    staticLegendBorder: '1px solid orange',
    staticLegendBackgroundColor: 'transparent',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    fill: columnAlignmentStringColumns,
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 1,
    shadeBelow: false,
    shadeBelowOpacity: 0.1,
    hoverDimension: 'auto',
    legendOpacity: 1.0,
  },
  argTypes: {
    ...sharedArgTypes,
    x: {
      control: {type: 'select', options: columnAlignmentXYOptions},
    },
    y: {
      control: {type: 'select', options: columnAlignmentXYOptions},
    },
    fill: {
      control: {type: 'multi-select', options: columnAlignmentStringColumns},
    },
  },
}

export const CustomCSV: Story = {
  render: (args: Args) => {
    const {
      csv,
      staticLegendHeightRatio,
      fixedWidth: fixedWidthText,
      fixedHeight: fixedHeightText,
      legendHide,
      staticLegendHide,
      position,
      colorScheme,
      legendOrientationThreshold,
      staticLegendOrientationThreshold,
      legendColorizeRows,
      staticLegendColorizeRows,
      legendFont,
      staticLegendFont,
      staticLegendBorder,
      staticLegendBackgroundColor,
      tickFont,
      x,
      y,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      fill: fillArg,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOpacity,
    } = args

    const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
    const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)
    const fixedPlotSize = {}
    if (fixedHeight > 0 && fixedWidth > 0) {
      fixedPlotSize['height'] = fixedHeight
      fixedPlotSize['width'] = fixedWidth
    }
    const table = fromFlux(csv).table
    const fill = Array.isArray(fillArg)
      ? fillArg
      : fillArg !== ''
        ? fillArg.split(',')
        : findStringColumns(table)

    const config: Config = {
      ...fixedPlotSize,
      fluxResponse: csv,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
      },
      xScale,
      yScale,
      tickFont,
      showAxes,
      legendColorizeRows,
      legendFont,
      legendHide,
      legendOpacity,
      legendOrientationThreshold,
      staticLegend: {
        backgroundColor: staticLegendBackgroundColor,
        border: staticLegendBorder,
        colorizeRows: staticLegendColorizeRows,
        font: staticLegendFont || legendFont,
        heightRatio: staticLegendHeightRatio,
        hide: staticLegendHide,
        orientationThreshold: staticLegendOrientationThreshold,
      },
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

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    csv: '',
    staticLegendHeightRatio: 0.2,
    fixedWidth: '',
    fixedHeight: '',
    legendHide: false,
    staticLegendHide: false,
    position: 'overlaid',
    colorScheme: 'Nineteen Eighty Four',
    legendOrientationThreshold: 20,
    staticLegendOrientationThreshold: 20,
    legendColorizeRows: true,
    staticLegendColorizeRows: true,
    legendFont: '12px sans-serif',
    staticLegendFont: '12px sans-serif',
    staticLegendBorder: '1px solid orange',
    staticLegendBackgroundColor: 'transparent',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    fill: '',
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 1,
    shadeBelow: false,
    shadeBelowOpacity: 0.1,
    hoverDimension: 'auto',
    legendOpacity: 1.0,
  },
  argTypes: sharedArgTypes,
}

export const RenderEffect: Story = {
  render: (args: Args) => {
    const {
      lines,
      fillColumnsCount,
      fillColumnNameLength,
      staticLegendHeightRatio,
      fixedWidth: fixedWidthText,
      fixedHeight: fixedHeightText,
      legendHide,
      staticLegendHide,
      includeNegativeNumbers,
      position,
      colorScheme,
      legendOrientationThreshold,
      staticLegendOrientationThreshold,
      legendColorizeRows,
      staticLegendColorizeRows,
      legendFont,
      staticLegendFont,
      staticLegendBorder,
      staticLegendBackgroundColor,
      tickFont,
      x,
      y,
      valueAxisLabel,
      xScale,
      yScale,
      timeZone,
      timeFormat,
      fill: fillArg,
      interpolation,
      showAxes,
      lineWidth,
      shadeBelow,
      shadeBelowOpacity,
      hoverDimension,
      legendOpacity,
    } = args

    const fixedWidth = !fixedWidthText ? -1 : Number(fixedWidthText)
    const fixedHeight = !fixedHeightText ? -1 : Number(fixedHeightText)
    const fixedPlotSize = {}
    if (fixedHeight > 0 && fixedWidth > 0) {
      fixedPlotSize['height'] = fixedHeight
      fixedPlotSize['width'] = fixedWidth
    }
    const table = getRandomTable(
      maxValue,
      includeNegativeNumbers,
      lines * 20,
      20,
      fillColumnsCount,
      fillColumnNameLength
    )
    const fill = Array.isArray(fillArg)
      ? fillArg
      : fillArg !== ''
        ? fillArg.split(',')
        : findStringColumns(table)

    const renderEffect = args => {
      if (staticLegendHeightRatio === STATIC_LEGEND_HEIGHT_RATIO_NOT_SET) {
        callCounter += 1

        // eslint-disable-next-line
        console.log('staticLegend.renderEffect: call counter', callCounter)
        // eslint-disable-next-line
        console.log('staticLegend.renderEffect: arguments', args)
        // eslint-disable-next-line
        console.log(
          'staticLegend.renderEffect: heightRatio',
          staticLegendHeightRatio
        )
      }
    }

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
      xScale,
      yScale,
      tickFont,
      showAxes,
      legendColorizeRows,
      legendFont,
      legendHide,
      legendOpacity,
      legendOrientationThreshold,
      staticLegend: {
        backgroundColor: staticLegendBackgroundColor,
        border: staticLegendBorder,
        colorizeRows: staticLegendColorizeRows,
        font: staticLegendFont || legendFont,
        heightRatio: staticLegendHeightRatio,
        hide: staticLegendHide,
        orientationThreshold: staticLegendOrientationThreshold,
        renderEffect,
      },
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

    return (
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    )
  },
  args: {
    lines: 4,
    fillColumnsCount: 7,
    fillColumnNameLength: 4,
    staticLegendHeightRatio: STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
    fixedWidth: '',
    fixedHeight: '',
    legendHide: false,
    staticLegendHide: false,
    includeNegativeNumbers: false,
    position: 'overlaid',
    colorScheme: 'Nineteen Eighty Four',
    legendOrientationThreshold: 20,
    staticLegendOrientationThreshold: 20,
    legendColorizeRows: true,
    staticLegendColorizeRows: true,
    legendFont: '12px sans-serif',
    staticLegendFont: '12px sans-serif',
    staticLegendBorder: '1px solid orange',
    staticLegendBackgroundColor: 'transparent',
    tickFont: '10px sans-serif',
    x: '_time',
    y: '_value',
    valueAxisLabel: 'foo',
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'UTC',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    fill: '',
    interpolation: 'monotoneX',
    showAxes: true,
    lineWidth: 1,
    shadeBelow: false,
    shadeBelowOpacity: 0.1,
    hoverDimension: 'auto',
    legendOpacity: 1.0,
  },
  argTypes: randomTableArgTypes,
}
