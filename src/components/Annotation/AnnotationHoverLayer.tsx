// Libraries
import {FunctionComponent} from 'react'

import {AnnotationMark} from 'types'
import {AnnotationLayerProps} from './AnnotationLayer'
import {AnnotationTooltip} from './AnnotationTooltip'

interface AnnotationHoverLayerProps extends AnnotationLayerProps {
  annotationPositions: AnnotationMark[]
  boundingReference: DOMRect
  hoverRowIndices: number[]
  width: number
}

export const AnnotationHoverLayer: FunctionComponent<
  AnnotationHoverLayerProps
> = ({
  annotationPositions,
  plotConfig,
  hoverRowIndices,
  boundingReference,
  width,
}) => {
  const filtered = annotationPositions.filter((_, i) =>
    hoverRowIndices.includes(i),
  )

  return (
    <>
      {filtered.map(annotationData => (
        <AnnotationTooltip
          key={`annotation-tooltip-${annotationData.dimension}-${annotationData.startValue}-${annotationData.stopValue}`}
          config={plotConfig}
          data={annotationData}
          boundingReference={boundingReference}
          width={width}
        />
      ))}
    </>
  )
}
