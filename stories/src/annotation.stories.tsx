import * as React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import {Config, Plot, LayerConfig, timeFormatter} from '../../giraffe/src'
import {TIME, VALUE} from '../../giraffe/src/constants/columnKeys'
import type {
  AnnotationDimension,
  AnnotationPinType,
  LineHoverDimension,
  LineInterpolation,
  LinePosition,
} from '../../giraffe/src/types'

import {
  PlotContainer,
  findStringColumns,
  findXYColumns,
  TIME_FORMAT_OPTIONS,
  COLOR_SCHEME_OPTIONS,
} from './helpers'

import {annotationsTable, matchAnnotationsToTable} from './data/annotation'

const table = annotationsTable

const xOptions = Object.keys(findXYColumns(table))
const fillOptions = findStringColumns(table)

const defaultAnnotations = matchAnnotationsToTable({
  color: 'green',
  dimension: 'x',
  table,
  x: '_time',
  y: '_value',
  pin: 'none',
})

const annotationSelectionsOptions = defaultAnnotations
  .map(annotation => String(annotation.startValue))
  .sort()

const annotationSelectionsDefault = defaultAnnotations
  .filter((_, i) => i % 4 === 0)
  .map(annotation => String(annotation.startValue))
  .sort()

const firstValue = String(table.getColumn(VALUE, 'number')[0])

const annotationContainerStyle = {
  width: 'calc(100vw - 100px)',
  height: 'calc(100vh - 125px)',
  margin: '75px 50px 50px 50px',
}

interface AnnotationArgs {
  annotations: string[]
  annotationColor: string
  annotationDimension: AnnotationDimension
  annotationHoverMargin: number
  colorScheme: string
  currentTime: string
  currentValue: string
  endTime: string
  endValue: string
  fill: string[]
  hoverDimension: LineHoverDimension | 'auto'
  interpolation: LineInterpolation
  legendColorizeRows: boolean
  legendFont: string
  legendHide: boolean
  legendOrientationThreshold: number
  lineLayer: boolean
  linePosition: LinePosition
  lineWidth: number
  pin: AnnotationPinType
  tickFont: string
  timeFormat: string
  timeZone: string
  valueAxisLabel: string
  x: string
  xScale: string
  xTotalTicks: number
  y: string
  yScale: string
  yTotalTicks: number
}

export default {
  title: 'Annotations',
} as Meta

type Story = StoryObj<AnnotationArgs>

const renderMarkAtEveryPoint = (args: AnnotationArgs) => {
  const {
    annotationColor,
    annotationDimension,
    annotationHoverMargin,
    colorScheme,
    fill,
    hoverDimension,
    interpolation,
    legendColorizeRows,
    legendFont,
    legendHide,
    legendOrientationThreshold,
    lineLayer,
    linePosition,
    lineWidth,
    pin,
    tickFont,
    timeFormat,
    timeZone,
    valueAxisLabel,
    x,
    xScale,
    xTotalTicks,
    y,
    yScale,
    yTotalTicks,
  } = args

  const layers = [
    {
      type: 'annotation',
      x,
      y,
      annotations: matchAnnotationsToTable({
        color: annotationColor,
        dimension: annotationDimension,
        table,
        x,
        y,
        pin,
      }),
      fill,
      hoverDimension,
      hoverMargin: annotationHoverMargin,
    },
  ] as LayerConfig[]

  if (lineLayer) {
    layers.unshift({
      type: 'line',
      x,
      y,
      fill,
      position: linePosition,
      interpolation,
      colors:
        COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS],
      lineWidth,
      hoverDimension,
    })
  }
  const config: Config = {
    table,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        `${val.toFixed(2)}${
          valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
        }`,
    },
    xScale,
    yScale,
    legendFont,
    legendHide,
    legendOrientationThreshold,
    legendColorizeRows,
    tickFont,
    xTotalTicks,
    yTotalTicks,
    layers,
  }
  return (
    <PlotContainer style={annotationContainerStyle}>
      <Plot config={config} />
    </PlotContainer>
  )
}

