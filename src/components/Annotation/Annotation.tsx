// Libraries
import {CSSProperties, FunctionComponent, useMemo, useRef} from 'react'

import {usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'
import type {AnnotationMark, LineHoverDimension, SVGAttributes} from 'types'
// Components
import {AnnotationHover} from './AnnotationHover'
import {AnnotationLine} from './AnnotationLine'
import {
  getAnnotationHoverIndices,
  getAnnotationsPositions,
  getVisibleAnnotations,
} from './annotationData'

export interface AnnotationConfig {
  x: string
  y: string
  annotations: AnnotationMark[]
  /*
    Accepted and ignored. It used to group rows into a FILL column inside the
    layer transform, but nothing ever read that column -- each mark carries its
    own `color`. Kept because it is part of the published config.
  */
  fill: string[]
  hoverDimension?: LineHoverDimension | 'auto'
  hoverMargin?: number
  svgAttributes?: SVGAttributes
  svgStyle?: CSSProperties
  lineWidth?: number
  handleAnnotationClick?: (id: string) => void
}

export interface AnnotationProps {
  config: AnnotationConfig
}

// Constants
import {ANNOTATION_DEFAULT_HOVER_MARGIN} from 'constants/index'

const ANNOTATION_OVERLAY_DEFAULT_STYLE = {
  position: 'absolute',
} as CSSProperties

export const Annotation: FunctionComponent<AnnotationProps> = ({config}) => {
  const env = usePlot()
  const {hoverX, hoverY} = usePlotInteraction()
  const {innerWidth, innerHeight, xScale, yScale, xDomain, yDomain} = env

  const annotationData = useMemo(
    () => getVisibleAnnotations(config.annotations, xDomain, yDomain),
    [config.annotations, xDomain, yDomain],
  )

  const onHover = () => {}
  const lineWidth = config.lineWidth || 2
  const annotationsPositions = useMemo(
    () => getAnnotationsPositions(annotationData, xScale, yScale),
    [annotationData, xScale, yScale],
  )
  const svgRef = useRef<SVGSVGElement>(null)

  let hoverDimension = 'xy' as LineHoverDimension
  if (config.hoverDimension === 'x' || config.hoverDimension === 'y') {
    hoverDimension = config.hoverDimension
  }

  const hoverMargin = config.hoverMargin
    ? config.hoverMargin
    : ANNOTATION_DEFAULT_HOVER_MARGIN

  const hoverRowIndices = getAnnotationHoverIndices(
    hoverDimension,
    hoverMargin,
    annotationsPositions,
    hoverX,
    hoverY,
  )

  let boundingRect: DOMRect
  if (svgRef.current) {
    boundingRect = svgRef.current.getBoundingClientRect()
  }

  const handleClick = ev => {
    if (config.handleAnnotationClick && ev.target.id) {
      config.handleAnnotationClick(ev.target.id)
    }
  }

  /*
    This overlay is a child of <Plot>, so it sits inside .giraffe-inner-plot and
    its coordinates are the inner plot's. Sizing it to the outer plot ran the
    annotation lines out through the axes, into the tick labels.
  */
  return (
    <svg
      className='giraffe-layer giraffe-layer-annotation'
      ref={svgRef}
      style={{
        ...ANNOTATION_OVERLAY_DEFAULT_STYLE,
        width: innerWidth,
        height: innerHeight,
      }}
      onClick={handleClick}
    >
      <AnnotationHover
        annotationPositions={annotationsPositions}
        boundingReference={boundingRect}
        hoverRowIndices={hoverRowIndices}
        legend={env.config.legend}
        width={innerWidth}
      />
      {annotationsPositions.map(annotationData =>
        annotationData.dimension === 'y' ? (
          <AnnotationLine
            dimension={annotationData.dimension}
            key={`line-y-${annotationData.dimension}-${annotationData.startValue}-${annotationData.stopValue}`}
            length={innerWidth}
            startValue={annotationData.startValue}
            stopValue={annotationData.stopValue}
            color={annotationData.color}
            strokeWidth={lineWidth}
            pin={annotationData.pin}
            id={annotationData.id}
          />
        ) : (
          <AnnotationLine
            dimension={annotationData.dimension}
            key={`line-x-${annotationData.dimension}-${annotationData.startValue}-${annotationData.stopValue}`}
            length={innerHeight}
            startValue={annotationData.startValue}
            stopValue={annotationData.stopValue}
            color={annotationData.color}
            strokeWidth={lineWidth}
            pin={annotationData.pin}
            id={annotationData.id}
            onHover={onHover}
          />
        ),
      )}
    </svg>
  )
}
