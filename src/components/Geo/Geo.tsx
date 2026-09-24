// Libraries
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Components
import {BingMap} from './bing-maps/BingMap'
import {LayerSwitcher} from './LayerSwitcher'

// Utils
import {preprocessData} from './processing/tableProcessing'
import {ZOOM_FRACTION, getMinZoom, getRowLimit} from 'utils/geo'

// Context
import {GeoMapContext} from './GeoMapContext'

// Types
import {GeoLayerConfig} from '../..'
import {Config, Table} from 'types'
import ViewportObserver from './ViewportObserver'
import TileLayer from './TileLayer'

interface Props extends Partial<GeoLayerConfig> {
  width: number
  height: number
  table: Table
  stylingConfig: Partial<Config>
}

const Geo: FunctionComponent<Props> = props => {
  const {
    allowPanAndZoom,
    height,
    lat,
    latLonColumns,
    layers,
    lon,
    mapStyle,
    s2Column,
    stylingConfig,
    tileServerConfiguration,
    useS2CellID,
    width,
    zoom,
  } = props
  const {tileServerUrl, bingKey} = tileServerConfiguration
  const {table, detectCoordinateFields} = props

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
          getRowLimit(props.layers),
          useS2CellID || !detectCoordinateFields,
          latLonColumns,
          s2Column,
        )
      : null,
  )

  useEffect(() => {
    const newTable = preprocessData(
      props.table,
      getRowLimit(props.layers),
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
          <ViewportObserver onViewportChange={props.onViewportChange} />
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
                stylingConfig={stylingConfig}
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

export default Geo
