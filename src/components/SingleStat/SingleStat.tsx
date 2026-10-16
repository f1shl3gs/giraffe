// Libraries
import {CSSProperties, FunctionComponent} from 'react'

// Types
import type {DecimalPlaces, SVGAttributes} from 'types'

// Utils
import {formatStatValue} from 'utils/formatStatValue'

// Constants
import {
  SINGLE_STAT_DEFAULT_TEST_ID,
  SINGLE_STAT_RESIZER_DEFAULT_STYLE,
  SINGLE_STAT_SVG_DEFAULT_ATTRIBUTES,
  SINGLE_STAT_SVG_TEXT_DEFAULT_ATTRIBUTES,
  SINGLE_STAT_SVG_TEXT_DEFAULT_STYLE,
} from 'style/singleStatStyles'

// Styles
import './SingleStat.scss'

export interface SingleStatProps {
  value?: number
  prefix: string
  suffix: string
  decimalPlaces: DecimalPlaces
  color: string
  opacity?: number
  backgroundColor?: string
  testID?: string
  style?: CSSProperties
  resizerStyle?: CSSProperties
  svgAttributes?: SVGAttributes
  svgStyle?: CSSProperties
  svgTextAttributes?: SVGAttributes
  svgTextStyle?: CSSProperties
}

const getDefaultViewBox = (stat: string): string =>
  `0 0 ${stat.length * 55} 100`

export const SingleStat: FunctionComponent<SingleStatProps> = ({
  value,
  prefix,
  suffix,
  decimalPlaces,
  color,
  opacity = 1,
  backgroundColor = null,
  testID = SINGLE_STAT_DEFAULT_TEST_ID,
  style = {},
  resizerStyle = {},
  svgAttributes = {viewBox: ''},
  svgStyle = {},
  svgTextAttributes = {},
  svgTextStyle = {},
}) => {
  if (value === undefined) {
    return (
      <div>
        <h4>No latest value found</h4>
      </div>
    )
  }

  const formattedValue = formatStatValue(value, {
    decimalPlaces,
    prefix,
    suffix,
  })

  let viewBox = getDefaultViewBox(formattedValue)

  if (svgAttributes.viewBox) {
    viewBox =
      typeof svgAttributes.viewBox === 'function'
        ? svgAttributes.viewBox(formattedValue)
        : svgAttributes.viewBox
  }

  return (
    <div
      className={'giraffe-layer giraffe-layer-single-stat'}
      data-testid={testID}
      style={{
        ...style,
        backgroundColor: `${backgroundColor}`,
      }}
    >
      <div
        className='giraffe-single-stat--resizer'
        style={{...SINGLE_STAT_RESIZER_DEFAULT_STYLE, ...resizerStyle}}
      >
        <svg
          {...{
            ...SINGLE_STAT_SVG_DEFAULT_ATTRIBUTES,
            ...svgAttributes,
            viewBox,
          }}
          className='giraffe-single-stat--svg'
          style={{...svgStyle}}
        >
          <text
            {...({
              ...SINGLE_STAT_SVG_TEXT_DEFAULT_ATTRIBUTES,
              ...svgTextAttributes,
              opacity,
            } as any)}
            className='giraffe-single-stat--text'
            style={{
              ...SINGLE_STAT_SVG_TEXT_DEFAULT_STYLE,
              ...svgTextStyle,
              fill: color,
            }}
          >
            {formattedValue}
          </text>
        </svg>
      </div>
    </div>
  )
}
