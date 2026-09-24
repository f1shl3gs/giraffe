import {FunctionComponent} from 'react'

import {LegendColumn} from './LegendColumn'
import {LegendPillColumn} from './LegendPillColumn'

import {Config, LegendData, LegendType} from 'types'
import {generateLegendStyles} from 'style/legend'

interface Props {
  type: LegendType
  data: LegendData
  config: Config
  isScrollable?: boolean
}

export const Legend: FunctionComponent<Props> = ({
  type: legendType,
  data,
  config,
  isScrollable = false,
}) => {
  const {
    width,
    height,
    legendFontColor: fontColor,
    legendFontBrightColor: fontBrightColor,
    legendColumns: columnsWhitelist,
    legendOrientationThreshold: orientationThreshold,
    legendColorizeRows: colorizeRows,
  } = config

  let columns = []
  if (Array.isArray(columnsWhitelist)) {
    if (columnsWhitelist.length === 0) {
      return null
    }
    columns = data.filter(column => columnsWhitelist.includes(column.key))
  } else {
    columns = data
  }

  const switchToVertical = columns.length > orientationThreshold

  // 'switchToVertical': true
  //   each column of data displays vertically, and
  //   additional columns are next to the previous column, therefore,
  //   the limit is the horizontal space (width)
  // 'switchToVertical': false
  //   each column of data displays horizontally, and
  //   additional columns are stacked below the previous column, therefore,
  //   the limit is the vertical space (height)
  const maxLength = switchToVertical ? width : height

  const styles = generateLegendStyles(
    legendType,
    isScrollable,
    columns,
    switchToVertical,
    colorizeRows,
    fontColor,
    fontBrightColor,
  )

  return (
    <div
      className='giraffe-legend-table'
      style={styles.table}
      data-testid='giraffe-legend-table'
    >
      {!colorizeRows && (
        <LegendPillColumn type={legendType} styles={styles.pills} />
      )}
      {columns.map(({name, values}, i) => (
        <LegendColumn
          type={legendType}
          key={name}
          name={name}
          maxLength={maxLength}
          values={values}
          columnStyle={styles.columns[i]}
          columnHeaderStyle={styles.headers}
          columnValueStyles={styles.values[i]}
        />
      ))}
    </div>
  )
}
