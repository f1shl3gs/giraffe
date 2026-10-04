import type {ArgTypes, Meta, StoryObj} from '@storybook/react'
import memoizeOne from 'memoize-one'
import {findStringColumns, findXYColumns, StoryFrame} from 'stories/helpers'
import type {Table} from 'types'
import {fromFlux} from 'utils/fromFlux'
import {newTable} from 'utils/newTable'
import type {GeoConfig} from 'components/Geo'
import {Geo} from 'components/Geo'
import type {LatLonColumns, TileServerConfiguration} from 'components/Geo/geoTypes'
import {ClusterAggregation} from 'components/Geo/geoTypes'
import {geoCSV} from 'components/Geo/processing/data/geo'

const now = Date.now()

function getRandomNumber(center: number, spread: number) {
  return center + (0.5 - Math.random()) * spread * 2
}

const createDataColumns = (numberOfRecords: number) => {
  const TIME_COL = []
  const VALUE1_COL = []
  const VALUE2_COL = []
  const LAT_COL = []
  const LON_COL = []
  for (let i = 0; i < numberOfRecords; i += 1) {
    VALUE1_COL.push(getRandomNumber(3.5, 3.5))
    VALUE2_COL.push(getRandomNumber(50, 30))
    LAT_COL.push(getRandomNumber(40, 3))
    LON_COL.push(getRandomNumber(-78, 3))
    TIME_COL.push(now + i * 1000 * 60)
  }
  return {TIME_COL, VALUE1_COL, VALUE2_COL, LAT_COL, LON_COL}
}

const geoTable = memoizeOne((numberOfRecords = 200): Table => {
  const columns = createDataColumns(numberOfRecords)
  return newTable(numberOfRecords)
    .addColumn('_time', 'dateTime:RFC3339', 'time', columns.TIME_COL)
    .addColumn('magnitude', 'double', 'number', columns.VALUE1_COL)
    .addColumn('duration', 'double', 'number', columns.VALUE2_COL)
    .addColumn('lat', 'double', 'number', columns.LAT_COL)
    .addColumn('lon', 'double', 'number', columns.LON_COL)
})

const addTrack = (data, startLat: number, startLon: number) => {
  const tid = Math.floor(Math.random() * 1000)
  let lat = startLat,
    lon = startLon
  for (let i = 0; i < 10; i++) {
    const time = now + i * 1000 * 60
    lat += Math.random() * 1.5
    lon += Math.random() * 1.5
    data.push({time, lat, lon, tid})
  }
}

const geoTracks = memoizeOne((lon: number, lat: number, count = 1): Table => {
  const data = []
  for (let i = 0; i < count; i++) {
    addTrack(data, lat - 4, lon - 6)
  }
  return newTable(data.length)
    .addColumn(
      '_time',
      'dateTime:RFC3339',
      'time',
      data.map(x => x.time),
    )
    .addColumn(
      'lat',
      'double',
      'number',
      data.map(x => x.lat),
    )
    .addColumn(
      'lon',
      'double',
      'number',
      data.map(x => x.lon),
    )
    .addColumn(
      'table',
      'double',
      'number',
      data.map(x => x.tid),
    )
})

