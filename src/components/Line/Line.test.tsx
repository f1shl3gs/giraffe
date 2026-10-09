import {render, renderHook} from '@testing-library/react'
import type {PlotEnv} from 'components/Plot/PlotEnv'

import {PlotEnvContext} from 'components/Plot/PlotEnv'
import {PlotInteractionContext} from 'components/Plot/PlotInteractionContext'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {TIME, VALUE} from 'constants/columnKeys'
import {drawLines} from 'utils/drawLines'
import {newTable} from 'utils/newTable'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {Line} from './Line'
import {useLineTransform} from './useLineTransform'

/*
  jsdom has no 2d context, so the drawing module is mocked and its call count
  stands in for "did the canvas repaint". That is the thing worth protecting:
  hovering re-renders <Line> through PlotInteractionContext, and a memo that
  misses cascades into a full redraw of every series.
*/
vi.mock('utils/drawLines', () => ({drawLines: vi.fn()}))

/* clearCanvas still touches the context directly, so it needs a stub too. */
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    scale: vi.fn(),
    clearRect: vi.fn(),
  })) as unknown as HTMLCanvasElement['getContext']
})

const ROWS = 500
const buildTable = () =>
  newTable(ROWS)
    .addColumn(
      TIME,
      'dateTime:RFC3339',
      'time',
      Array.from({length: ROWS}, (_, i) => 1600000000000 + i * 60000),
    )
    .addColumn(
      VALUE,
      'system',
      'number',
      Array.from({length: ROWS}, (_, i) => (i % 31) * 1.5),
    )

const buildEnv = (): PlotEnv => ({
  config: {
    table: buildTable(),
    colors: NINETEEN_EIGHTY_FOUR,
    xColumn: TIME,
    yColumn: VALUE,
  } as PlotEnv['config'],
  table: buildTable(),
  width: 800,
  height: 400,
  xDomain: [0, 1],
  xScale: (x: number) => x,
  xTicks: [0, 1],
  yDomain: [0, 100],
  yScale: (x: number) => x,
  yTicks: [0, 100],
  margins: {top: 0, right: 0, bottom: 0, left: 0},
  innerWidth: 800,
  innerHeight: 400,
  yColumnType: 'number',
})

const interaction = (hoverX: number | null) => ({hoverX, hoverY: null})

const renderLine = (
  env: PlotEnv,
  hoverX: number | null = null,
  props: Record<string, unknown> = {},
) =>
  render(
    <PlotEnvContext value={env}>
      <PlotInteractionContext value={interaction(hoverX)}>
        <Line {...props} />
      </PlotInteractionContext>
    </PlotEnvContext>,
  )

describe('Line repainting', () => {
  let env: PlotEnv

  beforeEach(() => {
    env = buildEnv()
    vi.mocked(drawLines).mockClear()
  })

  it('draws once on mount', () => {
    renderLine(env)
    expect(drawLines).toHaveBeenCalledTimes(1)
  })

  /*
    The regression this guards. `fill = []` inline made the transform's memo miss
    on every render; the new `lineData` then missed `simplifyLineData`'s memo,
    and the new `simplifiedLineData` missed `useCanvas`'s layout effect.
  */
  it('does not repaint when a hover moves and nothing else changed', () => {
    const {rerender} = renderLine(env, 100)

    const afterMount = vi.mocked(drawLines).mock.calls.length
    expect(afterMount).toBe(1)

    for (const x of [120, 140, 160, 180]) {
      rerender(
        <PlotEnvContext value={env}>
          <PlotInteractionContext value={interaction(x)}>
            <Line />
          </PlotInteractionContext>
        </PlotEnvContext>,
      )
    }

    expect(vi.mocked(drawLines).mock.calls.length).toBe(afterMount)
  })

  it('repaints when the table changes', () => {
    const {rerender} = renderLine(env)
    expect(drawLines).toHaveBeenCalledTimes(1)

    const resized = {...env, height: 500}
    rerender(
      <PlotEnvContext value={resized}>
        <PlotInteractionContext value={interaction(null)}>
          <Line />
        </PlotInteractionContext>
      </PlotEnvContext>,
    )

    expect(drawLines).toHaveBeenCalledTimes(2)
  })

  it('repaints when a drawing prop changes', () => {
    const {rerender} = renderLine(env, null, {lineWidth: 1})
    expect(drawLines).toHaveBeenCalledTimes(1)

    rerender(
      <PlotEnvContext value={env}>
        <PlotInteractionContext value={interaction(null)}>
          <Line lineWidth={4} />
        </PlotInteractionContext>
      </PlotEnvContext>,
    )

    expect(drawLines).toHaveBeenCalledTimes(2)
  })
})

/*
  The hook's reason to exist. A plain useMemo wrapper only helps if the caller
  happens to pass stable references; these assert that it holds even when the
  caller passes a fresh array literal every render.
*/
describe('useLineTransform input stabilization', () => {
  const ROWS = 300
  const buildTable = () =>
    newTable(ROWS)
      .addColumn(
        TIME,
        'dateTime:RFC3339',
        'time',
        Array.from({length: ROWS}, (_, i) => 1600000000000 + i * 60000),
      )
      .addColumn(
        VALUE,
        'system',
        'number',
        Array.from({length: ROWS}, (_, i) => (i % 31) * 1.5),
      )
      .addColumn(
        'cpu',
        'string',
        'string',
        Array.from({length: ROWS}, (_, i) => `host${i % 8}`),
      )
      .addColumn(
        'region',
        'string',
        'string',
        Array.from({length: ROWS}, (_, i) => `eu-${i % 3}`),
      )

  const table = buildTable()

  const countTransforms = (fill: string[] | undefined) => {
    const addColumn = vi.spyOn(table, 'addColumn')
    const {rerender} = renderHook(() =>
      useLineTransform(table, TIME, VALUE, fill, NINETEEN_EIGHTY_FOUR),
    )
    rerender()
    rerender()
    return addColumn.mock.calls.length
  }

  afterEach(() => vi.restoreAllMocks())

  it('holds the memo when the caller passes an equal array of equal contents', () => {
    expect(countTransforms(['cpu'])).toBe(1)
  })

  it('still recomputes when the contents actually change', () => {
    const addColumn = vi.spyOn(table, 'addColumn')
    const {rerender} = renderHook(
      ({fill}: {fill: string[]}) =>
        useLineTransform(table, TIME, VALUE, fill, NINETEEN_EIGHTY_FOUR),
      {initialProps: {fill: ['cpu']}},
    )
    expect(addColumn.mock.calls.length).toBe(1)

    rerender({fill: ['cpu', 'region']})

    expect(addColumn.mock.calls.length).toBe(2)
  })

  it('still recomputes when the contents shrink or reorder', () => {
    const addColumn = vi.spyOn(table, 'addColumn')
    const {rerender} = renderHook(
      ({fill}: {fill: string[]}) =>
        useLineTransform(table, TIME, VALUE, fill, NINETEEN_EIGHTY_FOUR),
      {initialProps: {fill: ['cpu', 'region']}},
    )
    rerender({fill: ['region', 'cpu']})
    expect(addColumn.mock.calls.length).toBe(2)

    rerender({fill: ['region']})
    expect(addColumn.mock.calls.length).toBe(3)
  })
})
