/*
  This barrel is the leaflet boundary: it exports <Geo> and its types only.
  Nothing that imports leaflet (GeoRenderer.tsx, PointMapLayer, TrackMapLayer,
  ...)
  may be re-exported from here, or every entry point pulls in leaflet.
*/

export type {GeoConfig, GeoProps} from './Geo'
export {Geo} from './Geo'
