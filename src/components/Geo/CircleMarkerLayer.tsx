// Libraries
import L from 'leaflet'
import {FunctionComponent, useEffect, useMemo} from 'react'

// Types
import {GeoTable} from './processing/GeoTable'
import {GeoCircleViewLayer} from './geoTypes'

// Utils
import {formatCircleMarkerRowInfo} from './geo'
import {
  calculateMinAndMax,
  getColor,
  normalizeValue,
} from './dimensionCalculations'
import {useGeoMap} from './GeoMapContext'
import type {GeoTooltipConfig} from './GeoTooltip'
import {GeoTooltip} from './GeoTooltip'

const DEFAULT_RADIUS = 50

interface Props {
  radiusFieldName: string
  colorFieldName: string
  table: GeoTable
  properties: GeoCircleViewLayer
  tooltipConfig: GeoTooltipConfig
  width: number
  height: number
}

export const CircleMarkerLayer: FunctionComponent<Props> = ({
  table,
  radiusFieldName,
  colorFieldName,
  properties,
  tooltipConfig,
  width,
  height,
}) => {
  const map = useGeoMap()

  const {bounds} = properties.radiusDimension

  const {markers, tooltips} = useMemo(() => {
    const radiusMinAndMax = radiusFieldName
      ? calculateMinAndMax(bounds, table, radiusFieldName)
      : null
    const markers = []
    const tooltips = []
    const rowCount = table.getRowCount()
    for (let i = 0; i < rowCount; i++) {
      const latLon = table.getLatLon(i)
      if (!latLon) {
        continue
      }
      const {lat, lon} = latLon
      const radiusValue = table.getValue(i, radiusFieldName)
      if (radiusValue !== undefined) {
        const colorValue = table.getValue(i, colorFieldName)
        const radius = normalizeValue(
          radiusMinAndMax,
          properties.radius || DEFAULT_RADIUS,
          radiusValue,
        )
        const color = getColor(
          properties.colors,
          colorValue,
          properties.interpolateColors,
        )
        const marker = L.circleMarker([lat, lon], {color, radius})
        markers.push(marker)
        const rowInfo = formatCircleMarkerRowInfo(properties, table, i)
        tooltips.push({markerRef: {current: marker}, rowInfo})
      }
    }
    return {markers, tooltips}
  }, [table, radiusFieldName, colorFieldName, bounds, properties])

  useEffect(() => {
    if (!map || markers.length === 0) {
      return
    }
    const layer = L.layerGroup(markers)
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, markers])

  return (
    <GeoTooltip
      config={tooltipConfig}
      width={width}
      height={height}
      tooltips={tooltips}
    />
  )
}

export default CircleMarkerLayer
