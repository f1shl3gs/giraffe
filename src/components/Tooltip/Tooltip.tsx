// Libraries

// Components
import {Legend} from 'components/Legend'
// Types
import type {LegendConfig} from 'components/Legend/LegendConfig'
// Constants
import {TOOLTIP_MAXIMUM_OPACITY, TOOLTIP_MINIMUM_OPACITY} from 'constants/index'
import {FunctionComponent, useMemo} from 'react'
import {createPortal} from 'react-dom'
import type {LegendData} from 'types'
// Hooks
import {useLegendElement} from './useLegendElement'

interface Props {
  data: LegendData
  /* The tooltip only ever styles and filters the legend, so it takes the
     legend half of the config rather than a whole PlotConfig. Geo renders
     tooltips too and is not a plot. */
  config: LegendConfig
  width: number
  height: number
}

/* Callers are expected to keep this mounted and hand it empty data when there
   is nothing hovered, rather than unmounting it. Mounting puts a detached div
   on screen for a frame: useLegendElement creates the element during render and
   only appends it in a passive effect, so the layout effect that positions the
   tooltip measures offsetWidth on a node that is not in the document yet and
   reads 0. With no width there is nothing to flip against, so the tooltip lands
   on one side of the cursor and then jumps to the other once it is attached. */

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

  let isTooltipHidden = Boolean(isHidden) || data.length === 0
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
