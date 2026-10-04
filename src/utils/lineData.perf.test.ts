import {lineTransform} from 'components/Line/transform'
import {DomainLabel} from 'types'
import {dataSize, FILL_COL, largeTable, lineData} from './fixtures/line'
import {getDomainDataFromLines} from './lineData'

// A number representing the limit on the number of points
//   in a data set that most, if not all users, could possibly want
//   to see in a line graph
const REASONABLE_LIMIT = 5_000_000

describe('line graph performance', () => {
  it('fixture should be greater than or equal to REASONABLE_LIMIT', () => {
    expect(dataSize).toBeGreaterThanOrEqual(REASONABLE_LIMIT)
  })

  test(`getDomainDataFromLines on ${REASONABLE_LIMIT} data points`, () => {
    expect(() => {
      const result = getDomainDataFromLines(lineData, FILL_COL, DomainLabel.Y)
      expect(result.length).toBeGreaterThanOrEqual(REASONABLE_LIMIT)
    }).not.toThrow()
  })

  test(`line transform a table with ${REASONABLE_LIMIT} data points`, () => {
    expect(() => {
      const result = lineTransform(
        largeTable,
        '_time',
        '_value',
        ['cpu'],
        ['#31C0F6', '#A500A5', '#FF7E27'],
      )
      expect(result.table.length).toBeGreaterThanOrEqual(REASONABLE_LIMIT)
    }).not.toThrow()
  }, 30_000)
})
