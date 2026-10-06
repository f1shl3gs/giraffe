import type {AnnotationMark} from 'types'
import {getVisibleAnnotations, sortDistances} from './annotationData'

describe('annotationData utils', () => {
  describe('sort distances; testing that the correct minimum is picked', () => {
    it('handles empty data', () => {
      const empty = []
      empty.sort(sortDistances)
      expect(empty).toEqual([])
    })
    it('picks the point annotation when a range and point annotation overlap when we are within the minimum overlapping distance', () => {
      const points = [
        {dist: 0, annoType: 'range'},
        {dist: 2.3, annoType: 'point'},
      ]
      const minimum = {dist: 2.3, annoType: 'point'}

      expect(points.sort(sortDistances)[0]).toEqual(minimum)
    })
    it('picks the point, with a range and point with same distance from the mouse', () => {
      const points = [
        {dist: 2.3, annoType: 'range'},
        {dist: 2.3, annoType: 'point'},
      ]
      const minimum = {dist: 2.3, annoType: 'point'}
      expect(points.sort(sortDistances)[0]).toEqual(minimum)
    })

    it('picks the range, with a close range and a far point; when the range is close enough to offset the weighting.', () => {
      const points = [
        {dist: 0, annoType: 'range'},
        {dist: 12.3, annoType: 'point'},
      ]
      const minimum = {dist: 0, annoType: 'range'}
      expect(points.sort(sortDistances)[0]).toEqual(minimum)
    })

    it('does a normal comparison on two ranges', () => {
      const points = [
        {dist: 5, annoType: 'range'},
        {dist: 0, annoType: 'range'},
      ]
      const minimum = {dist: 0, annoType: 'range'}
      expect(points.sort(sortDistances)[0]).toEqual(minimum)
    })

    it('does a normal comparison on two points', () => {
      const points = [
        {dist: 15, annoType: 'point'},
        {dist: 8, annoType: 'point'},
      ]
      const minimum = {dist: 8, annoType: 'point'}
      expect(points.sort(sortDistances)[0]).toEqual(minimum)
    })
  })

  describe('visible annotations; the domains come from <Plot>, so brushing narrows these too', () => {
    const X_DOMAIN = [1000, 3000]
    const Y_DOMAIN = [0, 10]

    const mark = (
      dimension: string,
      startValue: number,
      stopValue: number,
    ): AnnotationMark =>
      ({
        title: 'A',
        description: 'd',
        color: 'green',
        startValue,
        stopValue,
        dimension,
      }) as AnnotationMark

    it('creates no annotations when given none', () => {
      expect(getVisibleAnnotations(null as never, X_DOMAIN, Y_DOMAIN)).toEqual(
        [],
      )
    })

    it('keeps x annotations inside the x domain', () => {
      expect(
        getVisibleAnnotations(
          [mark('x', 1500, 1500), mark('x', 1000, 3000)],
          X_DOMAIN,
          Y_DOMAIN,
        ).length,
      ).toEqual(2)
    })

    it('drops x annotations outside the x domain', () => {
      expect(
        getVisibleAnnotations([mark('x', 50, 60)], X_DOMAIN, Y_DOMAIN).length,
      ).toEqual(0)
      expect(
        getVisibleAnnotations([mark('x', 4000, 5000)], X_DOMAIN, Y_DOMAIN)
          .length,
      ).toEqual(0)
    })

    it('checks y annotations against the y domain', () => {
      expect(
        getVisibleAnnotations([mark('y', 5, 5)], X_DOMAIN, Y_DOMAIN).length,
      ).toEqual(1)
      expect(
        getVisibleAnnotations([mark('y', 50, 60)], X_DOMAIN, Y_DOMAIN).length,
      ).toEqual(0)
    })

    it('removes duplicate annotations in the same dimension, keeping the first', () => {
      expect(
        getVisibleAnnotations(
          [
            mark('x', 1500, 1500),
            mark('x', 1500, 1500),
            mark('y', 5, 5),
            mark('x', 2000, 2000),
          ],
          X_DOMAIN,
          Y_DOMAIN,
        ).length,
      ).toEqual(3)
    })

    it('narrows to a brushed domain instead of the full data range', () => {
      const annotations = [mark('y', 1, 1), mark('y', 8, 8)]

      expect(
        getVisibleAnnotations(annotations, X_DOMAIN, Y_DOMAIN).length,
      ).toEqual(2)
      // A plot brushed down to [1,2] shows only the annotation at 1.
      expect(
        getVisibleAnnotations(annotations, X_DOMAIN, [1, 2]).length,
      ).toEqual(1)
    })
  })
})
