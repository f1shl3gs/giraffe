// Libraries
import React, {forwardRef} from 'react'

// Types
import {StandardFunctionProps} from '../../../types'

export interface TableBodyProps extends StandardFunctionProps {}

export type TableBodyRef = HTMLTableSectionElement

export const TableBody = forwardRef<TableBodyRef, TableBodyProps>(
  ({id, testID = 'table-body', children}, ref) => {
    return (
      <tbody
        id={id}
        data-testid={testID}
        ref={ref}
        className={'cf-table--body'}
      >
        {children}
      </tbody>
    )
  }
)
