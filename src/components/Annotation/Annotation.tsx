// Libraries
import {CSSProperties, FunctionComponent, useMemo, useRef} from 'react'

// Components
import {AnnotationHover} from './AnnotationHover'
import {AnnotationLine} from './AnnotationLine'

// Types
import type {AnnotationMark, LineHoverDimension} from 'types'

// Utils
import {
  getAnnotationHoverIndices,
  getAnnotationsPositions,
  getVisibleAnnotations,
} from './annotationData'
import {usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'

// Constants
import {ANNOTATION_DEFAULT_HOVER_MARGIN} from 'constants/index'

export interface AnnotationProps {
  annotations: AnnotationMark[]
  hoverDimension?: LineHoverDimension | 'auto'
  hoverMargin?: number
  lineWidth?: number
  handleAnnotationClick?: (id: string) => void
}

const ANNOTATION_OVERLAY_DEFAULT_STYLE = {
  position: 'absolute',
} as CSSProperties

export const Annotation: FunctionComponent<AnnotationProps> = ({
  annotations,
  hoverDimension: hoverDimensionProp = 'auto',
  hoverMargin = ANNOTATION_DEFAULT_HOVER_MARGIN,
  lineWidth = 2,
  handleAnnotationClick,
}) => {
  const env = usePlot()
  const {hoverX, hoverY} = usePlotInteraction()
  const {innerWidth, innerHeight, xScale, yScale, xDomain, yDomain} = env

  const annotationData = useMemo(
    () => getVisibleAnnotations(annotations, xDomain, yDomain),
    [annotations, xDomain, yDomain],
  )

  const onHover = () => {}
  const annotationsPositions = useMemo(
    () => getAnnotationsPositions(annotationData, xScale, yScale),
    [annotationData, xScale, yScale],
  )
  const svgRef = useRef<SVGSVGElement>(null)

  /* 'auto' resolves to 'xy': an annotation is a region rather than a series, so
     hovering anywhere inside the margin counts. */
  const hoverDimension: LineHoverDimension =
    hoverDimensionProp === 'x' || hoverDimensionProp === 'y'
      ? hoverDimensionProp
      : 'xy'

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
    if (handleAnnotationClick && ev.target.id) {
      handleAnnotationClick(ev.target.id)
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