const osmTileServerConfiguration = {
  tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

const bingTileServerConfiguration = {
  // The code here is for Giraffe demo purposes only, do not use it in your own
  // projects. To get a bing maps API key, go to:
  //
  // https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key
  bingKey: 'AtqWbnKXzGMWSAsgWknAw2cgBKuGIm9XmSbaS4fSebC5U6BdDTUF3I__u5NAp_Zi',
}

const geoCSVTable = fromFlux(geoCSV).table

const latLonColumnOptions = [
  ...Object.keys(findXYColumns(geoCSVTable)),
  ...findStringColumns(geoCSVTable),
]

const s2ColumnOptions = findStringColumns(geoCSVTable)

interface GeoArgs {
  allowPanAndZoom: boolean
  blur: number
  circleCount: number
  clusterAggregationFunction: ClusterAggregation
  colorClusterMarks: boolean
  csv: string
  dataPointCount: number
  endStopMarkerRadius: number
  endStopMarkers: boolean
  lattitudeSelection: string
  latitude: number
  longitude: number
  longitudeSelection: string
  markerCount: number
  maximumClusterRadius: number
  radius: number
  randomColors: boolean
  s2Column: string
  speed: number
  trackColor1: string
  trackColor2: string
  trackCount: number
  trackWidth: number
  useS2CellID: boolean
  zoom: number
}

export default {
  title: 'Geo',
} as Meta

type Story = StoryObj<GeoArgs>

const renderCircleMap =
  (tileServerConfiguration: TileServerConfiguration) => (args: GeoArgs) => {
    const {allowPanAndZoom, circleCount, latitude, longitude, zoom} = args
    const geoConfig: GeoConfig = {
      lat: latitude,
      lon: longitude,
      zoom,
      allowPanAndZoom,
      detectCoordinateFields: false,
      layers: [
        {
          type: 'circleMap',
          radiusField: 'magnitude',
          radiusDimension: {label: 'Magnitude'},
          colorDimension: {label: 'Duration'},
          colorField: 'duration',
          colors: [
            {type: 'min', hex: '#ff00b3'},
            {value: 50, hex: '#343aeb'},
            {type: 'max', hex: '#343aeb'},
          ],
        },
      ],
      tileServerConfiguration,
    }
    return (
      <StoryFrame>
        <Geo
          table={geoTable(circleCount)}
          config={geoConfig}
          tooltipConfig={{}}
        />
      </StoryFrame>
    )
  }

const renderMapMarkersStatic = (args: GeoArgs) => {
  const {allowPanAndZoom, latitude, longitude, markerCount, zoom} = args
  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    layers: [
      {
        type: 'pointMap',
        colorDimension: {label: 'Duration'},
        colorField: 'duration',
        colors: [
          {type: 'min', hex: '#ff0000'},
          {value: 50, hex: '#343aeb'},
          {type: 'max', hex: '#343aeb'},
        ],
        isClustered: false,
        tooltipColumns: [],
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo
        table={geoTable(markerCount)}
        config={geoConfig}
        tooltipConfig={{}}
      />
    </StoryFrame>
  )
}

const renderMapMarkersCustomCSV = (args: GeoArgs) => {
  const {
    allowPanAndZoom,
    lattitudeSelection,
    latitude,
    longitude,
    longitudeSelection,
    s2Column,
    useS2CellID,
    zoom,
  } = args
  const table = geoCSVTable

  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    useS2CellID,
    s2Column: useS2CellID ? s2Column : undefined,
    latLonColumns: useS2CellID
      ? undefined
      : ({
          lat: lattitudeSelection,
          lon: longitudeSelection,
        } as unknown as LatLonColumns),
    layers: [
      {
        type: 'pointMap',
        colorDimension: {label: 'Duration'},
        colorField: 'duration',
        colors: [
          {type: 'min', hex: '#ff0000'},
          {value: 50, hex: '#343aeb'},
          {type: 'max', hex: '#343aeb'},
        ],
        isClustered: false,
        tooltipColumns: ['_field', '_measurement', '_time'],
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo table={table} config={geoConfig} tooltipConfig={{}} />
    </StoryFrame>
  )
}

const renderMarkerClustering = (args: GeoArgs) => {
  const {
    allowPanAndZoom,
    clusterAggregationFunction,
    colorClusterMarks,
    latitude,
    longitude,
    maximumClusterRadius,
    zoom,
  } = args
  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    layers: [
      {
        type: 'pointMap',
        colorDimension: {label: 'Duration'},
        colorField: 'duration',
        colors: [
          {type: 'min', hex: '#00ff00'},
          {value: 50, hex: '#ffae42'},
          {value: 60, hex: '#ff0000'},
          {type: 'max', hex: '#ff0000'},
        ],
        isClustered: true,
        areClustersColored: colorClusterMarks,
        clusterAggregationFunction,
        maxClusterRadius: maximumClusterRadius,
        tooltipColumns: [],
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo table={geoTable(200)} config={geoConfig} tooltipConfig={{}} />
    </StoryFrame>
  )
}

const renderHeatmap = (args: GeoArgs) => {
  const {
    allowPanAndZoom,
    blur,
    dataPointCount,
    latitude,
    longitude,
    radius,
    zoom,
  } = args
  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    layers: [
      {
        type: 'heatmap',
        radius,
        blur,
        intensityDimension: {label: 'Magnitude'},
        intensityField: 'magnitude',
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo
        table={geoTable(dataPointCount)}
        config={geoConfig}
        tooltipConfig={{}}
      />
    </StoryFrame>
  )
}

const renderTracks = (args: GeoArgs) => {
  const {
    allowPanAndZoom,
    endStopMarkerRadius,
    endStopMarkers,
    latitude,
    longitude,
    randomColors,
    speed,
    trackColor1,
    trackColor2,
    trackCount,
    trackWidth,
    zoom,
  } = args
  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    layers: [
      {
        type: 'trackMap',
        speed,
        trackWidth,
        randomColors,
        endStopMarkers,
        endStopMarkerRadius,
        colors: randomColors
          ? undefined
          : [
              {type: 'min', hex: trackColor1},
              {type: 'max', hex: trackColor2},
            ],
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo
        table={geoTracks(-74, 40, trackCount)}
        config={geoConfig}
        tooltipConfig={{}}
      />
    </StoryFrame>
  )
}

const renderTracksWithCustomCSV = (args: GeoArgs) => {
  const {
    allowPanAndZoom,
    csv,
    endStopMarkerRadius,
    endStopMarkers,
    latitude,
    longitude,
    randomColors,
    speed,
    trackColor1,
    trackColor2,
    trackWidth,
    zoom,
  } = args
  const table = fromFlux(csv).table
  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    layers: [
      {
        type: 'trackMap',
        speed,
        trackWidth,
        randomColors,
        endStopMarkers,
        endStopMarkerRadius,
        colors: randomColors
          ? undefined
          : [
              {type: 'min', hex: trackColor1},
              {type: 'max', hex: trackColor2},
            ],
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo table={table} config={geoConfig} tooltipConfig={{}} />
    </StoryFrame>
  )
}

const renderLayeringVisualizations = (args: GeoArgs) => {
  const {
    allowPanAndZoom,
    endStopMarkerRadius,
    endStopMarkers,
    latitude,
    longitude,
    speed,
    trackColor1,
    trackColor2,
    trackWidth,
    zoom,
  } = args
  const geoConfig: GeoConfig = {
    lat: latitude,
    lon: longitude,
    zoom,
    allowPanAndZoom,
    detectCoordinateFields: false,
    layers: [
      {
        type: 'trackMap',
        speed,
        trackWidth,
        endStopMarkers,
        endStopMarkerRadius,
        colors: [
          {type: 'min', hex: trackColor1},
          {type: 'max', hex: trackColor2},
        ],
      },
      {
        type: 'pointMap',
        isClustered: false,
        colorDimension: {label: 'Duration'},
        colors: [
          {type: 'min', hex: '#ff0000'},
          {type: 'max', hex: '#343aeb'},
        ],
        tooltipColumns: [],
      },
    ],
    tileServerConfiguration: osmTileServerConfiguration,
  }
  return (
    <StoryFrame>
      <Geo table={geoTracks(-74, 40)} config={geoConfig} tooltipConfig={{}} />
    </StoryFrame>
  )
}

const baseArgs = {
  latitude: 40,
  longitude: -76,
  zoom: 6,
  allowPanAndZoom: true,
  useS2CellID: true,
}

const baseArgTypes: Partial<ArgTypes<GeoArgs>> = {
  latitude: {
    control: {type: 'range', min: -90, max: 90, step: 1},
  },
  longitude: {
    control: {type: 'range', min: -180, max: 180, step: 1},
  },
  zoom: {
    control: {type: 'range', min: 1, max: 20, step: 1},
  },
  allowPanAndZoom: {
    control: {type: 'boolean'},
  },
  useS2CellID: {
    control: {type: 'boolean'},
  },
}

export const CircleMarkers: Story = {
  render: renderCircleMap(osmTileServerConfiguration),
  args: {
    ...baseArgs,
    circleCount: 26,
  },
  argTypes: {
    ...baseArgTypes,
    circleCount: {
      control: {type: 'range', min: 0, max: 200000, step: 1},
    },
  },
}

export const MapMarkersStatic: Story = {
  render: renderMapMarkersStatic,
  args: {
    ...baseArgs,
    markerCount: 20,
  },
  argTypes: {
    ...baseArgTypes,
    markerCount: {
      control: {type: 'range', min: 0, max: 2000, step: 1},
    },
  },
}

export const MapMarkersCustomCSV: Story = {
  render: renderMapMarkersCustomCSV,
  args: {
    ...baseArgs,
    lattitudeSelection: '_value',
    longitudeSelection: '_value',
    s2Column: 's2_cell_id',
  },
  argTypes: {
    ...baseArgTypes,
    lattitudeSelection: {
      control: {type: 'select'},
      options: latLonColumnOptions,
    },
    longitudeSelection: {
      control: {type: 'select'},
      options: latLonColumnOptions,
    },
    s2Column: {
      control: {type: 'select'},
      options: s2ColumnOptions,
    },
  },
}

export const MarkerClustering: Story = {
  render: renderMarkerClustering,
  args: {
    ...baseArgs,
    maximumClusterRadius: 50,
    colorClusterMarks: true,
    clusterAggregationFunction: ClusterAggregation.mean,
  },
  argTypes: {
    ...baseArgTypes,
    maximumClusterRadius: {
      control: {type: 'range', min: 1, max: 1000, step: 1},
    },
    colorClusterMarks: {
      control: {type: 'boolean'},
    },
    clusterAggregationFunction: {
      control: {type: 'select'},
      options: [
        ClusterAggregation.mean,
        ClusterAggregation.median,
        ClusterAggregation.min,
        ClusterAggregation.max,
      ],
    },
  },
}

export const Heatmap: Story = {
  render: renderHeatmap,
  args: {
    ...baseArgs,
    dataPointCount: 200,
    radius: 20,
    blur: 10,
  },
  argTypes: {
    ...baseArgTypes,
    dataPointCount: {
      control: {type: 'range', min: 0, max: 500, step: 1},
    },
    radius: {
      control: {type: 'range', min: 0, max: 100, step: 1},
    },
    blur: {
      control: {type: 'range', min: 0, max: 150, step: 1},
    },
  },
}

export const Tracks: Story = {
  render: renderTracks,
  args: {
    ...baseArgs,
    trackCount: 3,
    speed: 200,
    trackWidth: 4,
    trackColor1: '#0000ff',
    trackColor2: '#f0f0ff',
    randomColors: true,
    endStopMarkers: true,
    endStopMarkerRadius: 4,
  },
  argTypes: {
    ...baseArgTypes,
    trackCount: {
      control: {type: 'range', min: 0, max: 100, step: 1},
    },
    speed: {
      control: {type: 'range', min: 1, max: 10000, step: 1},
    },
    trackWidth: {
      control: {type: 'range', min: 1, max: 15, step: 1},
    },
    trackColor1: {
      control: {type: 'color'},
    },
    trackColor2: {
      control: {type: 'color'},
    },
    randomColors: {
      control: {type: 'boolean'},
    },
    endStopMarkers: {
      control: {type: 'boolean'},
    },
    endStopMarkerRadius: {
      control: {type: 'range', min: 1, max: 100, step: 1},
    },
  },
}

export const TracksWithCustomCSV: Story = {
  render: renderTracksWithCustomCSV,
  args: {
    ...baseArgs,
    csv: '',
    speed: 200,
    trackWidth: 4,
    trackColor1: '#0000ff',
    trackColor2: '#f0f0ff',
    randomColors: true,
    endStopMarkers: true,
    endStopMarkerRadius: 4,
  },
  argTypes: {
    ...baseArgTypes,
    speed: {
      control: {type: 'range', min: 1, max: 10000, step: 1},
    },
    trackWidth: {
      control: {type: 'range', min: 1, max: 15, step: 1},
    },
    trackColor1: {
      control: {type: 'color'},
    },
    trackColor2: {
      control: {type: 'color'},
    },
    randomColors: {
      control: {type: 'boolean'},
    },
    endStopMarkers: {
      control: {type: 'boolean'},
    },
    endStopMarkerRadius: {
      control: {type: 'range', min: 1, max: 100, step: 1},
    },
  },
}

export const LayeringVisualizations: Story = {
  render: renderLayeringVisualizations,
  args: {
    ...baseArgs,
    speed: 200,
    trackWidth: 4,
    trackColor1: '#0000ff',
    trackColor2: '#f0f0ff',
    endStopMarkers: true,
    endStopMarkerRadius: 4,
  },
  argTypes: {
    ...baseArgTypes,
    speed: {
      control: {type: 'range', min: 1, max: 10000, step: 1},
    },
    trackWidth: {
      control: {type: 'range', min: 1, max: 15, step: 1},
    },
    trackColor1: {
      control: {type: 'color'},
    },
    trackColor2: {
      control: {type: 'color'},
    },
    endStopMarkers: {
      control: {type: 'boolean'},
    },
    endStopMarkerRadius: {
      control: {type: 'range', min: 1, max: 100, step: 1},
    },
  },
}

export const BingMapsAsTileServer: Story = {
  render: renderCircleMap(bingTileServerConfiguration),
  args: {
    ...baseArgs,
    circleCount: 26,
  },
  argTypes: {
    ...baseArgTypes,
    circleCount: {
      control: {type: 'range', min: 0, max: 200000, step: 1},
    },
  },
}
