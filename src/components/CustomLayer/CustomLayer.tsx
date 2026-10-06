// Libraries
import type {FunctionComponent, ReactElement} from 'react'

// Components
import {getFormatterForColumn, usePlot} from 'components/Plot/PlotEnv'

// Types
import type {ColumnType, Formatter, Scale} from 'types'

/*
  What a custom layer gets handed. This is the same set the old
  `type: 'custom'` layer received, minus `key` -- that existed only because
  layers were rendered out of an array, and React owns keys for children.

  There is deliberately no hover here. Anything rendered inside <Plot> can call
  `usePlotInteraction()` itself, so this render prop is a convenience rather than
  a gate: if you need hoverX / hoverY, or any state of your own, reach past it.
*/
export interface CustomLayerRenderProps {
  xScale: Scale<number, number>
  yScale: Scale<number, number>
  xDomain: number[]
  yDomain: number[]
  width: number
  height: number
  innerWidth: number
  innerHeight: number
  yColumnType: ColumnType
  columnFormatter: (columnKey: string) => Formatter
}

export interface CustomLayerProps {
  children: (props: CustomLayerRenderProps) => ReactElement
}

/*
  Custom content inside a plot's layer container.

  This used to be `{type: 'custom', render}` in `config.layers`, which meant
  <Plot> had to know a layer could be a function. It does not any more, and does
  not need to: <Plot> renders its children inside the same absolutely-positioned
  container every other layer draws into, and this reads the plot environment
  from context. Stacking order is JSX order, exactly as array order used to be.

  Note that everything inside `.giraffe-plot` is absolutely positioned, so what
  you return has to position itself.
*/
export const CustomLayer: FunctionComponent<CustomLayerProps> = ({
  children,
}) => {
  const env = usePlot()

  return children({
    xScale: env.xScale,
    yScale: env.yScale,
    xDomain: env.xDomain,
    yDomain: env.yDomain,
    width: env.width,
    height: env.height,
    innerWidth: env.innerWidth,
    innerHeight: env.innerHeight,
    yColumnType: env.yColumnType,
    columnFormatter: (columnKey: string) =>
      getFormatterForColumn(env.config, env.table, columnKey),
  })
}
