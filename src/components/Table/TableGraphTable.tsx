// Libraries
import classnames from 'classnames'
import {FunctionComponent, MouseEvent, useEffect, useRef, useState} from 'react'

// Components
import {AutoSizer} from 'components/AutoSizer'
import {ColumnSizer, SizedColumns} from 'components/ColumnSizer'
import {MultiGrid, MultiGridInputHandles, PropsMultiGrid} from './MultiGrid'
import {TableCell} from './TableCell'

// Constants
import {
  DEFAULT_FIX_FIRST_COLUMN,
  DEFAULT_TIME_FIELD,
  DEFAULT_VERTICAL_TIME_AXIS,
  NULL_ARRAY_INDEX,
} from 'constants/tableGraph'

// Types
import {
  TableViewProperties,
  Theme,
  TimeZone,
  TransformTableDataReturnType,
} from 'types'

// Utils
import {timeFormatter} from 'utils/formatters'
import {findHoverTimeIndex, resolveTimeFormat} from 'utils/tableGraph'
import {useHoverTime} from './hoverTime'

const COLUMN_MIN_WIDTH = 100
const ROW_HEIGHT = 30

// Styles
import './TableGraphs.scss'

export interface ColumnWidths {
  totalWidths: number
  widths: {[x: string]: number}
}

export interface CellRendererProps {
  columnIndex: number
  rowIndex: number
  key: string
  parent: React.Component<PropsMultiGrid>
  style: React.CSSProperties
}

interface OwnProps {
  dataTypes: {[x: string]: string}
  transformedDataBundle: TransformTableDataReturnType
  properties: TableViewProperties
  onSort: (fieldName: string) => void
  timeZone: TimeZone
  theme: Theme
}

type Props = OwnProps

interface State {
  timeColumnWidth: number
  totalColumnWidths: number
  shouldResize: boolean
  hoveredColumnIndex: number
  hoveredRowIndex: number
  multiGrid?: typeof MultiGrid
}

const getColumnCount = ({transformedDataBundle}: Props): number => {
  const {transformedData} = transformedDataBundle

  return transformedData[0] ? transformedData[0].length : 0
}

const getFixFirstColumn = (props: Props): boolean => {
  const {
    transformedDataBundle: {resolvedRenamableFields},
    properties: {tableOptions},
  } = props

  const {fixFirstColumn = DEFAULT_FIX_FIRST_COLUMN} = tableOptions

  if (
    !Array.isArray(resolvedRenamableFields) ||
    resolvedRenamableFields.length === 1
  ) {
    return false
  }

  const visibleFields = resolvedRenamableFields.reduce((acc, f) => {
    if (f.visible) {
      acc += 1
    }
    return acc
  }, 0)

  if (visibleFields === 1) {
    return false
  }

  return fixFirstColumn
}

const getComputedColumnCount = (props: Props): number => {
  if (getFixFirstColumn(props)) {
    return getColumnCount(props) - 1
  }

  return getColumnCount(props)
}

const isTimeVisible = (props: Props): boolean => {
  const {
    transformedDataBundle: {resolvedRenamableFields},
  } = props

  if (!Array.isArray(resolvedRenamableFields)) {
    return false
  }

  return (
    resolvedRenamableFields.find(
      field => field.internalName === DEFAULT_TIME_FIELD.internalName,
    )?.visible ?? false
  )
}

const isVerticalTimeAxis = (props: Props): boolean => {
  const {
    properties: {tableOptions},
  } = props

  const {verticalTimeAxis = DEFAULT_VERTICAL_TIME_AXIS} = tableOptions
  return verticalTimeAxis
}

const handleMouseLeave = (
  setHoverTime: (hoverTime: number | null) => void,
  setState: Function,
): void => {
  setHoverTime(0)

  const newState: Partial<State> = {
    hoveredColumnIndex: NULL_ARRAY_INDEX,
    hoveredRowIndex: NULL_ARRAY_INDEX,
  }

  setState((prevState: State) => ({...prevState, ...newState}))
}

