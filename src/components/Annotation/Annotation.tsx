// Libraries
import {CSSProperties, FunctionComponent, useMemo, useRef} from 'react'

// Components
import {AnnotationHover} from './AnnotationHover'
import {AnnotationLine} from './AnnotationLine'

import {usePlot} from 'components/Plot/PlotEnv'
import {usePlotInteraction} from 'components/Plot/PlotInteractionContext'

import type {AnnotationMark, LineHoverDimension, SVGAttributes} from 'types'
import {
  getAnnotationHoverIndices,
  getAnnotationsPositions,
} from './annotationData'

// Constants
import {ANNOTATION_DEFAULT_HOVER_MARGIN} from 'constants/index'
import {annotationTransform} from './transform'

export interface AnnotationConfig {
  x: string
  y: string
  annotations: AnnotationMark[]
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

const ANNOTATION_OVERLAY_DEFAULT_STYLE = {
  position: 'absolute',
} as CSSProperties

export const Annotation: FunctionComponent<AnnotationProps> = ({config}) => {
  const env = usePlot()
  const {hoverX, hoverY} = usePlotInteraction()
  const {table, width, height, xScale, yScale} = env

  const spec = useMemo(
    () =>
      annotationTransform(
        table,
        config.annotations,
        env.config.xColumn,
        env.config.yColumn,
        config.fill,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      table,
      config.annotations,
      config.fill,
      env.config.xColumn,
      env.config.yColumn,
    ],
  )

  const onHover = () => {}
  const lineWidth = config.lineWidth || 2
  const annotationsPositions = useMemo(
    () => getAnnotationsPositions(spec.annotationData, xScale, yScale),
    [spec.annotationData, xScale, yScale],
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

  return (
    <svg
      className='giraffe-layer giraffe-layer-annotation'
      ref={svgRef}
      style={{...ANNOTATION_OVERLAY_DEFAULT_STYLE, width, height}}
      onClick={handleClick}
    >
      <AnnotationHover
        annotationPositions={annotationsPositions}
        boundingReference={boundingRect}
        hoverRowIndices={hoverRowIndices}
        legend={env.config.legend}
        width={width}
      />
      {annotationsPositions.map(annotationData =>
        annotationData.dimension === 'y' ? (
          <AnnotationLine
            dimension={annotationData.dimension}
            key={`line-y-${annotationData.dimension}-${annotationData.startValue}-${annotationData.stopValue}`}
            length={width}
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
            length={height}
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
