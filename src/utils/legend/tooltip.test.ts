import {LineLayerSpec, lineTransform} from 'components/Line/transform'
import type {ScatterSpec} from 'components/Scatter/transform'
import {NINETEEN_EIGHTY_FOUR} from 'constants/colorSchemes'
import {FILL} from 'constants/columnKeys'
import {createGroupIDColumn, getNominalColorScale} from 'utils/transform'
import {LayerTypes} from 'types'
import {
  COLUMN_KEY,
  createSampleTable,
  HOST_KEY,
  POINT_KEY,
} from '../fixtures/randomTable'
import {getLegendData} from './staticLegend'
import {getPointsTooltipData} from './tooltip'

describe('getPointsTooltipData', () => {
  let sampleTable
  const xColKey = '_time'
  const yColKey = '_value'
  const columnFormatter = () => x => String(x)
  const pointFormatter = () => x => String(x)
  let lineSpec
  let fillScale
  let result

  const numberOfRecords = 1000
  const recordsPerLine = 10
  let startingIndex

  const setUp = options => {
    const {plotType = 'line', ...tableOptions} = options
    sampleTable = createSampleTable({...tableOptions, plotType})
    if (plotType === 'line') {
      lineSpec = lineTransform(
        sampleTable,
        xColKey,
        yColKey,
        [COLUMN_KEY],
        NINETEEN_EIGHTY_FOUR,
      )
    }

    const [fillColumn, fillColumnMap] = createGroupIDColumn(sampleTable, [
      plotType === 'line' ? COLUMN_KEY : HOST_KEY,
    ])
    fillScale = getNominalColorScale(fillColumnMap, NINETEEN_EIGHTY_FOUR)
    sampleTable = sampleTable.addColumn(FILL, 'system', 'number', fillColumn)

    const fillColumnFromSampleTable = sampleTable.getColumn(FILL, 'number')
    fillColumn.forEach((item, index) =>
      expect(item).toEqual(fillColumnFromSampleTable[index]),
    )
  }

  describe('tooltip for overlaid line graph', () => {
    it('should have a value column that is sorted in descending order', () => {
      lineSpec = {} as LineLayerSpec
      startingIndex = 3
      const hoveredRowIndices = []
      for (let i = startingIndex; i < numberOfRecords; i += recordsPerLine) {
        hoveredRowIndices.push(i)
      }
      setUp({
        include_negative: true,
        all_negative: false,
        numberOfRecords,
        recordsPerLine,
      })
      result = getPointsTooltipData(
        hoveredRowIndices,
        sampleTable,
        xColKey,
        yColKey,
        FILL,
        columnFormatter,
        [COLUMN_KEY],
        fillScale,
      )
      const singleValueColumn = result.find(column => column.name === yColKey)
      expect(
        singleValueColumn.values.every((value, index) => {
          if (index === 0) {
            return true
          }
          return Number(value) <= Number(singleValueColumn.values[index - 1])
        }),
      ).toEqual(true)
    })
  })

  describe('tooltip and static legend at the edge of the graph', () => {
    it('should have the same columns and order for tooltip and static legend in an overlaid line graph', () => {
      lineSpec = {} as LineLayerSpec
      setUp({
        include_negative: true,
        all_negative: false,
        numberOfRecords,
        recordsPerLine,
      })
      const overlaidLineGraphStaticLegend = getLegendData(
        sampleTable,
        {fill: [COLUMN_KEY], colors: NINETEEN_EIGHTY_FOUR},
        yColKey,
        columnFormatter,
      )
      const overlaidLineGraphTooltip = getPointsTooltipData(
        Object.values(lineSpec.columnGroupMaps.latestIndices),
        sampleTable,
        xColKey,
        yColKey,
        FILL,
        columnFormatter,
        [COLUMN_KEY],
        fillScale,
      )

      overlaidLineGraphStaticLegend.forEach(staticLegendColumn => {
        const matchingTooltipColumn = overlaidLineGraphTooltip.find(
          tooltipColumn => {
            return (
              staticLegendColumn.key === tooltipColumn.key &&
              staticLegendColumn.name.includes(tooltipColumn.name)
            )
          },
        )
        expect(matchingTooltipColumn).toBeDefined()
        expect(
          staticLegendColumn.colors.every(
            (color, index) => color === matchingTooltipColumn.colors[index],
          ),
        ).toEqual(true)
        expect(
          staticLegendColumn.values.every(
            (value, index) => value === matchingTooltipColumn.values[index],
          ),
        ).toEqual(true)
      })
    })
  })

  describe('tooltip for scattered plot', () => {
    it('should create the proper columns each with length 1 when optional parameters are missing', () => {
      lineSpec = {} as ScatterSpec
      const randomIndex = Math.floor(Math.random() * numberOfRecords)
      const hoveredRowIndices = [randomIndex]
      setUp({
        numberOfRecords,
        recordsPerLine,
        plotType: LayerTypes.Scatter,
      })
      result = getPointsTooltipData(
        hoveredRowIndices,
        sampleTable,
        xColKey,
        yColKey,
        FILL,
        pointFormatter,
        [POINT_KEY, HOST_KEY],
        fillScale,
      )
      expect(sampleTable.getColumn(POINT_KEY)).toBeTruthy()
      expect(sampleTable.getColumn(HOST_KEY)).toBeTruthy()
      expect(
        result.every(col => col.values && col.values.length === 1),
      ).toEqual(true)
    })
  })
})
