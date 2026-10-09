// Libraries

// Types
import type {LegendConfig} from 'components/Legend/LegendConfig'
// Constants
import {
  ANNOTATION_DEFAULT_MAX_WIDTH,
  ANNOTATION_TOOLTIP_CONTAINER_NAME,
  CLOCKFACE_Z_INDEX,
  LEAFLET_Z_INDEX,
} from 'constants/index'
import {CSSProperties, FunctionComponent, useEffect, useRef} from 'react'
import {createPortal} from 'react-dom'
import {AnnotationMark, AnnotationTooltipOptions, TooltipPosition} from 'types'
import {useLayoutStyle} from 'utils/useLayoutStyle'

interface Props {
  boundingReference: DOMRect
  data: AnnotationMark
  legend?: LegendConfig
  width: number
}

export const AnnotationTooltip: FunctionComponent<Props> = ({
  boundingReference,
  data,
  legend,
  width,
}) => {
  const {backgroundColor, border, font, fontColor} = legend || {}

  const {dimension, startValue, stopValue} = data || {}

  // move this 15 pixels up to get out of the way of the annotation click target
  const yAxisTooltipOffset = -15

  // setting position to be the average between start and stop;
  // if it is a ranged annotation then it will appear in the middle,
  // if it is a point annotation then the math is a no-op.
  const position = {
    x: dimension === 'x' ? (startValue + stopValue) / 2 : width,
    y: dimension === 'y' ? (startValue + stopValue) / 2 : yAxisTooltipOffset,
  } as TooltipPosition

  const clampedXOffset = Math.round(
    boundingReference ? boundingReference.x : position.x,
  )

  const clampedYOffset = Math.round(
    boundingReference ? boundingReference.y : position.y,
  )

  const annotationTooltipElement = useAnnotationTooltipElement(
    ANNOTATION_TOOLTIP_CONTAINER_NAME,
    {
      xOffset: clampedXOffset,
      yOffset: clampedYOffset,
      position,
      dimension,
    },
  )

  let tooltipCaretStyle: CSSProperties = {
    position: 'fixed',
    borderWidth: '7px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    zIndex: 2,
  }
  let tooltipCaretFillStyle

  if (dimension === 'x') {
    tooltipCaretStyle = {
      ...tooltipCaretStyle,
      borderTopColor: data.color,
      left: `${clampedXOffset + position.x}px`,
      top: `${clampedYOffset + position.y}px`,
      transform: 'translateX(-50%)',
    }

    tooltipCaretFillStyle = {
      ...tooltipCaretStyle,
      borderTopColor: backgroundColor,
      top: `calc(${clampedYOffset + position.y}px - 4px)`,
      zIndex: 3,
    }
  }

  if (dimension === 'y') {
    tooltipCaretStyle = {
      ...tooltipCaretStyle,
      position: 'absolute',
      borderRightColor: data.color,
      top: '50%',
      right: '100%',
      transform: 'translateY(-50%)',
    }

    tooltipCaretFillStyle = {
      ...tooltipCaretStyle,
      borderRightColor: backgroundColor,
      right: 'calc(100% - 4px)',
      zIndex: 3,
    }
  }

  const textContainerStyle: CSSProperties = {
    overflowWrap: 'break-word',
  }

  const multiLines = data.title.split('\n')

  return createPortal(
    <div
      className='giraffe-annotation-tooltip'
      data-testid='giraffe-annotation-tooltip'
      style={{
        border,
        borderColor: data.color,
        font,
        backgroundColor,
        color: fontColor,
        boxShadow: `0 0 4px 0px ${data.color}`,
        borderRadius: '3px',
        padding: '10px',
        display: 'inline-block',
        maxWidth: `${ANNOTATION_DEFAULT_MAX_WIDTH}px`,
      }}
    >
      <div style={tooltipCaretStyle} />
      <div style={tooltipCaretFillStyle} />

      {multiLines.map((line, index) => {
        if (!line || line === '' || line.trim() === '') {
          return <br key={`annoBr-${index}`} />
        }
        return (
          <div key={`annoLine-${index}`} style={textContainerStyle}>
            {line}
          </div>
        )
      })}
      <div style={textContainerStyle}>{data.description}</div>
    </div>,
    annotationTooltipElement,
  )
}

