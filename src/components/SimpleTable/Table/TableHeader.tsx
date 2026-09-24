// Libraries
import {FunctionComponent, RefObject} from 'react'

// Types
import {StandardFunctionProps} from 'types'

// Styles
import './Table.scss'

export interface TableHeaderProps extends StandardFunctionProps {
  ref?: RefObject<HTMLTableSectionElement>
}

export const TableHeader: FunctionComponent<TableHeaderProps> = ({
  id,
  testID,
  ref,
  children,
}) => {
  return (
    <thead
      id={id}
      data-testid={testID}
      ref={ref}
      className={'cf-table--header'}
    >
      {children}
    </thead>
  )
}
