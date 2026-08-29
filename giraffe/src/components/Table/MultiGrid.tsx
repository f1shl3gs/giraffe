import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import {DapperScrollbars} from '../DapperScrollbars'
import {getItemOffset, getItemSize} from './gridGeometry'
import {WindowGrid, WindowGridHandle} from './WindowGrid'

import styles from './TableGraphs.scss'

const SCROLLBAR_SIZE_BUFFER = 20
type HeightWidthFunction = (arg: {index: number}) => number

export interface PropsMultiGrid {
  width: number
  height: number
  columnCount?: number
  classNameBottomLeftGrid?: string
  classNameBottomRightGrid?: string
  classNameTopLeftGrid?: string
  classNameTopRightGrid?: string
  enableFixedColumnScroll?: boolean
  enableFixedRowScroll?: boolean
  fixedColumnCount?: number
  fixedRowCount?: number
  style?: object
  styleBottomLeftGrid?: object
  styleBottomRightGrid?: object
  styleTopLeftGrid?: object
  styleTopRightGrid?: object
  scrollTop?: number
  scrollLeft?: number
  rowCount?: number
  rowHeight?: number | HeightWidthFunction
  columnWidth?: number | HeightWidthFunction
  onScroll?: (arg: object) => {}
  onSectionRendered?: () => {}
  cellRenderer?: (arg: object) => React.JSX.Element
  [key: string]: any // MultiGrid can accept any prop, and will rerender if they change
}

interface State {
  scrollLeft: number
  scrollTop: number
  scrollbarSize: number
  showHorizontalScrollbar: boolean
  showVerticalScrollbar: boolean
  leftGridWidth: number | null
  topGridHeight: number | null
  bottomRightGridStyle: object | null
  topRightGridStyle: object | null
  containerTopStyle: object | null
  containerBottomStyle: object | null
  containerOuterStyle: object | null
  bottomLeftGridStyle: object | null
  topLeftGridStyle: object | null
}

const getBottomGridHeight = (state: State, props: PropsMultiGrid) => {
  const {height} = props

  const topGridHeight = state.topGridHeight ?? 0

  return height - topGridHeight
}

const getRightGridWidth = (state: State, props: PropsMultiGrid) => {
  const {width} = props

  const leftGridWidth = state.leftGridWidth ?? 0
  const result = width - leftGridWidth

  return result
}

const cellRendererTopRightGrid = (
  props: PropsMultiGrid,
  parent,
  {columnIndex, ...rest}
) => {
  const {cellRenderer, columnCount, fixedColumnCount} = props

  if (columnIndex === columnCount - fixedColumnCount) {
    return (
      <div
        key={rest.key}
        style={{
          ...rest.style,
          width: SCROLLBAR_SIZE_BUFFER,
        }}
      />
    )
  }
  return cellRenderer({
    ...rest,
    columnIndex: columnIndex + fixedColumnCount,
    parent,
  })
}

const cellRendererBottomLeftGrid = (
  props: PropsMultiGrid,
  parent,
  {rowIndex, ...rest}
) => {
  const {cellRenderer, fixedRowCount, rowCount} = props

  if (rowIndex === rowCount - fixedRowCount) {
    return (
      <div
        key={rest.key}
        style={{
          ...rest.style,
          height: SCROLLBAR_SIZE_BUFFER,
        }}
      />
    )
  }
  return cellRenderer({
    ...rest,
    parent,
    rowIndex: rowIndex + fixedRowCount,
  })
}

const cellRendererBottomRightGrid = (
  props: PropsMultiGrid,
  parent,
  {columnIndex, rowIndex, ...rest}
) => {
  const {cellRenderer, fixedColumnCount, fixedRowCount} = props

  return cellRenderer({
    ...rest,
    columnIndex: columnIndex + fixedColumnCount,
    parent,
    rowIndex: rowIndex + fixedRowCount,
  })
}

const columnWidthRightGrid = (state: State, props: PropsMultiGrid, {index}) => {
  const {columnCount, fixedColumnCount, columnWidth} = props
  const {scrollbarSize, showHorizontalScrollbar} = state

  // An extra cell is added to the count
  // This gives the smaller Grid extra room for offset,
  // In case the main (bottom right) Grid has a scrollbar
  // If no scrollbar, the extra space is overflow:hidden anyway
  if (showHorizontalScrollbar && index === columnCount - fixedColumnCount) {
    return scrollbarSize
  }

  return typeof columnWidth === 'function'
    ? columnWidth({index: index + fixedColumnCount})
    : columnWidth
}

