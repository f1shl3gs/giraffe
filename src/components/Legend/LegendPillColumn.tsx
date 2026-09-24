import {FunctionComponent} from 'react'

import {LegendType} from 'types'
import {LegendPillsStyles} from 'style/legend'

import {
  LEGEND_COLUMN_CLASSNAME,
  STATIC_LEGEND_COLUMN_CLASSNAME,
} from 'constants'

interface Props {
  type: LegendType
  styles: LegendPillsStyles
}

export const LegendPillColumn: FunctionComponent<Props> = ({
  type: legendType,
  styles,
}) => {
  const {column, header, value, pills} = styles
  const classNameBase =
    legendType === 'static'
      ? STATIC_LEGEND_COLUMN_CLASSNAME
      : LEGEND_COLUMN_CLASSNAME

  return (
    <div className={classNameBase} style={column}>
      <div className={`${classNameBase}-header`} style={header}>
        &nbsp;
      </div>
      {pills.map((pill, i) => (
        <div className={`${classNameBase}-value`} key={i} style={value}>
          <div className={`${classNameBase}-pill`} style={pill} />
        </div>
      ))}
    </div>
  )
}
