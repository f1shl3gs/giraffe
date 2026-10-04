import {
  createContext,
  FunctionComponent,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

interface LayerCanvasContextValue {
  register: (id: string, canvas: HTMLCanvasElement) => void
  unregister: (id: string) => void
}

/*
  Where layers publish their data canvas so <Plot> can compose them for export.

  Layers call useRegisterCanvas(id, ref) with the same RefObject they pass to
  useCanvas. The hook reads it from a layout effect, after React has attached
  refs — reading .current during render would always be null and would
  register nothing.
*/
const LayerCanvasContext = createContext<LayerCanvasContextValue>(null)

export const LayerCanvasProvider: FunctionComponent<{children: ReactNode}> = ({
  children,
}) => {
  const [canvases, setCanvases] = useState<Record<string, HTMLCanvasElement>>(
    {},
  )

  const register = useCallback((id: string, canvas: HTMLCanvasElement) => {
    setCanvases(prev => (prev[id] === canvas ? prev : {...prev, [id]: canvas}))
  }, [])

  const unregister = useCallback((id: string) => {
    setCanvases(prev => {
      if (!(id in prev)) {
        return prev
      }
      const next = {...prev}
      delete next[id]
      return next
    })
  }, [])

  const value = useMemo(() => ({register, unregister}), [register, unregister])

  return (
    <LayerCanvasContext.Provider value={value}>
      <LayerCanvasRegistryContext.Provider value={canvases}>
        {children}
      </LayerCanvasRegistryContext.Provider>
    </LayerCanvasContext.Provider>
  )
}

const LayerCanvasRegistryContext = createContext<
  Record<string, HTMLCanvasElement>
>({})

/*
  Registers a layer's canvas for export.

  Takes the same RefObject the layer passes to useCanvas, and reads it from a
  layout effect. A layout effect runs after React has attached refs, so
  ref.current is already the canvas; reading .current during render would
  always yield null and register nothing.

  The effect deps deliberately omit ref.current. React reuses the same DOM
  node across re-renders of a canvas at a stable position, so a node swap
  without an unmount is not a case this needs to track.
*/
export const useRegisterCanvas = (
  id: string,
  ref: RefObject<HTMLCanvasElement>,
): void => {
  const ctx = useContext(LayerCanvasContext)

  if (!ctx) {
    throw new Error('useRegisterCanvas: layer must be rendered inside <Plot>')
  }

  const {register, unregister} = ctx

  useLayoutEffect(() => {
    if (ref.current) {
      register(id, ref.current)
    }
    return () => unregister(id)
  }, [id, ref, register, unregister])
}

export const useLayerCanvases = (): HTMLCanvasElement[] => {
  const registry = useContext(LayerCanvasRegistryContext)
  return useMemo(() => Object.values(registry), [registry])
}
