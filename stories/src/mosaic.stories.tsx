import * as React from 'react'
import type {Meta, StoryObj, ArgTypes} from '@storybook/react'

import {
  Config,
  LayerConfig,
  Plot,
  fromFlux,
  timeFormatter,
} from '../../giraffe/src'
import {VALUE} from '../../giraffe/src/constants/columnKeys'
import {cpuTable} from './data/mosaicTable'

import {
  PlotContainer,
  findXYColumns,
  findStringColumns,
  TIME_FORMAT_OPTIONS,
  COLOR_SCHEME_OPTIONS,
} from './helpers'
import {circle_ci_branch, cloudy} from './data/mosaicCSV'
import {nfl} from './data/nflCSV'

interface MosaicArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  legendFont: string
  tickFont: string
  x: string
  y: string
  yLabelColumnSeparator: string
  fill: string
  yColumns: string[]
  yLabelColumns: string[]
  timeZone: string
  timeFormat: string
  showAxes: boolean
  hoverDimension: string
  legendOrientationThreshold: number
  csv: string
}

export default {
  title: 'Mosaic',
} as Meta

type Story = StoryObj<MosaicArgs>

const circleCiBranchTable = fromFlux(circle_ci_branch).table
const cloudyTable = fromFlux(cloudy).table
const nflTable = fromFlux(nfl).table

const commonArgTypes: Partial<ArgTypes<MosaicArgs>> = {
  colorScheme: {
    control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
  },
  timeZone: {
    control: {
      type: 'select',
      options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
    },
  },
  timeFormat: {control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]}},
  showAxes: {control: {type: 'boolean'}},
  legendOrientationThreshold: {control: {type: 'number'}},
}

const commonArgs: Partial<MosaicArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  legendFont: '12px sans-serif',
  yLabelColumnSeparator: '',
  fill: VALUE,
  timeZone: 'UTC',
  showAxes: true,
  legendOrientationThreshold: 5,
}

