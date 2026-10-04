import type {Meta, StoryObj} from '@storybook/react'
import type {TableConfig} from 'components/Table'
import {HoverTimeProvider, Table as TableComponent} from 'components/Table'
import {DEFAULT_TABLE_COLORS} from 'constants/tableGraph'
import {useMemo} from 'react'
import {StoryFrame, TIME_FORMAT_OPTIONS} from 'stories/helpers'
import type {Theme} from 'types'

import {tableCSV} from 'components/Table/tableGraph'

interface TableArgs {
  timeFormat: string
  theme: Theme
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

  /*
    Stable identity, deliberately. <FluxTablesTransform> memoizes on `files`, so
    a fresh array literal here would re-parse the CSV on every render and hand
    <TableGraph> a brand new table object each time -- which puts
    TableGraphTable's `shouldResize` effect into an update loop.
  */
  const files = useMemo(() => [fluxResponse], [fluxResponse])

  const config: TableConfig = {
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
  }

  return (
    <HoverTimeProvider>
      <StoryFrame>
        <TableComponent files={files} config={config} />
      </StoryFrame>
    </HoverTimeProvider>
  )
}

const baseArgs = {
  timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
  theme: 'dark' as const,
  fixFirstColumn: false,
  enforceDecimalPlaces: true,
  numberOfDecimalPlaces: 3,
}

const baseArgTypes = {
  timeFormat: {
    control: {type: 'select'},
    options: TIME_FORMAT_OPTIONS,
  },
  theme: {
    control: {type: 'select'},
    options: ['dark', 'light'],
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
