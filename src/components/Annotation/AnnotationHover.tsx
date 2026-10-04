// Libraries

import type {LegendConfig} from 'components/Legend/LegendConfig'
import {FunctionComponent} from 'react'
import type {AnnotationMark} from 'types'
import {AnnotationTooltip} from './AnnotationTooltip'

interface AnnotationHoverProps {
  annotationPositions: AnnotationMark[]
  boundingReference: DOMRect | undefined
  hoverRowIndices: number[]
  legend?: LegendConfig
  width: number
}

export const AnnotationHover: FunctionComponent<AnnotationHoverProps> = ({
  annotationPositions,
  legend,
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
          data={annotationData}
          legend={legend}
          boundingReference={boundingReference}
          width={width}
        />
      ))}
    </>
  )
}
