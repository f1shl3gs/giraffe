import type {ReactElement} from 'react'
import {render} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import {ColumnSizer, SizedColumns} from './ColumnSizer'

interface Capture {
  props: SizedColumns | null
}

interface SetupOptions {
  width: number
  columnCount: number
  columnMinWidth?: number
  columnMaxWidth?: number
}

/*
  ColumnSizer's children is a render prop typed to return a ReactElement, so
  this has to hand one back even though the test only cares about the props it
  is handed. Returning null quietly violated that contract.
*/
const captureChildren =
  (capture: Capture) =>
  (props: SizedColumns): ReactElement => {
    capture.props = props
    return <div />
  }

const setup = (
  options: SetupOptions,
): {props: SizedColumns; rerender: (options: SetupOptions) => void} => {
  const capture: Capture = {props: null}

  const sizer = (opts: SetupOptions) => (
    <ColumnSizer {...opts}>{captureChildren(capture)}</ColumnSizer>
  )

  const {rerender} = render(sizer(options))

  return {
    /*
      A getter rather than a plain field: `rerender` swaps the props out from
      under it, and every read should see the current ones. Throwing here beats
      a TypeError further down when the children never ran at all.
    */
    get props(): SizedColumns {
      if (!capture.props) {
        throw new Error('ColumnSizer never called its children')
      }

      return capture.props
    },
    rerender: next => rerender(sizer(next)),
  }
}

describe('ColumnSizer', () => {
  it('divides width evenly across columns and floors the result', () => {
    const {props} = setup({width: 1000, columnCount: 3})

    expect(props.columnWidth).toBe(333)
    expect(props.adjustedWidth).toBe(999)
  })

  it('clamps columnWidth to columnMinWidth', () => {
    const {props} = setup({
      width: 90,
      columnCount: 10,
      columnMinWidth: 20,
    })

    expect(props.columnWidth).toBe(20)
    expect(props.adjustedWidth).toBe(90)
  })

  it('clamps columnWidth to columnMaxWidth capped at width', () => {
    const {props} = setup({
      width: 900,
      columnCount: 2,
      columnMaxWidth: 300,
    })

    expect(props.columnWidth).toBe(300)
    expect(props.adjustedWidth).toBe(600)
  })

  it('defaults columnMinWidth to 1', () => {
    const {props} = setup({width: 5, columnCount: 8})

    expect(props.columnWidth).toBe(1)
    expect(props.adjustedWidth).toBe(5)
  })

  it('exposes getColumnWidth returning the computed column width', () => {
    const {props} = setup({width: 1000, columnCount: 3})

    expect(props.getColumnWidth()).toBe(333)
  })

  it('recomputes the registered child grid on registration', () => {
    const grid = {recomputeGridSize: vi.fn()}
    const {props} = setup({width: 1000, columnCount: 3})

    props.registerChild(grid)

    expect(grid.recomputeGridSize).toHaveBeenCalledTimes(1)
  })

  it('recomputes the registered child grid when sizing inputs change', () => {
    const grid = {recomputeGridSize: vi.fn()}
    const {props, rerender} = setup({width: 1000, columnCount: 3})
    props.registerChild(grid)

    rerender({width: 800, columnCount: 3})

    expect(grid.recomputeGridSize).toHaveBeenCalledTimes(2)
  })
})
