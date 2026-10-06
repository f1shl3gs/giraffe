// Libraries
import classnames from 'classnames'
import {Component, CSSProperties, FunctionComponent, MouseEvent} from 'react'

// Types
import {RenamableField, SortOptions, TableViewProperties} from 'types'
import {CellRendererProps} from './TableGraphTable'
import {MultiGridProps} from 'components/Table/MultiGrid'

// Utils
import {generateThresholdsListHexs} from 'utils/colorOperations'
import {formatStatValue} from 'utils/formatStatValue'

// Constants
import {ASCENDING, DEFAULT_TIME_FIELD} from 'constants/tableGraph'

// Styles
import './TableGraphs.scss'

const URL_REGEXP = /((http|https)?:\/\/[^\s]+)/g

// From https://github.com/influxdata/influxdb/commit/426f076d2c27da4e67b8d60ac023d30de88f0516:
// NOTE: rip this out if you spend time any here as per:
// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript/1500501#1500501
const asLink = (str: string) => {
  const isURL = `${str}`.includes('http://') || `${str}`.includes('https://')
  if (isURL === false) {
    return str
  }

  const regex = RegExp(URL_REGEXP.source, URL_REGEXP.flags)
  const out = []
  let index = 0
  let link
  let match

  do {
    match = regex.exec(str)

    if (match) {
      if (match.index - index > 0) {
        out.push(str.slice(index, match.index))
      }
      link = str.slice(match.index, match.index + match[1].length)
      out.push(
        <a href={link} target='_blank'>
          {link}
        </a>,
      )

      index = match.index + match[1].length
    }
  } while (match)

  return out
}

const getStyle = (
  properties: TableViewProperties,
  data: string,
  dataType: string,
  isTimeVisible: boolean,
  isVerticalTimeAxis: boolean,
  isFirstColumnFixed: boolean,
  resolvedRenamableFields: RenamableField[],
  columnIndex: number,
  rowIndex: number,
  style: CSSProperties,
) => {
  const {colors} = properties

  if (
    isFixed(isFirstColumnFixed, rowIndex, columnIndex) ||
    isTimeData(
      rowIndex,
      columnIndex,
      resolvedRenamableFields,
      isTimeVisible,
      isVerticalTimeAxis,
    ) ||
    isTimestamp(dataType) ||
    Number.isNaN(data) ||
    dataType.includes('string')
  ) {
    return style
  }

  const thresholdData = {colors, lastValue: data, cellType: 'table'}
  const {bgColor, textColor} = generateThresholdsListHexs(thresholdData)
  return {
    ...style,
    backgroundColor: bgColor as CSSProperties['backgroundColor'],
    color: textColor as CSSProperties['color'],
  }
}

const getClassName = (
  data: string,
  dataType: string,
  sortOptions: SortOptions,
  hoveredRowIndex: number,
  hoveredColumnIndex: number,
  isVerticalTimeAxis: boolean,
  isFirstColumnFixed: boolean,
  rowIndex: number,
  columnIndex: number,
  parent: {current: Component<MultiGridProps> | null} | null,
): string => {
  return classnames('table-graph-cell', {
    'table-graph-cell__fixed-row': isFixedRow(rowIndex, columnIndex),
    'table-graph-cell__fixed-column': isFixedColumn(
      isFirstColumnFixed,
      rowIndex,
      columnIndex,
    ),
    'table-graph-cell__fixed-corner': isFixedCorner(rowIndex, columnIndex),
    'table-graph-cell__highlight-row': isHighlightedRow(
      parent,
      rowIndex,
      hoveredRowIndex,
    ),
    'table-graph-cell__highlight-column': isHighlightedColumn(
      columnIndex,
      hoveredColumnIndex,
    ),
    'table-graph-cell__numerical':
      !Number.isNaN(Number(data)) && !dataType.includes('string'),
    'table-graph-cell__field-name': isFieldName(
      isVerticalTimeAxis,
      rowIndex,
      columnIndex,
    ),
    'table-graph-cell__sort-asc':
      isFieldName(isVerticalTimeAxis, rowIndex, columnIndex) &&
      isSorted(sortOptions, data) &&
      isAscending(sortOptions),
    'table-graph-cell__sort-desc':
      isFieldName(isVerticalTimeAxis, rowIndex, columnIndex) &&
      isSorted(sortOptions, data) &&
      !isAscending(sortOptions),
  })
}

