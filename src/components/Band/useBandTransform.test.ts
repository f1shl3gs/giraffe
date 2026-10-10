// Types
import type {LineData} from 'types'
import {DomainLabel} from 'types'

// Utils
import {getLinearScale} from 'utils/getLinearScale'
import {simplifyLineData} from 'utils/lineData'

import {
  alignMinMaxWithBand,
  createLatestBandIndices,
  getBandLineMap,
  getBands,
  groupLineIndicesIntoBands,
  simplifyBandData,
  sortBandLines,
} from './useBandTransform'

/* Several cases deliberately push nulls into xs/ys, which LineData forbids. */
const seriesAt = (
  data: LineData,
  id: number,
): {fill: string; xs: any[]; ys: any[]} => data.get(id) as any

describe('band transform utils', () => {
  const columnMap = {
    columnKeys: ['result', '_field', '_measurement', 'cpu', 'host'],
    mappings: [
      {
        cpu: 'cpu1',
        host: 'localhost',
        result: 'max',
        _field: 'usage_system',
        _measurement: 'cpu',
      },
      {
        cpu: 'cpu0',
        host: 'localhost',
        result: 'max',
        _field: 'usage_system',
        _measurement: 'cpu',
      },
      {
        cpu: 'cpu1',
        host: 'localhost',
        result: 'min',
        _field: 'usage_system',
        _measurement: 'cpu',
      },
      {
        cpu: 'cpu0',
        host: 'localhost',
        result: 'min',
        _field: 'usage_system',
        _measurement: 'cpu',
      },
      {
        cpu: 'cpu0',
        host: 'localhost',
        result: 'mean',
        _field: 'usage_system',
        _measurement: 'cpu',
      },
      {
        cpu: 'cpu1',
        host: 'localhost',
        result: 'mean',
        _field: 'usage_system',
        _measurement: 'cpu',
      },
    ],
  }

  describe('creates a map of indices by column type for all columns', () => {
    it('creates a map with null indices when the named columns are not found', () => {
      expect(getBandLineMap(columnMap, 'lower', 'median', 'upper')).toEqual({
        upperLines: [null, null],
        lowerLines: [null, null],
        rowLines: [null, null],
      })
      expect(getBandLineMap(columnMap, '', '', '')).toEqual({
        upperLines: [null, null],
        lowerLines: [null, null],
        rowLines: [null, null],
      })
    })

    it('creates a map with no indices when the column map is empty', () => {
      expect(
        getBandLineMap(
          {columnKeys: null, mappings: null},
          'min',
          'mean',
          'max',
        ),
      ).toEqual({
        upperLines: [],
        lowerLines: [],
        rowLines: [],
      })
      expect(
        getBandLineMap(
          {columnKeys: undefined, mappings: undefined},
          'min',
          'mean',
          'max',
        ),
      ).toEqual({
        upperLines: [],
        lowerLines: [],
        rowLines: [],
      })
      expect(
        getBandLineMap({columnKeys: [], mappings: []}, 'min', 'mean', 'max'),
      ).toEqual({
        upperLines: [],
        lowerLines: [],
        rowLines: [],
      })
    })

    it('creates a map with indices that are in the same position for the same band per column type', () => {
      expect(getBandLineMap(columnMap, 'min', 'mean', 'max')).toEqual({
        upperLines: [0, 1],
        lowerLines: [2, 3],
        rowLines: [5, 4],
      })
    })
  })

  describe('creates a map of unique identifiers for the bands and indices of their data', () => {
    it('creates indentifiers with null values when the named columns are not found', () => {
      expect(
        groupLineIndicesIntoBands(columnMap, 'lower', 'median', 'upper'),
      ).toEqual({
        usage_systemcpucpu0localhost: {lower: null, upper: null, row: null},
        usage_systemcpucpu1localhost: {lower: null, upper: null, row: null},
      })
      expect(groupLineIndicesIntoBands(columnMap, '', '', '')).toEqual({
        usage_systemcpucpu0localhost: {lower: null, upper: null, row: null},
        usage_systemcpucpu1localhost: {lower: null, upper: null, row: null},
      })
    })

    it('creates no indentifiers when the column map is empty', () => {
      expect(
        groupLineIndicesIntoBands(
          {columnKeys: null, mappings: null},
          'min',
          'mean',
          'max',
        ),
      ).toEqual({})
      expect(
        groupLineIndicesIntoBands(
          {columnKeys: undefined, mappings: undefined},
          'min',
          'mean',
          'max',
        ),
      ).toEqual({})
      expect(
        groupLineIndicesIntoBands(
          {columnKeys: [], mappings: []},
          'min',
          'mean',
          'max',
        ),
      ).toEqual({})
    })

    it('creates identifiers when given a column map', () => {
      expect(
        groupLineIndicesIntoBands(columnMap, 'min', 'mean', 'max'),
      ).toEqual({
        usage_systemcpucpu0localhost: {lower: 3, upper: 1, row: 4},
        usage_systemcpucpu1localhost: {lower: 2, upper: 0, row: 5},
      })
    })
  })

  describe('creates the bands to be rendered', () => {
    it('creates a line with lower and upper when they are available in the lineData', () => {
      const lineData: LineData = new Map([
        [
          0,
          {
            fill: 'rgb(106, 103, 205)',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              76.61205076395663, 61.825853725468505, 98.89477906175978,
              73.4646930173073, 64.65424723502838,
            ],
          },
        ],
        [
          1,
          {
            fill: 'rgb(186, 54, 130',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              76.61205076395663, 121.77592874278233, 98.89477906175978,
              101.72034417781009, 64.65424723502838,
            ],
          },
        ],
        [
          2,
          {
            fill: 'rgb(209, 70, 101)',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              76.61205076395663, 91.8008912341254, 98.89477906175978,
              87.59251859755864, 64.65424723502838,
            ],
          },
        ],
      ])
      const bandLineMap = {
        upperLines: [2],
        rowLines: [0],
        lowerLines: [1],
      }

      const result = getBands(lineData, bandLineMap)
      expect(Array.isArray(result)).toEqual(true)
      expect(result[0].fill).toEqual(lineData.get(0)!.fill)
      expect(result[0].lower).toBeDefined()
      expect(result[0].upper).toBeDefined()
    })

    it('creates a line without the lower or upper when corresponding lower or upper is missing from lineData', () => {
      const lineData: LineData = new Map([
        [
          0,
          {
            fill: 'rgb(106, 103, 205)',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              76.61205076395663, 61.825853725468505, 98.89477906175978,
              73.4646930173073, 64.65424723502838,
            ],
          },
        ],
        [
          1,
          {
            fill: 'rgb(186, 54, 130',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              76.61205076395663, 121.77592874278233, 98.89477906175978,
              101.72034417781009, 64.65424723502838,
            ],
          },
        ],
        [
          2,
          {
            fill: 'rgb(209, 70, 101)',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              76.61205076395663, 91.8008912341254, 98.89477906175978,
              87.59251859755864, 64.65424723502838,
            ],
          },
        ],
        [
          3,
          {
            fill: 'rgb(134, 70, 182)',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              361.6723348544358, 361.6723348544358, 367.2923527579312,
              364.49789997048606, 356.02120462233523,
            ],
          },
        ],
        [
          4,
          {
            fill: 'rgb(232, 95, 70)',
            xs: [
              0, 52.00725109558422, 104.01450219116845, 156.02175328675267,
              208.0290043823369,
            ],
            ys: [
              361.6723348544358, 370.14903020258663, 367.2923527579312, 373,
              356.02120462233523,
            ],
          },
        ],
      ])
      const bandLineMap = {
        upperLines: [3, null, null],
        rowLines: [0, 1, 2],
        lowerLines: [null, 4, null],
      }

      const result = getBands(lineData, bandLineMap)
      expect(Array.isArray(result)).toEqual(true)

      expect(result[0].fill).toEqual(lineData.get(0)!.fill)
      expect(result[0].lower).toBeUndefined()
      expect(result[0].upper).toBeDefined()

      expect(result[1].fill).toEqual(lineData.get(1)!.fill)
      expect(result[1].lower).toBeDefined()
      expect(result[1].upper).toBeUndefined()

      expect(result[2].fill).toEqual(lineData.get(2)!.fill)
      expect(result[2].lower).toBeUndefined()
      expect(result[2].upper).toBeUndefined()
    })
  })

  describe('aligns min and max columns to have same length as band', () => {
    it('returns an empty object when no row indices (no bands) are present', () => {
      const lineData: LineData = new Map([
        [
          0,
          {
            fill: 'rgb(49, 192, 246)',
            xs: [16.422140713571192],
            ys: [373.73275],
          },
        ],
        [
          1,
          {
            fill: 'rgb(95, 119, 213)',
            xs: [16.422140713571192, 32.844281427142384],
            ys: [373.73275, 304.66375],
          },
        ],
        [
          2,
          {
            fill: 'rgb(140, 66, 177)',
            xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
            ys: [373.73275, 304.66375, 379.4885],
          },
        ],
      ])
      const bandLineMap = {
        upperLines: [],
        lowerLines: [],
        rowLines: [],
      }

      expect(alignMinMaxWithBand(lineData, bandLineMap)).toEqual(new Map())
    })

    it('returns the updated line data with same length rows when one row index is present', () => {
      const lineData: LineData = new Map([
        [
          0,
          {
            fill: 'rgb(49, 192, 246)',
            xs: [16.422140713571192],
            ys: [373.73275],
          },
        ],
        [
          1,
          {
            fill: 'rgb(95, 119, 213)',
            xs: [16.422140713571192, 32.844281427142384],
            ys: [373.73275, 304.66375],
          },
        ],
        [
          2,
          {
            fill: 'rgb(140, 66, 177)',
            xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
            ys: [373.73275, 304.66375, 379.4885],
          },
        ],
      ])
      const bandLineMap = {
        upperLines: [0],
        lowerLines: [1],
        rowLines: [2],
      }

      expect(alignMinMaxWithBand(lineData, bandLineMap)).toEqual(
        new Map([
          [
            0,
            {
              fill: 'rgb(49, 192, 246)',
              xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
              ys: [373.73275, 304.66375, 379.4885],
            },
          ],
          [
            1,
            {
              fill: 'rgb(95, 119, 213)',
              xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
              ys: [373.73275, 304.66375, 379.4885],
            },
          ],
          [
            2,
            {
              fill: 'rgb(140, 66, 177)',
              xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
              ys: [373.73275, 304.66375, 379.4885],
            },
          ],
        ]),
      )

      seriesAt(lineData, 2).xs.unshift(0)
      seriesAt(lineData, 2).ys.unshift(null)

      expect(alignMinMaxWithBand(lineData, bandLineMap)).toEqual(
        new Map([
          [
            0,
            {
              fill: 'rgb(49, 192, 246)',
              xs: [
                0, 16.422140713571192, 32.844281427142384, 49.26642214071357,
              ],
              ys: [null, 373.73275, 304.66375, 379.4885],
            },
          ],
          [
            1,
            {
              fill: 'rgb(95, 119, 213)',
              xs: [
                0, 16.422140713571192, 32.844281427142384, 49.26642214071357,
              ],
              ys: [null, 373.73275, 304.66375, 379.4885],
            },
          ],
          [
            2,
            {
              fill: 'rgb(140, 66, 177)',
              xs: [
                0, 16.422140713571192, 32.844281427142384, 49.26642214071357,
              ],
              ys: [null, 373.73275, 304.66375, 379.4885],
            },
          ],
        ]),
      )
    })

    it('returns the updated line data with same length rows when multiple row indices are present', () => {
      const lineData: LineData = new Map([
        [
          0,
          {
            fill: 'rgb(49, 192, 246)',
            xs: [16.422140713571192],
            ys: [373.73275],
          },
        ],
        [
          1,
          {
            fill: 'red',
            xs: [1, 3],
            ys: [20, 55],
          },
        ],
        [
          2,
          {
            fill: 'rgb(95, 119, 213)',
            xs: [16.422140713571192, 32.844281427142384],
            ys: [373.73275, 304.66375],
          },
        ],
        [
          3,
          {
            fill: 'green',
            xs: [3],
            ys: [25],
          },
        ],
        [
          4,
          {
            fill: 'blue',
            xs: [1, 3, 5, 7, 9],
            ys: [20, 40, 60, 80, 100],
          },
        ],
        [
          5,
          {
            fill: 'rgb(140, 66, 177)',
            xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
            ys: [373.73275, 304.66375, 379.4885],
          },
        ],
      ])
      const bandLineMap = {
        upperLines: [0, 1],
        lowerLines: [2, 3],
        rowLines: [5, 4],
      }

      expect(alignMinMaxWithBand(lineData, bandLineMap)).toEqual(
        new Map([
          [
            0,
            {
              fill: 'rgb(49, 192, 246)',
              xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
              ys: [373.73275, 304.66375, 379.4885],
            },
          ],
          [
            1,
            {
              fill: 'red',
              xs: [1, 3, 5, 7, 9],
              ys: [20, 55, 60, 80, 100],
            },
          ],
          [
            2,
            {
              fill: 'rgb(95, 119, 213)',
              xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
              ys: [373.73275, 304.66375, 379.4885],
            },
          ],
          [
            3,
            {
              fill: 'green',
              xs: [1, 3, 5, 7, 9],
              ys: [20, 25, 60, 80, 100],
            },
          ],
          [
            4,
            {
              fill: 'blue',
              xs: [1, 3, 5, 7, 9],
              ys: [20, 40, 60, 80, 100],
            },
          ],
          [
            5,
            {
              fill: 'rgb(140, 66, 177)',
              xs: [16.422140713571192, 32.844281427142384, 49.26642214071357],
              ys: [373.73275, 304.66375, 379.4885],
            },
          ],
        ]),
      )

      seriesAt(lineData, 4).xs.unshift(0)
      seriesAt(lineData, 4).ys.unshift(null)
      seriesAt(lineData, 5).xs.push(50)
      seriesAt(lineData, 5).ys.push(null)

      expect(alignMinMaxWithBand(lineData, bandLineMap)).toEqual(
        new Map([
          [
            0,
            {
              fill: 'rgb(49, 192, 246)',
              xs: [
                16.422140713571192, 32.844281427142384, 49.26642214071357, 50,
              ],
              ys: [373.73275, 304.66375, 379.4885, null],
            },
          ],
          [
            1,
            {
              fill: 'red',
              xs: [0, 1, 3, 5, 7, 9],
              ys: [null, 20, 55, 60, 80, 100],
            },
          ],
          [
            2,
            {
              fill: 'rgb(95, 119, 213)',
              xs: [
                16.422140713571192, 32.844281427142384, 49.26642214071357, 50,
              ],
              ys: [373.73275, 304.66375, 379.4885, null],
            },
          ],
          [
            3,
            {
              fill: 'green',
              xs: [0, 1, 3, 5, 7, 9],
              ys: [null, 20, 25, 60, 80, 100],
            },
          ],
          [
            4,
            {
              fill: 'blue',
              xs: [0, 1, 3, 5, 7, 9],
              ys: [null, 20, 40, 60, 80, 100],
            },
          ],
          [
            5,
            {
              fill: 'rgb(140, 66, 177)',
              xs: [
                16.422140713571192, 32.844281427142384, 49.26642214071357, 50,
              ],
              ys: [373.73275, 304.66375, 379.4885, null],
            },
          ],
        ]),
      )
    })
  })
})

