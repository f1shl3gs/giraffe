// Libraries
import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Components
import {AutoSizer} from '../AutoSizer'
import {BingMap} from './bing-maps/BingMap'
import {GeoMapContext} from './GeoMapContext'
import type {GeoTooltipConfig} from './GeoTooltip'
import type {
  GeoQueryVariables,
  GeoViewLayer,
  LatLonColumns,
  TileServerConfiguration,
} from './geoTypes'
import {LayerSwitcher} from './LayerSwitcher'
import {preprocessData} from './processing/tableProcessing'
import TileLayer from './TileLayer'
import ViewportObserver from './ViewportObserver'

// Types
import type {Table} from 'types'

// Utils
import {
  calculateVariableAssignment,
  getMinZoom,
  getRowLimit,
  ZOOM_FRACTION,
} from './geo'

/*
  Geo is standalone: it owns a leaflet viewport rather than the plot's x/y
  coordinate system, so it takes its table directly instead of reading a
  <Plot> environment.

  `tooltipConfig` only styles Geo's tooltips, which reuse the shared
  <Tooltip>/<Legend>; Geo itself never reads the scales or axes from it.
*/
/* ---------------------------------------------------------------------
   The leaflet map itself: owns the map instance, its viewport and the
   geo sub-layers. <Geo> below adds AutoSizer and the viewport queries.
   ------------------------------------------------------------------- */

interface LeafletMapProps {
  width: number
  height: number
  table: Table
  config: GeoConfig
  tooltipConfig: GeoTooltipConfig
  onViewportChange: (lat: number, lon: number, zoom: number) => void
}

const LeafletMap: FunctionComponent<LeafletMapProps> = ({
  config,
  height,
  onViewportChange,
  table,
  tooltipConfig,
  width,
}) => {
  const {
    allowPanAndZoom,
    detectCoordinateFields,
    lat,
    latLonColumns,
    layers,
    lon,
    mapStyle,
    s2Column,
    tileServerConfiguration: {tileServerUrl, bingKey},
    useS2CellID,
    zoom,
  } = config

  const [map, setMap] = useState<L.Map | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const containerRef = useCallback((el: HTMLDivElement | null) => {
    if (el !== null) {
      setContainer(el)
    }
  }, [])
  const mapOptionsRef = useRef<L.MapOptions | undefined>(undefined)

  const [preprocessedTable, setPreprocessedTable] = useState(
    table
      ? preprocessData(
          table,
          getRowLimit(config.layers),
          useS2CellID || !detectCoordinateFields,
          latLonColumns,
          s2Column,
        )
      : null,
  )

  useEffect(() => {
    const newTable = preprocessData(
      table,
      getRowLimit(config.layers),
      useS2CellID || !detectCoordinateFields,
      latLonColumns,
      s2Column,
    )
    setPreprocessedTable(newTable)
  }, [table, detectCoordinateFields])

  useEffect(() => {
    if (!container || mapOptionsRef.current === undefined) {
      return
    }
    const m = L.map(container, mapOptionsRef.current)
    setMap(m)
    return () => {
      m.remove()
    }
  }, [container])

  useEffect(() => {
    if (width && height && map) {
      map.invalidateSize({pan: false})
    }
  }, [width, height, map])

  if (width === 0 || height === 0) {
    return null
  }

  const latLon = preprocessedTable.getLatLon(0)
  const mapCenter = {
    lat: latLon ? latLon.lat : lat,
    lng: latLon ? latLon.lon : lon,
  }

  if (mapOptionsRef.current === undefined) {
    mapOptionsRef.current = {
      center: mapCenter,
      zoom,
      minZoom: getMinZoom(width),
      zoomDelta: 1,
      zoomSnap: 1 / ZOOM_FRACTION,
      dragging: allowPanAndZoom,
      zoomControl: allowPanAndZoom,
      scrollWheelZoom: allowPanAndZoom,
      attributionControl: false,
    }
  }

  return (
    <div style={{position: 'relative'}}>
      <div
        ref={containerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
      {map && (
        <GeoMapContext.Provider value={map}>
          <ViewportObserver onViewportChange={onViewportChange} />
          {bingKey ? (
            <BingMap bingKey={bingKey} mapStyle={mapStyle} />
          ) : (
            <TileLayer url={tileServerUrl} />
          )}
          {layers.map((layer, index) => {
            if (!preprocessedTable) {
              return
            }
            return (
              <LayerSwitcher
                key={index}
                layer={layer}
                preprocessedTable={preprocessedTable}
                tooltipConfig={tooltipConfig}
                width={width}
                height={height}
                index={index}
              />
            )
          })}
        </GeoMapContext.Provider>
      )}
      {preprocessedTable && preprocessedTable.isTruncated() && (
        <div
          style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '4px',
            boxShadow: '0 1px 5px rgba(0, 0, 0, 0.65)',
            color: 'gray',
          }}
          className='truncatedResults'
        >
          Results are truncated.
          <a
            href='https://docs.influxdata.com/influxdb/cloud/visualize-data/visualization-types/map/'
            target='_blank'
          >
            More...
          </a>
        </div>
      )}
    </div>
  )
}