function isBlank(pString: string) {
  // Checks for a non-white space character
  return !/[^\s]+/.test(pString)
}

export const getContents = (
  properties: TableViewProperties,
  data: string,
  dataType: string,
  isVerticalTimeAxis: boolean,
  timeFormatter: (time: string) => string,
  rowIndex: number,
  columnIndex: number,
  resolvedRenamableFields: RenamableField[],
): string => {
  const {decimalPlaces} = properties

  if (!data || (typeof data === 'string' && isBlank(data))) {
    return String(data)
  }

  if (data && dataType.includes('dateTime')) {
    return timeFormatter(data)
  }
  if (
    typeof data === 'string' &&
    isFieldName(isVerticalTimeAxis, rowIndex, columnIndex)
  ) {
    return getFieldName(
      data,
      isVerticalTimeAxis,
      resolvedRenamableFields,
      columnIndex,
      rowIndex,
    )
  }

  if (!Number.isNaN(+data) && !dataType.includes('string')) {
    // method needs the first arg to be a number to work properly
    return formatStatValue(+data, {decimalPlaces})
  }

  return data
}

const getFieldName = (
  data: string,
  isVerticalTimeAxis: boolean,
  resolvedRenamableFields: RenamableField[],
  columnIndex: number,
  rowIndex: number,
): string => {
  const foundField =
    isFieldName(isVerticalTimeAxis, rowIndex, columnIndex) &&
    resolvedRenamableFields.find(({internalName}) => internalName === data)

  return foundField
    ? foundField.displayName || foundField.internalName || ''
    : ''
}

const isFieldName = (
  isVerticalTimeAxis: boolean,
  rowIndex: number,
  columnIndex: number,
): boolean =>
  isVerticalTimeAxis ? isFirstRow(rowIndex) : isFirstCol(columnIndex)

const isHighlightedRow = (
  parent: {current: Component<MultiGridProps> | null} | null,
  rowIndex: number,
  hoveredRowIndex: number,
): boolean => {
  return (
    (parent?.current && rowIndex === parent.current.props.scrollToRow) ||
    (rowIndex === hoveredRowIndex && hoveredRowIndex > 0)
  )
}

const isHighlightedColumn = (
  columnIndex: number,
  hoveredColumnIndex: number,
): boolean => columnIndex === hoveredColumnIndex && hoveredColumnIndex > 0

const isTimeData = (
  rowIndex: number,
  columnIndex: number,
  resolvedRenamableFields: RenamableField[],
  isTimeVisible: boolean,
  isVerticalTimeAxis: boolean,
): boolean => {
  return (
    isTimeVisible &&
    (isVerticalTimeAxis
      ? !isFirstRow(rowIndex) &&
        columnIndex === getTimeFieldIndex(resolvedRenamableFields)
      : rowIndex === getTimeFieldIndex(resolvedRenamableFields) &&
        isFirstCol(columnIndex))
  )
}

const isSorted = (sortOptions: SortOptions, data: string): boolean =>
  sortOptions.field === data

const isAscending = (sortOptions: SortOptions): boolean =>
  sortOptions.direction === ASCENDING

const isFirstRow = (rowIndex: number): boolean => rowIndex === 0

const isFirstCol = (columnIndex: number): boolean => columnIndex === 0

const isFixedRow = (rowIndex: number, columnIndex: number): boolean => {
  return isFirstRow(rowIndex) && !isFirstCol(columnIndex)
}

const isFixedColumn = (
  isFirstColumnFixed: boolean,
  rowIndex: number,
  columnIndex: number,
): boolean => {
  return isFirstColumnFixed && !isFirstRow(rowIndex) && isFirstCol(columnIndex)
}

const isFixedCorner = (rowIndex: number, columnIndex: number): boolean => {
  return isFirstRow(rowIndex) && isFirstCol(columnIndex)
}

