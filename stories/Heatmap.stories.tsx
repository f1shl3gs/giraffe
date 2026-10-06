import type {Meta, StoryObj} from '@storybook/react'
import type {HeatmapConfig} from 'components/Heatmap'
import {Heatmap} from 'components/Heatmap'
import {
  COLOR_SCHEME_OPTIONS,
  findXYColumns,
  getCPUTable,
  StoryFrame,
} from 'stories/helpers'

interface HeatmapArgs {
  colorScheme: string
  x: string
  y: string
  showAxes: boolean
  binSize: number
  fillOpacity: number
  strokeOpacity: number
}

export default {
  title: 'Heatmap',
} as Meta

type Story = StoryObj<HeatmapArgs>

const TABLE = getCPUTable()
const COLUMNS = findXYColumns(TABLE)

export const Example: Story = {
  render: args => {
    const {colorScheme, x, y, showAxes, binSize, fillOpacity, strokeOpacity} = args
    const colors =
      COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS]

    const config: HeatmapConfig = {
      x,
      y,
      colors,
      binSize,
      showAxes,
      fillOpacity,
      strokeOpacity,
      valueFormatters: {_value: val => `${Math.round(val)}%`},
    }

    return (
      <StoryFrame>
        <Heatmap config={config} table={TABLE}/>
      </StoryFrame>
    )
  },
  args: {
    colorScheme: 'Magma',
    x: '_time',
    y: '_value',
    showAxes: true,
    binSize: 10,
    fillOpacity: 1,
    strokeOpacity: 0,
  },
  argTypes: {
    colorScheme: {
      control: {type: 'select'},
      options: Object.keys(COLOR_SCHEME_OPTIONS),
    },
    x: {control: {type: 'select'}, options: Object.keys(COLUMNS)},
    y: {control: {type: 'select'}, options: Object.keys(COLUMNS)},
    showAxes: {control: {type: 'boolean'}},
    binSize: {control: {type: 'number'}},
    fillOpacity: { control: { type: 'number', step: 0.1, min: 0.1, max: 1.0 }},
    strokeOpacity: { control: {type: 'number', step: 0.1, min: 0.1, max: 1.0 }},
  },
}