const renderOverriddenDoubleClick = (args: AnnotationArgs) => {
  const {
    annotationColor,
    annotationDimension,
    colorScheme,
    fill,
    interpolation,
    legendColorizeRows,
    legendFont,
    legendOrientationThreshold,
    hoverDimension,
    lineLayer,
    linePosition,
    lineWidth,
    pin,
    tickFont,
    timeFormat,
    timeZone,
    valueAxisLabel,
    x,
    xScale,
    xTotalTicks,
    y,
    yScale,
    yTotalTicks,
  } = args

  const doubleClickHandler = plotInteraction => {
    // eslint-disable-next-line
    console.log(
      'This double click function is overridden! Returned arguments:',
      plotInteraction
    )
  }

  const hoverHandler = plotInteraction => {
    // eslint-disable-next-line
    console.log('hover handler:', plotInteraction)
  }

  const interactionHandlers = {
    doubleClick: doubleClickHandler,
    hover: hoverHandler,
  }

  const layers = [
    {
      type: 'annotation',
      x,
      y,
      annotations: matchAnnotationsToTable({
        color: annotationColor,
        dimension: annotationDimension,
        table,
        x,
        y,
        pin,
      }),
      fill,
    },
  ] as LayerConfig[]

  if (lineLayer) {
    layers.unshift({
      type: 'line',
      x,
      y,
      fill,
      position: linePosition,
      interpolation,
      colors:
        COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS],
      lineWidth,
      hoverDimension,
    })
  }

  const config: Config = {
    table,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        `${val.toFixed(2)}${
          valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
        }`,
    },
    xScale,
    yScale,
    legendFont,
    legendOrientationThreshold,
    legendColorizeRows,
    tickFont,
    xTotalTicks,
    yTotalTicks,
    layers,
    interactionHandlers,
  }
  return (
    <PlotContainer style={annotationContainerStyle}>
      <Plot config={config} />
    </PlotContainer>
  )
}

const renderSelectableMarks = (args: AnnotationArgs) => {
  const {
    annotations,
    annotationColor,
    annotationDimension,
    annotationHoverMargin,
    colorScheme,
    fill,
    hoverDimension,
    interpolation,
    legendColorizeRows,
    legendFont,
    legendOrientationThreshold,
    lineLayer,
    linePosition,
    lineWidth,
    tickFont,
    timeFormat,
    timeZone,
    valueAxisLabel,
    x,
    xScale,
    xTotalTicks,
    y,
    yScale,
    yTotalTicks,
  } = args

  const layers = [
    {
      type: 'annotation',
      x,
      y,
      annotations: annotations.map((valueString: string) => ({
        title: 'Hi!',
        description: `value: ${valueString}`,
        color: annotationColor,
        dimension: annotationDimension,
        startValue: Number(valueString),
        stopValue: Number(valueString),
      })),
      fill,
      hoverDimension,
      hoverMargin: annotationHoverMargin,
    },
  ] as LayerConfig[]

  if (lineLayer) {
    layers.unshift({
      type: 'line',
      x,
      y,
      fill,
      position: linePosition,
      interpolation,
      colors:
        COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS],
      lineWidth,
      hoverDimension,
    })
  }
  const config: Config = {
    table,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        `${val.toFixed(2)}${
          valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
        }`,
    },
    xScale,
    yScale,
    legendFont,
    legendOrientationThreshold,
    legendColorizeRows,
    tickFont,
    xTotalTicks,
    yTotalTicks,
    layers,
  }
  return (
    <PlotContainer style={annotationContainerStyle}>
      <Plot config={config} />
    </PlotContainer>
  )
}

const renderAddYourOwnMarks = (args: AnnotationArgs) => {
  const {
    annotationColor,
    annotationDimension,
    annotationHoverMargin,
    colorScheme,
    currentTime,
    currentValue,
    endTime,
    endValue,
    fill,
    hoverDimension,
    interpolation,
    legendColorizeRows,
    legendFont,
    legendHide,
    legendOrientationThreshold,
    lineLayer,
    linePosition,
    lineWidth,
    pin,
    tickFont,
    timeFormat,
    timeZone,
    valueAxisLabel,
    x,
    xScale,
    xTotalTicks,
    y,
    yScale,
    yTotalTicks,
  } = args

  const columnKey = annotationDimension === 'y' ? y : x

  const annotationsInput =
    columnKey === TIME
      ? [[currentTime], [endTime]]
      : [[currentValue], [endValue]]

  const numAnnotations = annotationsInput[0].length

  const annotationLayerData = []

  for (let i = 0; i < numAnnotations; i++) {
    const startVal = annotationsInput[0][i]
    const endVal = annotationsInput[1][i]
    annotationLayerData.push({
      title: `Hi ${i}`,
      description: `start/value is ${startVal}`,
      color: annotationColor,
      dimension: annotationDimension,
      startValue: Number(startVal),
      stopValue: Number(endVal),
      pin,
    })
  }

  const layers = [
    {
      type: 'annotation',
      x,
      y,
      annotations: annotationLayerData,
      fill,
      hoverDimension,
      hoverMargin: annotationHoverMargin,
    },
  ] as LayerConfig[]

  if (lineLayer) {
    layers.unshift({
      type: 'line',
      x,
      y,
      fill,
      position: linePosition,
      interpolation,
      colors:
        COLOR_SCHEME_OPTIONS[colorScheme as keyof typeof COLOR_SCHEME_OPTIONS],
      lineWidth,
      hoverDimension,
    })
  }
  const config: Config = {
    table,
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        `${val.toFixed(2)}${
          valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
        }`,
    },
    xScale,
    yScale,
    legendFont,
    legendHide,
    legendOrientationThreshold,
    legendColorizeRows,
    tickFont,
    xTotalTicks,
    yTotalTicks,
    layers,
  }
  return (
    <PlotContainer style={annotationContainerStyle}>
      <Plot config={config} />
    </PlotContainer>
  )
}

