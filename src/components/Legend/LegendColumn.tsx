import {CSSProperties, FunctionComponent} from 'react'

import {LegendType} from 'types'
import {
  LEGEND_COLUMN_CLASSNAME,
  STATIC_LEGEND_COLUMN_CLASSNAME,
} from 'constants'

interface Props {
  type: LegendType
  name: string
  maxLength: number
  values: string[]
  columnStyle: CSSProperties
  columnHeaderStyle: CSSProperties
  columnValueStyles: CSSProperties[]
}

export const LegendColumn: FunctionComponent<Props> = ({
  type: legendType,
  name,
  maxLength,
  values,
  columnStyle,
  columnHeaderStyle,
  columnValueStyles,
}) => {
  const valuesLimitedByPlotDimensions = values.slice(0, maxLength)
  const classNameBase =
    legendType === 'static'
      ? STATIC_LEGEND_COLUMN_CLASSNAME
      : LEGEND_COLUMN_CLASSNAME

  return (
    <div className={classNameBase} style={columnStyle}>
      <div className={`${classNameBase}-header`} style={columnHeaderStyle}>
        {name}
      </div>
      {valuesLimitedByPlotDimensions.map((value, i) => (
        <div
          className={`${classNameBase}-value`}
          key={i}
          style={columnValueStyles[i]}
        >
          {String(value)}
        </div>
      ))}
    </div>
  )
}
