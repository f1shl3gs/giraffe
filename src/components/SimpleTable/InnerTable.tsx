// Libraries
import {FunctionComponent, RefObject} from 'react'

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from './Table'
import {SubsetTable} from './SimpleTableGraph'

// Types
import {ComponentSize, VerticalAlignment} from 'types'

// Styles
import './SimpleTableGraph.scss'

interface InnerProps {
  table: SubsetTable
  pagedTableRefs: {
    pagedTableHeaderRef: RefObject<HTMLTableSectionElement>
    pagedTableBodyRef: RefObject<HTMLTableSectionElement>
  }
}

const InnerTable: FunctionComponent<InnerProps> = ({
  pagedTableRefs: {pagedTableHeaderRef, pagedTableBodyRef},
  table,
}) => {
  const headers = Object.values(table.cols).map(c => {
    if (c.name === 'table') {
      return (
        <TableHeaderCell
          key='htable'
          className={'cf-table--header-cell'}
          verticalAlignment={VerticalAlignment.Top}
          style={{textTransform: 'none'}}
        >
          table
          <label>{table.yield}</label>
        </TableHeaderCell>
      )
    }
    return (
      <TableHeaderCell
        className={'cf-table--header-cell'}
        key={`h${c.name}`}
        style={{textTransform: 'none'}}
      >
        {c.name}
        <label>{c.group ? 'group' : 'no group'}</label>
        <label>{c.fluxDataType}</label>
      </TableHeaderCell>
    )
  })
  const rows = Array(table.end - table.start)
    .fill(null)
    .map((_, idx) => {
      const cells = Object.values(table.cols).map(c => {
        let val = c.data[idx]

        if (val && c.type === 'time') {
          val = new Date(val).toISOString()
        }
        if (val && c.type === 'boolean') {
          val = val ? 'true' : 'false'
        }

        return (
          <TableCell
            className={'cf-table--cell'}
            key={`h${c.name}:r${idx}`}
            testID={`table-cell ${c.data[idx]}`}
          >
            {val?.toString()}
          </TableCell>
        )
      })

      return <TableRow key={`r${idx}`}>{cells}</TableRow>
    })

  return (
    <Table
      className={'cf-table'}
      fontSize={ComponentSize.Small}
      striped
      highlight
      testID='simple-table'
    >
      <TableHeader ref={pagedTableHeaderRef}>
        <TableRow>{headers}</TableRow>
      </TableHeader>
      <TableBody ref={pagedTableBodyRef}>{rows}</TableBody>
    </Table>
  )
}

export default InnerTable