const getScrollToColRow = (
  hoverTime: number | null,
  props: Props,
  state: State,
): {
  scrollToRow: number | null
  scrollToColumn: number | null
} => {
  const {
    transformedDataBundle: {sortedTimeVals},
  } = props
  const hoveringThisTable = state.hoveredColumnIndex !== NULL_ARRAY_INDEX

  if (!hoverTime || hoveringThisTable || !isTimeVisible(props)) {
    return {scrollToColumn: 0, scrollToRow: -1}
  }

  const hoverIndex = findHoverTimeIndex(sortedTimeVals, hoverTime)
  if (isVerticalTimeAxis(props)) {
    return {
      scrollToRow: hoverIndex,
      scrollToColumn: -1,
    }
  }
  return {
    scrollToRow: null,
    scrollToColumn: hoverIndex,
  }
}

const handleHover = (
  e: MouseEvent<HTMLElement>,
  props: Props,
  setHoverTime: (hoverTime: number | null) => void,
  setState: Function,
) => {
  const {dataset} = e.target as HTMLElement
  const {
    transformedDataBundle: {sortedTimeVals},
  } = props

  if (isVerticalTimeAxis(props) && +dataset.rowIndex === 0) {
    return
  }
  if (setHoverTime && isTimeVisible(props)) {
    const hoverTime = isVerticalTimeAxis(props)
      ? sortedTimeVals[dataset.rowIndex]
      : sortedTimeVals[dataset.columnIndex]

    setHoverTime(new Date(hoverTime).valueOf())
  }

  const newState: Partial<State> = {
    hoveredColumnIndex: +dataset.columnIndex,
    hoveredRowIndex: +dataset.rowIndex,
  }
  setState((prevState: State) => ({...prevState, ...newState}))
}

const getCellData = (
  props: Props,
  rowIndex: number,
  columnIndex: number,
): string => {
  const {
    transformedDataBundle: {transformedData},
  } = props
  return transformedData[rowIndex][columnIndex]
}

const getDataType = (
  props: Props,
  rowIndex: number,
  columnIndex: number,
): string => {
  const {
    transformedDataBundle: {transformedData},
    dataTypes,
  } = props

  if (rowIndex === 0) {
    return 'n/a'
  }

  const columnName = transformedData[0][columnIndex]

  return dataTypes[columnName] ?? 'n/a'
}

const getTimeFormatter = (props: Props) => {
  const {
    timeZone,
    properties: {timeFormat},
  } = props

  return timeFormatter({
    timeZone: timeZone === 'Local' ? undefined : timeZone,
    format: resolveTimeFormat(timeFormat),
  })
}

const cellRenderer = (
  state: State,
  setState: Function,
  hoverTime: number | null,
  setHoverTime: (hoverTime: number | null) => void,
  tgtProps: Props,
  cellProps: CellRendererProps,
) => {
  const {rowIndex, columnIndex} = cellProps
  const {
    transformedDataBundle: {sortOptions, resolvedRenamableFields},
    onSort,
    properties,
  } = tgtProps
  const {scrollToRow} = getScrollToColRow(hoverTime, tgtProps, state)
  const hoverIndex = scrollToRow >= 0 ? scrollToRow : state.hoveredRowIndex
  const handleHoverCallback = (e: React.MouseEvent<HTMLElement>) =>
    handleHover(e, tgtProps, setHoverTime, setState)

  return (
    <TableCell
      {...cellProps}
      sortOptions={sortOptions}
      onHover={handleHoverCallback}
      isTimeVisible={isTimeVisible(tgtProps)}
      data={getCellData(tgtProps, rowIndex, columnIndex)}
      dataType={getDataType(tgtProps, rowIndex, columnIndex)}
      hoveredRowIndex={hoverIndex}
      properties={properties}
      resolvedRenamableFields={resolvedRenamableFields}
      hoveredColumnIndex={state.hoveredColumnIndex}
      isFirstColumnFixed={getFixFirstColumn(tgtProps)}
      isVerticalTimeAxis={isVerticalTimeAxis(tgtProps)}
      onClickFieldName={onSort}
      timeFormatter={getTimeFormatter(tgtProps)}
    />
  )
}

