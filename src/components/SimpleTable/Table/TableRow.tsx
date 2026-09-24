// Libraries
import {FunctionComponent, RefObject} from 'react'

// Types
import {StandardFunctionProps} from 'types'

// Styles
import './Table.scss'

export interface TableRowProps extends StandardFunctionProps {
  ref?: RefObject<HTMLTableRowElement>
}

export const TableRow: FunctionComponent<TableRowProps> = ({
  testID = 'table-row',
  children,
  ref,
}) => {
  return (
    <tr ref={ref} className={'cf-table--row'} data-testid={testID}>
      {children}
    </tr>
  )
}