describe('createLatestBandIndices', () => {
  const lineData: LineData = new Map([
    [
      0,
      {
        fill: 'rgb(49, 192, 246)',
        xs: [
          1596664920000, 1596664980000, 1596665040000, 1596665100000,
          1596665160000, 1596665196906,
        ],
        ys: [12.8, 18.581418581418582, 14.1, 13.8, 14.7, 12.9],
      },
    ],
    [
      1,
      {
        fill: 'rgb(195, 52, 148)',
        xs: [
          1596664920000, 1596664980000, 1596665040000, 1596665100000,
          1596665160000, 1596665196906,
        ],
        ys: [
          1.2987012987012987, 2.6, 1.5, 1.6016016016016017, 1.8,
          1.3013013013013013,
        ],
      },
    ],
    [
      2,
      {
        fill: 'rgb(49, 192, 246)',
        xs: [
          1596664920000, 1596664980000, 1596665040000, 1596665100000,
          1596665160000, 1596665196906,
        ],
        ys: [
          12.587412587412587, 13.1, 12.5, 12.687312687312687, 11.7,
          12.087912087912088,
        ],
      },
    ],
    [
      3,
      {
        fill: 'rgb(195, 52, 148)',
        xs: [
          1596664920000, 1596664980000, 1596665040000, 1596665100000,
          1596665160000, 1596665196906,
        ],
        ys: [1.1011011011011012, 1.3, 1.2, 1.098901098901099, 1, 1.2],
      },
    ],
    [
      4,
      {
        fill: 'rgb(49, 192, 246)',
        xs: [
          1596664920000, 1596664980000, 1596665040000, 1596665100000,
          1596665160000, 1596665196906,
        ],
        ys: [
          12.693706293706294, 14.432488682488682, 13.318985652318984,
          13.214552114552115, 12.968918918918918, 12.42930402930403,
        ],
      },
    ],
    [
      5,
      {
        fill: 'rgb(195, 52, 148)',
        xs: [
          1596664920000, 1596664980000, 1596665040000, 1596665100000,
          1596665160000, 1596665196906,
        ],
        ys: [
          1.1999011999012, 1.6000005000005002, 1.3499342332675666,
          1.333500900167567, 1.3332675332675332, 1.2666675333342,
        ],
      },
    ],
  ])
  const bandLineMap = {
    upperLines: [0, 1],
    rowLines: [4, 5],
    lowerLines: [2, 3],
  }

  it('creates the latest band indices', () => {
    expect(
      createLatestBandIndices(lineData, bandLineMap, DomainLabel.X),
    ).toEqual({0: 5, 1: 11, 2: 17, 3: 23, 4: 29, 5: 35})
  })

  it('creates the band indices for the hovered lines', () => {
    expect(
      createLatestBandIndices(lineData, bandLineMap, DomainLabel.X, {
        4: 26,
        5: 32,
      }),
    ).toEqual({0: 2, 1: 8, 2: 14, 3: 20, 4: 26, 5: 32})
  })
})

