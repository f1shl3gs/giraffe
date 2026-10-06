import type {LineData} from '../types'

import {DomainLabel} from 'types'
import {getDomainDataFromLines} from './lineData'

describe('lineData', () => {
  describe('get domain data from line data', () => {
    const lineData: LineData = new Map([
      [
        0,
        {
          xs: [] as any,
          ys: [] as any,
          fill: 'some color',
        },
      ],
    ])
    it('should return an empty array when line data has no domain values', () => {
      expect(getDomainDataFromLines(lineData, [], DomainLabel.X)).toEqual([])
      expect(getDomainDataFromLines(lineData, [], DomainLabel.Y)).toEqual([])

      lineData.set(1, {xs: [], ys: [], fill: ''})
      expect(getDomainDataFromLines(lineData, [], DomainLabel.X)).toEqual([])
      expect(getDomainDataFromLines(lineData, [], DomainLabel.Y)).toEqual([])
    })
    it('should return an array of domain values in order by group number', () => {
      lineData.set(0, {xs: [100, 101], ys: [1, 2, 3, 4], fill: 'a color 1'})
      lineData.set(1, {xs: [100, 101], ys: [5, 6, 7, 8], fill: 'a color 2'})
      expect(
        getDomainDataFromLines(lineData, [0, 0, 1, 1], DomainLabel.X),
      ).toEqual([100, 101, 100, 101])
      expect(
        getDomainDataFromLines(
          lineData,
          [0, 0, 0, 0, 1, 1, 1, 1],
          DomainLabel.Y,
        ),
      ).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

      lineData.set(2, {xs: [], ys: [], fill: 'a color 3'})
      expect(
        getDomainDataFromLines(lineData, [0, 0, 1, 1], DomainLabel.X),
      ).toEqual([100, 101, 100, 101])
      expect(
        getDomainDataFromLines(
          lineData,
          [0, 0, 0, 0, 1, 1, 1, 1],
          DomainLabel.Y,
        ),
      ).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })
  })
})
