// Libraries
import {useEffect, useRef} from 'react'

// Utils
import {useLayoutStyle} from 'utils/useLayoutStyle'
import {useRefMousePos} from 'utils/useMousePos'

// Constants
import {CLOCKFACE_Z_INDEX, LEAFLET_Z_INDEX} from 'constants/index'

const MARGIN_X = 30

/*
  How far the cursor has to travel back past the threshold before the tooltip
  changes sides again.

  The threshold is a single pixel wide: only at x = innerWidth - MARGIN_X -
  tooltipWidth does the choice flip. Any movement of the hand across it flips the
  tooltip from one side of the cursor to the other, which moves it by its own
  width plus twice the margin, so it appears to teleport on every frame. Requiring
  the cursor to clear the threshold by this much before switching back means
  ordinary movement around the boundary cannot cause a second flip.
*/
const SWITCH_MARGIN = 12

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
    /*
      A wide tooltip reaches the cursor: it is positioned a margin away on
      whichever side has room, so once it is wider than the space to the right of
      the cursor it covers the cursor instead of staying clear of it. Taking
      pointer events it then hides the plot underneath, the plot sees the cursor
      leave and drops its hover state, and the tooltip disappears -- uncovering
      the cursor, which brings the whole cycle back. The tooltip is a readout, so
      it must never take the pointer.
    */
    ref.current.style.pointerEvents = 'none'
    /* Appended here, during render, rather than in an effect. The tooltip
       positions itself in a layout effect by reading its own offsetWidth, and a
       node that is not in the document yet measures 0. Reading 0 makes the
       overflow test below pass, so a freshly mounted tooltip would sit on the
       right of the cursor and then jump to the left on the next frame, once the
       node was attached and the real width was measured. */
    document.body.appendChild(ref.current)
  }

  useEffect(() => {
    return () => {
      document.body.removeChild(ref.current)
    }
  }, [])

  useTooltipStyle(ref.current)

  return ref.current
}

const useTooltipStyle = (el: HTMLDivElement) => {
  const {x, y} = useRefMousePos(document.body)
  /* Which side of the cursor the tooltip is on. See SWITCH_MARGIN. */
  const sideRef = useRef<'right' | 'left'>('right')

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

      if (x + MARGIN_X + tooltipWidth > window.innerWidth) {
        sideRef.current = 'left'
      } else if (
        x + MARGIN_X + tooltipWidth + SWITCH_MARGIN <=
        window.innerWidth
      ) {
        sideRef.current = 'right'
      }

      if (sideRef.current === 'left') {
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
