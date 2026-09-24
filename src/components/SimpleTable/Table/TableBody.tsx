// Libraries
import {FunctionComponent, RefObject} from 'react'

// Types
import {StandardFunctionProps} from 'types'

export interface TableBodyProps extends StandardFunctionProps {
  ref?: RefObject<HTMLTableSectionElement>
}

export const TableBody: FunctionComponent<TableBodyProps> = ({
  id,
  testID = 'table-body',
  children,
  ref,
}) => {
  return (
    <tbody id={id} data-testid={testID} ref={ref} className={'cf-table--body'}>
      {children}
    </tbody>
  )
}
