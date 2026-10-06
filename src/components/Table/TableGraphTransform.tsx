// Libraries
import {FunctionComponent, JSX, useMemo} from 'react'

// Types
import {
  SortOptions,
  TableViewProperties,
  TransformTableDataReturnType,
} from 'types'

// Utils
import {transformTableData} from 'utils/tableGraph'

interface Props {
  data: string[][]
  dataTypes: {[x: string]: string}
  properties: TableViewProperties
  sortOptions: SortOptions
  children: (transformedDataBundle: TransformTableDataReturnType) => JSX.Element
}

export const TableGraphTransform: FunctionComponent<Props> = ({
  properties,
  data,
  dataTypes,
  sortOptions,
  children,
}) => {
  const {tableOptions, timeFormat, decimalPlaces, fieldOptions} = properties

  /*
    Both memos need their inputs to keep their identity across renders, or they
    recompute every time. `data`, `sortOptions` and `tableOptions` arrive as
    props and state, which callers already hold stable -- the field options are
    the one thing built here, so they have to be held still by hand.

    useMemo, not a module-level memo: the comparison it does is per dependency
    and shallow, which is enough once nothing is rebuilt behind its back.
  */
  const fields = useMemo(
    () =>
      fieldOptions.map(opts => ({
        ...opts,
        dataType: dataTypes[opts.internalName],
      })),
    [fieldOptions, dataTypes],
  )

  const transformedDataBundle = useMemo(
    () =>
      transformTableData(
        data,
        sortOptions,
        fields,
        tableOptions,
        timeFormat,
        decimalPlaces,
      ),
    [data, sortOptions, fields, tableOptions, timeFormat, decimalPlaces],
  )

  return children(transformedDataBundle)
}
