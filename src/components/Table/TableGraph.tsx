import {
  ASCENDING,
  DEFAULT_SORT_DIRECTION,
  DESCENDING,
} from 'constants/tableGraph'
import {FunctionComponent, useState} from 'react'
import {
  FluxTable,
  SortOptions,
  TableViewProperties,
  Theme,
  TimeZone,
} from 'types'
import {TableGraphTable} from './TableGraphTable'
import {TableGraphTransform} from './TableGraphTransform'

interface Props {
  table: FluxTable
  properties: TableViewProperties
  timeZone: TimeZone
  theme: Theme
}

interface State {
  sortOptions: SortOptions
}

const handleSetSort = (fieldName: string, setState: Function) => {
  setState(({sortOptions}) => {
    const newSortOptions = {...sortOptions}
    newSortOptions.direction = DEFAULT_SORT_DIRECTION
    if (fieldName === sortOptions.field) {
      if (sortOptions.direction !== DESCENDING) {
        newSortOptions.direction = DESCENDING
        return {sortOptions: newSortOptions}
      }
      newSortOptions.field = ''
      return {sortOptions: newSortOptions}
    }
    newSortOptions.field = fieldName
    return {sortOptions: newSortOptions}
  })
}

export const TableGraph: FunctionComponent<Props> = ({
  table,
  properties,
  timeZone,
  theme,
}) => {
  const [state, setState] = useState<State>({
    sortOptions: {
      field: properties.tableOptions.sortBy?.internalName ?? null,
      direction: ASCENDING,
    },
  })

  const onSortCallback = (fieldName: string) => {
    handleSetSort(fieldName, setState)
  }
  return (
    <TableGraphTransform
      data={table.data}
      properties={properties}
      dataTypes={table.dataTypes}
      sortOptions={state.sortOptions}
    >
      {transformedDataBundle => (
        <TableGraphTable
          properties={properties}
          dataTypes={table.dataTypes}
          onSort={onSortCallback}
          transformedDataBundle={transformedDataBundle}
          timeZone={timeZone}
          theme={theme}
        />
      )}
    </TableGraphTransform>
  )
}
