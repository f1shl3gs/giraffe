// Libraries
import React, {FunctionComponent, useEffect, useMemo} from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Utils
import {getColor} from './dimensionCalculations'
import {SVGIcon} from './SVGIcon'
import {GeoTooltip} from './GeoTooltip'
import {useGeoMap} from './GeoMapContext'

import {
  formatPointLayerRowInfo,
  createClusterCustomIcon,
  MARKER_ICON_SIZE,
} from '../../utils/geo'

// Types
import {GeoTable} from './processing/GeoTable'
import {GeoPointMapViewLayer, Config} from '../../types'

interface Props {
  table: GeoTable
  colorFieldName: string
  properties: GeoPointMapViewLayer
  stylingConfig: Partial<Config>
  isClustered: boolean
}

export const PointMapLayer: FunctionComponent<Props> = props => {
  const {table, colorFieldName, properties, stylingConfig, isClustered} = props
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
      stylingConfig={stylingConfig}
      properties={properties}
      table={table}
      tooltips={tooltips}
    />
  )
}

export default PointMapLayer