const useAnnotationStyle = (
  el: HTMLDivElement,
  options: AnnotationTooltipOptions,
) => {
  const {dimension, position, xOffset, yOffset} = options || {}
  const {x, y} = position || {x: null, y: null}

  // Position the tooltip above the annotation for vertical annotations, like this:
  //
  //          ┌─────────────┐
  //          │             │
  //          │   tooltip   │
  //          │             │
  //          └─────────────┘
  //                 |
  //                 |
  //                 |
  //                 |
  //
  // Position the tooltip to the right of the annotation for horizontal annotations, like this:
  //
  //             ┌─────────────┐
  //             │             │
  //    ---------│   tooltip   │
  //             │             │
  //             └─────────────┘
  //
  // The positioning is subject to the following restrictions:
  //
  // - If the tooltip does not fit above a vertical annotation due to screen size,
  //   shift it to overlay the top part of the annotation
  //
  // - If the tooltip does not fit to the right of a horizontal annotation due to screen size,
  //   shift it to overlay the right part of the annotation
  //
  useLayoutStyle(
    el,
    ({offsetWidth: tooltipWidth, offsetHeight: tooltipHeight}) => {
      if (x === null || y === null) {
        return {
          display: 'none',
        }
      }
      // xOffset : start x-coordinate value of the plot layer
      // yOffset : start y-coordinate value of the plot layer
      // (xOffset, yOffset) is the origin of this plot
      // dx      : the distance to the middle of the tooltip from the parent plot container left edge
      let dx = xOffset - tooltipWidth / 2
      if (dx + tooltipWidth > window.innerWidth) {
        dx = 0 - tooltipWidth / 2 + window.innerWidth - (x + xOffset)
      }
      let dy = Math.max(yOffset - tooltipHeight, 0)

      if (dimension === 'y') {
        dx = xOffset
        if (dx + x + tooltipWidth > window.innerWidth) {
          dx = 0 - tooltipWidth + window.innerWidth - (dx + x)
        }
        dy = yOffset - tooltipHeight / 2
        if (dy + y + tooltipHeight > window.innerHeight) {
          dy = 0 - tooltipHeight + window.innerHeight - (dy + y)
        }
      }

      let clampedX = Math.round(x + dx)
      const clampedY = Math.round(dy + y)

      // When the annotation is in the far edge of the screen, the position.left value
      // overrides the width of the tooltip and makes its width smaller than its max-width.
      // Position the left edge of the tooltip such that the tooltip occupies its max width.
      if (
        window.innerWidth - clampedX < ANNOTATION_DEFAULT_MAX_WIDTH &&
        tooltipWidth >= ANNOTATION_DEFAULT_MAX_WIDTH
      ) {
        clampedX = window.innerWidth - ANNOTATION_DEFAULT_MAX_WIDTH
      }

      /* Geo widget maps are rendered with z-index: 399, we have to set it above
       that so that tooltips are not rendered/are hidden below the map, */
      return {
        display: 'inline-block',
        position: 'fixed',
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        zIndex: CLOCKFACE_Z_INDEX + LEAFLET_Z_INDEX + 1,
      }
    },
  )
}

const useAnnotationTooltipElement = (
  className: string,
  options: AnnotationTooltipOptions,
) => {
  const ref = useRef<HTMLDivElement>(null)

  if (ref.current === null) {
    ref.current = document.createElement('div')
    ref.current.classList.add(className)
  }

  useEffect(() => {
    document.body.appendChild(ref.current)

    return () => {
      document.body.removeChild(ref.current)
    }
  }, [])

  useAnnotationStyle(ref.current, options)

  return ref.current
}
