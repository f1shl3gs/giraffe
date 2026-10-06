// Types
import {Table} from 'types'
import type {LatLonColumns} from '../geoTypes'
import {GeoTable} from './GeoTable'
import {NativeGeoTable} from './NativeGeoTable'
import {PivotedGeoTable} from './PivotedGeoTable'

// Constants
export const FIELD_COLUMN = '_field'
export const VALUE_COLUMN = '_value'
export const TABLE_COLUMN = 'table'
export const QUERY_META_COLUMNS = [
  FIELD_COLUMN,
  VALUE_COLUMN,
  TABLE_COLUMN,
  '_start',
  '_stop',
]

export const TIME_COLUMN = '_time'
export const START_COLUMN = '_start'
export const STOP_COLUMN = '_stop'
export const LON_COLUMN = 'lon'
export const LAT_COLUMN = 'lat'
export const GEO_HASH_COLUMN = 's2_cell_id'

export const preprocessData = (
  table: Table,
  rowLimit: number,
  isS2Present: boolean,
  latLonColumns: LatLonColumns,
  s2Column: string,
): GeoTable => {
  const isLatLonAsTags = latLonAsTags(isS2Present, latLonColumns)
  if (isS2Present || isLatLonAsTags) {
    return new NativeGeoTable(table, rowLimit, latLonColumns, s2Column)
  }
  return new PivotedGeoTable(table, rowLimit, latLonColumns)
}

const latLonAsTags = (useS2CellID, latLonColumns) => {
  if (typeof useS2CellID !== 'undefined' && useS2CellID === false) {
    return (
      latLonColumns?.lat?.key === 'tag' && latLonColumns?.lon?.key === 'tag'
    )
  }

  return false
}

export const filterMetaColumns = (fieldNames: string[]) => {
  return fieldNames.filter(name => QUERY_META_COLUMNS.indexOf(name) < 0)
}