export interface GeoProps {
  table: Table
  config: GeoConfig
  tooltipConfig: GeoTooltipConfig
}

type Props = GeoProps

interface LastRenderProperties {
  latOnLastRender?: number
  lonOnLastRender?: number
  zoomOnLastRender?: number
  widthOnLastRender?: number
  heightOnLastRender?: number
}

const onViewportChange =
  (props: Props, lastRenderProperties: LastRenderProperties) =>
  (lat: number, lon: number, zoom: number) => {
    const {config} = props
    const {allowPanAndZoom, onUpdateViewport} = config
    if (allowPanAndZoom && onUpdateViewport) {
      onUpdateViewport(lat, lon, zoom)
    }
    const {widthOnLastRender, heightOnLastRender} = lastRenderProperties
    updateQuery(
      props,
      lastRenderProperties,
      widthOnLastRender,
      heightOnLastRender,
      lat,
      lon,
      zoom,
    )
  }

const updateQuery = (
  props: Props,
  lastRenderProperties: LastRenderProperties,
  width: number,
  height: number,
  lat: number,
  lon: number,
  zoom: number,
) => {
  const {onUpdateQuery = () => {}} = props.config
  const {
    widthOnLastRender,
    heightOnLastRender,
    latOnLastRender,
    lonOnLastRender,
    zoomOnLastRender,
  } = lastRenderProperties
  if (
    width &&
    height &&
    (widthOnLastRender !== width ||
      heightOnLastRender !== height ||
      latOnLastRender !== lat ||
      lonOnLastRender !== lon ||
      zoomOnLastRender !== zoom)
  ) {
    const variableAssignment = calculateVariableAssignment(
      width,
      height,
      lon,
      lat,
      zoom,
    )
    onUpdateQuery(variableAssignment)
    lastRenderProperties.latOnLastRender = lat
    lastRenderProperties.lonOnLastRender = lon
    lastRenderProperties.zoomOnLastRender = zoom
    lastRenderProperties.widthOnLastRender = width
    lastRenderProperties.heightOnLastRender = height
  }
}

const onAutoResize = (
  props: Props,
  lastRenderProperties: LastRenderProperties,
  width,
  height,
) => {
  const {config, table, tooltipConfig} = props
  const {lat, lon, zoom} = config
  const {latOnLastRender, lonOnLastRender, zoomOnLastRender} =
    lastRenderProperties

  updateQuery(
    props,
    lastRenderProperties,
    width,
    height,
    latOnLastRender === null ? lat : latOnLastRender,
    lonOnLastRender === null ? lon : lonOnLastRender,
    zoomOnLastRender === null ? zoom : zoomOnLastRender,
  )

  return (
    <div className='geo'>
      <LeafletMap
        width={width}
        height={height}
        table={table}
        config={config}
        tooltipConfig={tooltipConfig}
        onViewportChange={onViewportChange(props, lastRenderProperties)}
      />
    </div>
  )
}

export const Geo: FunctionComponent<GeoProps> = memo(props => {
  const lastRenderProperties = useRef<LastRenderProperties>({})

  if (!props.config.tileServerConfiguration) {
    return null
  }

  return (
    <AutoSizer>
      {(width, height) =>
        onAutoResize(props, lastRenderProperties.current, width, height)
      }
    </AutoSizer>
  )
})

export interface GeoConfig {
  lat: number
  lon: number
  zoom: number
  allowPanAndZoom: boolean
  mapStyle?: string
  detectCoordinateFields: boolean
  useS2CellID?: boolean
  s2Column?: string
  latLonColumns?: LatLonColumns

  onViewportChange?: (lat: number, lon: number, zoom: number) => void
  onUpdateViewport?: (lat: number, lon: number, zoom: number) => void
  onUpdateQuery?: (variables: GeoQueryVariables) => void

  layers: GeoViewLayer[]
  tileServerConfiguration: TileServerConfiguration
}
