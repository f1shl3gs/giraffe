import {render} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import {ColumnSizer, SizedColumns} from './ColumnSizer'

interface Capture {
  props: SizedColumns | null
}

const captureChildren = (capture: Capture) => (props: SizedColumns) => {
  capture.props = props
  return null
}

const setup = (props: {
  width: number
  columnCount: number
  columnMinWidth?: number
  columnMaxWidth?: number
}): {capture: Capture; rerender: (props: typeof props) => void} => {
  const capture: Capture = {props: null}
  const {rerender} = render(
    <ColumnSizer {...props}>{captureChildren(capture)}</ColumnSizer>
  )
  return {
    capture,
    rerender: next => {
      rerender(<ColumnSizer {...next}>{captureChildren(capture)}</ColumnSizer>)
    },
  }
}

describe('ColumnSizer', () => {
  it('divides width evenly across columns and floors the result', () => {
    const {capture} = setup({width: 1000, columnCount: 3})

    expect(capture.props.columnWidth).toBe(333)
    expect(capture.props.adjustedWidth).toBe(999)
  })

  it('clamps columnWidth to columnMinWidth', () => {
    const {capture} = setup({
      width: 90,
      columnCount: 10,
      columnMinWidth: 20,
    })

    expect(capture.props.columnWidth).toBe(20)
    expect(capture.props.adjustedWidth).toBe(90)
  })

  it('clamps columnWidth to columnMaxWidth capped at width', () => {
    const {capture} = setup({
      width: 900,
      columnCount: 2,
      columnMaxWidth: 300,
    })

    expect(capture.props.columnWidth).toBe(300)
    expect(capture.props.adjustedWidth).toBe(600)
  })

  it('defaults columnMinWidth to 1', () => {
    const {capture} = setup({width: 5, columnCount: 8})

    expect(capture.props.columnWidth).toBe(1)
    expect(capture.props.adjustedWidth).toBe(5)
  })

  it('exposes getColumnWidth returning the computed column width', () => {
    const {capture} = setup({width: 1000, columnCount: 3})

    expect(capture.props.getColumnWidth()).toBe(333)
  })

  it('recomputes the registered child grid on registration', () => {
    const grid = {recomputeGridSize: vi.fn()}
    const {capture} = setup({width: 1000, columnCount: 3})

    capture.props.registerChild(grid)

    expect(grid.recomputeGridSize).toHaveBeenCalledTimes(1)
  })

  it('recomputes the registered child grid when sizing inputs change', () => {
    const grid = {recomputeGridSize: vi.fn()}
    const {capture, rerender} = setup({width: 1000, columnCount: 3})
    capture.props.registerChild(grid)

    rerender({width: 800, columnCount: 3})

    expect(grid.recomputeGridSize).toHaveBeenCalledTimes(2)
  })
})
