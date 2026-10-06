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
      this as unknown as ResizeObserver,
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
  <div data-testid='child'>{`${width}x${height}`}</div>
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

  it('observes the element it renders', () => {
    const {container} = render(
      <AutoSizer className='test-sizer'>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    /*
      container is the div React Testing Library mounts into; the sizer's own
      element is the one below it. The sizer observes itself, which is what
      makes the measurement non-degenerate: its width and height are 100%, so
      its content box follows whatever its parent is given.
    */
    expect(lastInstance().observe).toHaveBeenCalledWith(container.firstChild)
    expect(container.firstChild).toHaveProperty('className', 'test-sizer')
  })

  it('renders nothing before the first measurement', () => {
    const {queryByTestId} = render(
      <AutoSizer>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    expect(queryByTestId('child')).toBeNull()
  })

  it('renders children with the measured size', async () => {
    const {getByTestId} = render(
      <AutoSizer>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    lastInstance().trigger(320, 240)
    await act(flushFrame)

    expect(getByTestId('child').textContent).toBe('320x240')
  })

  it('updates children when the size changes', async () => {
    const {getByTestId} = render(
      <AutoSizer>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    lastInstance().trigger(320, 240)
    await act(flushFrame)

    lastInstance().trigger(640, 480)
    await act(flushFrame)

    expect(getByTestId('child').textContent).toBe('640x480')
  })

  it('does not re-render children when the size is unchanged', async () => {
    render(
      <AutoSizer>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    lastInstance().trigger(320, 240)
    await act(flushFrame)
    expect(Child).toHaveBeenCalledTimes(1)

    lastInstance().trigger(320, 240)
    await act(flushFrame)
    expect(Child).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer on unmount', () => {
    const {unmount} = render(
      <AutoSizer>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    unmount()

    expect(lastInstance().disconnect).toHaveBeenCalledTimes(1)
  })

  it('applies className to the wrapper element', async () => {
    const {container, queryByTestId} = render(
      <AutoSizer className='giraffe-autosizer'>
        {(width, height) => <Child width={width} height={height} />}
      </AutoSizer>,
    )

    expect(container.firstChild).toHaveProperty(
      'className',
      'giraffe-autosizer',
    )

    lastInstance().trigger(10, 10)
    await waitFor(() => expect(queryByTestId('child')).not.toBeNull())
  })
})