export const MarkAtEveryPoint: Story = {
  render: renderMarkAtEveryPoint,
  args: {
    lineLayer: false,
    annotationColor: 'green',
    annotationDimension: 'x',
    annotationHoverMargin: 10,
    tickFont: '10px sans-serif',
    valueAxisLabel: 'foo',
    x: '_time',
    y: '_value',
    fill: ['cpu'],
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'America/Los_Angeles',
    timeFormat: 'hh:mm a',
    legendFont: '12px sans-serif',
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
    legendHide: false,
    xTotalTicks: 8,
    yTotalTicks: 10,
    linePosition: 'overlaid',
    interpolation: 'monotoneX',
    colorScheme: 'Nineteen Eighty Four',
    lineWidth: 1,
    hoverDimension: 'auto',
    pin: 'none',
  },
  argTypes: {
    annotationDimension: {
      control: {type: 'select', options: ['x', 'y']},
    },
    annotationHoverMargin: {
      control: {type: 'number'},
    },
    x: {
      control: {type: 'select', options: xOptions},
    },
    y: {
      control: {type: 'select', options: xOptions},
    },
    fill: {
      control: {type: 'check', options: fillOptions},
    },
    xScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    yScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    timeZone: {
      control: {
        type: 'select',
        options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
      },
    },
    timeFormat: {
      control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]},
    },
    legendOrientationThreshold: {
      control: {type: 'number'},
    },
    legendColorizeRows: {
      control: {type: 'boolean'},
    },
    legendHide: {
      control: {type: 'boolean'},
    },
    xTotalTicks: {
      control: {type: 'number'},
    },
    yTotalTicks: {
      control: {type: 'number'},
    },
    linePosition: {
      control: {type: 'select', options: ['overlaid', 'stacked']},
    },
    interpolation: {
      control: {
        type: 'select',
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
    },
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    lineWidth: {
      control: {type: 'number'},
    },
    hoverDimension: {
      control: {type: 'select', options: ['auto', 'x', 'y', 'xy']},
    },
    pin: {
      control: {type: 'select', options: ['none', 'circle', 'start', 'stop']},
    },
  },
}

export const OverriddenDoubleClickBehavior: Story = {
  render: renderOverriddenDoubleClick,
  args: {
    lineLayer: false,
    annotationColor: 'green',
    annotationDimension: 'x',
    tickFont: '10px sans-serif',
    valueAxisLabel: 'foo',
    x: '_time',
    y: '_value',
    fill: ['cpu'],
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'America/Los_Angeles',
    timeFormat: 'hh:mm a',
    legendFont: '12px sans-serif',
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
    xTotalTicks: 8,
    yTotalTicks: 10,
    linePosition: 'overlaid',
    interpolation: 'monotoneX',
    colorScheme: 'Nineteen Eighty Four',
    lineWidth: 1,
    hoverDimension: 'auto',
    pin: 'none',
  },
  argTypes: {
    annotationDimension: {
      control: {type: 'select', options: ['x', 'y']},
    },
    x: {
      control: {type: 'select', options: xOptions},
    },
    y: {
      control: {type: 'select', options: xOptions},
    },
    fill: {
      control: {type: 'check', options: fillOptions},
    },
    xScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    yScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    timeZone: {
      control: {
        type: 'select',
        options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
      },
    },
    timeFormat: {
      control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]},
    },
    legendOrientationThreshold: {
      control: {type: 'number'},
    },
    legendColorizeRows: {
      control: {type: 'boolean'},
    },
    xTotalTicks: {
      control: {type: 'number'},
    },
    yTotalTicks: {
      control: {type: 'number'},
    },
    linePosition: {
      control: {type: 'select', options: ['overlaid', 'stacked']},
    },
    interpolation: {
      control: {
        type: 'select',
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
    },
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    lineWidth: {
      control: {type: 'number'},
    },
    hoverDimension: {
      control: {type: 'select', options: ['auto', 'x', 'y', 'xy']},
    },
    pin: {
      control: {type: 'select', options: ['none', 'circle', 'start', 'stop']},
    },
  },
}

