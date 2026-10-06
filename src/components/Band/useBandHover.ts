// Libraries
import {useMemo} from 'react'

// Types
import {BandLineMap, LineData, NumericColumnData} from 'types'

const buildColumnData = (
  lineData: LineData,
  groupColData: NumericColumnData,
  bandLineMap: BandLineMap,
) => {
  const hoverableColumnData: {
    xs: number[]
    ys: number[]
    groupColData: number[]
  } = {
    xs: [],
    ys: [],
    groupColData: [],
  }

  bandLineMap.rowLines.forEach(rowIndex => {
    const series = lineData.get(rowIndex)

    if (series) {
      hoverableColumnData.xs = [...hoverableColumnData.xs, ...series.xs]
      hoverableColumnData.ys = [...hoverableColumnData.ys, ...series.ys]
      hoverableColumnData.groupColData = [
        ...hoverableColumnData.groupColData,
        ...Array.from(groupColData).filter(index => index === rowIndex),
      ]
    }
  })

  return hoverableColumnData
}

export const useBandHoverColumns = (
  mouseX: number,
  mouseY: number,
  lineData: LineData,
  groupColData: NumericColumnData,
  bandLineMap: BandLineMap,
  width: number,
  height: number,
) => {
  const active =
    mouseX !== undefined &&
    mouseX !== null &&
    mouseX >= 0 &&
    mouseX < width &&
    mouseY !== undefined &&
    mouseY !== null &&
    mouseY >= 0 &&
    mouseY < height

  const result = useMemo(
    () =>
      active ? buildColumnData(lineData, groupColData, bandLineMap) : null,
    [active, lineData, groupColData, bandLineMap],
  )

  return (
    result ?? {
      xs: [],
      ys: [],
      groupColData: [],
    }
  )
}
