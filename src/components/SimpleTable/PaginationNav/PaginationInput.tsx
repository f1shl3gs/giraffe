// Libraries
import {RefObject, ChangeEvent, MouseEvent, FunctionComponent} from 'react'

// Components
import {Input} from 'components/Input'
import {Index} from './Button'

// Types
import {
  ComponentColor,
  ComponentSize,
  IconFont,
  InputType,
  StandardFunctionProps,
} from 'types'

// Styles
import './Pagination.scss'

export interface PaginationInputProps extends StandardFunctionProps {
  currentPage: number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void | undefined
  onClick?: (event?: MouseEvent<HTMLButtonElement>) => void
  size?: ComponentSize
  ref?: RefObject<HTMLInputElement>
}

export const PaginationInput: FunctionComponent<PaginationInputProps> = ({
  size = ComponentSize.Small,
  currentPage = 1,
  onChange,
  onClick,
  ref,
}) => {
  const iconFont = 'CaretRight'
  const inputStyles = {width: currentPage.toString().length + 6 + 'ch'}

  return (
    <div className={'cf-pagination-input--container'}>
      <div
        className={
          'cf-pagination-input--item cf-pagination-input--item--padding'
        }
      >
        Go to Page
      </div>
      <Input
        type={InputType.Number}
        onChange={onChange}
        value={currentPage}
        size={size}
        style={inputStyles}
        ref={ref}
        className={'cf-pagination-input__width'}
      />
      <Index
        size={size}
        color={ComponentColor.Tertiary}
        onClick={onClick}
        placeIconAfterText={true}
        icon={IconFont[iconFont]}
        text={'Go'}
      />
    </div>
  )
}