export const SelectableMarks: Story = {
  render: renderSelectableMarks,
  args: {
    lineLayer: true,
    annotationColor: 'green',
    annotationDimension: 'x',
    annotationHoverMargin: 10,
    annotations: annotationSelectionsDefault,
    tickFont: '10px sans-serif',
    valueAxisLabel: 'foo',
    x: '_time',
    y: '_value',
    fill: ['cpu'],
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'America/Los_Angeles',
    timeFormat: 'hh:mm a',
    legendFont: '12px sans-serif',
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
    xTotalTicks: 8,
    yTotalTicks: 10,
    linePosition: 'overlaid',
    interpolation: 'monotoneX',
    colorScheme: 'Nineteen Eighty Four',
    lineWidth: 1,
    hoverDimension: 'auto',
    pin: 'none',
  },
  argTypes: {
    annotations: {
      control: {type: 'check', options: annotationSelectionsOptions},
    },
    annotationDimension: {
      control: {type: 'select', options: ['x', 'y']},
    },
    annotationHoverMargin: {
      control: {type: 'number'},
    },
    x: {
      control: {type: 'select', options: xOptions},
    },
    y: {
      control: {type: 'select', options: xOptions},
    },
    fill: {
      control: {type: 'check', options: fillOptions},
    },
    xScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    yScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    timeZone: {
      control: {
        type: 'select',
        options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
      },
    },
    timeFormat: {
      control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]},
    },
    legendOrientationThreshold: {
      control: {type: 'number'},
    },
    legendColorizeRows: {
      control: {type: 'boolean'},
    },
    xTotalTicks: {
      control: {type: 'number'},
    },
    yTotalTicks: {
      control: {type: 'number'},
    },
    linePosition: {
      control: {type: 'select', options: ['overlaid', 'stacked']},
    },
    interpolation: {
      control: {
        type: 'select',
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
    },
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    lineWidth: {
      control: {type: 'number'},
    },
    hoverDimension: {
      control: {type: 'select', options: ['auto', 'x', 'y', 'xy']},
    },
    pin: {
      control: {type: 'select', options: ['none', 'circle', 'start', 'stop']},
    },
  },
}

export const AddYourOwnMarks: Story = {
  render: renderAddYourOwnMarks,
  args: {
    lineLayer: true,
    annotationColor: 'green',
    annotationDimension: 'x',
    annotationHoverMargin: 10,
    x: '_time',
    y: '_value',
    currentValue: firstValue,
    endValue: firstValue,
    currentTime: String(Date.now() + 1000 * 60 * 6),
    endTime: String(Date.now() + 1000 * 60 * 6),
    pin: 'start',
    tickFont: '10px sans-serif',
    valueAxisLabel: 'foo',
    fill: ['cpu'],
    xScale: 'linear',
    yScale: 'linear',
    timeZone: 'America/Los_Angeles',
    timeFormat: 'hh:mm a',
    legendFont: '12px sans-serif',
    legendOrientationThreshold: 5,
    legendColorizeRows: true,
    legendHide: false,
    xTotalTicks: 8,
    yTotalTicks: 10,
    linePosition: 'overlaid',
    interpolation: 'monotoneX',
    colorScheme: 'Nineteen Eighty Four',
    lineWidth: 1,
    hoverDimension: 'auto',
  },
  argTypes: {
    annotationDimension: {
      control: {type: 'select', options: ['x', 'y']},
    },
    annotationHoverMargin: {
      control: {type: 'number'},
    },
    x: {
      control: {type: 'select', options: xOptions},
    },
    y: {
      control: {type: 'select', options: xOptions},
    },
    fill: {
      control: {type: 'check', options: fillOptions},
    },
    xScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    yScale: {
      control: {type: 'select', options: ['linear', 'log']},
    },
    timeZone: {
      control: {
        type: 'select',
        options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
      },
    },
    timeFormat: {
      control: {type: 'select', options: [...TIME_FORMAT_OPTIONS]},
    },
    legendOrientationThreshold: {
      control: {type: 'number'},
    },
    legendColorizeRows: {
      control: {type: 'boolean'},
    },
    legendHide: {
      control: {type: 'boolean'},
    },
    xTotalTicks: {
      control: {type: 'number'},
    },
    yTotalTicks: {
      control: {type: 'number'},
    },
    linePosition: {
      control: {type: 'select', options: ['overlaid', 'stacked']},
    },
    interpolation: {
      control: {
        type: 'select',
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
    },
    colorScheme: {
      control: {type: 'select', options: Object.keys(COLOR_SCHEME_OPTIONS)},
    },
    lineWidth: {
      control: {type: 'number'},
    },
    hoverDimension: {
      control: {type: 'select', options: ['auto', 'x', 'y', 'xy']},
    },
    pin: {
      control: {type: 'select', options: ['none', 'circle', 'start', 'stop']},
    },
  },
}
