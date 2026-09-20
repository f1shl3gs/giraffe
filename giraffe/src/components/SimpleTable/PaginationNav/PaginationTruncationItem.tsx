// Libraries
import React, {forwardRef, MouseEvent} from 'react'
import classnames from 'classnames'

// Components
import {Button} from './Button/Button'

// Types
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  StandardFunctionProps,
} from '../../../types'

// Styles
import './Pagination.scss'

export interface PaginationTruncationItemProps extends StandardFunctionProps {
  onClick?: (event?: MouseEvent<HTMLElement>) => void
  size?: ComponentSize
}

export type PaginationTruncationItemRef = HTMLLIElement
export const PaginationTruncationItem = forwardRef<
  PaginationTruncationItemRef,
  PaginationTruncationItemProps
>(
  (
    {
      id,
      style,
      testID = 'pagination-truncation-item',
      className,
      onClick,
      size = ComponentSize.Medium,
    },
    ref
  ) => {
    const paginationClassName = classnames(
      'cf-pagination--item--container',
      className
    )

    return (
      <li
        className={paginationClassName}
        data-testid={testID}
        id={id}
        style={style}
        ref={ref}
      >
        <Button
          size={size}
          color={ComponentColor.Tertiary}
          onClick={onClick}
          shape={ButtonShape.Square}
          text={'...'}
          status={ComponentStatus.Disabled}
          style={{background: 'transparent'}}
        />
      </li>
    )
  }
)
