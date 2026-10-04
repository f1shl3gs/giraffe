import type {LineData} from '../../types'

import {newTable} from '../newTable'

const now = Date.now()
const numberOfLines = 1_000
const dataPointsPerLine = 5_000
const dataSize = numberOfLines * dataPointsPerLine
const maxValue = 100

function getRandomNumber(max: number) {
  return Math.random() * Math.floor(max)
}

function getRandomColor() {
  return Math.floor(Math.random() * 255)
}
const lineData: LineData = new Map()
const FILL_COL: number[] = []
const TIME_COL: number[] = []
const VALUE_COL: number[] = []
const CPU_COL: string[] = []

for (let lineNumber = 0; lineNumber < numberOfLines; lineNumber += 1) {
  const series: {xs: number[]; ys: number[]; fill: string} = {
    // prettier-ignore
    fill: `rgb(${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()})`,
    xs: [],
    ys: [],
  }
  lineData.set(lineNumber, series)
  for (let dataPoint = 0; dataPoint < dataPointsPerLine; dataPoint += 1) {
    const time = now + (dataPoint % dataPointsPerLine) * 1000 * 60
    const randomNumber = getRandomNumber(maxValue)
    const index = lineNumber * numberOfLines + dataPointsPerLine

    series.xs.push(time)
    FILL_COL.push(lineNumber)
    TIME_COL.push(time)

    series.ys.push(randomNumber)
    VALUE_COL.push(randomNumber)
    CPU_COL.push(`cpu${Math.floor(index / dataPointsPerLine)}`)
  }
}

const largeTable = newTable(dataSize)
  .addColumn('_time', 'dateTime:RFC3339', 'time', TIME_COL)
  .addColumn('_value', 'system', 'number', VALUE_COL)
  .addColumn('cpu', 'string', 'string', CPU_COL)

export {dataSize, FILL_COL, largeTable, lineData}
