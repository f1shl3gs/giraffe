// Libraries
import {CSSProperties, FunctionComponent, useMemo} from 'react'

// Types
import type {DecimalPlaces, SVGAttributes, Table} from 'types'

// Utils
import {formatStatValue} from 'utils/formatStatValue'
import {getLatestValues} from './getLatestValues'

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

export interface SingleStatConfig {
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

/*
  SingleStat is standalone (D13, same shape as Gauge and Geo). The number it
  shows is the latest value in the table, so it needs no axes, no scales and no
  plot environment. It still works as a child of <Plot> -- the third story puts
  it above a line -- because nothing here reads the environment.
*/
export interface SingleStatProps {
  config: SingleStatConfig
  table: Table
}

export const SingleStat: FunctionComponent<SingleStatProps> = ({
  config,
  table,
}) => {
  const latestValues = useMemo(() => getLatestValues(table), [table])
  if (latestValues.length === 0) {
    return (
      <div>
        <h4>No latest value found</h4>
      </div>
    )
  }

  return <SingleStatView stat={latestValues[0]} config={config} />
}

interface SingleStatViewProps {
  stat: number
  config: SingleStatConfig
}

const getDefaultViewBox = (stat: string): string =>
  `0 0 ${stat.length * 55} 100`

const SingleStatView: FunctionComponent<SingleStatViewProps> = ({
  stat,
  config,
}) => {
  const {
    backgroundColor = null,
    decimalPlaces,
    prefix,
    resizerStyle = {},
    style = {},
    suffix,
    svgAttributes = {viewBox: ''},
    svgStyle = {},
    svgTextAttributes = {},
    svgTextStyle = {},
    testID = SINGLE_STAT_DEFAULT_TEST_ID,
    textColor,
    textOpacity = 1,
  } = config

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
