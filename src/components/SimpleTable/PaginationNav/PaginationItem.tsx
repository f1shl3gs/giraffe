// Libraries
import classnames from 'classnames'
import {FunctionComponent, MouseEvent, RefObject} from 'react'

// Components
import {Index} from './Button'

// Types
import {ComponentColor, ComponentSize, StandardFunctionProps} from 'types'

// Styles
import './Pagination.scss'

export interface PaginationItemProps extends StandardFunctionProps {
  page?: string
  isActive: boolean
  onClick?: (e?: MouseEvent<HTMLElement>) => void
  size?: ComponentSize
  ref?: RefObject<HTMLLIElement>
}

export const PaginationItem: FunctionComponent<PaginationItemProps> = ({
  id,
  style,
  testID = 'pagination-item',
  className,
  page,
  isActive,
  onClick,
  size = ComponentSize.Small,
  ref,
}) => {
  const paginationItemContainerClassName = classnames(
    'cf-pagination--item--container',
    className,
    {
      'cf-pagination--item--container__active': isActive && page,
    },
  )

  return (
    <li
      className={paginationItemContainerClassName}
      data-testid={testID}
      id={id}
      style={style}
      ref={ref}
    >
      <Index
        size={size}
        color={ComponentColor.Tertiary}
        onClick={onClick}
        active={isActive}
        text={page}
      />
    </li>
  )
}
