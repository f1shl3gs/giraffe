import type {Meta, StoryObj} from '@storybook/react'
import {Line} from 'components/Line'
import type {LineProps} from 'components/Line'
import type {PlotConfig} from 'components/Plot'
import {Plot} from 'components/Plot'
import type {SingleStatProps} from 'components/SingleStat'
import {SingleStat as SingleStatComponent} from 'components/SingleStat'
import {
  COLOR_SCHEME_OPTIONS,
  findStringColumns,
  findXYColumns,
  StoryFrame,
} from 'stories/helpers'
import {LASER, SINGLE_STAT_SVG_NO_USER_SELECT} from 'style/singleStatStyles'
import type {LineHoverDimension, LineInterpolation} from 'types'
import {timeFormatter} from 'utils/formatters'
import {fromFlux} from 'utils/fromFlux'
import {newTable} from 'utils/newTable'

const numberOfRecords = 20
const recordsPerLine = 20
const now = Date.now()

const singleStatTable = newTable(numberOfRecords)
  .addColumn(
    '_time',
    'dateTime:RFC3339',
    'time',
    Array.from(
      {length: numberOfRecords},
      (_, i) => now + (i % recordsPerLine) * 1000 * 60,
    ),
  )
  .addColumn(
    '_value',
    'system',
    'number',
    Array.from({length: numberOfRecords}, () => Math.random() * Math.floor(10)),
  )
  .addColumn(
    'cpu',
    'string',
    'string',
    Array.from(
      {length: numberOfRecords},
      (_, i) => `cpu${Math.floor(i / recordsPerLine)}`,
    ),
  )

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
  interpolation: LineInterpolation
  showAxes: boolean
  lineWidth: number
  shadeBelow: boolean
  shadeBelowOpacity: number
  hoverDimension: LineHoverDimension | 'auto'
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
    const singleStatProps: Omit<SingleStatProps, 'table'> = {
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
    }
    return (
      <StoryFrame>
        <SingleStatComponent table={singleStatTable} {...singleStatProps} />
      </StoryFrame>
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
    const singleStatProps: Omit<SingleStatProps, 'table'> = {
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
    }
    return (
      <StoryFrame>
        <SingleStatComponent table={fromFlux(csv).table} {...singleStatProps} />
      </StoryFrame>
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

    const lineConfig: LineProps = {
      fill,
      interpolation,
      colors,
      lineWidth,
      hoverDimension,
      shadeBelow,
      shadeBelowOpacity,
    }

    const config: PlotConfig = {
      xColumn: x,
      yColumn: y,
      valueFormatters: {
        _time: timeFormatter({timeZone, format: timeFormat}),
        _value: val =>
          `${val.toFixed(2)}${
            valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
          }`,
      },
      xScale,
      yScale,
      legend: {
        font: legendFont,
        orientationThreshold: legendOrientationThreshold,
        colorizeRows: legendColorizeRows,
      },
      tickFont,
      showAxes,
    }

    const singleStatProps: Omit<SingleStatProps, 'table'> = {
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
    }

    /*
      <SingleStat> is not a child of <Plot> and does not need to be. It reads
      nothing from the plot environment -- no axes, no scales, no geometry -- and
      .giraffe-layer-single-stat is position:absolute inset:0, so all it wants is
      a positioned ancestor. Putting it inside <Plot> would only hand it the
      plot's margins and let the axes paint on top of it. Overlaying a number on
      a chart is a layout decision, so it belongs to the consumer.
    */
    return (
      <StoryFrame>
        <div style={{position: 'relative', width: '100%', height: '100%'}}>
          <Plot table={singleStatTable} config={config}>
            <Line {...lineConfig} />
          </Plot>
          {includeSingleStatLayer && (
            <SingleStatComponent
              table={singleStatTable}
              {...singleStatProps}
            />
          )}
        </div>
      </StoryFrame>
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
      control: {type: 'select'},
      options: Object.keys(COLOR_SCHEME_OPTIONS),
    },
    x: {control: {type: 'select'}, options: Object.keys(COLUMNS)},
    y: {control: {type: 'select'}, options: Object.keys(COLUMNS)},
    xScale: {control: {type: 'select'}, options: ['linear', 'log']},
    yScale: {control: {type: 'select'}, options: ['linear', 'log']},
    timeZone: {
      control: {type: 'select'},
      options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
    },
    timeFormat: {
      control: {type: 'select'},
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
    fill: {control: {type: 'check'}, options: STRING_COLUMNS},
    interpolation: {
      control: {type: 'select'},
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
    showAxes: {control: {type: 'boolean'}},
    lineWidth: {control: {type: 'number'}},
    shadeBelow: {control: {type: 'boolean'}},
    shadeBelowOpacity: {control: {type: 'number'}},
    hoverDimension: {
      control: {type: 'select'},
      options: ['auto', 'x', 'y', 'xy'],
    },
    legendOrientationThreshold: {control: {type: 'number'}},
    legendColorizeRows: {control: {type: 'boolean'}},
  },
}
