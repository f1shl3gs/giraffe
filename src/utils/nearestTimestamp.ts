import type {NumericColumnData} from 'types'

/*
  `timestamps` is nullable because Table.getColumn is: it returns null for a
  missing column, and for one whose type does not widen to number. Callers get
  the raw inverted value back in that case, which is what an unsnappable axis
  should do.
*/
export const nearestTimestamp = (
  timestamps: NumericColumnData | null,
  rawValue: number,
): number => {
  if (!timestamps || timestamps.length === 0) {
    return rawValue
  }

  if (timestamps.length === 1) {
    return timestamps[0]
  }

  const midPoint = timestamps.length / 2
  const firstHalf = timestamps.slice(0, midPoint)
  const secondHalf = timestamps.slice(midPoint)

  const firstPivotPoint = firstHalf[firstHalf.length - 1]
  const secondPivotPoint = secondHalf[0]

  const firstHalfDistance = Math.abs(firstPivotPoint - rawValue)
  const secondHalfDistance = Math.abs(secondPivotPoint - rawValue)

  if (firstHalfDistance > secondHalfDistance) {
    return nearestTimestamp(secondHalf, rawValue)
  }

  return nearestTimestamp(firstHalf, rawValue)
}
