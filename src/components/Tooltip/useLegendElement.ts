// Libraries
import {useEffect, useRef} from 'react'

// Utils
import {useLayoutStyle} from 'utils/useLayoutStyle'
import {useRefMousePos} from 'utils/useMousePos'

// Constants
import {CLOCKFACE_Z_INDEX, LEAFLET_Z_INDEX} from 'constants/index'

const MARGIN_X = 30

/*
  Returns a DOM node that a tooltip can be rendered inside.

  The node will be created and appended to the end of the document body on
  mount. After every render, the tooltip is automatically positioned to be next
  to the mouse. It will be destroyed on unmount.

  The returned node is intended to be used with `React.createPortal`. It is
  appended to the end of the document to circumvent z-index issues.
*/
export const useLegendElement = (className: string) => {
  const ref = useRef<HTMLDivElement>(null)

  if (ref.current === null) {
    ref.current = document.createElement('div')
    ref.current.classList.add(className)
  }

  useEffect(() => {
    document.body.appendChild(ref.current)
    return () => {
      document.body.removeChild(ref.current)
    }
  }, [])

  useTooltipStyle(ref.current)

  return ref.current
}

const useTooltipStyle = (el: HTMLDivElement) => {
  const {x, y} = useRefMousePos(document.body)

  // Position the tooltip next to the mouse cursor, like this:
  //
  //                   ┌─────────────┐
  //                   │             │
  //          (mouse)  │   tooltip   │
  //                   │             │
  //                   └─────────────┘
  //
  // The positioning is subject to the following restrictions:
  //
  // - If the tooltip overflows the right side of the screen, position it on
  //   the left side of the cursor instead
  //
  // - If the tooltip overflows the top or bottom of the screen (with a bit of
  //   margin), shift it just enough so that it is fully back inside the screen
  //
  useLayoutStyle(
    el,
    ({offsetWidth: tooltipWidth, offsetHeight: tooltipHeight}) => {
      if (x === null || y === null) {
        return {
          display: 'none',
        }
      }

      let dx = MARGIN_X
      let dy = 0 - tooltipHeight / 2

      if (x + dx + tooltipWidth > window.innerWidth) {
        dx = 0 - MARGIN_X - tooltipWidth
      }

      if (y + dy + tooltipHeight > window.innerHeight) {
        dy -= y + dy + tooltipHeight - window.innerHeight
      }

      if (y + dy < 0) {
        dy += 0 - (y + dy)
      }

      const clampedX = Math.max(x + dx, 8)
      const clampedY = Math.max(y + dy, 8)

      /* Geo widget maps are rendered with z-index: 399, we have to set it above
       that so that tooltips are not rendered/are hidden below the map, */
      return {
        display: 'inline',
        position: 'fixed',
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        zIndex: CLOCKFACE_Z_INDEX + LEAFLET_Z_INDEX + 1,
      }
    },
  )
}
