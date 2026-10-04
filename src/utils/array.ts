export function range(
  ...args: [stop: number] | [start: number, stop: number, step?: number]
): number[] {
  const [start, stop, step] = args

  const from = args.length < 2 ? 0 : start
  const to = args.length < 2 ? start : stop
  const by = args.length < 3 ? 1 : step

  const count = Math.max(0, Math.ceil((to - from) / by)) | 0
  const values: number[] = new Array(count)

  for (let i = 0; i < count; i++) {
    values[i] = from + i * by
  }

  return values
}

export function extent(
  values: Iterable<number | null | undefined>,
): [number, number] | null {
  let min: number | null = null
  let max: number | null = null

  for (const value of values) {
    if (value == null || Number.isNaN(value)) {
      continue
    }

    if (min === null || value < min) {
      min = value
    }
    if (max === null || value > max) {
      max = value
    }
  }

  return min === null || max === null ? null : [min, max]
}

export function thresholdSturges(
  values: ArrayLike<number | null | undefined> | null | undefined,
): number {
  let valid = 0

  if (values) {
    for (let i = 0; i < values.length; i++) {
      const value = values[i]

      if (value != null && !Number.isNaN(value)) {
        valid++
      }
    }
  }

  return Math.max(1, Math.ceil(Math.log(valid) / Math.LN2) + 1)
}

const E10 = Math.sqrt(50)
const E5 = Math.sqrt(10)
const E2 = Math.sqrt(2)

function tickSpec(
  start: number,
  stop: number,
  count: number,
): [number, number, number] {
  const step = (stop - start) / Math.max(0, count)
  const power = Math.floor(Math.log10(step))
  const error = step / Math.pow(10, power)
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1

  let i1: number
  let i2: number
  let inc: number

  if (power < 0) {
    inc = Math.pow(10, -power) / factor
    i1 = Math.round(start * inc)
    i2 = Math.round(stop * inc)

    if (i1 / inc < start) {
      i1 += 1
    }
    if (i2 / inc > stop) {
      i2 -= 1
    }

    inc = -inc
  } else {
    inc = Math.pow(10, power) * factor
    i1 = Math.round(start / inc)
    i2 = Math.round(stop / inc)

    if (i1 * inc < start) {
      i1 += 1
    }
    if (i2 * inc > stop) {
      i2 -= 1
    }
  }

  if (i2 < i1 && 0.5 <= count && count < 2) {
    return tickSpec(start, stop, count * 2)
  }

  return [i1, i2, inc]
}

export function ticks(start: number, stop: number, count: number): number[] {
  if (!(count > 0)) {
    return []
  }
  if (start === stop) {
    return [start]
  }

  const reverse = stop < start
  const [i1, i2, inc] = reverse
    ? tickSpec(stop, start, count)
    : tickSpec(start, stop, count)

  if (!(i2 >= i1)) {
    return []
  }

  const n = i2 - i1 + 1
  const result: number[] = new Array(n)

  if (reverse) {
    if (inc < 0) {
      for (let i = 0; i < n; i++) {
        result[i] = (i2 - i) / -inc
      }
    } else {
      for (let i = 0; i < n; i++) {
        result[i] = (i2 - i) * inc
      }
    }
  } else {
    if (inc < 0) {
      for (let i = 0; i < n; i++) {
        result[i] = (i1 + i) / -inc
      }
    } else {
      for (let i = 0; i < n; i++) {
        result[i] = (i1 + i) * inc
      }
    }
  }

  return result
}
