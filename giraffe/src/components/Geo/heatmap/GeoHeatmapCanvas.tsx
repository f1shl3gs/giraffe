// Replaces react-leaflet-heatmap-layer and its rendering core simpleheat
// (both unmaintained for 8+ years) with the owned two-pass alpha-mapping
// renderer in ./drawHeatmap. Visual parity QA against the previous rendering
// lands with the Storybook phase.

// Libraries
import {FunctionComponent, useEffect, useRef} from 'react'
import Leaflet from 'leaflet'

// Utils
import {drawHeatmap} from './drawHeatmap'

interface LeafletMap {
  getPanes(): {overlayPane: HTMLElement}
  getSize(): {x: number; y: number}
  containerPointToLayerPoint(point: [number, number]): {x: number; y: number}
  latLngToContainerPoint(latLng: [number, number]): {x: number; y: number}
  on(events: string, handler: () => void): void
  off(events: string, handler: () => void): void
}

interface Props {
  map?: LeafletMap
  points: Array<{lat: number; lon: number; intensity: number}>
  radius: number
  blur: number
  max: number
  minOpacity: number
  gradient: Record<number, string>
}

const GeoHeatmapCanvas: FunctionComponent<Props> = ({
  map,
  points,
  radius,
  blur,
  max,
  minOpacity,
  gradient,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resetRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!map) {
      return undefined
    }
    const canvas = Leaflet.DomUtil.create('canvas', 'leaflet-zoom-animated')
    canvas.style.opacity = String(minOpacity)
    const pane = map.getPanes().overlayPane
    pane.appendChild(canvas)
    canvasRef.current = canvas

    const reset = () => resetRef.current()
    map.on('moveend zoomend resize viewreset', reset)

    return () => {
      map.off('moveend zoomend resize viewreset', reset)
      pane.removeChild(canvas)
      canvasRef.current = null
    }
  }, [map])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!map || !canvas) {
      return
    }
    canvas.style.opacity = String(minOpacity)
    resetRef.current = () => {
      const size = map.getSize()
      canvas.width = size.x
      canvas.height = size.y
      Leaflet.DomUtil.setPosition(
        canvas,
        map.containerPointToLayerPoint([0, 0]) as any
      )
      const projectedPoints = points.map(p => {
        const point = map.latLngToContainerPoint([p.lat, p.lon])
        return {x: point.x, y: point.y, intensity: p.intensity}
      })
      drawHeatmap(canvas, projectedPoints, {radius, blur, max, gradient})
    }
    resetRef.current()
  }, [map, points, radius, blur, max, minOpacity, gradient])

  return null
}

export default GeoHeatmapCanvas
