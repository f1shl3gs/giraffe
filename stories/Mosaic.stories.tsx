import type {ArgTypes, Meta, StoryObj} from '@storybook/react'

import {VALUE} from 'constants/columnKeys'
import {
  COLOR_SCHEME_OPTIONS,
  findStringColumns,
  findXYColumns,
  StoryFrame,
  TIME_FORMAT_OPTIONS,
} from 'stories/helpers'
import type {MosaicHoverDimension} from 'types'
import {fromFlux} from 'utils/fromFlux'
import type {MosaicConfig} from 'components/Mosaic'
import {Mosaic} from 'components/Mosaic'
import {circle_ci_branch, cloudy} from 'stories/data/mosaicCSV'
import {cpuTable} from 'stories/data/mosaicTable'
import {nfl} from 'stories/data/nflCSV'

interface MosaicArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  x: string
  y: string
  yLabelColumnSeparator: string
  fill: string
  yColumns: string[]
  yLabelColumns: string[]
  timeZone: string
  timeFormat: string
  showAxes: boolean
  hoverDimension: MosaicHoverDimension | 'auto'
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
    control: {type: 'select'},
    options: Object.keys(COLOR_SCHEME_OPTIONS),
  },
  timeZone: {
    control: {type: 'select'},
    options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
  },
  timeFormat: {
    control: {type: 'select'},
    options: [...TIME_FORMAT_OPTIONS],
  },
  showAxes: {control: {type: 'boolean'}},
  legendOrientationThreshold: {control: {type: 'number'}},
}

const commonArgs: Partial<MosaicArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  yLabelColumnSeparator: '',
  fill: VALUE,
  timeZone: 'UTC',
  showAxes: true,
  legendOrientationThreshold: 5,
}

const render = (args: MosaicArgs) => {
  const {
    colorScheme,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    showAxes,
    hoverDimension,
    timeFormat,
  } = args

  const table = cpuTable

  const mosaicConfig: MosaicConfig = {
    x,
    y: yColumns,
    yLabelColumnSeparator,
    yLabelColumns,
    fill: [fill],
    hoverDimension,
    timeFormat,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
  }

  return (
    <StoryFrame>
      <Mosaic table={table} config={{...mosaicConfig, showAxes}} />
    </StoryFrame>
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
      control: {type: 'select'},
      options: Object.keys(findXYColumns(cpuTable)),
    },
    fill: {control: {type: 'select'}, options: findStringColumns(cpuTable)},
    yColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(cpuTable),
    },
    yLabelColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(cpuTable),
    },
    hoverDimension: {control: {type: 'select'}, options: ['x', 'xy']},
  },
}

const renderCircleCiBranch = (args: MosaicArgs) => {
  const {
    colorScheme,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    showAxes,
    hoverDimension,
    timeFormat,
  } = args

  const table = fromFlux(circle_ci_branch).table

  const mosaicConfig: MosaicConfig = {
    x,
    y: yColumns,
    yLabelColumnSeparator,
    yLabelColumns,
    fill: [fill],
    hoverDimension,
    timeFormat,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
  }

  return (
    <StoryFrame>
      <Mosaic table={table} config={{...mosaicConfig, showAxes}} />
    </StoryFrame>
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
      control: {type: 'select'},
      options: Object.keys(findXYColumns(circleCiBranchTable)),
    },
    fill: {
      control: {type: 'select'},
      options: findStringColumns(circleCiBranchTable),
    },
    yColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(circleCiBranchTable),
    },
    yLabelColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(circleCiBranchTable),
    },
    hoverDimension: {control: {type: 'select'}, options: ['x', 'y', 'xy']},
  },
}

const renderCloudy = (args: MosaicArgs) => {
  const {
    colorScheme,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    showAxes,
    hoverDimension,
    timeFormat,
  } = args

  const table = fromFlux(cloudy).table

  const mosaicConfig: MosaicConfig = {
    x,
    y: yColumns,
    yLabelColumnSeparator,
    yLabelColumns,
    fill: [fill],
    hoverDimension,
    timeFormat,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
  }

  return (
    <StoryFrame>
      <Mosaic table={table} config={{...mosaicConfig, showAxes}} />
    </StoryFrame>
  )
}

export const StaticDataCloudy: Story = {
  render: renderCloudy,
  args: {
    ...commonArgs,
    x: '_time',
    yColumns: ['city'],
    yLabelColumns: ['city'],
    timeFormat: 'MM/DD HH:mm:ss',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {type: 'select'},
      options: Object.keys(findXYColumns(cloudyTable)),
    },
    fill: {control: {type: 'select'}, options: findStringColumns(cloudyTable)},
    yColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(cloudyTable),
    },
    yLabelColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(cloudyTable),
    },
    hoverDimension: {control: {type: 'select'}, options: ['x', 'y', 'xy']},
  },
}

const renderNFL = (args: MosaicArgs) => {
  const {
    colorScheme,
    x,
    yLabelColumnSeparator,
    fill,
    yColumns,
    yLabelColumns,
    showAxes,
    hoverDimension,
    timeFormat,
  } = args

  const table = fromFlux(nfl).table

  const mosaicConfig: MosaicConfig = {
    x,
    y: yColumns,
    yLabelColumnSeparator,
    yLabelColumns,
    fill: [fill],
    hoverDimension,
    timeFormat,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
  }

  return (
    <StoryFrame>
      <Mosaic table={table} config={{...mosaicConfig, showAxes}} />
    </StoryFrame>
  )
}

export const Nfl2020RegularSeason: Story = {
  render: renderNFL,
  args: {
    ...commonArgs,
    x: '_time',
    yColumns: ['team'],
    yLabelColumns: ['team'],
    timeFormat: 'MM/DD/YY',
    hoverDimension: 'xy',
  },
  argTypes: {
    ...commonArgTypes,
    x: {
      control: {type: 'select'},
      options: Object.keys(findXYColumns(nflTable)),
    },
    fill: {control: {type: 'select'}, options: findStringColumns(nflTable)},
    yColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(nflTable),
    },
    yLabelColumns: {
      control: {type: 'multi-select'},
      options: findStringColumns(nflTable),
    },
    hoverDimension: {control: {type: 'select'}, options: ['x', 'y', 'xy']},
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
    showAxes,
    hoverDimension,
    timeFormat,
  } = args

  const table = fromFlux(csv).table

  const mosaicConfig: MosaicConfig = {
    x,
    y: y.split(','),
    yLabelColumns: y.split(','),
    yLabelColumnSeparator,
    fill: [fill],
    hoverDimension,
    timeFormat,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
  }

  return (
    <StoryFrame>
      <Mosaic table={table} config={{...mosaicConfig, showAxes}} />
    </StoryFrame>
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
    hoverDimension: {control: {type: 'select'}, options: ['x', 'xy']},
  },
}
