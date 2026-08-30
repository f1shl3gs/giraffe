import {FunctionComponent, useEffect} from 'react'
import L from 'leaflet'
import {BingLayerObject} from './BingLayerObject'
import {useGeoMap} from '../GeoMapContext'

interface Props {
  bingKey: string
  mapStyle?: string
}

export const BingMap: FunctionComponent<Props> = ({bingKey, mapStyle}) => {
  const map = useGeoMap()
  useEffect(() => {
    if (!map) {
      return
    }
    const makeLayer = (type?: string) =>
      new (BingLayerObject as any)(bingKey, {minNativeZoom: 3, type})
    const roads = makeLayer('Road')
    const satellitePlain = makeLayer(undefined)
    const satelliteLabels = makeLayer('AerialWithLabels')
    const dark = makeLayer('CanvasDark')
    const baseLayers = {
      Roads: roads,
      'Satellite (Plain)': satellitePlain,
      'Satellite (Labels)': satelliteLabels,
      'Dark mode': dark,
    }
    let defaultLayer = roads
    if (mapStyle === 'Satellite (plain)') {
      defaultLayer = satellitePlain
    } else if (mapStyle === 'Satellite') {
      defaultLayer = satelliteLabels
    } else if (mapStyle === 'Dark') {
      defaultLayer = dark
    }

    const control = L.control.layers(baseLayers, {}, {position: 'topright'})
    control.addTo(map)
    let activeLayer = defaultLayer
    const onBaseLayerChange = event => {
      activeLayer = event.layer
    }
    map.on('baselayerchange', onBaseLayerChange)
    map.addLayer(defaultLayer)

    return () => {
      map.off('baselayerchange', onBaseLayerChange)
      map.removeLayer(activeLayer)
      control.remove()
    }
  }, [bingKey, map, mapStyle])

  return null
}
