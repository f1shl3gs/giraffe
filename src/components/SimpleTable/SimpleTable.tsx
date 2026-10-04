// Libraries
import {FunctionComponent} from 'react'

// Types
import type {FluxDataType} from 'types'
import type {InternalFromFluxResult} from './flows'

// Components
import PageControl from './PageControl'
import PagedTable from './PagedTable'
import {PaginationProvider} from './pagination'

import './SimpleTable.scss'

export interface SubsetTableColumn {
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
  cols: Record<string, SubsetTableColumn>
}

export interface SimpleTableProps {
  /*
    A parsed flux result rather than a bare Table. PagedTable reads
    `result.fluxGroupKeyUnion` to lay out multiple tables on one page, and that
    is a property of the flux response -- it cannot be recovered from a Table.
    `fromFlux(csv)` is the way in.
  */
  result: InternalFromFluxResult
  config: SimpleTableConfig
}

export const SimpleTable: FunctionComponent<SimpleTableProps> = ({
  result,
  config,
}) => {
  const {showAll} = config

  return (
    <div className={'visualization--simple-table'}>
      <PaginationProvider totalNumberOfRows={result?.table?.length || 0}>
        <PagedTable showAll={showAll} result={result} />
        <PageControl />
      </PaginationProvider>
    </div>
  )
}

export interface SimpleTableConfig {
  showAll: boolean
}