describe('simplifyBandData', () => {
  const NOW = new Date().getTime()
  const TWENTY_FOUR_HOURS_FROM_NOW = NOW + 1000 * 60 * 60 * 24
  const xScale = getLinearScale(NOW, TWENTY_FOUR_HOURS_FROM_NOW, 0, 1200)

  const yScale = getLinearScale(0, 100, 800, 0)

  it('returns the same number of points that it receives for each line', () => {
    const lineData: LineData = new Map([
      [
        0,
        {
          fill: '#31C0F6',
          xs: [
            NOW + 1000 * 60 * 60 * 1,
            NOW + 1000 * 60 * 60 * 2,
            NOW + 1000 * 60 * 60 * 3,
            NOW + 1000 * 60 * 60 * 4,
            NOW + 1000 * 60 * 60 * 5,
            NOW + 1000 * 60 * 60 * 6,
            NOW + 1000 * 60 * 60 * 7,
            NOW + 1000 * 60 * 60 * 8,
          ],
          ys: [77, 77, 77, 90, 90, 77, 77, 77],
        },
      ],
      [
        1,
        {
          fill: '#31C0F6',
          xs: [
            NOW + 1000 * 60 * 60 * 1,
            NOW + 1000 * 60 * 60 * 2,
            NOW + 1000 * 60 * 60 * 3,
            NOW + 1000 * 60 * 60 * 4,
            NOW + 1000 * 60 * 60 * 5,
            NOW + 1000 * 60 * 60 * 6,
            NOW + 1000 * 60 * 60 * 7,
            NOW + 1000 * 60 * 60 * 8,
          ],
          ys: [25, 40, 32, 22, 58, 33, 52, 66],
        },
      ],
      [
        2,
        {
          fill: '#31C0F6',
          xs: [
            NOW + 1000 * 60 * 60,
            NOW + 1000 * 60 * 60 * 2,
            NOW + 1000 * 60 * 60 * 3,
            NOW + 1000 * 60 * 60 * 4,
            NOW + 1000 * 60 * 60 * 5,
            NOW + 1000 * 60 * 60 * 6,
            NOW + 1000 * 60 * 60 * 7,
            NOW + 1000 * 60 * 60 * 8,
          ],
          ys: [1, 1, 1, 2, 1, 1, 1, 1],
        },
      ],
    ])
    const seriesAt = (data: LineData, id: number) => data.get(id)!

    const truncatedResult = simplifyLineData(lineData, xScale, yScale)
    expect(seriesAt(truncatedResult, 0).xs.length).not.toEqual(
      seriesAt(lineData, 0).xs.length,
    )
    expect(seriesAt(truncatedResult, 2).xs.length).not.toEqual(
      seriesAt(lineData, 2).xs.length,
    )
    expect(seriesAt(truncatedResult, 0).xs.length).not.toEqual(
      seriesAt(truncatedResult, 1).xs.length,
    )
    expect(seriesAt(truncatedResult, 1).xs.length).not.toEqual(
      seriesAt(truncatedResult, 2).xs.length,
    )

    const result = simplifyBandData(lineData, xScale, yScale)
    expect(seriesAt(result, 0).xs.length).toEqual(
      seriesAt(lineData, 0).xs.length,
    )
    expect(seriesAt(result, 0).ys.length).toEqual(
      seriesAt(lineData, 0).ys.length,
    )

    expect(seriesAt(result, 1).xs.length).toEqual(
      seriesAt(lineData, 1).xs.length,
    )
    expect(seriesAt(result, 1).ys.length).toEqual(
      seriesAt(lineData, 1).ys.length,
    )

    expect(seriesAt(result, 2).xs.length).toEqual(
      seriesAt(lineData, 2).xs.length,
    )
    expect(seriesAt(result, 2).ys.length).toEqual(
      seriesAt(lineData, 2).ys.length,
    )
  })
})

describe('sortBandLines', () => {
  it('sorts band lines according to "rows" in the bandLineMap', () => {
    const rowFour = [2, 3, 4]
    const rowFive = [12, 13, 14]
    const bandValues = [
      rowFour[0] + 4,
      rowFour[1] + 4,
      rowFour[2] + 4,
      rowFive[0] + 3,
      rowFive[1] + 3,
      rowFive[2] + 3,
      rowFour[0] - 1,
      rowFour[1] - 1,
      rowFour[2] - 1,
      rowFive[0] - 5,
      rowFive[1] - 5,
      rowFive[2] - 5,
      ...rowFour,
      ...rowFive,
    ]
    const bandLineMap = {
      upperLines: [0, 1],
      rowLines: [4, 5],
      lowerLines: [2, 3],
    }
    const latestIndices = {0: 2, 1: 5, 2: 8, 3: 11, 4: 14, 5: 17}
    expect(sortBandLines(bandValues, bandLineMap, latestIndices)).toEqual({
      upperLines: [1, 0],
      rowLines: [5, 4],
      lowerLines: [3, 2],
    })
  })
})
