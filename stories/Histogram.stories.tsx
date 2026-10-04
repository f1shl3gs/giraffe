import type {Meta, StoryObj} from '@storybook/react'
import type {HistogramConfig} from 'components/Histogram'
import {Histogram} from 'components/Histogram'
import {
  COLOR_SCHEME_OPTIONS,
  findXYColumns,
  getCPUTable,
  StoryFrame,
} from 'stories/helpers'

interface HistogramArgs {
  colorScheme: string
  x: string
  showAxes: boolean
  binCount: number
  position: 'overlaid' | 'stacked'
  fill: string[]
}

export default {
  title: 'Histogram',
} as Meta

type Story = StoryObj<HistogramArgs>

const TABLE = getCPUTable()
const COLUMNS = findXYColumns(TABLE)

export const Example: Story = {
  render: args => {
    const {colorScheme, x, showAxes, binCount, position, fill} = args
    const colors =
      COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS]

    const config: HistogramConfig = {
      x,
      colors,
      fill,
      binCount,
      position,
      showAxes,
    }

    return (
      <StoryFrame>
        <Histogram table={TABLE} config={config} />
      </StoryFrame>
    )
  },
  args: {
    colorScheme: 'Nineteen Eighty Four',
    x: '_value',
    showAxes: true,
    binCount: 10,
    position: 'overlaid',
    fill: ['cpu'],
  },
  argTypes: {
    colorScheme: {
      control: {type: 'select'},
      options: Object.keys(COLOR_SCHEME_OPTIONS),
    },
    x: {control: {type: 'select'}, options: Object.keys(COLUMNS)},
    showAxes: {control: {type: 'boolean'}},
    binCount: {control: {type: 'number'}},
    position: {control: {type: 'select'}, options: ['overlaid', 'stacked']},
    fill: {
      control: {type: 'multi-select'},
      options: Object.keys(COLUMNS),
    },
  },
}
