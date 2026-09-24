import {FunctionComponent, useEffect} from 'react'
import {useGeoMap} from './GeoMapContext'

interface Props {
  onViewportChange?: (lat: number, lon: number, zoom: number) => void
}

const ViewportObserver: FunctionComponent<Props> = ({onViewportChange}) => {
  const map = useGeoMap()
  useEffect(() => {
    if (!map || !onViewportChange) {
      return
    }
    const onMoveend = () => {
      const center = map.getCenter()
      onViewportChange(center.lat, center.lng, map.getZoom())
    }
    map.on('moveend', onMoveend)
    return () => {
      map.off('moveend', onMoveend)
    }
  }, [map, onViewportChange])
  return null
}

export default ViewportObserver
