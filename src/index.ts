// Fonts must be declared exactly once (see src/style/fonts.scss)
import './style/fonts.scss'

/*
  The public entry point: components, the types their configs are built from,
  and the handful of functions needed to get data in.

  Nothing inside src/ imports from this file -- components, stories and helpers
  import the owning module directly ('utils/newTable', 'types', 'constants/x'),
  so that this barrel stays a leaf and the build can be split into per-component
  entries later without touching call sites.

  Every export below is named rather than re-exported with `export *`. That is
  what lets a consumer's bundler drop the components they never render: with a
  wildcard the bundler cannot always trace which names come from which module,
  and `export * from './components/Plot'` alone leaked thirteen internal helpers
  (`createPlotEnv`, `getXScale`, `areDomainsStale`, ...). The package is already
  marked side-effect free (see "sideEffects" in package.json), so an unused
  export and everything it reaches is shaken out of the build.

  <Geo> stays reachable as `import {Geo} from '@influxdata/giraffe'`. It pulls in
  leaflet, so leaflet has to resolve even for consumers who never render <Geo> --
  bundlers resolve the import graph before they tree-shake. See the "sideEffects"
  and dependencies notes in package.json.

  <Table> is not exported here yet. Its name would collide with the `Table` type
  below, and until that is resolved the type keeps the name at the top level, as
  it did before. The component and its config are reachable through
  'src/components/Table'.
*/

// Components
export {Annotation} from './components/Annotation'
export type {
  AnnotationConfig,
  AnnotationProps,
} from './components/Annotation'
export {Band} from './components/Band'
export type {BandConfig, BandProps} from './components/Band'
export {CustomLayer} from './components/CustomLayer'
export type {
  CustomLayerProps,
  CustomLayerRenderProps,
} from './components/CustomLayer'
export {Gauge} from './components/Gauge'
export type {GaugeConfig, GaugeProps} from './components/Gauge'
export {Geo} from './components/Geo'
export type {GeoConfig, GeoProps} from './components/Geo'
export {Heatmap} from './components/Heatmap'
export type {HeatmapConfig, HeatmapProps} from './components/Heatmap'
export {Histogram} from './components/Histogram'
export type {
  HistogramConfig,
  HistogramProps,
} from './components/Histogram'
export {Line} from './components/Line'
export type {LineConfig, LineProps} from './components/Line'
export {Plot} from './components/Plot'
export type {
  PlotConfig,
  PlotProps,
} from './components/Plot'
export {HoverTimeProvider} from './components/Table'
// Type only, no need to export Component
export type {
  StaticLegendConfig,
  StaticLegendRenderEffectOptions,
} from './components/StaticLegend'

// Types the configs above are written in terms of
export type {
  AnnotationDimension,
  AnnotationMark,
  AnnotationTooltipOptions,
  AxisTicks,
  BandBorder,
  BandLineMap,
  Color,
  ColumnData,
  ColumnGroupMap,
  ColumnType,
  ColumnWidths,
  DecimalPlaces,
  DomainLabel,
  FluxDataType,
  Formatter,
  FormatterType,
  GaugeTheme,
  GetColumn,
  HistogramPosition,
  InteractionHandlerArguments,
  InteractionHandlers,
  LatestIndexMap,
  LegendType,
  LineData,
  LineHoverDimension,
  LineInterpolation,
  LinePosition,
  NumericColumnData,
  PlotDimensions,
  RenamableField,
  Scale,
  SortOptions,
  StandardFunctionProps,
  SVGAttributeFunction,
  SVGAttributes,
  SymbolType,
  Table,
  TableViewProperties,
  TextMetrics,
  Theme,
  TooltipPosition,
} from './types'
export type {
  GeoQueryVariables,
  GeoViewLayer,
  LatLonColumns,
  TileServerConfiguration,
} from './components/Geo/geoTypes'
export type {GeoTooltipConfig} from './components/Geo/GeoTooltip'
export type {AxisScale} from './components/Plot/Plot'
export type {LegendConfig} from './components/Legend/LegendConfig'

// Getting data in
export type {FromFluxResult} from './utils/fromFlux'
export {fromFlux} from './utils/fromFlux'
export {fromRows} from './utils/fromRows'
export {newTable} from './utils/newTable'

// Formatting
export type {TimeFormatterFactoryOptions} from './utils/formatters'
export {
  BINARY_PREFIX_FORMATTER_TYPE,
  binaryPrefixFormatter,
  SI_PREFIX_FORMATTER_TYPE,
  siPrefixFormatter,
  timeFormatter,
} from './utils/formatters'
