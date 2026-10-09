import type {Meta, StoryObj} from '@storybook/react'
import memoizeOne from 'memoize-one'
import {StoryFrame} from 'stories/helpers'
import {DEFAULT_GAUGE_COLORS} from 'style/gaugeStyles'
import type {GaugeTheme, Table} from 'types'
import {newTable} from 'utils/newTable'
import type {GaugeProps} from 'components/Gauge'
import {Gauge} from 'components/Gauge'

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

const now = Date.now()
const numberOfRecords = 20
const recordsPerLine = 20

const getRandomNumber = (min: number, max: number) =>
  Math.random() * (max - min) + min

// Memoized so the gauge value does not jump on every Storybook re-render.
const gaugeTable = memoizeOne((minValue: number, maxValue: number): Table => {
  const timeCol: Array<number> = []
  const valueCol: Array<number> = []
  for (let i = 0; i < numberOfRecords; i += 1) {
    valueCol.push(getRandomNumber(minValue, maxValue))
    timeCol.push(now + (i % recordsPerLine) * 1000 * 60)
  }
  return newTable(numberOfRecords)
    .addColumn('_time', 'dateTime:RFC3339', 'time', timeCol)
    .addColumn('_value', 'system', 'number', valueCol)
})

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

  const table = gaugeTable(Number(gaugeMin), Number(gaugeMax))
  const valueColumn = table.getColumn('_value', 'number')

  const gaugeProps: Omit<GaugeProps, 'value'> = {
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
  }

  return (
    <StoryFrame>
      <Gauge value={valueColumn[valueColumn.length - 1]} {...gaugeProps} />
    </StoryFrame>
  )
}

export const Standard: Story = {
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
