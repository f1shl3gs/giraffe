import React, {CSSProperties, FC, ReactNode} from 'react'

import {Table} from '../../giraffe/src'
import {CPU} from './data/cpu'

import * as giraffe from '../../giraffe/src'

export interface PlotContainerProps {
  style?: CSSProperties
  children?: ReactNode
}

export const PlotContainer: FC<PlotContainerProps> = props => {
  const {style = {}, children} = props

  const defaultPlotStyle = {
    width: 'calc(100vw - 100px)',
    height: 'calc(100vh - 125px)',
    margin: '50px',
  }

  return <div style={{...defaultPlotStyle, ...style}}>{children}</div>
}

export const getCPUTable = () => CPU

/*
  Find all column keys in a table suitable for mapping to the `x` or `y`
  aesthetic, and retun as a map from column keys to column names.
*/
export const findXYColumns = (table: Table) =>
  table.columnKeys.reduce((acc, k) => {
    const columnType = table.getColumnType(k)

    if (columnType !== 'number' && columnType !== 'time') {
      return acc
    }

    return {
      ...acc,
      [k]: table.getColumnName(k),
    }
  }, {})

export const findStringColumns = (table: Table) =>
  table.columnKeys.filter(k => table.getColumnType(k) === 'string')

export const TIME_FORMAT_OPTIONS = [
  'DD/MM/YYYY HH:mm:ss.sss',
  'MM/DD/YYYY HH:mm:ss.sss',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY-MM-DD HH:mm:ss ZZ',
  'YYYY-MM-DD HH:mm:ss a ZZ',
  'MM/DD hh:mm a',
  'hh:mm a',
  'hh:mm',
  'HH:mm',
  'HH:mm:ss',
  'HH:mm:ss a',
  'HH:mm:ss ZZ',
  'HH:mm:ss.sss',
  'MMMM D, YYYY HH:mm:ss',
  'dddd, MMMM D, YYYY HH:mm:ss',
  'MM/DD/YY',
  'MM/DD/YYYY',
  'MM/DD HH:mm:ss',
] as const

export const COLOR_SCHEME_OPTIONS = {
  'Nineteen Eighty Four': giraffe.NINETEEN_EIGHTY_FOUR,
  'Color Blind Friendly Light': giraffe.COLOR_BLIND_FRIENDLY_LIGHT,
  'Color Blind Friendly Dark': giraffe.COLOR_BLIND_FRIENDLY_DARK,
  Atlantis: giraffe.ATLANTIS,
  'Do Androids Dream': giraffe.DO_ANDROIDS_DREAM,
  Delorean: giraffe.DELOREAN,
  Cthulhu: giraffe.CTHULHU,
  Ectoplasm: giraffe.ECTOPLASM,
  Primary: giraffe.PRIMARY,
  'Primary (Reverse)': giraffe.PRIMARY_REVERSE,
  'T Max 400 Film': giraffe.T_MAX_400_FILM,
  'Rainbow (8)': giraffe.RAINBOW_EIGHT,
  'Rainbow (16)': giraffe.RAINBOW_SIXTEEN,
  Viridis: giraffe.VIRIDIS,
  Magma: giraffe.MAGMA,
  Inferno: giraffe.INFERNO,
  Plasma: giraffe.PLASMA,
  ylOrRd: giraffe.YL_OR_RD,
  ylGnBu: giraffe.YL_GN_BU,
  buGn: giraffe.BU_GN,
  'Solid Blue': giraffe.SOLID_BLUE,
  'Solid Green': giraffe.SOLID_GREEN,
  'Solid Red': giraffe.SOLID_RED,
  'Solid Yellow': giraffe.SOLID_YELLOW,
  'Solid Purple': giraffe.SOLID_PURPLE,
} as const
