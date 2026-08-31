// Types
import {Axis} from '../../../types/geo'

export const formatValue = (
  key: string,
  defaultLabel: string,
  value: number,
  dimension: Axis = {}
) => {
  const {prefix = '', suffix = ''} = dimension
  const formattedValue = `${prefix}${value}${suffix}`
  if (value !== undefined && value !== null) {
    return {
      key: key,
      name: defaultLabel,
      type: 'string',
      values: [formattedValue],
    }
  }
}

export const defineToolTipEffect = (markerRefs, setToolTip) => {
  return () => {
    const boundHandlers = []
    for (let i = 0; i < markerRefs.length; i++) {
      const {markerRef, rowInfo} = markerRefs[i]
      const marker = markerRef.current
      let mouseEntered = false
      const onMouseOver = () => {
        if (!mouseEntered) {
          setToolTip(rowInfo)
          mouseEntered = true
        }
      }
      const onMouseOut = () => {
        mouseEntered = false
        setToolTip(null)
      }
      marker.on('mouseover', onMouseOver)
      marker.on('mouseout', onMouseOut)
      boundHandlers.push({marker, onMouseOver, onMouseOut})
    }
    return () => {
      for (const {marker, onMouseOver, onMouseOut} of boundHandlers) {
        marker.off('mouseover', onMouseOver)
        marker.off('mouseout', onMouseOut)
      }
    }
  }
}
