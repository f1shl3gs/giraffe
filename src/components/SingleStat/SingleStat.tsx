// Libraries
import {CSSProperties, FunctionComponent, useMemo} from 'react'
// Constants
import {
  SINGLE_STAT_DEFAULT_TEST_ID,
  SINGLE_STAT_RESIZER_DEFAULT_STYLE,
  SINGLE_STAT_SVG_DEFAULT_ATTRIBUTES,
  SINGLE_STAT_SVG_TEXT_DEFAULT_ATTRIBUTES,
  SINGLE_STAT_SVG_TEXT_DEFAULT_STYLE,
} from 'style/singleStatStyles'
// Types
import type {DecimalPlaces, SVGAttributes, Table} from 'types'
// Utils
import {formatStatValue} from 'utils/formatStatValue'
import {getLatestValues} from './getLatestValues'

// Styles
import './SingleStat.scss'

export interface SingleStatProps {
  table: Table
  prefix: string
  suffix: string
  decimalPlaces: DecimalPlaces
  textColor: string
  textOpacity?: number
  backgroundColor?: string
  testID?: string
  style?: CSSProperties
  resizerStyle?: CSSProperties
  svgAttributes?: SVGAttributes
  svgStyle?: CSSProperties
  svgTextAttributes?: SVGAttributes
  svgTextStyle?: CSSProperties
}

export const SingleStat: FunctionComponent<SingleStatProps> = ({
  table,
  prefix,
  suffix,
  decimalPlaces,
  textColor,
  textOpacity = 1,
  backgroundColor = null,
  testID = SINGLE_STAT_DEFAULT_TEST_ID,
  style = {},
  resizerStyle = {},
  svgAttributes = {viewBox: ''},
  svgStyle = {},
  svgTextAttributes = {},
  svgTextStyle = {},
}) => {
  const latestValues = useMemo(() => getLatestValues(table), [table])
  if (latestValues.length === 0) {
    return (
      <div>
        <h4>No latest value found</h4>
      </div>
    )
  }

  return (
    <SingleStatView
      stat={latestValues[0]}
      prefix={prefix}
      suffix={suffix}
      decimalPlaces={decimalPlaces}
      textColor={textColor}
      textOpacity={textOpacity}
      backgroundColor={backgroundColor}
      testID={testID}
      style={style}
      resizerStyle={resizerStyle}
      svgAttributes={svgAttributes}
      svgStyle={svgStyle}
      svgTextAttributes={svgTextAttributes}
      svgTextStyle={svgTextStyle}
    />
  )
}

/* Every field the view needs is already resolved by <SingleStat>, so none of
   them are optional here. */
interface SingleStatViewProps {
  stat: number
  prefix: string
  suffix: string
  decimalPlaces: DecimalPlaces
  textColor: string
  textOpacity: number
  backgroundColor: string | null
  testID: string
  style: CSSProperties
  resizerStyle: CSSProperties
  svgAttributes: SVGAttributes
  svgStyle: CSSProperties
  svgTextAttributes: SVGAttributes
  svgTextStyle: CSSProperties
}

const getDefaultViewBox = (stat: string): string =>
  `0 0 ${stat.length * 55} 100`

const SingleStatView: FunctionComponent<SingleStatViewProps> = ({
  stat,
  prefix,
  suffix,
  decimalPlaces,
  textColor,
  textOpacity,
  backgroundColor,
  testID,
  style,
  resizerStyle,
  svgAttributes,
  svgStyle,
  svgTextAttributes,
  svgTextStyle,
}) => {
  const formattedValue = formatStatValue(stat, {
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
              opacity: textOpacity,
            } as any)}
            className='giraffe-single-stat--text'
            style={{
              ...SINGLE_STAT_SVG_TEXT_DEFAULT_STYLE,
              ...svgTextStyle,
              fill: textColor,
            }}
          >
            {formattedValue}
          </text>
        </svg>
      </div>
    </div>
  )
}
