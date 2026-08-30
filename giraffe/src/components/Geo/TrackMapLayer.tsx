// Libraries
import React, {FunctionComponent, useEffect, useMemo} from 'react'
import L from 'leaflet'

// Components
import {AnimatedPath} from './AnimatedPath'

// Utils
import {useGeoMap} from './GeoMapContext'

// Types
import {GeoTable} from './processing/GeoTable'
import {GeoTrackMapViewLayer} from '../../types/geo'
import {Config} from '../../types'

interface Props {
  table: GeoTable
  properties: GeoTrackMapViewLayer
  stylingConfig: Partial<Config>
}

const DEFAULT_TRACK_COLOR = [{hex: '#FFC400'}, {hex: '#F90A13'}]
const DEFAULT_TRACK_PALETTE = [
  {hex: 'blue'},
  {hex: 'red'},
  {hex: 'green'},
  {hex: 'brown'},
  {hex: 'black'},
  {hex: 'deeppink'},
  {hex: 'olive'},
]
const DEFAULT_END_MARKER_RADIUS = 4

export const TrackMapLayer: FunctionComponent<Props> = props => {
  const {table, properties} = props
  const map = useGeoMap()
  const endStopMarkers =
    properties.endStopMarkers === undefined || properties.endStopMarkers
  const endStopMarkerRadius =
    properties.endStopMarkerRadius || DEFAULT_END_MARKER_RADIUS

  const {paths, endStopMarkerSpecs} = useMemo(() => {
    const options = {
      weight: properties.trackWidth || 3,
      delay: 50 + (properties.speed || 500),
      hardwareAccelerated: true,
    }
    const endStopMarkerSpecs = []
    const colors = properties.colors || DEFAULT_TRACK_COLOR
    const palette = !properties.colors && properties.randomColors
      ? DEFAULT_TRACK_PALETTE
      : colors
    const paths = table.mapTracks((track, trackOptions, index) => {
      let startColor, endColor
      if (properties.randomColors) {
        startColor = palette[index % DEFAULT_TRACK_PALETTE.length].hex
        endColor = 'white'
      } else {
        startColor = colors[0].hex
        endColor = colors[colors.length - 1].hex
      }

      if (endStopMarkers) {
        endStopMarkerSpecs.push({
          lat: track[0][0],
          lon: track[0][1],
          color: startColor,
        })
        endStopMarkerSpecs.push({
          lat: track[track.length - 1][0],
          lon: track[track.length - 1][1],
          color: startColor,
        })
      }

      const optionsWithColor = {
        ...trackOptions,
        ...options,
        color: startColor,
        pulseColor: startColor === endColor ? 'white' : endColor,
      }
      return (
        <AnimatedPath
          key={index}
          positions={track}
          options={optionsWithColor}
        />
      )
    }, options)
    return {paths, endStopMarkerSpecs}
  }, [table, properties, endStopMarkers])

  useEffect(() => {
    if (!map) {
      return
    }
    const markers = endStopMarkerSpecs.map(spec => {
      return L.circleMarker([spec.lat, spec.lon], {
        radius: endStopMarkerRadius,
        fill: true,
        color: spec.color,
        fillColor: spec.color,
        fillOpacity: 1,
      })
    })
    const layer = L.layerGroup(markers)
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, endStopMarkerSpecs, endStopMarkers, endStopMarkerRadius])

  return <>{paths}</>
}

export default TrackMapLayer