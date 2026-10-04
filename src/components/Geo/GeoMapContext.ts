import type {Map as LeafletMap} from 'leaflet'
import {createContext, useContext} from 'react'

export const GeoMapContext = createContext<LeafletMap | null>(null)

export const useGeoMap = () => useContext(GeoMapContext)
