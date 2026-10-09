// Fonts must be declared exactly once (see src/style/fonts.scss)
import './style/fonts.scss'

// Components
export {Annotation} from './components/Annotation'
export type {AnnotationProps} from './components/Annotation'
export {Band} from './components/Band'
export type {BandProps} from './components/Band'
export {CustomLayer} from './components/CustomLayer'
export type {
  CustomLayerProps,
  CustomLayerRenderProps,
} from './components/CustomLayer'
export {Gauge} from './components/Gauge'
export type {GaugeProps} from './components/Gauge'
export {Geo} from './components/Geo'
export type {GeoConfig, GeoProps} from './components/Geo'
export {Heatmap} from './components/Heatmap'
export type {HeatmapProps} from './components/Heatmap'
export {Histogram} from './components/Histogram'
export type {HistogramProps} from './components/Histogram'
export {Line} from './components/Line'
export type {LineProps} from './components/Line'
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
export {Scatter} from './components/Scatter'
export type {ScatterProps} from './components/Scatter'
export {SingleStat} from './components/SingleStat'
export type {SingleStatProps} from './components/SingleStat'
export {Mosaic} from './components/Mosaic'
export type {MosaicProps} from './components/Mosaic'

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
