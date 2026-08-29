import * as React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {Config, Plot} from '../../giraffe/src'

import {PlotContainer, TIME_FORMAT_OPTIONS} from './helpers'
import {TableGraphLayerConfig} from '../../giraffe/src/types'
import {HoverTimeProvider} from '../../giraffe/src/components/Table'
import {DEFAULT_TABLE_COLORS} from '../../giraffe/src'

import {tableCSV} from './data/tableGraph'

interface TableArgs {
  timeFormat: string
  theme: string
  fixFirstColumn: boolean
  enforceDecimalPlaces: boolean
  numberOfDecimalPlaces: number
  csv: string
}

export default {
  title: 'Table',
} as Meta

type Story = StoryObj<TableArgs>

const fieldOptions = [
  {
    displayName: '_start',
    internalName: '_start',
    visible: true,
  },
  {
    displayName: '_stop',
    internalName: '_stop',
    visible: true,
  },
  {
    displayName: '_time',
    internalName: '_time',
    visible: true,
  },
  {
    displayName: '_value',
    internalName: '_value',
    visible: true,
  },
  {
    displayName: '_field',
    internalName: '_field',
    visible: true,
  },
  {
    displayName: '_measurement',
    internalName: '_measurement',
    visible: true,
  },
  {
    displayName: 'cpu',
    internalName: 'cpu',
    visible: true,
  },
  {
    displayName: 'host',
    internalName: 'host',
    visible: true,
  },
]

const render = (args: TableArgs, fluxResponse: string) => {
  const {
    timeFormat,
    theme,
    fixFirstColumn,
    enforceDecimalPlaces,
    numberOfDecimalPlaces,
  } = args

  const config: Config = {
    fluxResponse,
    layers: [
      {
        type: 'table',
        properties: {
          colors: DEFAULT_TABLE_COLORS,
          tableOptions: {
            fixFirstColumn,
            verticalTimeAxis: true,
          },
          fieldOptions,
          timeFormat,
          decimalPlaces: {
            digits: numberOfDecimalPlaces,
            isEnforced: enforceDecimalPlaces,
          },
        },
        timeZone: 'Local',
        tableTheme: theme,
      } as TableGraphLayerConfig,
    ],
  }

  return (
    <HoverTimeProvider>
      <PlotContainer>
        <Plot config={config} />
      </PlotContainer>
    </HoverTimeProvider>
  )
}

const baseArgs = {
  timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
  theme: 'dark',
  fixFirstColumn: false,
  enforceDecimalPlaces: true,
  numberOfDecimalPlaces: 3,
}

const baseArgTypes = {
  timeFormat: {
    control: {type: 'select', options: TIME_FORMAT_OPTIONS},
  },
  theme: {
    control: {type: 'select', options: ['dark', 'light']},
  },
  fixFirstColumn: {
    control: {type: 'boolean'},
  },
  enforceDecimalPlaces: {
    control: {type: 'boolean'},
  },
  numberOfDecimalPlaces: {
    control: {type: 'number'},
  },
} as const

export const Table: Story = {
  render: args => render(args, tableCSV),
  args: baseArgs,
  argTypes: baseArgTypes,
}

export const CustomCSV: Story = {
  render: args => render(args, args.csv),
  args: {
    ...baseArgs,
    csv: '',
  },
  argTypes: baseArgTypes,
}
