import L from 'leaflet'
import {FunctionComponent, useEffect} from 'react'
import {useGeoMap} from './GeoMapContext'

interface Props {
  url: string
}

const TileLayer: FunctionComponent<Props> = ({url}) => {
  const map = useGeoMap()
  useEffect(() => {
    if (!map) {
      return
    }
    const layer = L.tileLayer(url, {minNativeZoom: 3})
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, url])
  return null
}

export default TileLayer
