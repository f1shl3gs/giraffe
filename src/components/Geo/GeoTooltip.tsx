// Libraries
import {FunctionComponent, useLayoutEffect, useState} from 'react'

// Components
import {Tooltip} from 'components/Tooltip'

// Utils
import {defineToolTipEffect} from './processing/toolTips'

/*
  Geo's styling surface. Geo owns a leaflet viewport rather than a plot's x/y
  coordinate system, so it has no PlotConfig — but its tooltips render through
  the shared <Tooltip>/<Legend>, which still speak the flat, pre-LegendConfig
  `legend*` names and need the container's dimensions to decide row layout.

  These are the only fields Geo actually forwards.
*/
export interface GeoTooltipConfig {
  backgroundColor?: string
  border?: string
  colorizeRows?: boolean
  columns?: string[]
  font?: string
  fontBrightColor?: string
  fontColor?: string
  hide?: boolean
  opacity?: number
  orientationThreshold?: number
}

interface Props {
  config: GeoTooltipConfig
  width: number
  height: number
  tooltips: Array<{markerRef; rowInfo}>
}

export const GeoTooltip: FunctionComponent<Props> = ({
  width,
  height,
  config,
  tooltips,
}) => {
  const [tooltipData, setTooltipData] = useState(null)
  useLayoutEffect(defineToolTipEffect(tooltips, setTooltipData), [tooltips])

  return (
    <>
      {tooltipData && (
        <Tooltip
          data={tooltipData}
          config={config}
          width={width}
          height={height}
        />
      )}
    </>
  )
}
