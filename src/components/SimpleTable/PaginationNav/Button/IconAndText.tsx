// Libraries
import {FunctionComponent} from 'react'

// Components
import {Icon} from 'components/Icon'

// Types
import {IconFont} from 'types'

// Styles
import './Button.scss'

export interface IconAndTextProps {
  text?: string
  icon?: IconFont | string
  placeIconAfterText?: boolean
}

export const IconAndText: FunctionComponent<IconAndTextProps> = ({
  text,
  icon,
  placeIconAfterText = false,
}) => {
  const iconEl = icon && <Icon glyph={icon} className={'cf-button-icon'} />
  const textEl = text && <span className={'cf-button--label'}>{text}</span>

  if (!icon && !text) {
    return null
  }

  if (placeIconAfterText) {
    return (
      <>
        {textEl}
        {iconEl}
      </>
    )
  }

  return (
    <>
      {iconEl}
      {textEl}
    </>
  )
}
