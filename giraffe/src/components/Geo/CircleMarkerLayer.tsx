// Libraries
import React, {FunctionComponent, useEffect, useMemo} from 'react'
import L from 'leaflet'

// Utils
import {
  calculateMinAndMax,
  getColor,
  normalizeValue,
} from './dimensionCalculations'
import {formatCircleMarkerRowInfo} from '../../utils/geo'
import {GeoTooltip} from './GeoTooltip'
import {useGeoMap} from './GeoMapContext'

// Types
import {GeoTable} from './processing/GeoTable'
import {Config} from '../../types'
import {GeoCircleViewLayer} from '../../types/geo'

const DEFAULT_RADIUS = 50

interface Props {
  radiusFieldName: string
  colorFieldName: string
  table: GeoTable
  properties: GeoCircleViewLayer
  stylingConfig: Partial<Config>
}

export const CircleMarkerLayer: FunctionComponent<Props> = props => {
  const {table, radiusFieldName, colorFieldName, stylingConfig, properties} =
    props
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
          radiusValue
        )
        const color = getColor(
          properties.colors,
          colorValue,
          properties.interpolateColors
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
      stylingConfig={stylingConfig}
      properties={properties}
      table={table}
      tooltips={tooltips}
    />
  )
}

export default CircleMarkerLayer