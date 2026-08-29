import React from 'react'
import {render} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import GeoHeatmapCanvas from './GeoHeatmapCanvas'
import {drawHeatmap} from './drawHeatmap'

// drawHeatmap 依赖真实 canvas(jsdom 无 2d context),mock 掉以隔离测试集成层
vi.mock('./drawHeatmap', () => ({drawHeatmap: vi.fn()}))

const POINTS = [
  {lat: 10, lon: 20, intensity: 1},
  {lat: -30, lon: 60, intensity: 0.5},
]

type Listener = () => void

const fakeMap = () => {
  const listeners: Record<string, Listener[]> = {}
  const paneChildren: HTMLElement[] = []
  const pane = {
    appendChild: vi.fn((el: HTMLElement) => paneChildren.push(el)),
    removeChild: vi.fn((el: HTMLElement) => {
      const i = paneChildren.indexOf(el)
      if (i !== -1) {
        paneChildren.splice(i, 1)
      }
    }),
  }
  return {
    pane,
    paneChildren,
    listeners,
    getPanes: () => ({overlayPane: pane}),
    getSize: () => ({x: 800, y: 600}),
    containerPointToLayerPoint: () => ({x: 0, y: 0}),
    latLngToContainerPoint: ([lat, lon]: [number, number]) => ({
      x: (lon + 180) * 2,
      y: (90 - lat) * 2,
    }),
    on: (events: string, handler: Listener) => {
      events.split(' ').forEach(ev => (listeners[ev] ||= []).push(handler))
    },
    off: (events: string, handler: Listener) => {
      events.split(' ').forEach(ev => {
        listeners[ev] = (listeners[ev] || []).filter(h => h !== handler)
      })
    },
  }
}

describe('GeoHeatmapCanvas', () => {
  beforeEach(() => {
    vi.mocked(drawHeatmap).mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('appends a canvas to the overlay pane and draws projected points', () => {
    const map = fakeMap()
    render(
      <GeoHeatmapCanvas
        map={map as any}
        points={POINTS}
        radius={30}
        blur={15}
        max={1}
        minOpacity={0.5}
        gradient={{1: 'red'}}
      />
    )

    expect(map.paneChildren).toHaveLength(1)
    const canvas = map.paneChildren[0] as HTMLCanvasElement
    expect(canvas.tagName).toBe('CANVAS')
    expect(canvas.style.opacity).toBe('0.5')

    const call = vi.mocked(drawHeatmap).mock.calls[0]
    expect(call[1]).toEqual([
      {x: 400, y: 160, intensity: 1},
      {x: 480, y: 240, intensity: 0.5},
    ])
    expect(call[2]).toEqual({
      radius: 30,
      blur: 15,
      max: 1,
      gradient: {1: 'red'},
    })
  })

  it('redraws on map events without recreating the canvas', () => {
    const map = fakeMap()
    render(
      <GeoHeatmapCanvas
        map={map as any}
        points={POINTS}
        radius={30}
        blur={15}
        max={1}
        minOpacity={0.5}
        gradient={{1: 'red'}}
      />
    )
    expect(map.paneChildren).toHaveLength(1)

    vi.mocked(drawHeatmap).mockClear()
    map.listeners['moveend'].forEach(h => h())

    expect(vi.mocked(drawHeatmap)).toHaveBeenCalledTimes(1)
    expect(map.paneChildren).toHaveLength(1)
  })

  it('removes listeners and the canvas on unmount', () => {
    const map = fakeMap()
    const {unmount} = render(
      <GeoHeatmapCanvas
        map={map as any}
        points={POINTS}
        radius={30}
        blur={15}
        max={1}
        minOpacity={0.5}
        gradient={{1: 'red'}}
      />
    )
    const canvas = map.paneChildren[0]
    const moveEndHandlers = [...map.listeners['moveend']]

    unmount()

    expect(map.paneChildren).not.toContain(canvas)
    moveEndHandlers.forEach(h =>
      expect(map.listeners['moveend']).not.toContain(h)
    )
  })
})
