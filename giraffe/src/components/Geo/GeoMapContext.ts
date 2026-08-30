import {createContext, useContext} from 'react'
import type {Map as LeafletMap} from 'leaflet'

export const GeoMapContext = createContext<LeafletMap | null>(null)

export const useGeoMap = () => useContext(GeoMapContext)
