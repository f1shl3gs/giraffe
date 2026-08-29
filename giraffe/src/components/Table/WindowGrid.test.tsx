import React, {useRef} from 'react'
import {render} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import {WindowGrid, WindowGridHandle} from './WindowGrid'

const Probe = vi.fn(
  (_args: {
    columnIndex: number
    rowIndex: number
    key: string
    style: React.CSSProperties
  }) => <div data-testid="cell" />
)

const Harness = ({
  gridRef,
  ...props
}: {
  gridRef?: React.MutableRefObject<WindowGridHandle>
  [key: string]: unknown
}) => {
  const fallbackRef = useRef<WindowGridHandle>(null)
  const ref = gridRef ?? fallbackRef
  return (
    <WindowGrid
      cellRenderer={Probe as never}
      columnCount={3}
      columnWidth={30}
      height={100}
      ref={ref as never}
      rowCount={40}
      rowHeight={30}
      width={90}
      {...props}
    />
  )
}

describe('WindowGrid', () => {
  it('renders only the visible rows plus overscan', () => {
    const {container} = render(<Harness />)

    expect(container.querySelectorAll('[data-testid="cell"]')).toHaveLength(42)
  })

  it('shifts cells by the controlled scroll offsets', () => {
    Probe.mockClear()
    render(<Harness scrollTop={45} />)

    const firstStyle = Probe.mock.calls[0][0].style
    expect(firstStyle.top).toBe(-45)
  })

  it('provides absolute positioning styles per cell', () => {
    Probe.mockClear()
    render(<Harness />)

    const args = Probe.mock.calls[0][0]
    expect(args.rowIndex).toBe(0)
    expect(args.columnIndex).toBe(0)
    expect(args.style.position).toBe('absolute')
    expect(args.style.height).toBe(30)
  })

  it('applies className and dimensions to the container', () => {
    const {container} = render(<Harness className="test-grid" />)

    const el = container.firstElementChild as HTMLElement
    expect(el.className).toBe('test-grid')
    expect(el.style.width).toBe('90px')
    expect(el.style.height).toBe('100px')
  })

  it('renders nothing when there are no rows', () => {
    const {container} = render(<Harness rowCount={0} />)

    expect(container.querySelector('[data-testid="cell"]')).toBeNull()
  })

  it('exposes its props through the imperative handle', () => {
    const gridRef = {current: null}
    render(<Harness gridRef={gridRef as never} scrollToRow={7} />)

    expect(gridRef.current.props.scrollToRow).toBe(7)
  })
})
