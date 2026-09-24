import {DependencyList, RefObject, useLayoutEffect} from 'react'
import {clearCanvas} from './clearCanvas'

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement>,
  width: number,
  height: number,
  renderFunction: (context: CanvasRenderingContext2D) => void,
  renderFunctionDeps?: DependencyList,
): void => {
  const deps = renderFunctionDeps
    ? [canvasRef.current, width, height, ...renderFunctionDeps]
    : undefined

  // TODO: Resize canvas immediately on width/height change but debounce drawing
  useLayoutEffect(() => {
    if (!canvasRef.current) {
      return
    }

    clearCanvas(canvasRef.current, width, height)
    renderFunction(canvasRef.current.getContext('2d'))
  }, deps)
}
