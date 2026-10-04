import type {PlotConfig} from './PlotConfig'

/*
  Plot-level defaults. These are not layer defaults (D9 put those in each layer
  component) -- they are the styling a plot falls back to when the consumer says
  nothing, and they used to live in CONFIG_DEFAULTS, which was deleted along
  with the old layer dispatcher. Without them axisColor / gridColor /
  tickFontColor arrive as undefined and canvas falls back to black.
*/
export const PLOT_DEFAULTS: PlotConfig = {
  xColumn: '',
  yColumn: '',

  xScale: 'linear',
  yScale: 'linear',

  showAxes: true,

  axisColor: '#292933',
  axisOpacity: 1,
  gridColor: '#292933',
  gridOpacity: 1,

  tickFont: '10px sans-serif',
  tickFontColor: '#8e91a1',

  legend: {
    font: '10px monospace',
    fontColor: '#bec2cc',
    fontBrightColor: '#f6f6f8',
    backgroundColor: '#0f0e15',
    border: '2px solid #202028',
    crosshairColor: 'rgba(255,255,255,0.75)',
    colorizeRows: true,
    opacity: 1,
  },
}

/*
  Layer defaults are per component, but a layer reading e.g. its own colors must
  not see undefined when the consumer passed nothing -- see the note in
  Line.tsx/Band.tsx. This is deliberately not a normalizer for `config.layers`:
  there is no layer dispatch left to normalize.
*/
export const withPlotDefaults = (config: PlotConfig): PlotConfig => ({
  ...PLOT_DEFAULTS,
  ...config,
  legend: {...PLOT_DEFAULTS.legend, ...config.legend},
})
