import type {LegendConfig} from 'components/Legend/LegendConfig'
import {TOOLTIP_MAXIMUM_OPACITY, TOOLTIP_MINIMUM_OPACITY} from 'constants/index'
import {FunctionComponent, useMemo} from 'react'
import {createPortal} from 'react-dom'
import {LegendData} from 'types'
import {useLegendElement} from 'utils/legend/useTooltipElement'
import {Legend} from './Legend'

interface Props {
  data: LegendData
  /* The tooltip only ever styles and filters the legend, so it takes the
     legend half of the config rather than a whole PlotConfig. Geo renders
     tooltips too and is not a plot. */
  config: LegendConfig
  width: number
  height: number
}

export const Tooltip: FunctionComponent<Props> = ({
  data,
  config,
  width,
  height,
}) => {
  const {
    backgroundColor,
    border,
    columns,
    font,
    fontBrightColor,
    hide: isHidden,
    opacity: legendOpacity,
  } = config
  const tooltipElement = useLegendElement('giraffe-tooltip-container')

  const tooltipOpacity = useMemo(() => {
    if (
      legendOpacity >= TOOLTIP_MINIMUM_OPACITY &&
      legendOpacity <= TOOLTIP_MAXIMUM_OPACITY
    ) {
      return legendOpacity
    }
    return TOOLTIP_MAXIMUM_OPACITY
  }, [legendOpacity])

  let isTooltipHidden = Boolean(isHidden)
  if (Array.isArray(columns) && columns.length === 0) {
    isTooltipHidden = true
  }

  if (isTooltipHidden) {
    return null
  }

  const tooltipContents = (
    <Legend
      type='tooltip'
      data={data}
      config={config}
      width={width}
      height={height}
    />
  )

  return createPortal(
    <div
      className='giraffe-tooltip'
      style={{
        backgroundColor,
        border,
        borderRadius: '3px',
        color: fontBrightColor,
        cursor: 'crosshair',
        font,
        opacity: tooltipOpacity,
        padding: '10px',
      }}
      data-testid='giraffe-tooltip'
    >
      {tooltipContents}
    </div>,
    tooltipElement,
  )
}