const rowHeightBottomGrid = (state: State, props: PropsMultiGrid, {index}) => {
  const {fixedRowCount, rowCount, rowHeight} = props
  const {scrollbarSize, showVerticalScrollbar} = state

  // An extra cell is added to the count
  // This gives the smaller Grid extra room for offset,
  // In case the main (bottom right) Grid has a scrollbar
  // If no scrollbar, the extra space is overflow:hidden anyway
  if (showVerticalScrollbar && index === rowCount - fixedRowCount) {
    return scrollbarSize
  }

  return typeof rowHeight === 'function'
    ? rowHeight({index: index + fixedRowCount})
    : rowHeight
}

const onScroll = (setState: Function, props: PropsMultiGrid, scrollInfo) => {
  const {scrollLeft, scrollTop} = scrollInfo
  setState((prevState: State) => ({
    ...prevState,
    ...{
      scrollLeft,
      scrollTop,
    },
  }))

  const {onScroll} = props
  if (onScroll) {
    onScroll(scrollInfo)
  }
}

const renderTopLeftGrid = (
  state: State,
  props: PropsMultiGrid,
  topLeftGridRef
) => {
  const {fixedColumnCount, fixedRowCount} = props

  if (!fixedColumnCount || !fixedRowCount) {
    return null
  }

  const style = {
    ...state.topLeftGridStyle,
    ...props.styleTopLeftGrid,
  }

  return (
    <WindowGrid
      cellRenderer={props.cellRenderer}
      className={styles[props.classNameTopLeftGrid]}
      columnCount={fixedColumnCount}
      columnWidth={props.columnWidth ?? 0}
      height={state.topGridHeight ?? 0}
      ref={topLeftGridRef}
      rowCount={fixedRowCount}
      rowHeight={props.rowHeight ?? 0}
      style={{...style}}
      width={state.leftGridWidth ?? 0}
    />
  )
}

const renderTopRightGrid = (
  state: State,
  props: PropsMultiGrid,
  topRightGridRef
) => {
  const {columnCount, fixedColumnCount, fixedRowCount, scrollLeft} = props

  if (!fixedRowCount) {
    return null
  }

  const width = getRightGridWidth(state, props)
  const height = state.topGridHeight ?? 0

  const cellRendererTopRightGridCallback = args =>
    cellRendererTopRightGrid.call(null, props, topRightGridRef, args)
  const columnWidthRightGridCallback = args =>
    columnWidthRightGrid.call(null, state, props, args)

  const style = {
    ...state.topRightGridStyle,
    left: state.leftGridWidth ?? 0,
    ...props.styleTopRightGrid,
  }
  return (
    <WindowGrid
      cellRenderer={cellRendererTopRightGridCallback}
      className={styles[props.classNameTopRightGrid]}
      columnCount={Math.max(0, columnCount - fixedColumnCount)}
      columnWidth={columnWidthRightGridCallback}
      height={height}
      ref={topRightGridRef}
      rowCount={fixedRowCount}
      rowHeight={props.rowHeight ?? 0}
      scrollLeft={scrollLeft}
      style={{...style}}
      width={width ?? 0}
    />
  )
}

const renderBottomLeftGrid = (
  state: State,
  props: PropsMultiGrid,
  bottomLeftGridRef
) => {
  const {fixedColumnCount, fixedRowCount, rowCount, scrollTop} = props

  if (!fixedColumnCount) {
    return null
  }

  const height = getBottomGridHeight(state, props)

  const cellRendererBottomLeftGridCallback = args =>
    cellRendererBottomLeftGrid.call(null, props, bottomLeftGridRef, args)
  const rowHeightBottomGridCallback = args =>
    rowHeightBottomGrid.call(null, state, props, args)

  const style = {
    ...state.bottomLeftGridStyle,
    ...props.styleBottomLeftGrid,
  }
  return (
    <WindowGrid
      cellRenderer={cellRendererBottomLeftGridCallback}
      className={styles[props.classNameBottomLeftGrid]}
      columnCount={fixedColumnCount}
      columnWidth={props.columnWidth ?? 0}
      height={height}
      ref={bottomLeftGridRef}
      rowCount={Math.max(0, rowCount - fixedRowCount)}
      rowHeight={rowHeightBottomGridCallback}
      scrollTop={scrollTop}
      style={{...style}}
      width={state.leftGridWidth ?? 0}
    />
  )
}

