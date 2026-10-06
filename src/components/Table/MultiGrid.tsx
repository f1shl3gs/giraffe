// Libraries
import type {CSSProperties, Ref} from 'react'
import {
  ReactElement,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

// Components
import {DapperScrollbars} from '../DapperScrollbars'
import type {DapperScrollValues} from '../DapperScrollbars/DapperScrollbars'
import {getItemOffset, getItemSize} from './gridGeometry'
import type {WindowGridCellArgs, WindowGridHandle} from './WindowGrid'
import {WindowGrid} from './WindowGrid'

// Styles
import './TableGraphs.scss'

const SCROLLBAR_SIZE_BUFFER = 20
type HeightWidthFunction = (arg: {index: number}) => number

export interface MultiGridProps {
  width: number
  height: number
  /*
    Required, not optional, because the grid uses all three with no guard:
    `cellRenderer` is forwarded to <WindowGrid> untouched (which would crash on
    the first cell), and `columnCount` / `rowCount` are subtracted in
    `Math.max(0, columnCount - fixedColumnCount)`, where an absent one yields
    NaN rather than 0. <WindowGrid> requires the same three, and MultiGrid's
    only caller supplies them.

    `columnWidth` / `rowHeight` stay optional on purpose -- every render site
    guards those with `?? 0`.
  */
  columnCount: number
  classNameBottomLeftGrid?: string
  classNameBottomRightGrid?: string
  classNameTopLeftGrid?: string
  classNameTopRightGrid?: string
  enableFixedColumnScroll?: boolean
  enableFixedRowScroll?: boolean
  fixedColumnCount?: number
  fixedRowCount?: number
  style?: CSSProperties
  styleBottomLeftGrid?: CSSProperties
  styleBottomRightGrid?: CSSProperties
  styleTopLeftGrid?: CSSProperties
  styleTopRightGrid?: CSSProperties
  scrollTop?: number
  scrollLeft?: number
  /*
    Destructured by the component and passed by <TableGraphTable>, but never
    declared: they only type-checked because of the `[key: string]: any` that
    used to sit at the end of this interface.
  */
  scrollToRow?: number
  scrollToColumn?: number
  rowCount: number
  rowHeight?: number | HeightWidthFunction
  columnWidth?: number | HeightWidthFunction
  onScroll?: (values: DapperScrollValues) => void
  onSectionRendered?: () => void
  /*
    `parent` is added by MultiGrid's own cellRenderer wrappers -- it tells a
    renderer which quadrant it is drawing for -- so it is not part of what
    <WindowGrid> hands out, hence the intersection rather than a field on
    WindowGridCellArgs.
  */
  cellRenderer: (args: WindowGridCellArgs & {parent?: unknown}) => ReactElement
  /*
    Was `[key: string]: any`, which every caller leaned on: <TableGraphTable>
    passes `onMount`, which was never declared. An index signature also makes
    TS treat every key of a `{...defaults, ...rest}` spread as "specified more
    than once", which is why the grid's own default object could not be given
    a type. Declaring the one real member keeps the same permissiveness for
    callers and leaves the spread analysable.
  */
  onMount?: (handle: MultiGridInputHandles | null) => void
  /*
    Ref, not RefObject: the only caller passes <ColumnSizer>'s registerChild,
    which is a callback. useImperativeHandle accepts both, so the narrower type
    was rejecting the one ref this component actually gets.
  */
  ref?: Ref<MultiGridInputHandles>
}

/*
  PropsMultiGrid after `restWithDefault`.

  These are the fields the grid defaults itself, so downstream of that object
  they are plain values rather than `T | undefined` -- which is what lets the
  maths below subtract `fixedRowCount` without a guard at every use. Only the
  ones actually defaulted belong here; `columnCount`, `rowCount` and
  `cellRenderer` are required on PropsMultiGrid itself because the grid uses
  them unconditionally.

  Naming the two apart is also what keeps the defaults honest: adding a field
  here that nothing defaults would be a lie TS cannot catch.
*/
export interface ResolvedMultiGridProps extends MultiGridProps {
  classNameBottomLeftGrid: string
  classNameBottomRightGrid: string
  classNameTopLeftGrid: string
  classNameTopRightGrid: string
  enableFixedColumnScroll: boolean
  enableFixedRowScroll: boolean
  fixedColumnCount: number
  fixedRowCount: number
  scrollToColumn: number
  scrollToRow: number
  style: CSSProperties
  styleBottomLeftGrid: CSSProperties
  styleBottomRightGrid: CSSProperties
  styleTopLeftGrid: CSSProperties
  styleTopRightGrid: CSSProperties
}

interface State {
  scrollLeft: number
  scrollTop: number
  scrollbarSize: number
  showHorizontalScrollbar: boolean
  showVerticalScrollbar: boolean
  leftGridWidth: number | null
  topGridHeight: number | null
  bottomRightGridStyle: CSSProperties | null
  topRightGridStyle: CSSProperties | null
  containerTopStyle: CSSProperties | null
  containerBottomStyle: CSSProperties | null
  containerOuterStyle: CSSProperties | null
  bottomLeftGridStyle: CSSProperties | null
  topLeftGridStyle: CSSProperties | null
}

const getBottomGridHeight = (state: State, props: ResolvedMultiGridProps) => {
  const {height} = props

  const topGridHeight = state.topGridHeight ?? 0

  return height - topGridHeight
}

const getRightGridWidth = (state: State, props: ResolvedMultiGridProps) => {
  const {width} = props
  const leftGridWidth = state.leftGridWidth ?? 0

  return width - leftGridWidth
}

const cellRendererTopRightGrid = (
  props: ResolvedMultiGridProps,
  parent: unknown,
  {columnIndex, ...rest}: WindowGridCellArgs,
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
  props: ResolvedMultiGridProps,
  parent: unknown,
  {rowIndex, ...rest}: WindowGridCellArgs,
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
  props: ResolvedMultiGridProps,
  parent: unknown,
  {columnIndex, rowIndex, ...rest}: WindowGridCellArgs,
) => {
  const {cellRenderer, fixedColumnCount, fixedRowCount} = props

  return cellRenderer({
    ...rest,
    columnIndex: columnIndex + fixedColumnCount,
    parent,
    rowIndex: rowIndex + fixedRowCount,
  })
}

const columnWidthRightGrid = (
  state: State,
  props: ResolvedMultiGridProps,
  {index}: {index: number},
): number => {
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
    : (columnWidth ?? 0)
}

const rowHeightBottomGrid = (
  state: State,
  props: ResolvedMultiGridProps,
  {index}: {index: number},
): number => {
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
    : (rowHeight ?? 0)
}

const onScroll = (
  setState: Function,
  props: ResolvedMultiGridProps,
  scrollInfo: DapperScrollValues,
) => {
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
  props: ResolvedMultiGridProps,
  topLeftGridRef: RefObject<WindowGridHandle | null>,
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
      className={props.classNameTopLeftGrid}
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
  props: ResolvedMultiGridProps,
  topRightGridRef: RefObject<WindowGridHandle | null>,
) => {
  const {columnCount, fixedColumnCount, fixedRowCount, scrollLeft} = props

  if (!fixedRowCount) {
    return null
  }

  const width = getRightGridWidth(state, props)
  const height = state.topGridHeight ?? 0

  const cellRendererTopRightGridCallback = (args: WindowGridCellArgs) =>
    cellRendererTopRightGrid.call(null, props, topRightGridRef, args)
  const columnWidthRightGridCallback = ({index}: {index: number}) =>
    columnWidthRightGrid.call(null, state, props, {index})

  const style = {
    ...state.topRightGridStyle,
    left: state.leftGridWidth ?? 0,
    ...props.styleTopRightGrid,
  }
  return (
    <WindowGrid
      cellRenderer={cellRendererTopRightGridCallback}
      className={props.classNameTopRightGrid}
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
  props: ResolvedMultiGridProps,
  bottomLeftGridRef: RefObject<WindowGridHandle | null>,
) => {
  const {fixedColumnCount, fixedRowCount, rowCount, scrollTop} = props

  if (!fixedColumnCount) {
    return null
  }

  const height = getBottomGridHeight(state, props)

  const cellRendererBottomLeftGridCallback = (args: WindowGridCellArgs) =>
    cellRendererBottomLeftGrid.call(null, props, bottomLeftGridRef, args)
  const rowHeightBottomGridCallback = ({index}: {index: number}) =>
    rowHeightBottomGrid.call(null, state, props, {index})

  const style = {
    ...state.bottomLeftGridStyle,
    ...props.styleBottomLeftGrid,
  }
  return (
    <WindowGrid
      cellRenderer={cellRendererBottomLeftGridCallback}
      className={props.classNameBottomLeftGrid}
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
  props: ResolvedMultiGridProps,
  bottomRightGridRef: RefObject<WindowGridHandle | null>,
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

  const cellRendererBottomRightGridCallback = (args: WindowGridCellArgs) =>
    cellRendererBottomRightGrid.call(null, props, bottomRightGridRef, args)
  const columnWidthRightGridCallback = ({index}: {index: number}) =>
    columnWidthRightGrid.call(null, state, props, {index})
  const onScrollCallback = (scrollInfo: DapperScrollValues) =>
    onScroll.call(null, setState, props, scrollInfo)
  const rowHeightBottomGridCallback = ({index}: {index: number}) =>
    rowHeightBottomGrid.call(null, state, props, {index})

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
        className={props.classNameBottomRightGrid}
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

/*
  Typed, which the `any` above was working around: with the index signature gone
  there is nothing left for PropsWithoutRef<> to drop. Binding `props` as well
  as the rest is what the two effects below already assumed -- they read
  props.scrollLeft / props.scrollToRow, and with only a destructured parameter
  in scope those were references to a name that did not exist.
*/
/*
  The grid's own defaults. See the note at the merge site for why this is a
  named object rather than an inline literal.
*/
const gridDefaults = {
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
}

export const MultiGrid = (props: MultiGridProps) => {
  const {scrollToRow = -1, scrollToColumn = -1, ref, ...rest} = props
  /*
    Merged rather than written as one literal: inline, each of these keys is a
    property that `...rest` also has, which TS reports as TS2783 ("specified more
    than once") -- thirteen lines of noise that bury the real errors in a file
    this size. ResolvedMultiGridProps is what the merge produces.
  */
  const restWithDefault: ResolvedMultiGridProps = {...gridDefaults, ...rest}

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

  /*
      The empty dependency list is load-bearing. Without it this handle is a new
      object on every render, so <ColumnSizer>'s `useImperativeHandle` effect
      re-runs `registerChild` every commit, which calls `recomputeGridSize()`,
      which calls `setRenderCounter` -- and the render it schedules builds another
      handle. That loop is what "Maximum update depth exceeded" was.

      Both closures only capture `setRenderCounter`, whose identity is stable.
    */
  useImperativeHandle(ref, () => {
    return {
      recomputeGridSize: () => setRenderCounter(value => value + 1),
      forceUpdate: () => setRenderCounter(value => value + 1),
    }
  }, [])

  useEffect(() => {
    const {scrollLeft = 0, scrollTop = 0} = props

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

    const viewHeight = getBottomGridHeight(state, restWithDefault)
    const viewWidth = getRightGridWidth(state, restWithDefault)
    const bodyRows = Math.max(
      0,
      (restWithDefault.rowCount ?? 0) - restWithDefault.fixedRowCount,
    )
    const bodyColumns = Math.max(
      0,
      (restWithDefault.columnCount ?? 0) - restWithDefault.fixedColumnCount,
    )
    const rowSize = ({index}: {index: number}) =>
      rowHeightBottomGrid(state, restWithDefault, {index})
    const columnSize = ({index}: {index: number}) =>
      columnWidthRightGrid(state, restWithDefault, {
        index,
      })

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
        scrollToColumn - restWithDefault.fixedColumnCount,
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
    <div style={state.containerOuterStyle ?? undefined}>
      <div style={state.containerTopStyle ?? undefined}>
        {renderTopLeftGrid(state, restWithDefault, topLeftGridRef)}
        {renderTopRightGrid(
          state,
          {
            ...restWithDefault,
            ...onScroll,
            scrollLeft,
          },
          topRightGridRef,
        )}
      </div>
      <div style={state.containerBottomStyle ?? undefined}>
        {renderBottomLeftGrid(
          state,
          {
            ...restWithDefault,
            scrollTop,
          },
          bottomLeftGridRef,
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
          bottomRightGridRef,
        )}
      </div>
    </div>
  )
}
