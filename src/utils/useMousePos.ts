// Libraries
import {MouseEvent, useEffect, useMemo, useState} from 'react'

interface Position {
  x: number | null
  y: number | null
}

export const useMousePos = () => {
  const [position, setPosition] = useState<Position>({x: null, y: null})

  const callbacks = useMemo(
    () => ({
      onMouseMove(ev: MouseEvent<HTMLDivElement>) {
        const {top, left} = ev.currentTarget.getBoundingClientRect()

        setPosition({
          x: ev.clientX - left,
          y: ev.clientY - top,
        })
      },
      onMouseLeave() {
        setPosition({x: null, y: null})
      },
    }),
    [],
  )

  return {
    position,
    ...callbacks,
  }
}

export const useRefMousePos = (el: Element): Position => {
  /*
    Null until the first mousemove, not (0, 0). The tooltip places itself from
    this position, and (0, 0) would put it in the top left corner: a tooltip
    that mounts before it has seen a mouse event is briefly drawn there.
  */
  const [state, setState] = useState<Position>({x: null, y: null})

  useEffect(() => {
    if (!el) {
      // Force one more render to give the ref a chance to attach
      setState({x: null, y: null})

      return
    }

    const onMouseMove = e => {
      setState({x: e.x, y: e.y})
    }

    const onMouseLeave = () => {
      setState({x: null, y: null})
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [el])

  return state
}
