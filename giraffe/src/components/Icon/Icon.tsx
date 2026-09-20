// Libraries
import React, {forwardRef} from 'react'
import classnames from 'classnames'

// Types
import {IconFont, StandardFunctionProps} from '../../types'

// Styles
import './Icon.scss'

export interface IconProps extends StandardFunctionProps {
  /** Icon to display */
  glyph: IconFont | string
}

export type IconRef = HTMLSpanElement

export const Icon = forwardRef<IconRef, IconProps>(
  ({id, glyph, style, testID = 'icon', className}, ref) => {
    const iconClassNames = classnames('cf-icon', glyph, className)

    return (
      <span
        id={id}
        ref={ref}
        style={style}
        data-testid={testID}
        className={iconClassNames}
      />
    )
  }
)

Icon.displayName = 'GiraffeIcon'
