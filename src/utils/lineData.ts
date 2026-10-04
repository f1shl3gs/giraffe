import {DomainLabel, LineData, Scale} from 'types'

import {simplify} from './simplify'

const isPlottable = (v: unknown): boolean =>
  v !== null && v !== undefined && !(typeof v === 'number' && Number.isNaN(v))

/*
  A missing value has no position on the scale. Mapping it to 0 draws the line
  far outside the plot whenever the domain does not contain 0, so the point is
  dropped instead and the line joins its neighbours.
*/
const scalePoints = (
  xs: Array<number | null>,
  ys: Array<number | null>,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
): Array<{xs: number[]; ys: number[]}> => {
  const px: number[] = []
  const py: number[] = []

  for (let i = 0; i < ys.length; i++) {
    if (!isPlottable(ys[i]) || !isPlottable(xs[i])) {
      continue
    }
    px.push(xScale(xs[i] as number))
    py.push(yScale(ys[i] as number))
  }

  return [{xs: px, ys: py}]
}

export const simplifyLineData = (
  lineData: LineData,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
): LineData => {
  const result: LineData = new Map()

  for (const [groupID, {xs, ys, fill}] of lineData) {
    const [{xs: scaledXs, ys: scaledYs}] = scalePoints(xs, ys, xScale, yScale)
    const [simplifiedXs, simplifiedYs] = simplify(scaledXs, scaledYs, 0.5)

    /*
      simplify() deliberately allocates Float64Array (see its own `ArrayLike`
      alias) for large inputs. LineData declares number[], and widening it was
      tried and cost 19 new errors across six files, so the two are reconciled
      here instead -- one copy per line group.
    */
    result.set(groupID, {
      xs: Array.from(simplifiedXs),
      ys: Array.from(simplifiedYs),
      fill,
    })
  }

  return result
}

export const simplifyBandData = (
  lineData: LineData,
  xScale: Scale<number, number>,
  yScale: Scale<number, number>,
): LineData => {
  const result: LineData = new Map()

  for (const [groupID, {xs, ys, fill}] of lineData) {
    const [{xs: scaledXs, ys: scaledYs}] = scalePoints(xs, ys, xScale, yScale)

    result.set(groupID, {xs: scaledXs, ys: scaledYs, fill})
  }

  return result
}

export const getDomainDataFromLines = (
  lineData: LineData,
  fillCol: Array<number>,
  domainLabel: DomainLabel,
): Array<number> => {
  if (Array.isArray(fillCol)) {
    const counters: {[groupID: number]: number} = {}
    return fillCol.map(line => {
      if (!counters[line]) {
        counters[line] = 0
      }
      const index = counters[line]
      const value = lineData.get(line)![domainLabel][index]
      counters[line] += 1
      return value
    })
  }
  return []
}
