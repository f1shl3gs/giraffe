import * as React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {PlotContainer} from './helpers'
import {Config, Plot, fromFlux} from '../../giraffe/src'
import {tableCSV, nonNumbersInNumbersColumn} from './data/tableGraph'
import {largeDataSet} from './data/largeDataSet'
import {multiTableUnusualCSV} from './data/multiTableUnusualCSV'

interface SimpleTableArgs {
  backgroundColor: string
  showAll: boolean
  csv: string
}

export default {
  title: 'Simple Table',
} as Meta

type Story = StoryObj<SimpleTableArgs>

const tableRender =
  (fluxResponse: Config['fluxResponse']) => (args: SimpleTableArgs) => {
    const {backgroundColor, showAll} = args

    const config: Config = {
      fluxResponse,
      layers: [
        {
          type: 'simple table',
          showAll: showAll,
        },
      ],
    }

    return (
      // Simple Table needs a black background by default,
      //   override Storybook's dark grey
      <PlotContainer style={{backgroundColor}}>
        <Plot config={config} />
      </PlotContainer>
    )
  }

const customRender = (args: SimpleTableArgs) => {
  const {backgroundColor, showAll, csv} = args
  const fromFluxResult = fromFlux(csv)

  const config: Config = {
    fromFluxResult,
    layers: [
      {
        type: 'simple table',
        showAll: showAll,
      },
    ],
  }

  return (
    // Simple Table needs a black background by default,
    //   override Storybook's dark grey
    <PlotContainer style={{backgroundColor}}>
      <Plot config={config} />
    </PlotContainer>
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

export const SimpleTable: Story = {
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
