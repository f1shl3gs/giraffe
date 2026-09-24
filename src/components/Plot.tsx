// Libraries
import {FunctionComponent, RefObject, ReactElement, useRef} from 'react'

// Components
import {AutoSizer} from './AutoSizer'
import {PlotResizer, TableResizer} from './PlotResizer'

// Types
import {Config, SizedConfig} from 'types'

// Utils
import {hasPlotEnv} from 'utils/hasPlotEnv'

interface Props {
  config: Config
  axesCanvasRef?: RefObject<HTMLCanvasElement>
  layerCanvasRef?: RefObject<HTMLCanvasElement>
  children?: ReactElement
}

export const Plot: FunctionComponent<Props> = ({
  config,
  children,
  axesCanvasRef,
  layerCanvasRef,
}) => {
  const resolvedAxesCanvasRef = axesCanvasRef ?? useRef<HTMLCanvasElement>(null)
  const resolvedLayerCanvasRef =
    layerCanvasRef ?? useRef<HTMLCanvasElement>(null)

  if (config.width && config.height) {
    return hasPlotEnv(config) ? (
      <div className='giraffe-fixedsizer' style={{position: 'relative'}}>
        <PlotResizer
          axesCanvasRef={resolvedAxesCanvasRef}
          config={config as SizedConfig}
          height={config.height}
          layerCanvasRef={resolvedLayerCanvasRef}
          width={config.width}
        >
          {children}
        </PlotResizer>
      </div>
    ) : (
      <TableResizer
        config={config as SizedConfig}
        height={config.height}
        width={config.width}
      >
        {children}
      </TableResizer>
    )
  }

  return hasPlotEnv(config) ? (
    <AutoSizer className='giraffe-autosizer'>
      {({width, height}) => (
        <PlotResizer
          axesCanvasRef={resolvedAxesCanvasRef}
          config={config as SizedConfig}
          height={height}
          layerCanvasRef={resolvedLayerCanvasRef}
          width={width}
        >
          {children}
        </PlotResizer>
      )}
    </AutoSizer>
  ) : (
    <AutoSizer className='giraffe-autosizer'>
      {({width, height}) => (
        <TableResizer
          config={config as SizedConfig}
          height={height}
          width={width}
        >
          {children}
        </TableResizer>
      )}
    </AutoSizer>
  )
}
