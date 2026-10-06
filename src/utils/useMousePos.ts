// Libraries
import {MouseEvent, useEffect, useMemo, useState} from 'react'

export interface Position {
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
  const [state, setState] = useState({x: 0, y: 0})

  useEffect(() => {
    if (!el) {
      // Force one more render to give the ref a chance to attach
      setState({x: 0, y: 0})

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
