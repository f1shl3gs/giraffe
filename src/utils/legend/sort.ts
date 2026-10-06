// Types
import {ColumnData} from 'types'

export const sortIndicesByValueColumn = (
  valuesColumn: ColumnData,
  rowIndices: Array<number>,
): Array<number> => {
  if (!valuesColumn || !rowIndices?.length) {
    return []
  }

  const rows: Array<{key: number; rowIndex: number}> = []
  rowIndices.forEach(rowIndex => {
    const colValue = valuesColumn[`${rowIndex}`]

    rows.push({
      key: typeof colValue === 'number' ? colValue : 0,
      rowIndex,
    })
  })

  rows.sort((first, second) => second.key - first.key)

  return rows.map(({rowIndex}) => rowIndex)
}

export const isSortable = (values: unknown[]): boolean => {
  if (!values || !values.length || values.length == 1) {
    return false
  }
  const initialValue = values[0]
  return values.every((value: unknown, index: number) => {
    if (index === 0) {
      return true
    }
    return value !== initialValue
  })
}
