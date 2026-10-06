// Libraries

// Components
import {Axes} from 'components/Plot/Axes'
import {Brush} from 'components/Plot/Brush'
import type {PlotEnv} from 'components/Plot/PlotEnv'
import {PlotInteractionContext} from 'components/Plot/PlotInteractionContext'
import {
  CSSProperties,
  FunctionComponent,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
// Types
import {InteractionHandlerArguments, Scale} from 'types'

// Utils
import {nearestTimestamp} from 'utils/nearestTimestamp'
import {useDragEvent} from 'utils/useDragEvent'
import {useMousePos} from 'utils/useMousePos'

export interface DomainOverride {
  xDomain?: number[]
  yDomain?: number[]
}

interface Props {
  plot: PlotEnv
  /*
    `null` clears the override entirely. Passing `{}` is not a reset: the plot
    merges overrides key by key, so an empty object leaves the brushed domain in
    place.
  */
  onBrushChange: (domain: DomainOverride | null) => void
  children: ReactNode | ReactNode[]
}

export const PlotContainer: FunctionComponent<Props> = ({
  plot,
  onBrushChange,
  children,
}) => {
  const {
    config,
    width,
    height,
    yScale,
    innerHeight,
    innerWidth,
    xDomain,
    yDomain,
    xScale,
    margins,
    table,
  } = plot

  const [hoverEvent, hoverTargetProps] = useMousePos()
  const [dragEvent, dragTargetProps] = useDragEvent()
  const hoverX = dragEvent ? null : hoverEvent.x
  const hoverY = dragEvent ? null : hoverEvent.y

  const nearestX = useCallback(
    (pixelX: number) =>
      nearestTimestamp(
        table.getColumn(config.xColumn, 'number'),
        xScale.invert(pixelX),
      ),
    [table, config.xColumn, xScale],
  )

  const handleYBrushEnd = useCallback(
    (range: number[]) => {
      onBrushChange({
        yDomain: rangeToDomain(range, yScale, innerHeight).reverse(),
      })
    },
    [innerHeight, yScale, onBrushChange],
  )

  const onResetDomains = useCallback(() => onBrushChange(null), [onBrushChange])
  const plotInteraction: InteractionHandlerArguments = {
    clampedValueX: nearestX(hoverEvent.x),
    hoverX: hoverEvent.x,
    hoverY: hoverEvent.y,
    valueX: xScale.invert(hoverEvent.x),
    valueY: yScale.invert(hoverEvent.y),
    xDomain,
    yDomain,
    resetDomains: onResetDomains,
  }

  const singleShiftClick = config.interactionHandlers?.singleShiftClick
  const onShiftClick = singleShiftClick
    ? ev => singleShiftClick(plotInteraction)
    : () => {}

  const handleXBrushEnd = useCallback(
    (range, shiftDown) => {
      if (!shiftDown) {
        onBrushChange({xDomain: rangeToDomain(range, xScale, innerWidth)})
        return
      }

      config.interactionHandlers?.onXBrush?.(
        nearestX(range[0]),
        nearestX(range[1]),
      )
    },
    [xScale, innerWidth, nearestX, onBrushChange, config.interactionHandlers],
  )

  config.interactionHandlers?.hover?.(plotInteraction)

  const interation = useMemo(
    () => (config.legend ? {hoverX, hoverY} : null),
    [config.legend, hoverX, hoverY],
  )

  const fullSizeStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }

  return (
    <PlotInteractionContext value={interation}>
      <div
        className={'giraffe-plot'}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          userSelect: 'none',
        }}
      >
        {config.showAxes && <Axes plot={plot} style={fullSizeStyle} />}
        <div
          className={'giraffe-inner-plot'}
          style={{
            position: 'absolute',
            top: `${margins.top}px`,
            right: `${margins.right}px`,
            bottom: `${margins.bottom}px`,
            left: `${margins.left}px`,
            cursor: `${config.cursor || (!config.legend && 'crosshair') || 'auto'}`,
          }}
          onDoubleClick={onResetDomains}
          {...hoverTargetProps}
          {...dragTargetProps}
        >
          <div className={'giraffe-layers'} style={fullSizeStyle}>
            {children}
          </div>
          <Brush
            event={dragEvent}
            width={plot.innerWidth}
            height={plot.innerHeight}
            onXBrushEnd={handleXBrushEnd}
            onYBrushEnd={handleYBrushEnd}
            onShiftClick={onShiftClick}
          />
        </div>
      </div>
    </PlotInteractionContext>
  )
}

export const rangeToDomain = (
  [p0, p1]: number[],
  scale: Scale<number, number>,
  length: number,
): number[] => [
  scale.invert(Math.max(Math.min(p0, p1), 0)),
  scale.invert(Math.min(Math.max(p0, p1), length)),
]
