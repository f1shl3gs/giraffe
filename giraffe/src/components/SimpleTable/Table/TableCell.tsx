// Libraries
import React, {forwardRef} from 'react'
import classnames from 'classnames'

// Types
import {StandardFunctionProps} from '../../../types'

// Styles
import './Table.scss'

export interface TableCellProps extends StandardFunctionProps {}

export type TableCellRef = HTMLTableDataCellElement

export const TableCell = forwardRef<TableCellRef, TableCellProps>(
  ({testID = 'table-cell', className, children}, ref) => {
    const tableCellClass = classnames('cf-table--cell', className)

    return (
      <td
        ref={ref}
        style={{textAlign: 'left', verticalAlign: 'middle'}}
        colSpan={1}
        className={tableCellClass}
        data-testid={testID}
      >
        {children}
      </td>
    )
  }
)
