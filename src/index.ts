// Fonts must be declared exactly once (see src/style/fonts.scss)
import './style/fonts.scss'

/*
  The public entry point: components, the types their configs are built from,
  and the handful of functions needed to get data in.

  Nothing inside src/ imports from this file -- components, stories and helpers
  import the owning module directly ('utils/newTable', 'types', 'constants/x'),
  so that this barrel stays a leaf and the build can be split into per-component
  entries later without touching call sites.

  <Geo> is deliberately absent: it imports leaflet, which must not be dragged
  into every consumer's bundle. It is reachable only via
  'src/components/Geo' (see that directory's barrel for why).
*/

export * from './components/Annotation'
export * from './components/Band'
export * from './components/CustomLayer'
export * from './components/Gauge'
export * from './components/Geo'
export * from './components/Heatmap'
export * from './components/Histogram'
export * from './components/Line'
export * from './components/Plot'
export * from './components/Table'
// Types the above are written in terms of
export type {
  ColumnData,
  ColumnType,
  FluxDataType,
  Formatter,
  GetColumn,
  NumericColumnData,
  Scale,
  Table,
} from './types'
export {DomainLabel} from './types'
export * from './utils/formatters'
export * from './utils/fromFlux'
export {fromRows} from './utils/fromRows'
// Getting data in
export {newTable} from './utils/newTable'
