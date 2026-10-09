import type {Meta, StoryObj} from '@storybook/react'

import {CustomLayer} from 'components/CustomLayer'
import {Line} from 'components/Line'
import type {LineProps} from 'components/Line'
import type {PlotConfig} from 'components/Plot'
import {Plot} from 'components/Plot'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'
import {getCPUTable, StoryFrame} from 'stories/helpers'

export default {
  title: 'Custom Layer',
} as Meta

type Story = StoryObj

const TABLE = getCPUTable()

const PLOT_CONFIG: PlotConfig = {
  width: 800,
  height: 400,
  xColumn: '_time',
  yColumn: '_value',
}

const LINE_CONFIG: LineProps = {
  fill: ['cpu'],
}

/*
  Everything inside .giraffe-plot is absolutely positioned, so a custom layer
  always positions itself. `width: 100%` is the plot's inner width; the default
  `bottom` of an absolutely positioned div is the bottom of that box.
*/
const fullWidthBox: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  width: '100%',
}

export const HighlightedRegion: Story = {
  render: () => (
    <StoryFrame>
      <Plot table={TABLE} config={PLOT_CONFIG}>
        <Line {...LINE_CONFIG} />
        <CustomLayer>
          {({yScale}) => (
            <div
              style={{
                ...fullWidthBox,
                top: `${yScale(20)}px`,
                /* yScale runs bottom-to-top, so the lower value is the larger
                   pixel offset -- the difference comes out positive. */
                height: `${yScale(10) - yScale(20)}px`,
                background: 'tomato',
                opacity: 0.3,
              }}
            />
          )}
        </CustomLayer>
      </Plot>
    </StoryFrame>
  ),
}

export const HorizontalThreshold: Story = {
  render: () => (
    <StoryFrame>
      <Plot table={TABLE} config={PLOT_CONFIG}>
        <Line {...LINE_CONFIG} />
        <CustomLayer>
          {({yScale, columnFormatter}) => (
            <>
              <div
                style={{
                  ...fullWidthBox,
                  top: `${yScale(15)}px`,
                  borderTop: '1px dashed #DC4E58',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '4px',
                  top: `${yScale(15) - 16}px`,
                  color: '#DC4E58',
                  font: '10px sans-serif',
                }}
              >
                threshold {columnFormatter('_value')(15)}
              </div>
            </>
          )}
        </CustomLayer>
      </Plot>
    </StoryFrame>
  ),
}

/*
  The x axis is time here, so xScale takes milliseconds. The bracket is the
  scale's range start, which lines the rule up with the left edge of the inner
  plot the way yScale does for HorizontalThreshold.
*/
export const VerticalMarker: Story = {
  render: () => (
    <StoryFrame>
      <Plot table={TABLE} config={PLOT_CONFIG}>
        <Line {...LINE_CONFIG} />
        <CustomLayer>
          {({xScale, innerHeight}) => {
            const xCol = TABLE.getColumn('_time', 'number') || []
            const first = xCol[0] + (xCol[xCol.length - 1] - xCol[0]) * 0.62
            return (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${xScale(first)}px`,
                    height: `${innerHeight}px`,
                    borderLeft: '2px solid #7E8CFF',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${xScale(first) + 4}px`,
                    color: '#7E8CFF',
                    font: '10px sans-serif',
                  }}
                >
                  deploy
                </div>
              </>
            )
          }}
        </CustomLayer>
      </Plot>
    </StoryFrame>
  ),
}

/*
  hoverX / hoverY are not in the render props on purpose -- anything rendered
  inside <Plot> can read them itself. This is the escape hatch: <CustomLayer>
  passes no props at all here, and the sibling <HoverReadout> gets the
  interaction from context.
*/
export const HoverTracking: Story = {
  render: () => (
    <StoryFrame>
      <Plot table={TABLE} config={PLOT_CONFIG}>
        <Line {...LINE_CONFIG} />
        <HoverReadout />
      </Plot>
    </StoryFrame>
  ),
}

const HoverReadout = () => {
  const {hoverX, hoverY} = usePlotInteraction()

  return (
    <CustomLayer>
      {({yScale, innerHeight}) => {
        if (hoverX === null || hoverY === null) {
          return <div style={fullWidthBox} />
        }
        /* invert maps a pixel back to a data value, which is how you go from
           "the cursor is here" to "the reading is this". */
        const value = yScale.invert?.(hoverY)
        return (
          <>
            <div
              style={{
                ...fullWidthBox,
                top: `${hoverY}px`,
                borderTop: '1px solid rgba(255,255,255,0.6)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '4px',
                left: '8px',
                height: `${innerHeight}px`,
                borderLeft: '1px solid rgba(255,255,255,0.6)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: `${hoverY - 18}px`,
                left: '8px',
                padding: '2px 4px',
                background: '#0f0e15',
                color: '#f6f6f8',
                font: '10px monospace',
              }}
            >
              {value === undefined ? '' : value.toFixed(2)}
            </div>
          </>
        )
      }}
    </CustomLayer>
  )
}
