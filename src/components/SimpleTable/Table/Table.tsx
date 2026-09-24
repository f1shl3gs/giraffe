// Libraries
import {FunctionComponent, RefObject} from 'react'
import classnames from 'classnames'

// Types
import {BorderType, ComponentSize, StandardFunctionProps} from 'types'

// Styles
import './Table.scss'

export interface TableProps extends StandardFunctionProps {
  /** Padding inside every cell in the table */
  cellPadding?: ComponentSize
  /** Font size of table elements */
  fontSize?: ComponentSize
  /** Controls the appearance of borders in the table */
  borders?: BorderType
  /** Controls coloration pattern of rows, useful for improving legibility on dense tables */
  striped?: boolean
  /** Highlights a row on hover, useful for improving legibility on dense tables */
  highlight?: boolean
  ref?: RefObject<HTMLTableElement>
}

export const Table: FunctionComponent<TableProps> = ({
  id,
  style = {width: '100%'},
  testID = 'table',
  striped = false,
  borders = BorderType.Horizontal,
  children,
  fontSize = ComponentSize.Medium,
  highlight = false,
  className,
  cellPadding = ComponentSize.Small,
  ref,
}) => {
  const tableClass = classnames('cf-table', className, {
    [`cf-table__padding-${cellPadding}`]: cellPadding,
    [`cf-table__borders-${borders}`]: borders,
    [`cf-table__font-${fontSize}`]: fontSize,
    'cf-table__striped': striped,
    'cf-table__highlight': highlight,
  })

  return (
    <table
      id={id}
      ref={ref}
      style={style}
      className={tableClass}
      data-testid={testID}
    >
      {children}
    </table>
  )
}

Table.displayName = 'Table'