const renderBottomRightGrid = (
  state: State,
  setState: Function,
  props,
  bottomRightGridRef
) => {
  const {
    columnCount,
    fixedColumnCount,
    fixedRowCount,
    rowCount,
    scrollToColumn,
    scrollToRow,
  } = props

  const width = getRightGridWidth(state, props)
  const height = getBottomGridHeight(state, props)

  const cellRendererBottomRightGridCallback = args =>
    cellRendererBottomRightGrid.call(null, props, bottomRightGridRef, args)
  const columnWidthRightGridCallback = args =>
    columnWidthRightGrid.call(null, state, props, args)
  const onScrollCallback = scrollInfo =>
    onScroll.call(null, setState, props, scrollInfo)
  const rowHeightBottomGridCallback = args =>
    rowHeightBottomGrid.call(null, state, props, args)

  const style = {
    ...state.bottomRightGridStyle,
    left: state.leftGridWidth ?? 0,
    ...props.styleBottomRightGrid,
  }
  return (
    <DapperScrollbars
      style={{...state.bottomRightGridStyle, width, height}}
      autoHide={true}
      scrollTop={state.scrollTop}
      scrollLeft={state.scrollLeft}
      onScroll={onScrollCallback}
    >
      <WindowGrid
        cellRenderer={cellRendererBottomRightGridCallback}
        className={styles[props.classNameBottomRightGrid]}
        columnCount={Math.max(0, columnCount - fixedColumnCount)}
        columnWidth={columnWidthRightGridCallback}
        height={height}
        ref={bottomRightGridRef}
        rowCount={Math.max(0, rowCount - fixedRowCount)}
        rowHeight={rowHeightBottomGridCallback}
        scrollLeft={state.scrollLeft}
        scrollToColumn={scrollToColumn - fixedColumnCount}
        scrollToRow={scrollToRow - fixedRowCount}
        scrollTop={state.scrollTop}
        style={{...style, left: 0}}
        width={width}
      />
    </DapperScrollbars>
  )
}

export interface MultiGridInputHandles {
  recomputeGridSize(): void
  forceUpdate(): void
}

/**
 * Renders 1, 2, or 4 Grids depending on configuration.
 * A main (body) Grid will always be rendered.
 * Optionally, 1-2 Grids for sticky header rows will also be rendered.
 * If no sticky columns, only 1 sticky header Grid will be rendered.
 * If sticky columns, 2 sticky header Grids will be rendered.
 */

