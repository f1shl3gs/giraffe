// Libraries
import {FunctionComponent} from 'react'

// Components
import PageControl from './PageControl'
import PagedTable from './PagedTable'
import {FluxResult} from './flows'
import {PaginationProvider} from './pagination'

// Types
import {FluxDataType} from 'index'

import './SimpleTableGraph.scss'

interface SubsetTableColumn {
  name: string
  type: string
  fluxDataType: FluxDataType
  data: Array<any>
  group: boolean
}

export interface SubsetTable {
  idx: number
  yield: string
  start: number
  end: number
  signature: string
  cols: SubsetTableColumn[]
}

interface Props {
  result: FluxResult['parsed']
  showAll: boolean
}

export const SimpleTable: FunctionComponent<Props> = ({result, showAll}) => {
  return (
    <div className={'visualization--simple-table'}>
      <PaginationProvider totalNumberOfRows={result?.table?.length || 0}>
        <PagedTable showAll={showAll} result={result} />
        <PageControl />
      </PaginationProvider>
    </div>
  )
}
