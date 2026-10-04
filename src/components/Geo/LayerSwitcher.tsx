// Libraries
import {FunctionComponent} from 'react'

// Components
import CircleMarkerLayer from './CircleMarkerLayer'
import type {GeoTooltipConfig} from './GeoTooltip'
// Types
import type {
  GeoCircleViewLayer,
  GeoHeatMapViewLayer,
  GeoPointMapViewLayer,
  GeoTrackMapViewLayer,
  GeoViewLayer,
} from './geoTypes'
import HeatmapLayer from './HeatmapLayer'
import PointMapLayer from './PointMapLayer'
import {GeoTable} from './processing/GeoTable'
import TrackMapLayer from './TrackMapLayer'

interface Props {
  layer: GeoViewLayer
  preprocessedTable: GeoTable
  index: number
  tooltipConfig: GeoTooltipConfig
  width: number
  height: number
}

export const LayerSwitcher: FunctionComponent<Props> = ({
  layer,
  preprocessedTable,
  index,
  tooltipConfig,
  width,
  height,
}) => {
  switch (layer.type) {
    case 'circleMap':
      const circleLayer = layer as GeoCircleViewLayer
      return (
        <CircleMarkerLayer
          key={index}
          radiusFieldName={circleLayer.radiusField}
          colorFieldName={circleLayer.colorField}
          table={preprocessedTable}
          properties={circleLayer}
          tooltipConfig={tooltipConfig}
          width={width}
          height={height}
        />
      )
    case 'heatmap':
      const heatmapLayer = layer as GeoHeatMapViewLayer
      return (
        <HeatmapLayer
          key={index}
          intensityFieldName={heatmapLayer.intensityField}
          table={preprocessedTable}
          blur={heatmapLayer.blur}
          radius={heatmapLayer.radius}
          properties={heatmapLayer}
        />
      )
    case 'pointMap':
      const pointMapLayer = layer as GeoPointMapViewLayer
      return (
        <PointMapLayer
          key={index}
          colorFieldName={pointMapLayer.colorField}
          table={preprocessedTable}
          properties={pointMapLayer}
          tooltipConfig={tooltipConfig}
          width={width}
          height={height}
          isClustered={pointMapLayer.isClustered === true}
        />
      )
    case 'trackMap':
      const trackMapLayer = layer as GeoTrackMapViewLayer
      return (
        <TrackMapLayer
          key={index}
          table={preprocessedTable}
          properties={trackMapLayer}
          tooltipConfig={tooltipConfig}
          width={width}
          height={height}
        />
      )
    default:
      return null
  }
}
