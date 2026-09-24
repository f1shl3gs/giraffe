// Libraries
import {RefObject, MouseEvent, FunctionComponent} from 'react'
import classnames from 'classnames'

// Components
import {Index} from './Button'

// Types
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  StandardFunctionProps,
} from 'types'

// Styles
import './Pagination.scss'

export interface PaginationTruncationItemProps extends StandardFunctionProps {
  onClick?: (event?: MouseEvent<HTMLElement>) => void
  size?: ComponentSize
  ref?: RefObject<HTMLLIElement>
}

export const PaginationTruncationItem: FunctionComponent<
  PaginationTruncationItemProps
> = ({
  id,
  style,
  testID = 'pagination-truncation-item',
  className,
  onClick,
  size = ComponentSize.Medium,
  ref,
}) => {
  const paginationClassName = classnames(
    'cf-pagination--item--container',
    className,
  )

  return (
    <li
      className={paginationClassName}
      data-testid={testID}
      id={id}
      style={style}
      ref={ref}
    >
      <Index
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
