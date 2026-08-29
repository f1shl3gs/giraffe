import React, {FC, useEffect, useRef} from 'react'

interface GridLike {
  recomputeGridSize?: () => void
}

export interface SizedColumns {
  adjustedWidth: number
  columnWidth: number
  getColumnWidth: () => number
  registerChild: (child: GridLike | null) => void
}

interface Props {
  children: (sizedColumns: SizedColumns) => React.ReactNode
  columnCount: number
  columnMaxWidth?: number
  columnMinWidth?: number
  width: number
}

export const ColumnSizer: FC<Props> = ({
  children,
  columnCount,
  columnMaxWidth,
  columnMinWidth,
  width,
}) => {
  const childRef = useRef<GridLike | null>(null)

  useEffect(() => {
    childRef.current?.recomputeGridSize?.()
  }, [columnCount, columnMaxWidth, columnMinWidth, width])

  const registerChild = (child: GridLike | null) => {
    childRef.current = child
    child?.recomputeGridSize?.()
  }

  const safeMinWidth = columnMinWidth || 1
  const safeMaxWidth = columnMaxWidth ? Math.min(columnMaxWidth, width) : width

  let columnWidth = width / columnCount
  columnWidth = Math.max(safeMinWidth, columnWidth)
  columnWidth = Math.min(safeMaxWidth, columnWidth)
  columnWidth = Math.floor(columnWidth)

  const adjustedWidth = Math.min(width, columnWidth * columnCount)

  return (
    <>
      {children({
        adjustedWidth,
        columnWidth,
        getColumnWidth: () => columnWidth,
        registerChild,
      })}
    </>
  )
}
