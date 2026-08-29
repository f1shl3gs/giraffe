import {act, render, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {AutoSizer} from './AutoSizer'

class MockResizeObserver {
  static instances: MockResizeObserver[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(readonly callback: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this)
  }

  trigger(width: number, height: number): void {
    this.callback(
      [{contentRect: {width, height}}] as unknown as ResizeObserverEntry[],
      this as unknown as ResizeObserver
    )
  }
}

const lastInstance = (): MockResizeObserver =>
  MockResizeObserver.instances[MockResizeObserver.instances.length - 1]

const flushFrame = (): Promise<void> =>
  new Promise(resolve => {
    requestAnimationFrame(() => resolve())
  })

const Child = vi.fn(({width, height}: {width: number; height: number}) => (
  <div data-testid="child">{`${width}x${height}`}</div>
))

describe('AutoSizer', () => {
  beforeEach(() => {
    MockResizeObserver.instances = []
    Child.mockClear()
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('observes its wrapper element on mount', () => {
    const {container} = render(
      <AutoSizer className="test-sizer">
        {size => <Child {...size} />}
      </AutoSizer>
    )

    expect(lastInstance().observe).toHaveBeenCalledWith(container.firstChild)
  })

  it('renders nothing before the first measurement', () => {
    const {queryByTestId} = render(
      <AutoSizer>{size => <Child {...size} />}</AutoSizer>
    )

    expect(queryByTestId('child')).toBeNull()
  })

  it('renders children with the measured size', async () => {
    const {getByTestId} = render(
      <AutoSizer>{size => <Child {...size} />}</AutoSizer>
    )

    lastInstance().trigger(320, 240)
    await act(flushFrame)

    expect(getByTestId('child').textContent).toBe('320x240')
  })

  it('updates children when the size changes', async () => {
    const {getByTestId} = render(
      <AutoSizer>{size => <Child {...size} />}</AutoSizer>
    )

    lastInstance().trigger(320, 240)
    await act(flushFrame)

    lastInstance().trigger(640, 480)
    await act(flushFrame)

    expect(getByTestId('child').textContent).toBe('640x480')
  })

  it('does not re-render children when the size is unchanged', async () => {
    render(<AutoSizer>{size => <Child {...size} />}</AutoSizer>)

    lastInstance().trigger(320, 240)
    await act(flushFrame)
    expect(Child).toHaveBeenCalledTimes(1)

    lastInstance().trigger(320, 240)
    await act(flushFrame)
    expect(Child).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer on unmount', () => {
    const {unmount} = render(
      <AutoSizer>{size => <Child {...size} />}</AutoSizer>
    )

    unmount()

    expect(lastInstance().disconnect).toHaveBeenCalledTimes(1)
  })

  it('applies className to the wrapper element', async () => {
    const {container, queryByTestId} = render(
      <AutoSizer className="giraffe-autosizer">
        {size => <Child {...size} />}
      </AutoSizer>
    )

    expect(container.firstChild).toHaveProperty(
      'className',
      'giraffe-autosizer'
    )

    lastInstance().trigger(10, 10)
    await waitFor(() => expect(queryByTestId('child')).not.toBeNull())
  })
})
