export type ItemSize = number | ((arg: {index: number}) => number)

interface VisibleRangeArgs {
  itemCount: number
  itemSize: ItemSize
  overscan: number
  scrollOffset: number
  viewportSize: number
}

interface VisibleRange {
  start: number
  stop: number
}

export const getItemSize = (size: ItemSize, index: number): number =>
  typeof size === 'function' ? size({index}) : size

export const getItemOffset = (
  size: ItemSize,
  itemCount: number,
  index: number
): number => {
  let offset = 0
  const limit = Math.min(index, itemCount)
  for (let i = 0; i < limit; i++) {
    offset += getItemSize(size, i)
  }
  return offset
}

export const getTotalSize = (size: ItemSize, itemCount: number): number =>
  getItemOffset(size, itemCount, itemCount)

export const getVisibleRange = ({
  itemCount,
  itemSize,
  overscan,
  scrollOffset,
  viewportSize,
}: VisibleRangeArgs): VisibleRange => {
  if (itemCount <= 0) {
    return {start: 0, stop: -1}
  }

  let start = 0
  while (
    start < itemCount - 1 &&
    getItemOffset(itemSize, itemCount, start + 1) <= scrollOffset
  ) {
    start++
  }

  const scrollEnd = scrollOffset + viewportSize
  let stop = start
  while (
    stop < itemCount - 1 &&
    getItemOffset(itemSize, itemCount, stop) + getItemSize(itemSize, stop) <
      scrollEnd
  ) {
    stop++
  }

  return {
    start: Math.max(0, start - overscan),
    stop: Math.min(itemCount - 1, stop + overscan),
  }
}
