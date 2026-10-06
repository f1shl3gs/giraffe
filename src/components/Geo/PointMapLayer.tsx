// Libraries
import L from 'leaflet'
import {FunctionComponent, useEffect, useMemo} from 'react'

import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Utils
import {
  createClusterCustomIcon,
  formatPointLayerRowInfo,
  MARKER_ICON_SIZE,
} from './geo'

import {getColor} from './dimensionCalculations'
import {useGeoMap} from './GeoMapContext'
import type {GeoTooltipConfig} from './GeoTooltip'
import {GeoTooltip} from './GeoTooltip'
import type {GeoPointMapViewLayer} from './geoTypes'

// Types
import {GeoTable} from './processing/GeoTable'
import {SVGIcon} from './SVGIcon'

interface Props {
  table: GeoTable
  colorFieldName: string
  properties: GeoPointMapViewLayer
  tooltipConfig: GeoTooltipConfig
  width: number
  height: number
  isClustered: boolean
}

export const PointMapLayer: FunctionComponent<Props> = ({
  table,
  colorFieldName,
  properties,
  isClustered,
  tooltipConfig,
  width,
  height,
}) => {
  const map = useGeoMap()

  const {markers, tooltips} = useMemo(() => {
    const rowCount = table.getRowCount()
    const markers = []
    const tooltips = []
    for (let i = 0; i < rowCount; i++) {
      const latLon = table.getLatLon(i)
      if (!latLon) {
        continue
      }
      const {lat, lon} = latLon
      const colorValue = table.getValue(i, colorFieldName)
      const color = getColor(properties.colors, colorValue, false)
      const icon = SVGIcon({color: color, iconSize: MARKER_ICON_SIZE})
      const marker: any = L.marker([lat, lon], {icon})
      marker.clusterRenderingProperties = properties
      marker.value = table.getValue(i, properties.colorField)
      markers.push(marker)
      tooltips.push({
        markerRef: {current: marker},
        rowInfo: formatPointLayerRowInfo(properties, table, i),
      })
    }
    return {markers, tooltips}
  }, [table, colorFieldName, properties])

  useEffect(() => {
    if (!map || markers.length === 0) {
      return
    }
    const clusterGroup =
      isClustered === true
        ? (L as any).markerClusterGroup({
            iconCreateFunction: createClusterCustomIcon,
            maxClusterRadius: properties.maxClusterRadius || 40,
          })
        : null
    if (clusterGroup) {
      clusterGroup.addLayers(markers)
      clusterGroup.addTo(map)
    } else {
      markers.forEach(m => {
        m.addTo(map)
      })
    }
    return () => {
      if (clusterGroup) {
        clusterGroup.remove()
      } else {
        markers.forEach(m => {
          m.remove()
        })
      }
    }
  }, [map, isClustered, markers, properties])

  return (
    <GeoTooltip
      config={tooltipConfig}
      width={width}
      height={height}
      tooltips={tooltips}
    />
  )
}

export default PointMapLayer
