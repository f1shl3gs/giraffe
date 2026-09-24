// Libraries
import {FunctionComponent, RefObject} from 'react'
import classnames from 'classnames'

// Types
import {StandardFunctionProps} from 'types'

// Styles
import './Table.scss'

export interface TableCellProps extends StandardFunctionProps {
  ref?: RefObject<HTMLTableCellElement>
}

export const TableCell: FunctionComponent<TableCellProps> = ({
  testID = 'table-cell',
  className,
  children,
  ref,
}) => {
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
