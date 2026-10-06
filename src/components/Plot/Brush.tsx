// Libraries
import {
  CSSProperties,
  FunctionComponent,
  MouseEvent,
  useLayoutEffect,
} from 'react'

// Utils
import {DragEvent} from 'utils/useDragEvent'

const MIN_SELECTION_SIZE = 5 // pixels

interface Props {
  event: DragEvent | null
  width: number
  height: number
  onXBrushEnd: (xRange: number[], onShiftDown?: boolean) => void
  onYBrushEnd: (yRange: number[]) => void
  onShiftClick?: (mouseEvent: MouseEvent) => void
}

export const Brush: FunctionComponent<Props> = ({
  event,
  width,
  height,
  onXBrushEnd,
  onYBrushEnd,
  onShiftClick,
}) => {
  const isBrushing = event && event.direction

  useLayoutEffect(() => {
    if (event?.type !== 'dragend') {
      return
    }

    if (isBrushing) {
      let callback
      let p0
      let p1

      if (event.direction === 'x') {
        p0 = Math.min(event.initialX, event.x)
        p1 = Math.max(event.initialX, event.x)
        callback = onXBrushEnd
      } else if (event.direction === 'y') {
        p0 = Math.min(event.initialY, event.y)
        p1 = Math.max(event.initialY, event.y)
        callback = onYBrushEnd
      } else {
        return
      }

      if (p1 - p0 < MIN_SELECTION_SIZE) {
        return
      }
      // doing brush now
      callback([p0, p1], event.isShiftDown)
    } else {
      if (event.isShiftDown && event.mouseActionState === 'mouseUpHappened') {
        // a mouseUpHappened, so this is the equivalent of an 'onClick'
        // because brushing (dragging across an area) has not happened
        onShiftClick(event?.mouseEvent)
      }
    }
  }, [event?.type])

  if (!isBrushing || event.type === 'dragend') {
    return null
  }

  const {
    x,
    y,
    width: brushWidth,
    height: brushHeight,
  } = getRectDimensions(event, width, height)

  /*
    Same treatment as the HighlightedRegion custom layer story: a flat red wash
    with no outline. The previous 10% aliceblue measured ~1.19:1 against the plot
    background, i.e. effectively invisible; tomato at 0.3 is unmistakable while
    still letting the series underneath read through.
  */
  const selectionStyle: CSSProperties = {
    display: event.initialX === null ? 'none' : 'inherit',
    position: 'absolute',
    left: `${x}px`,
    width: `${brushWidth}px`,
    top: `${y}px`,
    height: `${brushHeight}px`,
    background: 'tomato',
    opacity: 0.3,
  }

  return <div className='giraffe-brush-selection' style={selectionStyle} />
}

const getRectDimensions = (
  event: DragEvent,
  plotWidth: number,
  plotHeight: number,
) => {
  if (event.direction === 'x') {
    const x = Math.max(0, Math.min(event.initialX, event.x))

    const width = Math.min(Math.max(event.initialX, event.x) - x, plotWidth - x)

    return {
      x,
      y: 0,
      width,
      height: plotHeight,
    }
  }

  if (event.direction === 'y') {
    const y = Math.max(0, Math.min(event.initialY, event.y))

    const height = Math.min(
      Math.max(event.initialY, event.y) - y,
      plotHeight - y,
    )

    return {
      x: 0,
      y,
      width: plotWidth,
      height: height,
    }
  }

  return null
}