export const MultiGrid = forwardRef<MultiGridInputHandles, PropsMultiGrid>(
  // props typed as any: @types/react v19's PropsWithoutRef<> drops named
  // members of PropsMultiGrid (index-signature interaction), and annotating
  // the full type here previously required a cast that broke react-hooks
  // component detection.
  (props: any, ref) => {
    const {scrollToRow = -1, scrollToColumn = -1, ...rest} = props

    const restWithDefault = {
      classNameBottomLeftGrid: '',
      classNameBottomRightGrid: '',
      classNameTopLeftGrid: '',
      classNameTopRightGrid: '',
      enableFixedColumnScroll: false,
      enableFixedRowScroll: false,
      fixedColumnCount: 0,
      fixedRowCount: 0,
      scrollToColumn: -1,
      scrollToRow: -1,
      style: {},
      styleBottomLeftGrid: {},
      styleBottomRightGrid: {},
      styleTopLeftGrid: {},
      styleTopRightGrid: {},
      ...rest,
    }

    const [state, setState] = useState<State>({
      scrollLeft: 0,
      scrollTop: 0,
      scrollbarSize: 0,
      showHorizontalScrollbar: false,
      showVerticalScrollbar: false,
      leftGridWidth: 0,
      topGridHeight: 0,
      bottomRightGridStyle: {
        position: 'absolute',
      },
      topRightGridStyle: {
        overflowX: 'hidden',
        overflowY: 'hidden',
        position: 'absolute',
        top: 0,
      },
      containerTopStyle: null,
      containerBottomStyle: null,
      containerOuterStyle: null,
      bottomLeftGridStyle: {
        left: 0,
        overflowY: 'hidden',
        overflowX: 'hidden',
        position: 'absolute',
      },
      topLeftGridStyle: {
        left: 0,
        overflowX: 'hidden',
        overflowY: 'hidden',
        position: 'absolute',
        top: 0,
      },
    })

    const [, setRenderCounter] = useState(0)

    useImperativeHandle(ref, () => {
      return {
        recomputeGridSize: () => setRenderCounter(value => value + 1),
        forceUpdate: () => setRenderCounter(value => value + 1),
      }
    })

    useEffect(() => {
      const {scrollLeft, scrollTop} = props

      if (scrollLeft > 0 || scrollTop > 0) {
        const newState: Partial<State> = {}

        if (scrollLeft > 0) {
          newState.scrollLeft = scrollLeft
        }

        if (scrollTop > 0) {
          newState.scrollTop = scrollTop
        }

        setState(state => ({...state, ...newState}))
      }
    }, [])

    // Keep the hovered row/column in view inside the scroll window.
    useEffect(() => {
      if (scrollToRow < 0 && scrollToColumn < 0) {
        return
      }

      const viewHeight = getBottomGridHeight(state, props)
      const viewWidth = getRightGridWidth(state, props)
      const bodyRows = Math.max(
        0,
        (restWithDefault.rowCount ?? 0) - restWithDefault.fixedRowCount
      )
      const bodyColumns = Math.max(
        0,
        (restWithDefault.columnCount ?? 0) - restWithDefault.fixedColumnCount
      )
      const rowSize = ({index}: {index: number}) =>
        rowHeightBottomGrid(state, restWithDefault as PropsMultiGrid, {index})
      const columnSize = ({index}: {index: number}) =>
        columnWidthRightGrid(state, restWithDefault as PropsMultiGrid, {index})

      let nextScrollTop = state.scrollTop
      let nextScrollLeft = state.scrollLeft

      if (scrollToRow >= 0) {
        const index = Math.max(0, scrollToRow - restWithDefault.fixedRowCount)
        const top = getItemOffset(rowSize, bodyRows, index)
        const bottom = top + getItemSize(rowSize, index)
        if (top < state.scrollTop || bottom > state.scrollTop + viewHeight) {
          nextScrollTop =
            top < state.scrollTop ? top : Math.max(0, bottom - viewHeight)
        }
      }

      if (scrollToColumn >= 0) {
        const index = Math.max(
          0,
          scrollToColumn - restWithDefault.fixedColumnCount
        )
        const left = getItemOffset(columnSize, bodyColumns, index)
        const right = left + getItemSize(columnSize, index)
        if (left < state.scrollLeft || right > state.scrollLeft + viewWidth) {
          nextScrollLeft =
            left < state.scrollLeft ? left : Math.max(0, right - viewWidth)
        }
      }

      if (
        nextScrollTop !== state.scrollTop ||
        nextScrollLeft !== state.scrollLeft
      ) {
        setState(prevState => ({
          ...prevState,
          scrollTop: nextScrollTop,
          scrollLeft: nextScrollLeft,
        }))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollToRow, scrollToColumn])

    const topLeftGridRef = useRef<WindowGridHandle | null>(null)
    const topRightGridRef = useRef<WindowGridHandle | null>(null)
    const bottomLeftGridRef = useRef<WindowGridHandle | null>(null)
    const bottomRightGridRef = useRef<WindowGridHandle | null>(null)

    // Don't render any of our Grids if there are no cells.
    if (props.width === 0 || props.height === 0) {
      return null
    }

    const {scrollLeft, scrollTop} = state

    return (
      <div style={state.containerOuterStyle}>
        <div style={state.containerTopStyle}>
          {renderTopLeftGrid(
            state,
            restWithDefault as PropsMultiGrid,
            topLeftGridRef
          )}
          {renderTopRightGrid(
            state,
            {
              ...restWithDefault,
              ...onScroll,
              scrollLeft,
            } as PropsMultiGrid,
            topRightGridRef
          )}
        </div>
        <div style={state.containerBottomStyle}>
          {renderBottomLeftGrid(
            state,
            {
              ...restWithDefault,
              scrollTop,
            } as PropsMultiGrid,
            bottomLeftGridRef
          )}
          {renderBottomRightGrid(
            state,
            setState,
            {
              ...restWithDefault,
              scrollLeft,
              scrollTop,
              scrollToColumn,
              scrollToRow,
            },
            bottomRightGridRef
          )}
        </div>
      </div>
    )
  }
)