const isTimestamp = (dataType: string): boolean =>
  dataType === 'dateTime:RFC3339'

const isFixed = (
  isFirstColumnFixed: boolean,
  rowIndex: number,
  columnIndex: number,
): boolean => {
  return (
    isFixedRow(rowIndex, columnIndex) ||
    isFixedColumn(isFirstColumnFixed, rowIndex, columnIndex) ||
    isFixedCorner(rowIndex, columnIndex)
  )
}

const getTimeFieldIndex = (
  resolvedRenamableFields: RenamableField[],
): number => {
  let hiddenBeforeTime = 0
  const timeIndex = resolvedRenamableFields.findIndex(
    ({internalName, visible}) => {
      if (!visible) {
        hiddenBeforeTime += 1
      }
      return internalName === DEFAULT_TIME_FIELD.internalName
    },
  )

  return timeIndex - hiddenBeforeTime
}

const getCellIdString = (
  data: string,
  sortOptions: SortOptions,
  rowIndex: number,
  columnIndex: number,
  isVerticalTimeAxis: boolean,
): string => {
  if (
    isFieldName(isVerticalTimeAxis, rowIndex, columnIndex) &&
    isSorted(sortOptions, data) &&
    isAscending(sortOptions)
  ) {
    return 'table-graph-cell__sort-asc'
  } else if (
    isFieldName(isVerticalTimeAxis, rowIndex, columnIndex) &&
    isSorted(sortOptions, data) &&
    !isAscending(sortOptions)
  ) {
    return 'table-graph-cell__sort-desc'
  } else {
    return 'table-graph-cell'
  }
}

interface Props extends CellRendererProps {
  sortOptions: SortOptions
  data: string
  dataType: string
  properties: TableViewProperties
  hoveredRowIndex: number
  hoveredColumnIndex: number
  isTimeVisible: boolean
  isVerticalTimeAxis: boolean
  isFirstColumnFixed: boolean
  onClickFieldName: (data: string) => void
  onHover: (e: MouseEvent<HTMLElement>) => void
  resolvedRenamableFields: RenamableField[]
  timeFormatter: (time: string) => string
}

export const TableCell: FunctionComponent<Props> = ({
  data,
  dataType,
  sortOptions,
  rowIndex,
  columnIndex,
  onHover,
  onClickFieldName,
  properties,
  resolvedRenamableFields,
  timeFormatter,
  isFirstColumnFixed,
  isTimeVisible,
  isVerticalTimeAxis,
  hoveredRowIndex,
  hoveredColumnIndex,
  style,
  parent,
}) => {
  const handleClick = () => {
    return isFieldName(isVerticalTimeAxis, rowIndex, columnIndex) &&
      typeof data === 'string'
      ? onClickFieldName(data)
      : null
  }

  const cellStyle = getStyle(
    properties,
    data,
    dataType,
    isTimeVisible,
    isVerticalTimeAxis,
    isFirstColumnFixed,
    resolvedRenamableFields,
    columnIndex,
    rowIndex,
    style,
  )

  const content = getContents(
    properties,
    data,
    dataType,
    isVerticalTimeAxis,
    timeFormatter,
    rowIndex,
    columnIndex,
    resolvedRenamableFields,
  )

  const className = getClassName(
    data,
    dataType,
    sortOptions,
    hoveredRowIndex,
    hoveredColumnIndex,
    isVerticalTimeAxis,
    isFirstColumnFixed,
    rowIndex,
    columnIndex,
    parent,
  )

  if (rowIndex === 0) {
    const cellIdString = getCellIdString(
      data,
      sortOptions,
      rowIndex,
      columnIndex,
      isVerticalTimeAxis,
    )

    return (
      <button
        style={cellStyle}
        className={className}
        onClick={handleClick}
        data-column-index={columnIndex}
        data-row-index={rowIndex}
        data-testid={`${data}-table-header ${cellIdString}`}
        onMouseOver={onHover}
        title={content}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      style={cellStyle}
      className={className}
      onClick={handleClick}
      data-column-index={columnIndex}
      data-row-index={rowIndex}
      onMouseOver={onHover}
      title={content}
    >
      {asLink(content)}
    </div>
  )
}
