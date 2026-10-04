import {createContext, useContext} from 'react'

export interface PlotInteraction {
  hoverX: number | null
  hoverY: number | null
}

export const PlotInteractionContext = createContext<PlotInteraction | null>(
  null,
)

// Once usePlotInteraction returns this, it means no provider configured
const NO_INTERACTION: PlotInteraction = {hoverX: null, hoverY: null}

export const usePlotInteraction = (): PlotInteraction =>
  useContext(PlotInteractionContext) ?? NO_INTERACTION
