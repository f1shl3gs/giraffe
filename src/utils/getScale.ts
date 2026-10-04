import {ScaleFactory} from 'types'
import {getLinearScale} from './getLinearScale'
import {getLogScale} from './getLogScale'

export const getScale = (scale: string): ScaleFactory => {
  switch (scale) {
    case 'linear':
      return getLinearScale
    case 'log':
      return getLogScale
    default:
      return getLinearScale
  }
}
