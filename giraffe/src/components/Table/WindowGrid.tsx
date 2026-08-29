import React, {CSSProperties, forwardRef, useImperativeHandle} from 'react'

import {
  getItemOffset,
  getItemSize,
  getVisibleRange,
  ItemSize,
} from './gridGeometry'

const OVERSCAN_ROW_COUNT = 10
const OVERSCAN_COLUMN_COUNT = 0

export interface WindowGridCellArgs {
  columnIndex: number
  key: string
  rowIndex: number
  style: CSSProperties
}

interface WindowGridProps {
  cellRenderer: (args: WindowGridCellArgs) => React.ReactNode
  className?: string
  columnCount: number
  columnWidth: ItemSize
  height: number
  rowHeight: ItemSize
  rowCount: number
  scrollLeft?: number
  scrollTop?: number
  scrollToColumn?: number
  scrollToRow?: number
  style?: CSSProperties
  width: number
}

export interface WindowGridHandle {
  props: WindowGridProps
}

export const WindowGrid = forwardRef<WindowGridHandle, WindowGridProps>(
  (props, ref) => {
    const {
      cellRenderer,
      className,
      columnCount,
      columnWidth,
      height,
      rowHeight,
      rowCount,
      scrollLeft = 0,
      scrollTop = 0,
      style,
      width,
    } = props

    const rows = getVisibleRange({
      itemCount: rowCount,
      itemSize: rowHeight,
      overscan: OVERSCAN_ROW_COUNT,
      scrollOffset: scrollTop,
      viewportSize: height,
    })
    const columns = getVisibleRange({
      itemCount: columnCount,
      itemSize: columnWidth,
      overscan: OVERSCAN_COLUMN_COUNT,
      scrollOffset: scrollLeft,
      viewportSize: width,
    })

    useImperativeHandle(ref, () => ({props}))

    const cells = []
    for (let rowIndex = rows.start; rowIndex <= rows.stop; rowIndex++) {
      for (
        let columnIndex = columns.start;
        columnIndex <= columns.stop;
        columnIndex++
      ) {
        cells.push(
          cellRenderer({
            columnIndex,
            key: `${rowIndex}:${columnIndex}`,
            rowIndex,
            style: {
              height: getItemSize(rowHeight, rowIndex),
              left:
                getItemOffset(columnWidth, columnCount, columnIndex) -
                scrollLeft,
              position: 'absolute',
              top: getItemOffset(rowHeight, rowCount, rowIndex) - scrollTop,
              width: getItemSize(columnWidth, columnIndex),
            },
          })
        )
      }
    }

    return (
      <div
        className={className}
        style={{height, position: 'relative', width, ...style}}
      >
        {cells}
      </div>
    )
  }
)
