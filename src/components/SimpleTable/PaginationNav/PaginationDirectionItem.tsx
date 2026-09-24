// Libraries
import classnames from 'classnames'
import {FunctionComponent, MouseEvent, RefObject} from 'react'

// Component
import {Index} from './Button'

// Types
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  Direction,
  IconFont,
  StandardFunctionProps,
} from 'types'

// Styles
import './Pagination.scss'

export interface PaginationDirectionItemProps extends StandardFunctionProps {
  /** Caret Left or Caret Right on button */
  direction: Direction
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void
  size?: ComponentSize
  isActive: boolean
  ref?: RefObject<HTMLLIElement>
}

export const PaginationDirectionItem: FunctionComponent<
  PaginationDirectionItemProps
> = ({
  id,
  style,
  testID = 'pagination-direction-item',
  className,
  direction,
  onClick,
  size = ComponentSize.Medium,
  isActive,
  ref,
}) => {
  const paginationClassName = classnames(
    'cf-pagination--item--container',
    className,
  )

  const iconFont =
    direction === Direction.Left
      ? IconFont.CaretLeft_New
      : IconFont.CaretRight_New

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
        icon={iconFont}
        active={isActive}
      ></Index>
    </li>
  )
}
