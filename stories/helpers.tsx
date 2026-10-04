import * as COLOR_SCHEMES from 'constants/colorSchemes'
import {CSSProperties, FunctionComponent, ReactNode} from 'react'
import type {Table} from 'types'
import {CPU} from 'stories/data/cpu'

/*
  A viewport for a plot inside a story. Deliberately not called PlotContainer:
  components/Plot/PlotContainer.tsx is the real plot chrome (axes, layers,
  brush), and a story-only frame sharing its name reads as library API.
*/
export interface StoryFrameProps {
  style?: CSSProperties
  children?: ReactNode
}

export const StoryFrame: FunctionComponent<StoryFrameProps> = ({style = {}, children}) => {
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
  'Nineteen Eighty Four': COLOR_SCHEMES.NINETEEN_EIGHTY_FOUR,
  'Color Blind Friendly Light': COLOR_SCHEMES.COLOR_BLIND_FRIENDLY_LIGHT,
  'Color Blind Friendly Dark': COLOR_SCHEMES.COLOR_BLIND_FRIENDLY_DARK,
  Atlantis: COLOR_SCHEMES.ATLANTIS,
  'Do Androids Dream': COLOR_SCHEMES.DO_ANDROIDS_DREAM,
  Delorean: COLOR_SCHEMES.DELOREAN,
  Cthulhu: COLOR_SCHEMES.CTHULHU,
  Ectoplasm: COLOR_SCHEMES.ECTOPLASM,
  Primary: COLOR_SCHEMES.PRIMARY,
  'Primary (Reverse)': COLOR_SCHEMES.PRIMARY_REVERSE,
  'T Max 400 Film': COLOR_SCHEMES.T_MAX_400_FILM,
  'Rainbow (8)': COLOR_SCHEMES.RAINBOW_EIGHT,
  'Rainbow (16)': COLOR_SCHEMES.RAINBOW_SIXTEEN,
  Viridis: COLOR_SCHEMES.VIRIDIS,
  Magma: COLOR_SCHEMES.MAGMA,
  Inferno: COLOR_SCHEMES.INFERNO,
  Plasma: COLOR_SCHEMES.PLASMA,
  ylOrRd: COLOR_SCHEMES.YL_OR_RD,
  ylGnBu: COLOR_SCHEMES.YL_GN_BU,
  buGn: COLOR_SCHEMES.BU_GN,
  'Solid Blue': COLOR_SCHEMES.SOLID_BLUE,
  'Solid Green': COLOR_SCHEMES.SOLID_GREEN,
  'Solid Red': COLOR_SCHEMES.SOLID_RED,
  'Solid Yellow': COLOR_SCHEMES.SOLID_YELLOW,
  'Solid Purple': COLOR_SCHEMES.SOLID_PURPLE,
} as const