const getTableWidth = (gridContainer: HTMLDivElement): number => {
  return gridContainer && gridContainer.clientWidth
    ? gridContainer.clientWidth
    : 0
}

const calculateColumnWidth =
  (
    state: State,
    props: Props,
    gridContainer: HTMLDivElement,
    columnSizerWidth: number,
  ) =>
  (column: {index: number}): number => {
    const {index} = column

    const {
      transformedDataBundle: {transformedData, columnWidths},
    } = props

    const {totalColumnWidths} = state
    const columnLabel = transformedData[0][index]

    const original = columnWidths[columnLabel] || 0

    if (getFixFirstColumn(props) && index === 0) {
      return original
    }

    if (getTableWidth(gridContainer) <= totalColumnWidths) {
      return original
    }

    if (getColumnCount(props) <= 1) {
      return columnSizerWidth
    }

    const difference = getTableWidth(gridContainer) - totalColumnWidths
    const increment = difference / getComputedColumnCount(props)

    return original + increment
  }

const TableGraphTableComponent: FunctionComponent<Props> = props => {
  const {hoverTime, setHoverTime} = useHoverTime()
  const {
    transformedDataBundle: {transformedData},
    theme,
  } = props

  const multiGridRef = useRef<MultiGridInputHandles>(null)

  const [state, setState] = useState<State>({
    timeColumnWidth: 0,
    shouldResize: false,
    totalColumnWidths: 0,
    hoveredRowIndex: NULL_ARRAY_INDEX,
    hoveredColumnIndex: NULL_ARRAY_INDEX,
  })

  const [gridContainer, setGridContainer] = useState<HTMLDivElement>(null)

  useEffect(() => {
    if (state.shouldResize) {
      if (multiGridRef) {
        multiGridRef.current.recomputeGridSize()
      }
      setState((prevState: State) => ({
        ...prevState,
        ...{shouldResize: false},
      }))
    }
  }, [state.shouldResize])

  const columnCount = getColumnCount(props)
  const fixFirstColumn = getFixFirstColumn(props)

  const rowCount = columnCount === 0 ? 0 : transformedData.length
  const fixedColumnCount = fixFirstColumn && columnCount > 1 ? 1 : 0
  const {scrollToColumn, scrollToRow} = getScrollToColRow(
    hoverTime,
    props,
    state,
  )

  const handleMultiGridMount = ref => {
    multiGridRef.current = ref
    multiGridRef.current.forceUpdate()
  }

  const handleMouseLeaveCallback = () =>
    handleMouseLeave(setHoverTime, setState)
  const cellRendererCallback = cellProps =>
    cellRenderer(state, setState, hoverTime, setHoverTime, props, cellProps)

  const className = classnames('time-machine-table', {
    'time-machine-table__light-mode': theme === 'light',
  })

  return (
    <div
      className={className}
      ref={el => setGridContainer(el)}
      onMouseLeave={handleMouseLeaveCallback}
    >
      {rowCount > 0 && (
        <AutoSizer>
          {({width, height}) => {
            return (
              <ColumnSizer
                columnCount={getComputedColumnCount(props)}
                columnMinWidth={COLUMN_MIN_WIDTH}
                width={width}
              >
                {({
                  adjustedWidth,
                  columnWidth,
                  registerChild,
                }: SizedColumns) => {
                  return (
                    <MultiGrid
                      height={height}
                      ref={registerChild}
                      rowCount={rowCount}
                      width={adjustedWidth}
                      rowHeight={ROW_HEIGHT}
                      scrollToRow={scrollToRow}
                      columnCount={columnCount}
                      scrollToColumn={scrollToColumn}
                      fixedColumnCount={fixedColumnCount}
                      cellRenderer={cellRendererCallback}
                      onMount={handleMultiGridMount}
                      classNameBottomRightGrid='table-graph--scroll-window'
                      columnWidth={calculateColumnWidth(
                        state,
                        props,
                        gridContainer,
                        columnWidth,
                      )}
                    />
                  )
                }}
              </ColumnSizer>
            )
          }}
        </AutoSizer>
      )}
    </div>
  )
}

export const TableGraphTable = TableGraphTableComponent
