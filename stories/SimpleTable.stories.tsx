import type {Meta, StoryObj} from '@storybook/react'
import type {SimpleTableConfig} from 'components/SimpleTable'
import {SimpleTable} from 'components/SimpleTable'
import {StoryFrame} from 'stories/helpers'
import {fromFlux} from 'utils/fromFlux'
import {nonNumbersInNumbersColumn, tableCSV} from 'components/Table/tableGraph'
import {largeDataSet} from 'stories/data/largeDataSet'
import {multiTableUnusualCSV} from 'stories/data/multiTableUnusualCSV'

interface SimpleTableArgs {
  backgroundColor: string
  showAll: boolean
  csv: string
}

export default {
  title: 'Simple Table',
} as Meta

type Story = StoryObj<SimpleTableArgs>

const tableRender = (csv: string) => (args: SimpleTableArgs) => {
  const {backgroundColor, showAll} = args

  const config: SimpleTableConfig = {showAll}

  return (
    // Simple Table needs a black background by default,
    //   override Storybook's dark grey
    <StoryFrame style={{backgroundColor}}>
      <SimpleTable result={fromFlux(csv)} config={config} />
    </StoryFrame>
  )
}

const customRender = (args: SimpleTableArgs) => {
  const {backgroundColor, showAll, csv} = args

  const config: SimpleTableConfig = {showAll}

  return (
    // Simple Table needs a black background by default,
    //   override Storybook's dark grey
    <StoryFrame style={{backgroundColor}}>
      <SimpleTable result={fromFlux(csv)} config={config} />
    </StoryFrame>
  )
}

const tableArgs = {
  backgroundColor: 'black',
  showAll: false,
}

const tableArgTypes = {
  showAll: {
    control: {type: 'boolean'},
  },
} as const

export const Standard: Story = {
  render: tableRender(tableCSV),
  args: tableArgs,
  argTypes: tableArgTypes,
}

export const NonNumbersInANumbersColumn: Story = {
  render: tableRender(nonNumbersInNumbersColumn),
  args: tableArgs,
  argTypes: tableArgTypes,
}

export const VeryLargeDataSet: Story = {
  render: tableRender(largeDataSet),
  args: tableArgs,
  argTypes: tableArgTypes,
}

export const MultiTableUnusualDataSet: Story = {
  render: tableRender(multiTableUnusualCSV),
  args: tableArgs,
  argTypes: tableArgTypes,
}

export const CustomCSV: Story = {
  render: customRender,
  args: {
    csv: '',
    backgroundColor: 'black',
    showAll: false,
  },
  argTypes: tableArgTypes,
}
