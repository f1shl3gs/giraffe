// Libraries
import React, {FunctionComponent} from 'react'

import GeoHeatmapCanvas from './heatmap/GeoHeatmapCanvas'
import {useGeoMap} from './GeoMapContext'

// Types
import {GeoTable} from './processing/GeoTable'
import {GeoHeatMapViewLayer} from '../../types/geo'

// Utils
import {calculateMinAndMax, normalizeValue} from './dimensionCalculations'

interface Props {
  table: GeoTable
  intensityFieldName: string
  radius?: number
  blur?: number
  properties: GeoHeatMapViewLayer
}

const DEFAULT_BLUR = 15
const DEFAULT_RADIUS = 30
const DEFAULT_GRADIENT = {0.4: 'blue', 0.8: 'orange', 1.0: 'red'}

const HeatmapLayer: FunctionComponent<Props> = props => {
  const {properties, table, intensityFieldName, radius, blur} = props
  const map = useGeoMap()
  const {bounds} = properties.intensityDimension
  const intensityMinAndMax = intensityFieldName
    ? calculateMinAndMax(bounds, table, intensityFieldName)
    : null
  const {colors} = properties
  const leafletGradient = colors
    ? colors.reduce((acc, v, i) => {
        acc[i / (colors.length - 1)] = v.hex
        return acc
      }, {})
    : DEFAULT_GRADIENT

  const count = table.getRowCount()
  const points = []
  for (let i = 0; i < count; i++) {
    const latLon = table.getLatLon(i)
    if (!latLon) {
      continue
    }
    const intensityValue = table.getValue(i, intensityFieldName)
    if (!intensityValue) {
      continue
    }
    const normalizedValue = normalizeValue(
      intensityMinAndMax,
      1,
      intensityValue
    )
    points.push({...latLon, intensity: normalizedValue})
  }
  return (
    <GeoHeatmapCanvas
      {...{
        points,
        radius: radius || DEFAULT_RADIUS,
        blur: blur || DEFAULT_BLUR,
        max: 1,
        minOpacity: 0.5,
        gradient: leafletGradient,
        map,
      }}
    />
  )
}

export default HeatmapLayer
