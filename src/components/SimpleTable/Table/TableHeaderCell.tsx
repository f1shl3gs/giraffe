// Libraries
import classnames from 'classnames'
import {FunctionComponent, RefObject} from 'react'

// Types
import {Alignment, StandardFunctionProps, VerticalAlignment} from 'types'

// Styles
import './Table.scss'

export interface TableHeaderCellProps extends StandardFunctionProps {
  /** How many columns this cell should take up */
  colSpan?: number
  /** Horizontal alignment of contents */
  horizontalAlignment?: Alignment
  /** Vertical alignment of contents */
  verticalAlignment?: VerticalAlignment
  ref?: RefObject<HTMLTableHeaderCellElement>
}

export const TableHeaderCell: FunctionComponent<TableHeaderCellProps> = ({
  children,
  className,
  colSpan = 1,
  horizontalAlignment = Alignment.Left,
  id,
  style,
  testID = 'table-header-cell',
  verticalAlignment = VerticalAlignment.Middle,
  ref,
}) => {
  const tableHeaderCellClass = classnames('cf-table--header-cell', className)

  const tableHeaderCellStyle = {
    textAlign: horizontalAlignment,
    verticalAlign: verticalAlignment,
    ...style,
  }

  return (
    <th
      className={tableHeaderCellClass}
      colSpan={colSpan}
      data-testid={testID}
      id={id}
      ref={ref}
      style={tableHeaderCellStyle}
    >
      {children}
    </th>
  )
}
