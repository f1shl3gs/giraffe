// Libraries

import memoizeOne from 'memoize-one'
import {FunctionComponent, JSX} from 'react'
// Types
import {
  SortOptions,
  TableViewProperties,
  TransformTableDataReturnType,
} from 'types'
import {isEqual} from 'utils/isEqual'
// Utils
import {transformTableData} from 'utils/tableGraph'

interface Props {
  data: string[][]
  dataTypes: {[x: string]: string}
  properties: TableViewProperties
  sortOptions: SortOptions
  children: (transformedDataBundle: TransformTableDataReturnType) => JSX.Element
}

const memoizedTableTransform = memoizeOne(transformTableData, isEqual)

export const TableGraphTransform: FunctionComponent<Props> = (props: Props) => {
  const {properties, data, dataTypes, sortOptions} = props
  const {tableOptions, timeFormat, decimalPlaces, fieldOptions} = properties
  const fo =
    fieldOptions &&
    fieldOptions.map(opts => ({
      ...opts,
      dataType: dataTypes[opts.internalName],
    }))

  const transformedDataBundle = memoizedTableTransform(
    data,
    sortOptions,
    fo,
    tableOptions,
    timeFormat,
    decimalPlaces,
  )
  return props.children(transformedDataBundle)
}
