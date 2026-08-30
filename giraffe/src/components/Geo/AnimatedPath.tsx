// Libraries
import {FunctionComponent, useEffect} from 'react'
import L from 'leaflet'
import type {LatLngExpression} from 'leaflet'

// Utils
import {useGeoMap} from './GeoMapContext'

// Types
import {Track} from './processing/GeoTable'

/*
  In-house replacement for react-leaflet-ant-path / leaflet-ant-path.

  The visual effect is a track drawn as two stacked polylines:
    - a solid main path in the track color, and
    - a dashed pulse path in the pulse color whose stroke-dashoffset is
      animated with the Web Animations API (no stylesheet needed).

  Differences from leaflet-ant-path, by design:
    - The animation speed is derived from the `delay` option only and does
      NOT change with the map zoom. The original formula was
      `1 + delay/3/zoom` seconds; we keep that shape but pin zoom to a
      typical value of 10, giving `1 + delay/30` seconds.
    - Only the options TrackMapLayer actually uses are supported
      (color, pulseColor, weight, delay, hardwareAccelerated).
*/

interface AnimatedPathOptions {
  color?: string
  pulseColor?: string
  weight?: number
  delay?: number
  hardwareAccelerated?: boolean
}

interface Props {
  positions: Track
  options: AnimatedPathOptions
}

const DEFAULT_OPTIONS = {
  color: '#0000FF',
  pulseColor: '#FFFFFF',
  weight: 5,
  delay: 400,
  opacity: 0.5,
  dashArray: [10, 20],
}

export const AnimatedPath: FunctionComponent<Props> = ({
  positions,
  options,
}) => {
  const map = useGeoMap()
  const merged = {...DEFAULT_OPTIONS, ...options}
  const coordinates = positions as LatLngExpression[]
  const {color, pulseColor, weight, delay, opacity, dashArray} = merged
  const hardwareAccelerated = !!options.hardwareAccelerated

  useEffect(() => {
    if (!map) {
      return
    }
    const pathOptions = {color, weight, opacity}
    const main = L.polyline(coordinates, pathOptions)
    const pulse = L.polyline(coordinates, {
      ...pathOptions,
      color: pulseColor,
      dashArray,
      fill: false,
      className: 'giraffe-ant-path',
    })
    main.addTo(map)
    pulse.addTo(map)

    const pulseElement = pulse.getElement()
    if (pulseElement && hardwareAccelerated) {
      // Leaflet applies its own transform to the renderer container, not to
      // this path element, so an inline transform here is safe.
      (pulseElement as HTMLElement).style.transform = 'translateZ(0)'
    }

    // Fixed speed: 1 + delay/30 seconds, independent of map zoom.
    const animation =
      pulseElement &&
      pulseElement.animate(
        [{strokeDashoffset: '100%'}, {strokeDashoffset: '0%'}],
        {
          duration: (1 + delay / 30) * 1000,
          iterations: Infinity,
          easing: 'linear',
        }
      )

    return () => {
      if (animation) {
        animation.cancel()
      }
      main.remove()
      pulse.remove()
    }
  }, [
    map,
    coordinates,
    color,
    pulseColor,
    weight,
    opacity,
    dashArray,
    delay,
    hardwareAccelerated,
  ])

  return null
}

export default AnimatedPath
