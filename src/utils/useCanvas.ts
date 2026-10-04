// Libraries
import {DependencyList, RefObject, useLayoutEffect, useRef} from 'react'

// Utils
import {clearCanvas} from './clearCanvas'

export const useCanvas = (
  width: number,
  height: number,
  render: (ctx: CanvasRenderingContext2D) => void,
  deps: DependencyList = [],
): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const canvas = ref.current
    if (!canvas) {
      return
    }

    clearCanvas(canvas, width, height)

    const context = canvas.getContext('2d')
    if (context) {
      render(context)
    }
  }, [width, height, ...deps])

  return ref
}