const render = (args: MosaicArgs) => {
  const {
    colorScheme,
    legendFont,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    timeZone,
    timeFormat,
    showAxes,
    hoverDimension,
    legendOrientationThreshold,
  } = args

  const config: Config = {
    table: cpuTable,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
    },
    legendFont,
    legendOrientationThreshold,
    showAxes,
    layers: [
      {
        type: 'mosaic',
        x,
        y: yColumns,
        yLabelColumnSeparator,
        yLabelColumns,
        fill: [fill],
        hoverDimension,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      } as LayerConfig,
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const Example: Story = {
  render,
  args: {
    ...commonArgs,
    x: '_time',
    yColumns: ['cpu', 'host'],
    yLabelColumns: ['cpu'],
    timeFormat: 'hh:mm a',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {type: 'select', options: Object.keys(findXYColumns(cpuTable))},
    },
    fill: {control: {type: 'select', options: findStringColumns(cpuTable)}},
    yColumns: {
      control: {type: 'multi-select', options: findStringColumns(cpuTable)},
    },
    yLabelColumns: {
      control: {type: 'multi-select', options: findStringColumns(cpuTable)},
    },
    hoverDimension: {control: {type: 'select', options: ['x', 'xy']}},
  },
}

const renderCircleCiBranch = (args: MosaicArgs) => {
  const {
    colorScheme,
    legendFont,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    timeZone,
    timeFormat,
    showAxes,
    hoverDimension,
    legendOrientationThreshold,
  } = args

  const config: Config = {
    fluxResponse: circle_ci_branch,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
    },
    legendFont,
    legendOrientationThreshold,
    showAxes,
    layers: [
      {
        type: 'mosaic',
        x,
        y: yColumns,
        yLabelColumnSeparator,
        yLabelColumns,
        fill: [fill],
        hoverDimension,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      } as LayerConfig,
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const StaticDataCircleCiBranch: Story = {
  render: renderCircleCiBranch,
  args: {
    ...commonArgs,
    x: '_time',
    yColumns: ['project', 'workflow_name'],
    yLabelColumns: ['project', 'workflow_name'],
    timeFormat: 'MM/DD HH:mm:ss',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {
        type: 'select',
        options: Object.keys(findXYColumns(circleCiBranchTable)),
      },
    },
    fill: {
      control: {
        type: 'select',
        options: findStringColumns(circleCiBranchTable),
      },
    },
    yColumns: {
      control: {
        type: 'multi-select',
        options: findStringColumns(circleCiBranchTable),
      },
    },
    yLabelColumns: {
      control: {
        type: 'multi-select',
        options: findStringColumns(circleCiBranchTable),
      },
    },
    hoverDimension: {control: {type: 'select', options: ['x', 'y', 'xy']}},
  },
}

const renderCloudy = (args: MosaicArgs) => {
  const {
    colorScheme,
    tickFont,
    legendFont,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    timeZone,
    timeFormat,
    showAxes,
    hoverDimension,
    legendOrientationThreshold,
  } = args

  const config: Config = {
    fluxResponse: cloudy,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
    },
    legendFont,
    legendOrientationThreshold,
    showAxes,
    tickFont,
    layers: [
      {
        type: 'mosaic',
        x,
        y: yColumns,
        yLabelColumnSeparator,
        yLabelColumns,
        fill: [fill],
        hoverDimension,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      } as LayerConfig,
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const StaticDataCloudy: Story = {
  render: renderCloudy,
  args: {
    ...commonArgs,
    tickFont: '10px sans-serif',
    x: '_time',
    yColumns: ['city'],
    yLabelColumns: ['city'],
    timeFormat: 'MM/DD HH:mm:ss',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {
        type: 'select',
        options: Object.keys(findXYColumns(cloudyTable)),
      },
    },
    fill: {control: {type: 'select', options: findStringColumns(cloudyTable)}},
    yColumns: {
      control: {
        type: 'multi-select',
        options: findStringColumns(cloudyTable),
      },
    },
    yLabelColumns: {
      control: {
        type: 'multi-select',
        options: findStringColumns(cloudyTable),
      },
    },
    hoverDimension: {control: {type: 'select', options: ['x', 'y', 'xy']}},
  },
}

const renderNFL = (args: MosaicArgs) => {
  const {
    colorScheme,
    tickFont,
    legendFont,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    timeZone,
    timeFormat,
    showAxes,
    hoverDimension,
    legendOrientationThreshold,
  } = args

  const config: Config = {
    fluxResponse: nfl,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
    },
    legendFont,
    legendOrientationThreshold,
    showAxes,
    tickFont,
    layers: [
      {
        type: 'mosaic',
        x,
        y: yColumns,
        yLabelColumnSeparator,
        yLabelColumns,
        fill: [fill],
        hoverDimension,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      } as LayerConfig,
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const Nfl2020RegularSeason: Story = {
  render: renderNFL,
  args: {
    ...commonArgs,
    tickFont: '10px sans-serif',
    x: '_time',
    yColumns: ['team'],
    yLabelColumns: ['team'],
    timeFormat: 'MM/DD/YY',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {type: 'select', options: Object.keys(findXYColumns(nflTable))},
    },
    fill: {control: {type: 'select', options: findStringColumns(nflTable)}},
    yColumns: {
      control: {
        type: 'multi-select',
        options: findStringColumns(nflTable),
      },
    },
    yLabelColumns: {
      control: {
        type: 'multi-select',
        options: findStringColumns(nflTable),
      },
    },
    hoverDimension: {control: {type: 'select', options: ['x', 'y', 'xy']}},
  },
}

const renderCustomCSV = (args: MosaicArgs) => {
  const {
    csv,
    x,
    y,
    yLabelColumnSeparator,
    fill,
    colorScheme,
    legendFont,
    timeZone,
    timeFormat,
    showAxes,
    hoverDimension,
    legendOrientationThreshold,
  } = args

  const config: Config = {
    fluxResponse: csv,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
    },
    legendFont,
    legendOrientationThreshold,
    showAxes,
    layers: [
      {
        type: 'mosaic',
        x,
        y: y.split(','),
        yLabelColumns: y.split(','),
        yLabelColumnSeparator,
        fill: [fill],
        hoverDimension,
        colors: COLOR_SCHEME_OPTIONS[colorScheme],
      } as LayerConfig,
    ],
  }

  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const CustomCSV: Story = {
  render: renderCustomCSV,
  args: {
    ...commonArgs,
    csv: '',
    x: '_time',
    y: '',
    timeFormat: 'hh:mm a',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    hoverDimension: {control: {type: 'select', options: ['x', 'xy']}},
  },
}
