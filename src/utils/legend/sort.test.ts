import {sortIndicesByValueColumn} from './sort'

describe('sortIndicesByValueColumn', () => {
  it('sorts falsy values as last', () => {
    let lineValues = [0, 10, 20, 30]
    let indices = [0, 1, 2, 3, 4, 5, 6]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual([
      3, 2, 1, 0, 4, 5, 6,
    ])

    indices = [0, 1, 2, 3]
    lineValues = [undefined, null, 0, NaN]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual(indices)

    lineValues = [NaN, undefined, 0, null]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual(indices)

    lineValues = [0, 0, 0, 0, 0, 0, 0]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual(indices)

    lineValues = [NaN, 1, 0, null]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual(indices)

    lineValues = [NaN, 2, 1000, null, 0, 5]
    indices = [5, 4, 3, 2, 1, 0]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual([
      2, 5, 1, 4, 3, 0,
    ])
  })

  it('sorts all values of a line graph by the latest indices', () => {
    const lineValues = [0, 10, 20, 30]
    const indices = [0, 1, 2, 3]
    expect(sortIndicesByValueColumn(lineValues, indices)).toEqual([3, 2, 1, 0])
  })
})
